/* node tools/test-episode-pager.js
 *
 * The in-game episode arrows: the neighbours the API hands back, and what the control
 * renders. Neighbours WRAP, so the interesting cases are the seams — past the oldest is
 * the newest — and the one-episode game, which must link nowhere rather than to itself.
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
ok('the route wraps rather than stopping', /\(eIdx \+ off \+ n\) % n/.test(api));
ok('...and finds the episode by index, not just by value',
  /findIndex\(\(x\) => x\.id === ep\)/.test(api));
ok('a single-episode game gets no neighbours at all', /if \(n < 2\) return null/.test(api));

const episodes = [
  { id: 'ep280', ep: 'EP280', title: 'Speak Like a Native' },
  { id: 'ep279', ep: 'EP279', title: 'Everyday Expressions' },
  { id: 'ep278', ep: 'EP278', title: 'Listen Every Day' },
];
// mirrors near() in api/games.js
const at = (id, list = episodes) => {
  const i = list.findIndex((x) => x.id === id);
  const n = list.length;
  const near = (off) => (n < 2 ? null : list[(i + off + n) % n]);
  return { prev: near(-1), next: near(1) };
};

ok('the middle episode has both neighbours',
  at('ep279').prev.id === 'ep280' && at('ep279').next.id === 'ep278');
ok('past the oldest comes the newest', at('ep278').next.id === 'ep280');
ok('before the newest comes the oldest', at('ep280').prev.id === 'ep278');
ok('so no episode is ever a dead end',
  episodes.every((e) => at(e.id).prev && at(e.id).next));
ok('a one-episode game links nowhere, not to itself',
  at('ep280', [episodes[0]]).prev === null && at('ep280', [episodes[0]]).next === null);

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
ok('both arrows render as links', (el.innerHTML.match(/<a class="[pn]" href="\?ep=/g) || []).length === 2);
ok('...pointing at the right episodes',
  /\?ep=ep280/.test(el.innerHTML) && /\?ep=ep278/.test(el.innerHTML));
ok('...one on each side', /class="p"/.test(el.innerHTML) && /class="n"/.test(el.innerHTML));
ok('...carrying rel=prev / rel=next for the browser',
  /rel="prev"/.test(el.innerHTML) && /rel="next"/.test(el.innerHTML));
ok('the control is revealed once filled', el.hidden === false);

ok('the label is the episode number and nothing else',
  /<b>EP280<\/b>/.test(el.innerHTML) && !/Everyday Expressions/.test(el.innerHTML));
ok('each arrow still says where it goes, for a screen reader',
  /aria-label="Previous episode, EP280"/.test(el.innerHTML)
  && /aria-label="Next episode, EP278"/.test(el.innerHTML));

// the ends of the run no longer exist
el = render(at('ep278'));
ok('the oldest episode still offers a way forward', /rel="next"/.test(el.innerHTML));
ok('...and nothing is rendered as disabled', !/<span>/.test(el.innerHTML));

// one lonely episode: no arrows at all
el = render({ prev: null, next: null });
ok('a single-episode game shows no arrows', el.innerHTML === '' && el.hidden === true);

// titles are escaped, since they come from the catalogue
el = render({ prev: { id: 'x', ep: 'EP1', title: '<img src=x>' }, next: null });
ok('a title is escaped, not injected', !/<img/.test(el.innerHTML));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
