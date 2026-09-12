/* node tools/test-nav-hint.js
 *
 * The first-frame account hint. What this protects:
 *   - a returning member's header and floating controls settle on frame ONE, so the theme
 *     toggle and tour pill are never created visible and then hidden;
 *   - nobody is ever shown the WRONG state — "Member Login" must not appear for a member
 *     whose fetch is merely slow, which is what the old 600ms fallback did;
 *   - signing out clears the hint, so the next page does not paint a stale avatar.
 */
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'elc-nav.js'), 'utf8');

function boot({ hint = null, pathname = '/progress.html' } = {}) {
  const store = {};
  if (hint) store['elc-acct'] = JSON.stringify(hint);
  const htmlClasses = new Set();
  const slot = { id: 'acct', innerHTML: '' };
  const timers = [];

  const node = (id) => (id === 'acct' ? slot : {
    id, innerHTML: '', hidden: true, dataset: {},
    classList: { toggle() {}, add() {}, remove() {} },
    setAttribute() {}, focus() {}, addEventListener() {},
    querySelector: () => ({ addEventListener() {}, querySelectorAll: () => [] }),
    querySelectorAll: () => [],
  });

  global.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = v; },
    removeItem: (k) => { delete store[k]; },
  };
  global.document = {
    readyState: 'complete',
    documentElement: {
      classList: {
        toggle: (c, on) => { on ? htmlClasses.add(c) : htmlClasses.delete(c); },
        add: (c) => htmlClasses.add(c), remove: (c) => htmlClasses.delete(c),
      },
    },
    getElementById: (id) => (id === 'elcnav' ? null : node(id)),
    querySelector: () => null,
    addEventListener() {},
  };
  global.location = { pathname, origin: 'https://englishleap.app', search: '' };
  global.window = global;
  global.addEventListener = () => {};
  global.URL = URL;
  global.fetch = () => Promise.resolve();
  global.setTimeout = (fn, ms) => { timers.push({ fn, ms }); return timers.length; };
  global.clearTimeout = () => {};
  global.ELCTheme = { mode: () => 'auto', set() {}, hide() {}, show() {} };
  global.ELCTour = undefined;

  new Function(SRC)();
  return { store, htmlClasses, slot, timers, ELCAccount: global.ELCAccount };
}

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
};

// --- a returning member -------------------------------------------------------
const back = boot({ hint: { name: 'Fahad preview', plan: 'fluency' } });
ok('avatar is drawn on the first frame, before any fetch',
  /elcnav-av/.test(back.slot.innerHTML) && /FP/.test(back.slot.innerHTML));
ok('...with the remembered tier', /plan-fluency/.test(back.slot.innerHTML));
ok('theme toggle is suppressed before theme.js builds it',
  back.htmlClasses.has('elc-nofloat-theme'));
ok('tour pill is suppressed before elc-tour.js mounts it',
  back.htmlClasses.has('elc-nolaunch'));

// --- a first-time or signed-out visitor ---------------------------------------
const cold = boot({ hint: null });
ok('no hint -> nothing is guessed, the slot stays empty', cold.slot.innerHTML === '');
ok('...and the floating controls are left alone',
  !cold.htmlClasses.has('elc-nofloat-theme') && !cold.htmlClasses.has('elc-nolaunch'));

// --- the safety net -----------------------------------------------------------
const net = cold.timers.filter((t) => t.ms >= 2000);
ok('the fallback waits longer than a round trip', net.length === 1, `at ${net[0] && net[0].ms}ms`);
ok('...and 600ms, which used to flash "Member Login", is gone',
  !cold.timers.some((t) => t.ms === 600));

// --- the truth arrives --------------------------------------------------------
const live = boot({ hint: null });
live.ELCAccount({ name: 'Anna Smith', plan: 'transcript' });
ok('a real answer is remembered for next time',
  JSON.parse(live.store['elc-acct']).name === 'Anna Smith');
ok('...and suppresses the floating controls', live.htmlClasses.has('elc-nolaunch'));

// --- signed out, or signed out elsewhere --------------------------------------
const out = boot({ hint: { name: 'Fahad preview', plan: 'fluency' } });
out.ELCAccount(null);
ok('a signed-out answer clears the stale hint', !('elc-acct' in out.store));
ok('...and gives the floating controls back',
  !out.htmlClasses.has('elc-nofloat-theme') && !out.htmlClasses.has('elc-nolaunch'));

// --- drawing from cache must not overwrite the cache with itself --------------
const h = boot({ hint: { name: 'Fahad preview', plan: 'fluency' } });
ok('the hint render leaves the stored hint untouched',
  JSON.parse(h.store['elc-acct']).plan === 'fluency');

// ---------------------------------------------------------------- ELCReveal
// Presentation, but with a non-cosmetic failure mode: if the class is not applied the
// card stays display:none and the member never sees it at all.
function revealEl() {
  const cls = new Set();
  return {
    hidden: true, scrollHeight: 180, offsetHeight: 0,
    classList: { add(...c) { c.forEach((x) => cls.add(x)); }, has: (c) => cls.has(c), _s: cls },
    style: {}, addEventListener() {}, removeEventListener() {},
  };
}
function withMotion(reduce) {
  global.window = global;
  global.matchMedia = () => ({ matches: reduce });
  boot();                                     // re-evaluates elc-nav.js, redefining ELCReveal
}

withMotion(false);
let r = revealEl();
global.ELCReveal(r, 'show has-oriva');
ok('reveal applies every class it is given',
  r.classList.has('show') && r.classList.has('has-oriva'));
ok('...and animates from zero height', r.style.height === '180px' && r.style.opacity === '1');
ok('...having started from nothing', typeof r.style.transition === 'string'
  && /height/.test(r.style.transition));

r = revealEl();
global.ELCReveal(r);
ok('with no class it unhides instead', r.hidden === false);

withMotion(true);
r = revealEl();
global.ELCReveal(r, 'show');
ok('reduced motion: the card still shows', r.classList.has('show'));
ok('...but nothing moves', r.style.height === undefined && r.style.transition === undefined);

r = revealEl();
r.scrollHeight = 0;                           // nothing to reveal yet
global.ELCReveal(r, 'show');
ok('a zero-height card is left alone rather than pinned at 0', r.style.height === undefined);

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
