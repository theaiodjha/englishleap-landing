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
  const slotCls = new Set();
  const slot = { id: 'acct', innerHTML: '',
    classList: { add: (c) => slotCls.add(c), remove: (c) => slotCls.delete(c),
                 contains: (c) => slotCls.has(c) } };
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
  return { store, htmlClasses, slot, slotCls, timers, ELCAccount: global.ELCAccount };
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

// The card is absolutely positioned against .elcnav-acct{position:relative}. Without
// that class it anchors to some far ancestor and hangs off the edge of the screen — which
// is exactly what the game bars did, because their slot was a bare <div id="acct">.
ok('the slot is given its positioning class, whatever the page forgot',
  back.slotCls.has('elcnav-acct'));

// --- a first-time or signed-out visitor ---------------------------------------
// The card is now the ONLY home of the theme and the tour, so a signed-out visitor gets it
// on the first frame too — the same circle as a member's avatar, carrying a person glyph.
const cold = boot({ hint: null });
ok('no hint -> the signed-out control is drawn straight away',
  /elcnav-av anon/.test(cold.slot.innerHTML));
ok('...leading with Sign in', /Sign in<\/span>/.test(cold.slot.innerHTML)
  && /\/api\/auth\/login\?next=/.test(cold.slot.innerHTML));
ok('...carrying the theme and the tour', /elcnav-card-theme/.test(cold.slot.innerHTML)
  && /Take the tour/.test(cold.slot.innerHTML));
ok('...and no member-only rows', !/Sign out/.test(cold.slot.innerHTML)
  && !/Your progress/.test(cold.slot.innerHTML));
ok('"Member Login" is gone for good', !/Member Login/.test(cold.slot.innerHTML));
ok('the floating corner controls are suppressed for everyone',
  cold.htmlClasses.has('elc-nofloat-theme') && cold.htmlClasses.has('elc-nolaunch'));
ok('a provisional signed-out draw does not wipe anything from storage',
  !('elc-acct' in cold.store));
ok('no timer is needed: the slot is never left empty',
  !cold.timers.some((t) => t.ms === 600 || t.ms === 2500));

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
ok('...swaps the initials for the signed-out card in the same slot',
  /elcnav-av anon/.test(out.slot.innerHTML) && !/FP/.test(out.slot.innerHTML));
ok('...and the floating controls stay retired',
  out.htmlClasses.has('elc-nofloat-theme') && out.htmlClasses.has('elc-nolaunch'));

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
