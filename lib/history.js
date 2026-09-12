// lib/history.js — per-member practice history, the data the progress dashboard reads.
//
// Three keys per member, all bounded so free-tier storage can never run away:
//   uil:log:{uid}    list  — the last HISTORY_MAX practice sessions, newest first (~580B
//                            each: metadata plus the coach's two wins and one tweak, so the
//                            member can read their feedback back. Never a transcript.)
//   uil:agg:{uid}    hash  — rolling totals that are NEVER trimmed, so the long-term
//                            growth story survives even after old detail is trimmed:
//                              {YYYY-MM}:sec  seconds analysed that month
//                              {YYYY-MM}:n    sessions that month
//                              w:{word}       times a target word was used naturally
//   elc:games:{uid}  hash  — `{type}:{ep}` → timestamp; bounded by the catalogue size
//
// Plus site totals (elc:stats, elc:members, elc:active:{week}) and two keys that belong
// to NOBODY — site-wide play counts, no uid in them, used for
// "what other members are practising". See POP_KEY below.
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
const WIN_MAX = 140;              // chars per win; two are kept
const WINS_KEPT = 2;

const ready = () => !!(URL && TOK);
const logKey = (uid) => `uil:log:${uid}`;
const aggKey = (uid) => `uil:agg:${uid}`;
const gameKey = (uid) => `elc:games:${uid}`;
const month = (d = new Date()) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

// ---- site-wide popularity -------------------------------------------------------
// Aggregate across every member; nothing here identifies anyone. `{type}:{ep}` fields,
// so one HGETALL answers "popular episodes" (sum over types), "popular games" (sum over
// episodes) and the cross-section (which episode lands best in which game).
export const POP_WEEKS = 8;               // how many weekly windows are kept alive
const POP_KEY = 'elc:pop';
const popWeekKey = (w) => `elc:pop:${w}`;

// ---- site totals (for the home page's social proof) -----------------------------
// Sets, not counters: someone opening the Arcade twice is one member, not two. At this
// scale an exact set of short uids is smaller and simpler than a HyperLogLog. Traffic is
// deliberately absent — Vercel Web Analytics owns visitors, and counting page loads in KV
// would burn the free tier and count bots as people.
const STATS_KEY = 'elc:stats';
const MEMBERS_KEY = 'elc:members';
const activeKey = (w) => `elc:active:${w}`;

