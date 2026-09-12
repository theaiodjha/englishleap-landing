/* node tools/test-episode-pager.js
 *
 * The in-game episode pager: the neighbours the API hands back, and how the control
 * renders at the ENDS of the run — where an off-by-one silently offers a link to an
 * episode that does not exist, or drops a control and makes the other one jump sideways.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
};

// ---------------------------------------------------------------- the server's neighbours
// Mirrors api/games.js: episodes are newest-first, prev is newer, next is older.
const api = fs.readFileSync(path.join(ROOT, 'api', 'games.js'), 'utf8');
ok('the route computes neighbours from the ordered array',
  /const near = \(i\) =>/.test(api) && /prev: near\(eIdx - 1\), next: near\(eIdx \+ 1\)/.test(api));
ok('...and finds the episode by index, not just by value',
  /findIndex\(\(x\) => x\.id === ep\)/.test(api));

const episodes = [
  { id: 'ep280', ep: 'EP280', title: 'Speak Like a Native' },
  { id: 'ep279', ep: 'EP279', title: 'Everyday Expressions' },
  { id: 'ep278', ep: 'EP278', title: 'Listen Every Day' },
];
const near = (i) => (episodes[i] ? episodes[i] : null);
const at = (id) => {
  const i = episodes.findIndex((x) => x.id === id);
  return { prev: near(i - 1), next: near(i + 1) };
};

ok('the middle episode has both neighbours',
  at('ep279').prev.id === 'ep280' && at('ep279').next.id === 'ep278');
ok('the newest has no previous', at('ep280').prev === null && at('ep280').next.id === 'ep279');
ok('the oldest has no next', at('ep278').next === null && at('ep278').prev.id === 'ep279');
ok('a negative index never wraps to the end of the array', near(-1) === null);

// ---------------------------------------------------------------- the rendered control
const page = fs.readFileSync(path.join(ROOT, 'games', 'phrase-pairs', 'index.html'), 'utf8');
const block = [...page.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((x) => x[1]).find((x) => /function epPager/.test(x));
if (!block) throw new Error('epPager() not found');
const fn = block.slice(block.indexOf('function epPager'));
const body = fn.slice(0, fn.indexOf('\n}') + 2);

// Use the PAGE's own esc(), not a stand-in: an identity function would sail through the
// escaping assertion while the real page injected markup.
const escSrc = block.match(/function esc\([\s\S]*?\n\}/) || block.match(/const esc=[^\n]+/);
if (!escSrc) throw new Error('esc() not found in the page');
const pageEsc = new Function(escSrc[0] + '\nreturn esc;')();

function render(d) {
  const el = { innerHTML: '', hidden: true };
  new Function('$', 'esc', body + '\nreturn epPager;')(() => el, pageEsc)(d);
  return el;
}

let el = render(at('ep279'));
ok('both neighbours render as links', (el.innerHTML.match(/<a href="\?ep=/g) || []).length === 2);
ok('...pointing at the right episodes',
  /\?ep=ep280/.test(el.innerHTML) && /\?ep=ep278/.test(el.innerHTML));
ok('...and carry rel=prev / rel=next for the browser',
  /rel="prev"/.test(el.innerHTML) && /rel="next"/.test(el.innerHTML));
ok('the control is revealed once filled', el.hidden === false);

el = render(at('ep280'));
ok('at the newest, the end is shown in place rather than dropped',
  /<span>/.test(el.innerHTML) && /Newest episode/.test(el.innerHTML));
ok('...and offers no link backwards', !/rel="prev"/.test(el.innerHTML));
ok('...while the forward link still works', /rel="next"/.test(el.innerHTML));

el = render(at('ep278'));
ok('at the oldest, the far end is shown in place', /Oldest episode/.test(el.innerHTML));
ok('...and offers no link forwards', !/rel="next"/.test(el.innerHTML));

// a single-episode game must not offer either
el = render({ prev: null, next: null });
ok('one lonely episode: two ends, no links',
  (el.innerHTML.match(/<span>/g) || []).length === 2 && !/<a /.test(el.innerHTML));

// titles are escaped, since they come from the catalogue
el = render({ prev: { id: 'x', ep: 'EP1', title: '<img src=x>' }, next: null });
ok('a title is escaped, not injected', !/<img/.test(el.innerHTML));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
