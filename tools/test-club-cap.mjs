/* node tools/test-club-cap.mjs
 *
 * The club-wide monthly ceiling — the circuit breaker that the per-member quota is not.
 * Per-member quota caps ONE member; total spend is members x allowance, and before this
 * nothing watched the sum.
 *
 * The behaviours that matter, and why each could plausibly be got wrong:
 *   - it FAILS OPEN, because a spend cap that locks every paying member out during an
 *     Upstash blip is worse than the overspend it guards against;
 *   - both meters move together, or the ceiling drifts below the truth and refuses early;
 *   - the club state is its own thing, never the member's quota message — a member with
 *     80 minutes left must not be told they are out.
 *
 * KV_REST_API_* are set BEFORE the dynamic import: lib/quota.js reads them at module load
 * and ESM hoists static imports above every statement (same trick as test-stats.mjs).
 */
process.env.KV_REST_API_URL = 'https://kv.test';
process.env.KV_REST_API_TOKEN = 'tok';
process.env.UIL_CLUB_CAP_MIN = '100';           // 100 minutes, so the numbers stay readable

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  — ' + extra : ''));
};

// --- a fake Upstash -----------------------------------------------------------
let store = {}, calls = [], mode = 'live';
globalThis.fetch = async (url, opts = {}) => {
  calls.push(String(url));
  if (mode === 'down') return { ok: false, status: 500, json: async () => ({}), text: async () => 'boom' };
  const u = String(url);
  if (u.endsWith('/pipeline')) {
    const cmds = JSON.parse(opts.body);
    return { ok: true, json: async () => cmds.map(([, k, n]) => {
      store[k] = (store[k] || 0) + Number(n);
      return { result: store[k] };
    }) };
  }
  const m = /\/get\/(.+)$/.exec(u);
  if (m) return { ok: true, json: async () => ({ result: store[decodeURIComponent(m[1])] ?? null }) };
  return { ok: true, json: async () => ({ result: 1 }) };   // expire, etc.
};

const q = await import('../lib/quota.js');

// --- the cap is configurable and read from the environment ---------------------
ok('the ceiling comes from UIL_CLUB_CAP_MIN', q.CLUB_CAP_MIN === 100, 'got ' + q.CLUB_CAP_MIN);

// --- an empty month is under the cap -------------------------------------------
store = {};
let club = await q.getClubUsage();
ok('a fresh month starts under the ceiling', !club.over && club.usedMin === 0);

// --- both meters move on one round trip -----------------------------------------
store = {}; calls = [];
await q.addUsage('p:1', 600, 100);   // asks for ten minutes; clampRecordingSec caps it at 180s
const keys = Object.keys(store);
ok('the personal meter is written', keys.some((k) => k.startsWith('uil:min:p:1:')), keys.join(' '));
ok('the club meter is written too', keys.some((k) => k.startsWith('uil:club:')), keys.join(' '));
ok('...on ONE pipeline call, not two round trips',
  calls.filter((c) => c.endsWith('/pipeline')).length === 1,
  calls.filter((c) => c.endsWith('/pipeline')).length + ' pipeline calls');

const clubKey = keys.find((k) => k.startsWith('uil:club:'));
const mineKey = keys.find((k) => k.startsWith('uil:min:'));
ok('both meters agree on the amount', store[clubKey] === store[mineKey],
  `${store[mineKey]} vs ${store[clubKey]}`);

ok('a single recording is clamped to MAX_REC_SEC before it is metered',
  store[mineKey] === q.MAX_REC_SEC, `${store[mineKey]}s — a 10-minute claim must not bill 10 minutes`);

// --- a second member adds to the same club bucket --------------------------------
await q.addUsage('p:2', 180, 100);
ok('a second member accumulates into the same club bucket', store[clubKey] === 360,
  'got ' + store[clubKey]);
club = await q.getClubUsage();
ok('...and the club reads 6 minutes', club.usedMin === 6, 'got ' + club.usedMin);
ok('still under a 100-minute ceiling', !club.over);

// --- reaching the ceiling ---------------------------------------------------------
store[clubKey] = 100 * 60;
club = await q.getClubUsage();
ok('at exactly the ceiling it is over', club.over, `${club.usedMin}/${club.capMin}`);

// --- the crucial separation: club over, member fine --------------------------------
const mine = await q.getUsage('p:1', 100);
ok('a member with minutes left is NOT over their own quota', !mine.over,
  'the club being out must never render as "you have used your minutes"');

// --- fail open ---------------------------------------------------------------------
mode = 'down';
club = await q.getClubUsage();
ok('KV down fails OPEN, not closed', !club.over && club.unmetered === true,
  'locking every paying member out during a blip is the worse failure');
mode = 'live';

// --- disabling it ------------------------------------------------------------------
{
  const saved = process.env.UIL_CLUB_CAP_MIN;
  process.env.UIL_CLUB_CAP_MIN = '0';
  const fresh = await import('../lib/quota.js?disabled=1');
  ok('a cap of 0 disables the ceiling', fresh.CLUB_CAP_MIN === 0);
  const c = await fresh.getClubUsage();
  ok('...and nothing is ever over it', !c.over);
  process.env.UIL_CLUB_CAP_MIN = saved;
}

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
