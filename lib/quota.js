// lib/quota.js — per-user monthly "AI audio minutes" quota for Out Loud.
//
// The feature analyses RECORDED audio and gives feedback. The meter is the
// duration of audio actually analysed: each successful analysis adds the
// recording's length (in seconds) to the member's monthly total.
//
// One Upstash key per member per month: `uil:min:{uid}:{YYYY-MM}` (seconds).
// The YYYY-MM in the key makes each month a fresh counter automatically; a
// ~40-day TTL cleans old buckets up. Identity comes from the VERIFIED session
// cookie (session.uid), never a client header.

const URL = process.env.KV_REST_API_URL;
const TOK = process.env.KV_REST_API_TOKEN;

// Monthly audio-minute allowance by Patreon tier price, richest first. Minutes are cheap
// (100 min of analysis costs ~$0.29), so the allowance is a safety rail, not a paywall —
// be generous here rather than metering members who love the feature.
// The 700c tier is PLUMBING ONLY: nothing sells it yet, so no member can reach it.
export const ALLOWANCE = [
  { cents: 600, min: 400 },                    // Fluency+ (not yet offered) — threshold sits
                                               // BELOW the intended price so a $6.99 tier
                                               // (699c) cannot miss it by a cent
  { cents: 200, min: 100 },                    // Fluency Club $2.99
];
export const LIMIT_MIN = 100;                  // the base allowance, and the default
const LIMIT_SEC = LIMIT_MIN * 60;

// A legacy session issued before tiering has no `cents`. It counts as a full member
// elsewhere, so it gets the BASE allowance here — never the top tier by accident.
export function limitFor(cents) {
  if (cents === undefined || cents === null) return LIMIT_MIN;
  const c = Number(cents) || 0;
  for (const t of ALLOWANCE) if (c >= t.cents) return t.min;
  return 0;                                    // below Fluency: no Out Loud at all
}
export const MAX_REC_SEC = 180;                // longest single recording we accept/meter (3 min)
const BUCKET_TTL = 40 * 24 * 3600;             // seconds; key self-expires after the month

function monthKey(uid) {
  const d = new Date();
  const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  return `uil:min:${uid}:${ym}`;
}

async function kv(path) {
  const r = await fetch(`${URL}/${path}`, { headers: { Authorization: `Bearer ${TOK}` } });
  if (!r.ok) throw new Error(`kv ${r.status}`);
  return (await r.json()).result;
}

function shape(usedSec, limitMin = LIMIT_MIN) {
  const usedMin = Math.floor(usedSec / 60);
  const limitSec = limitMin * 60;
  return {
    usedSec,
    usedMin,
    limitMin,
    remainingSec: Math.max(0, limitSec - usedSec),
    remainingMin: Math.max(0, limitMin - usedMin),
    over: usedSec >= limitSec,
  };
}

// Clamp a reported recording length to a sane range before it ever touches the quota.
export function clampRecordingSec(sec) {
  const n = Math.round(Number(sec) || 0);
  return Math.min(MAX_REC_SEC, Math.max(0, n));
}

// Read current usage. If KV isn't configured (local/dev) it reports empty with a
// flag, so callers can fail open rather than lock out a paying member.
export async function getUsage(uid, limitMin = LIMIT_MIN) {
  if (!URL || !TOK || !uid) return { ...shape(0, limitMin), unmetered: true };
  try {
    const v = await kv(`get/${encodeURIComponent(monthKey(uid))}`);
    return shape(Number(v) || 0, limitMin);
  } catch {
    return { ...shape(0, limitMin), unmetered: true };
  }
}

// Add a recording's duration (seconds) to this month's usage. Atomic INCRBY.
// Call this ONLY after a successful analysis, so failed calls cost nothing.
export async function addUsage(uid, sec, limitMin = LIMIT_MIN) {
  const add = clampRecordingSec(sec);
  if (!URL || !TOK || !uid || add === 0) return getUsage(uid, limitMin);
  try {
    const key = encodeURIComponent(monthKey(uid));
    const total = Number(await kv(`incrby/${key}/${add}`)) || add;
    if (total <= add) await kv(`expire/${key}/${BUCKET_TTL}`); // set TTL once, on creation
    return shape(total, limitMin);
  } catch {
    return { ...shape(0, limitMin), unmetered: true };
  }
}