// ISO week, so a window never straddles a year boundary oddly. Matches lib/dashboard.js.
export function isoWeekOf(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

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
// `rubric` is [fluency, clarity, vocabulary, task] each 1-5; `metrics` is {wpm, ttr}.
// `wins` is the coach's actual words, not a count: the member is shown their feedback back
// on the progress page, and two wins then a tweak is the whole point of the format.
// These are the trendable half of a session — the warm prose is for the member, these
// are for the chart. Both are stored; neither is shown as a score.
export async function logSession(uid, { episodeId, episode, durationSec, wordsUsed, wins, tweak, rubric, metrics }) {
  if (!ready() || !uid) return false;
  const r = (Array.isArray(rubric) ? rubric : []).slice(0, 4)
    .map((x) => Math.max(1, Math.min(5, Math.round(Number(x) || 0))) || 0)
    .filter((x) => x >= 1);
  const met = metrics || {};
  const rec = {
    t: Date.now(),
    e: String(episodeId || ''),
    n: Number(episode) || 0,
    d: Math.round(Number(durationSec) || 0),
    w: (Array.isArray(wordsUsed) ? wordsUsed : []).slice(0, 12).map((x) => String(x).toLowerCase()),
    v: (Array.isArray(wins) ? wins : []).slice(0, WINS_KEPT)
         .map((w) => String(w || '').slice(0, WIN_MAX)).filter(Boolean),
    x: String(tweak || '').slice(0, TWEAK_MAX),
  };
  if (r.length === 4) rec.r = r;
  if (met.wpm) rec.wpm = Math.round(met.wpm);
  if (met.ttr) rec.ttr = Math.round(met.ttr);
  const m = month();
  const cmds = [
    ['LPUSH', logKey(uid), JSON.stringify(rec)],
    ['LTRIM', logKey(uid), '0', String(HISTORY_MAX - 1)],
    ['HINCRBY', aggKey(uid), `${m}:sec`, String(rec.d)],
    ['HINCRBY', aggKey(uid), `${m}:n`, '1'],
    ['HINCRBY', STATS_KEY, 'uilsec', String(rec.d)],   // site total, same round trip
  ];
  // Two rolling sums so the long-term trend survives the 100-session trim; the
  // per-dimension detail lives in the session list, which is plenty of runway.
  if (rec.r) cmds.push(['HINCRBY', aggKey(uid), `${m}:rsum`, String(r.reduce((a, b) => a + b, 0))]);
  if (rec.wpm) cmds.push(['HINCRBY', aggKey(uid), `${m}:wpm`, String(rec.wpm)]);
  for (const w of rec.w) cmds.push(['HINCRBY', aggKey(uid), `w:${w}`, '1']);
  try {
    await pipeline(cmds);
    return true;
  } catch (e) {
    console.warn('[history] logSession failed', String(e.message || e));
    return false;
  }
}

// Record a finished arcade game. The member's own entry is idempotent — replaying only
// updates the timestamp — but the site-wide counters take EVERY finish, which is what
// makes them a frequency rather than a checklist.
export async function logGame(uid, type, ep) {
  if (!ready() || !uid || !type || !ep) return false;
  const field = `${type}:${ep}`;
  const wk = popWeekKey(isoWeekOf());
  try {
    // one round trip: the member's copy, all-time, this week, and the window's own TTL
    await pipeline([
      ['HSET', gameKey(uid), field, String(Date.now())],
      ['HINCRBY', POP_KEY, field, 1],
      ['HINCRBY', wk, field, 1],
      ['EXPIRE', wk, String(POP_WEEKS * 7 * 86400)],
      ['HINCRBY', STATS_KEY, 'games', 1],
    ]);
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

/* Mark a member as seen: once in the all-time set, once in this week's. Call it from a
   route a member actually visits, not from sign-in alone — a cookie lasts 30 days, so
   sign-ins would badly under-count who is still here. SADD is idempotent, so calling it
   on every request is correct; it just costs one command. */
export async function touchMember(uid) {
  if (!ready() || !uid) return false;
  const wk = activeKey(isoWeekOf());
  try {
    await pipeline([
      ['SADD', MEMBERS_KEY, String(uid)],
      ['SADD', wk, String(uid)],
      ['EXPIRE', wk, String(POP_WEEKS * 7 * 86400)],
    ]);
    return true;
  } catch (e) {
    console.warn('[history] touchMember failed', String(e.message || e));
    return false;
  }
}

/* The raw site totals. Returns zeros on any trouble — the strip that reads this hides
   itself rather than showing a broken number. */
export async function getSiteStats() {
  if (!ready()) return { members: 0, active: 0, games: 0, uilsec: 0 };
  try {
    const r = await pipeline([
      ['SCARD', MEMBERS_KEY],
      ['SCARD', activeKey(isoWeekOf())],
      ['HGET', STATS_KEY, 'games'],
      ['HGET', STATS_KEY, 'uilsec'],
    ]);
    const at = (i) => Number(r && r[i] && r[i].result) || 0;
    return { members: at(0), active: at(1), games: at(2), uilsec: at(3) };
  } catch (e) {
    console.warn('[history] getSiteStats failed', String(e.message || e));
    return { members: 0, active: 0, games: 0, uilsec: 0 };
  }
}

// Site-wide play counts. `window` is 'week' (the rolling window, which is what a
// "popular now" card should use) or 'all'. Returns {} on any trouble — a missing
// popularity list hides a card; it never breaks a page.
export async function getPopularity(window = 'week') {
  if (!ready()) return {};
  const key = window === 'all' ? POP_KEY : popWeekKey(isoWeekOf());
  try {
    const [r] = await pipeline([['HGETALL', key]]);
    const raw = r && r.result;
    const out = {};
    if (Array.isArray(raw)) {                       // Upstash returns a flat [k,v,k,v]
      for (let i = 0; i < raw.length; i += 2) out[raw[i]] = Number(raw[i + 1]) || 0;
    } else if (raw && typeof raw === 'object') {
      for (const k of Object.keys(raw)) out[k] = Number(raw[k]) || 0;
    }
    return out;
  } catch (e) {
    console.warn('[history] getPopularity failed', String(e.message || e));
    return {};
  }
}

// The month whose recap this member has already seen, so a card shows once and then
// stops. One small key per member; nothing is generated for someone who never returns.
const seenKey = (uid) => `uil:recapseen:${uid}`;

export async function getRecapSeen(uid) {
  if (!ready() || !uid) return null;
  try { return await read(`get/${encodeURIComponent(seenKey(uid))}`); } catch { return null; }
}

export async function setRecapSeen(uid, ym) {
  if (!ready() || !uid || !ym) return false;
  try { await pipeline([['SET', seenKey(uid), String(ym)]]); return true; }
  catch (e) { console.warn('[history] setRecapSeen failed', String(e.message || e)); return false; }
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
      months[m][field] = Number(v) || 0;   // sec, n, rsum, wpm
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
