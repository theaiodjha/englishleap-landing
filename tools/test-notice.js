/* node tools/test-notice.js
 *
 * The notice strip and the quota warning it carries.
 *
 * The rule worth protecting is the DISMISSAL KEY. A recurring notice must carry its period
 * ("uil-quota-2026-09"), so dismissing this month's warning cannot silence next month's —
 * otherwise the one time it matters, it will already have been switched off.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NAV = fs.readFileSync(path.join(ROOT, 'elc-nav.js'), 'utf8');
const UIL = fs.readFileSync(path.join(ROOT, 'out-loud.html'), 'utf8');

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
};

// ---------------------------------------------------------------- ELCNotice
function bootNav(store = {}) {
  const el = {
    innerHTML: '', handlers: {},
    querySelector: () => el._x,
    addEventListener() {},
  };
  el._x = { addEventListener: (ev, fn) => { el._x.click = fn; } };
  global.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
  };
  global.document = {
    readyState: 'complete', documentElement: { classList: { toggle() {}, add() {}, remove() {} } },
    getElementById: () => null, querySelector: () => null, addEventListener() {},
  };
  global.location = { pathname: '/out-loud.html', origin: 'https://englishleap.app', search: '' };
  global.window = global;
  global.addEventListener = () => {};
  global.setTimeout = () => 0;
  global.URL = URL;
  global.fetch = () => Promise.resolve();
  new Function(NAV)();
  return { el, store };
}

let b = bootNav();
ok('a fresh notice renders', global.ELCNotice(b.el, { key: 'k1', html: 'hello' }) === true);
ok('...with its text and a dismiss control',
  /hello/.test(b.el.innerHTML) && /class="nx"/.test(b.el.innerHTML));
ok('tone becomes a class', /elcnotice warn/.test(
  (bootNav().el, global.ELCNotice(b.el, { key: 'k2', tone: 'warn', html: 'x' }), b.el.innerHTML)));

// dismissing it
b = bootNav();
global.ELCNotice(b.el, { key: 'k1', html: 'hello' });
b.el._x.click();
ok('dismissing empties the strip', b.el.innerHTML === '');
ok('...and is remembered', /k1/.test(b.store['elc-notice-seen'] || ''));

// and stays dismissed on the next page load
const again = bootNav(b.store);
ok('a dismissed key does not come back',
  global.ELCNotice(again.el, { key: 'k1', html: 'hello' }) === false);
ok('...but a different key still shows',
  global.ELCNotice(again.el, { key: 'k2', html: 'hello' }) === true);

// the stored list cannot grow forever
b = bootNav();
for (let i = 0; i < 60; i++) { global.ELCNotice(b.el, { key: 'n' + i, html: 'x' }); b.el._x.click(); }
ok('the dismissed list stays bounded',
  JSON.parse(b.store['elc-notice-seen']).length <= 40,
  `${JSON.parse(b.store['elc-notice-seen']).length} keys`);

// ---------------------------------------------------------------- quotaNotice
const block = [...UIL.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((x) => x[1]).find((x) => /function quotaNotice/.test(x));
if (!block) throw new Error('quotaNotice() not found');
const fn = block.slice(block.indexOf('function quotaNotice'));
const body = fn.slice(0, fn.indexOf('\n}') + 2);

function runQuota(u, store = {}) {
  const el = { innerHTML: '', querySelector: () => ({ addEventListener() {} }) };
  const calls = [];
  const ctx = new Function('$', 'ELCNotice', 'Date', body + '\nreturn quotaNotice;')(
    () => el,
    (target, o) => { calls.push(o); return true; },
    Date,
  );
  ctx(u);
  return { el, calls };
}

let q = runQuota({ limitMin: 100, remainingMin: 74, usedMin: 26 });
ok('plenty left: nothing is said', q.el.innerHTML === '' && q.calls.length === 0);

q = runQuota({ limitMin: 100, remainingMin: 20, usedMin: 80 });
ok('at the threshold the warning appears', q.calls.length === 1);
ok('...and names the minutes left', /About 20 minutes left/.test(q.calls[0].html));
ok('...keyed to THIS month, so next month warns again',
  /^uil-quota-\d{4}-\d{2}$/.test(q.calls[0].key), q.calls[0].key);

q = runQuota({ limitMin: 100, remainingMin: 1, usedMin: 99 });
ok('one minute left reads as singular', /About 1 minute left/.test(q.calls[0].html));

q = runQuota({ limitMin: 100, remainingMin: 0, usedMin: 100 });
ok('at zero it states the fact rather than warning',
  q.calls.length === 0 && /used this month/.test(q.el.innerHTML));
ok('...and is NOT dismissible — it is the current state, not news',
  !/class="nx"/.test(q.el.innerHTML));
ok('...and points at something still open', /Arcade/.test(q.el.innerHTML));

// a bigger tier keeps proportional runway
q = runQuota({ limitMin: 400, remainingMin: 80, usedMin: 320 });
ok('a 400-minute tier warns at 80, not at 15', q.calls.length === 1);
q = runQuota({ limitMin: 400, remainingMin: 81, usedMin: 319 });
ok('...and not before', q.calls.length === 0);

// an unmetered/dev session must not invent a warning
q = runQuota({ limitMin: 0, remainingMin: 0, usedMin: 0 });
ok('no limit configured: say nothing', q.el.innerHTML === '' && q.calls.length === 0);

// ---------------------------------------------------------------- arcadeNotices
// Exactly one notice, chosen by priority. Three strips above the games is a wall.
const ARC = fs.readFileSync(path.join(ROOT, 'practice-arcade.html'), 'utf8');
const arcBlock = [...ARC.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((x) => x[1]).find((x) => /function arcadeNotices/.test(x));
if (!arcBlock) throw new Error('arcadeNotices() not found');
const arcFn = arcBlock.slice(arcBlock.indexOf('function arcadeNotices'));
const arcBody = arcFn.slice(0, arcFn.indexOf('\n}') + 2);

function runArcade(d, { launched = false } = {}) {
  const calls = [];
  const el = { innerHTML: '' };
  const fn = new Function('document', 'ELCNotice', 'window', 'Date',
    arcBody + '\nreturn arcadeNotices;')(
    { getElementById: () => el },
    (target, o) => { calls.push(o); return true; },
    { ELC_SHOW_UIL: launched },
    Date,
  );
  fn(d);
  return calls;
}

const DAY = 86400000;
const fresh = { access: 'paid', lastAt: Date.now() - 2 * DAY };
const away = { access: 'paid', lastAt: Date.now() - 30 * DAY };

ok('a recent, paid member is told nothing', runArcade(fresh).length === 0);

let c = runArcade(fresh, { launched: true });
ok('the launch is announced once live', c.length === 1 && c[0].key === 'uil-launch');
ok('...with no period in the key, because it is genuinely once', !/\d{4}/.test(c[0].key));

c = runArcade({ access: 'trial', lastAt: Date.now() - 2 * DAY });
ok('a trial member is told what happens next', c.length === 1 && c[0].key === 'trial-open');

c = runArcade(away);
ok('three weeks away earns a nudge', c.length === 1 && /^away-/.test(c[0].key));
ok('...keyed to the week, so it can return if they stay away',
  /^away-\d{4}-\d{1,2}$/.test(c[0].key), c[0] && c[0].key);

ok('two weeks away is not yet a nudge',
  runArcade({ access: 'paid', lastAt: Date.now() - 14 * DAY }).length === 0);
ok('a member who has never practised is not nudged',
  runArcade({ access: 'paid', lastAt: null }).length === 0);

// priority, and only ever one
c = runArcade({ access: 'trial', lastAt: Date.now() - 30 * DAY }, { launched: true });
ok('with everything true at once, exactly ONE strip shows', c.length === 1);
ok('...and it is the news', c[0].key === 'uil-launch');
c = runArcade({ access: 'trial', lastAt: Date.now() - 30 * DAY });
ok('without the launch, state beats the nudge', c.length === 1 && c[0].key === 'trial-open');

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
