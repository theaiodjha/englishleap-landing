// lib/quota.js — per-user monthly "AI audio minutes" quota for Use It Live.
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

export const LIMIT_MIN = 100;                  // minutes of audio analysis per user per month
const LIMIT_SEC = LIMIT_MIN * 60;
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

function shape(usedSec) {
  const usedMin = Math.floor(usedSec / 60);
  return {
    usedSec,
    usedMin,
    limitMin: LIMIT_MIN,
    remainingSec: Math.max(0, LIMIT_SEC - usedSec),
    remainingMin: Math.max(0, LIMIT_MIN - usedMin),
    over: usedSec >= LIMIT_SEC,
  };
}

// Clamp a reported recording length to a sane range before it ever touches the quota.
export function clampRecordingSec(sec) {
  const n = Math.round(Number(sec) || 0);
  return Math.min(MAX_REC_SEC, Math.max(0, n));
}

// Read current usage. If KV isn't configured (local/dev) it reports empty with a
// flag, so callers can fail open rather than lock out a paying member.
export async function getUsage(uid) {
  if (!URL || !TOK || !uid) return { ...shape(0), unmetered: true };
  try {
    const v = await kv(`get/${encodeURIComponent(monthKey(uid))}`);
    return shape(Number(v) || 0);
  } catch {
    return { ...shape(0), unmetered: true };
  }
}

// Add a recording's duration (seconds) to this month's usage. Atomic INCRBY.
// Call this ONLY after a successful analysis, so failed calls cost nothing.
export async function addUsage(uid, sec) {
  const add = clampRecordingSec(sec);
  if (!URL || !TOK || !uid || add === 0) return getUsage(uid);
  try {
    const key = encodeURIComponent(monthKey(uid));
    const total = Number(await kv(`incrby/${key}/${add}`)) || add;
    if (total <= add) await kv(`expire/${key}/${BUCKET_TTL}`); // set TTL once, on creation
    return shape(total);
  } catch {
    return { ...shape(0), unmetered: true };
  }
}
