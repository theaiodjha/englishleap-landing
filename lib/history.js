// lib/history.js — per-member practice history, the data the progress dashboard reads.
//
// Three keys per member, all bounded so free-tier storage can never run away:
//   uil:log:{uid}    list  — the last HISTORY_MAX practice sessions, newest first (~300B each)
//   uil:agg:{uid}    hash  — rolling totals that are NEVER trimmed, so the long-term
//                            growth story survives even after old detail is trimmed:
//                              {YYYY-MM}:sec  seconds analysed that month
//                              {YYYY-MM}:n    sessions that month
//                              w:{word}       times a target word was used naturally
//   elc:games:{uid}  hash  — `{type}:{ep}` → timestamp; bounded by the catalogue size
//
// Ceiling is ~40KB per member, forever. Identity always comes from the VERIFIED
// session cookie (session.uid), never a client field — same rule as lib/quota.js.
//
// Every function here FAILS OPEN. History is nice to have; it must never break a
// practice session or block a paying member. Failures warn into the Vercel log.

const URL = process.env.KV_REST_API_URL;
const TOK = process.env.KV_REST_API_TOKEN;

export const HISTORY_MAX = 100;   // sessions of detail kept per member
const TWEAK_MAX = 160;            // chars of coaching note stored per session

const ready = () => !!(URL && TOK);
const logKey = (uid) => `uil:log:${uid}`;
const aggKey = (uid) => `uil:agg:${uid}`;
const gameKey = (uid) => `elc:games:${uid}`;
const month = (d = new Date()) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

// Several commands, one round trip. Upstash counts each command, so this saves
// latency rather than quota — which is what matters inside an analyze request.
async function pipeline(cmds) {
  const r = await fetch(`${URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOK}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  if (!r.ok) throw new Error(`kv pipeline ${r.status}`);
  return r.json();
}

async function read(path) {
  const r = await fetch(`${URL}/${path}`, { headers: { Authorization: `Bearer ${TOK}` } });
  if (!r.ok) throw new Error(`kv ${r.status}`);
  return (await r.json()).result;
}

// ---- writes ----

// Record one completed practice session. Metadata only — no transcript is stored,
// which keeps a record at ~300B and keeps members' speech out of the database.
export async function logSession(uid, { episodeId, episode, durationSec, wordsUsed, wins, tweak }) {
  if (!ready() || !uid) return false;
  const rec = {
    t: Date.now(),
    e: String(episodeId || ''),
    n: Number(episode) || 0,
    d: Math.round(Number(durationSec) || 0),
    w: (Array.isArray(wordsUsed) ? wordsUsed : []).slice(0, 12).map((x) => String(x).toLowerCase()),
    k: Number(wins) || 0,
    x: String(tweak || '').slice(0, TWEAK_MAX),
  };
  const m = month();
  const cmds = [
    ['LPUSH', logKey(uid), JSON.stringify(rec)],
    ['LTRIM', logKey(uid), '0', String(HISTORY_MAX - 1)],
    ['HINCRBY', aggKey(uid), `${m}:sec`, String(rec.d)],
    ['HINCRBY', aggKey(uid), `${m}:n`, '1'],
  ];
  for (const w of rec.w) cmds.push(['HINCRBY', aggKey(uid), `w:${w}`, '1']);
  try {
    await pipeline(cmds);
    return true;
  } catch (e) {
    console.warn('[history] logSession failed', String(e.message || e));
    return false;
  }
}

// Record a finished arcade game. Idempotent: replaying only updates the timestamp.
export async function logGame(uid, type, ep) {
  if (!ready() || !uid || !type || !ep) return false;
  try {
    await pipeline([['HSET', gameKey(uid), `${type}:${ep}`, String(Date.now())]]);
    return true;
  } catch (e) {
    console.warn('[history] logGame failed', String(e.message || e));
    return false;
  }
}

// One-time migration of a device's localStorage completions into the account.
// `items` is [{type, ep, ts}]; existing entries keep their original timestamp.
export async function logGamesBulk(uid, items) {
  if (!ready() || !uid || !Array.isArray(items) || !items.length) return 0;
  const pairs = [];
  for (const it of items.slice(0, 400)) {
    if (!it || !it.type || !it.ep) continue;
    pairs.push(`${it.type}:${it.ep}`, String(Number(it.ts) || Date.now()));
  }
  if (!pairs.length) return 0;
  try {
    await pipeline([['HSET', gameKey(uid), ...pairs]]);
    return pairs.length / 2;
  } catch (e) {
    console.warn('[history] logGamesBulk failed', String(e.message || e));
    return 0;
  }
}

// ---- reads (for the dashboard) ----

export async function getSessions(uid, limit = HISTORY_MAX) {
  if (!ready() || !uid) return [];
  try {
    const rows = await read(`lrange/${encodeURIComponent(logKey(uid))}/0/${Math.max(0, limit - 1)}`);
    return (Array.isArray(rows) ? rows : [])
      .map((r) => { try { return JSON.parse(r); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

// Upstash returns HGETALL as a flat [field, value, ...] array.
function pairsToObject(flat) {
  const out = {};
  const a = Array.isArray(flat) ? flat : [];
  for (let i = 0; i < a.length - 1; i += 2) out[a[i]] = a[i + 1];
  return out;
}

export async function getAggregates(uid) {
  if (!ready() || !uid) return { months: {}, words: {} };
  try {
    const all = pairsToObject(await read(`hgetall/${encodeURIComponent(aggKey(uid))}`));
    const months = {}, words = {};
    for (const [k, v] of Object.entries(all)) {
      if (k.startsWith('w:')) { words[k.slice(2)] = Number(v) || 0; continue; }
      const [m, field] = k.split(':');
      if (!m || !field) continue;
      months[m] = months[m] || { sec: 0, n: 0 };
      months[m][field] = Number(v) || 0;
    }
    return { months, words };
  } catch { return { months: {}, words: {} }; }
}

export async function getGames(uid) {
  if (!ready() || !uid) return {};
  try {
    const all = pairsToObject(await read(`hgetall/${encodeURIComponent(gameKey(uid))}`));
    const out = {};
    for (const [k, v] of Object.entries(all)) out[k] = Number(v) || 0;
    return out;
  } catch { return {}; }
}
