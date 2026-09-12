// node tools/test-stats.mjs — the publishing rules for the home page's club numbers.
// These are the assertions that keep the strip from either lying or embarrassing you:
// nothing is published below the floor, and every figure is rounded DOWN.
// lib/history.js reads KV_REST_API_* at MODULE LOAD, and ESM hoists imports above all
// statements — so these must be set before the dynamic import, not after a static one.
process.env.KV_REST_API_URL = process.env.KV_REST_API_URL || 'https://example.invalid';
process.env.KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || 'test';
const { default: handler } = await import('../api/stats.js');

// Stand in for KV by intercepting the pipeline fetch lib/history.js makes.
const realFetch = globalThis.fetch;
function withStats({ members, active, games, uilsec }) {
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ([
      { result: members }, { result: active },
      { result: String(games) }, { result: String(uilsec) },
    ]),
  });
}

async function call(stats) {
  withStats(stats);
  let body = null, headers = {};
  await handler({}, {
    setHeader: (k, v) => { headers[k.toLowerCase()] = v; },
    json: (b) => { body = b; return b; },
  });
  return { body, headers };
}

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
};

const tiny = await call({ members: 9, active: 4, games: 30, uilsec: 600 });
ok('9 members publishes nothing', tiny.body.show === false);
ok('...and leaks no figure', !('members' in tiny.body),
  JSON.stringify(tiny.body));

const real = await call({ members: 412, active: 88, games: 8351, uilsec: 74000 });
ok('412 members -> "400+"', real.body.members === 400, `got ${real.body.members}`);
ok('8351 games -> "8,000+"', real.body.games === 8000, `got ${real.body.games}`);
ok('88 active -> "80+"', real.body.active === 80, `got ${real.body.active}`);
ok('74000s -> 1233 min -> "1,000+"', real.body.minutes === 1000, `got ${real.body.minutes}`);
ok('every figure rounds DOWN, never up',
  real.body.members <= 412 && real.body.games <= 8351 && real.body.active <= 88);

const quiet = await call({ members: 60, active: 3, games: 40, uilsec: 100 });
ok('a thin week omits "active" rather than saying 0', quiet.body.active === null);
ok('too few games omits that figure', quiet.body.games === null);
ok('too few minutes omits that figure', quiet.body.minutes === null);
ok('but the member count still shows', quiet.body.members === 60);

ok('edge-cached, so visitors do not each cost a KV read',
  /s-maxage=600/.test(real.headers['cache-control'] || ''),
  real.headers['cache-control'] || '(none)');
ok('stale-while-revalidate, so a cold cache never waits on KV',
  /stale-while-revalidate/.test(real.headers['cache-control'] || ''));

// KV unreachable must hide the strip, not throw
globalThis.fetch = async () => { throw new Error('kv down'); };
let crashed = false, out = null;
try {
  await handler({}, { setHeader() {}, json: (b) => { out = b; } });
} catch { crashed = true; }
ok('KV down: no throw', !crashed);
ok('KV down: strip hidden', out && out.show === false);

globalThis.fetch = realFetch;
console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
