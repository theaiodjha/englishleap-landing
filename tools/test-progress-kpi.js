/* node tools/test-progress-kpi.js
 *
 * The progress page's KPI tiles: where each one leads, and — the part worth protecting —
 * that a tile whose target does not exist for this member is NOT rendered as a button.
 * A clickable number that opens an empty card is worse than a number you cannot click.
 *
 * Reads render() straight out of progress.html so the test cannot drift from the page.
 */
const fs = require('fs');
const path = require('path');

const page = fs.readFileSync(path.join(__dirname, '..', 'progress.html'), 'utf8');
// several inline scripts; take the one defining render(), and stop before the loader IIFE
const blocks = [...page.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((x) => x[1]);
const block = blocks.find((b) => /function\s+render\s*\(/.test(b));
if (!block) throw new Error('render() not found in progress.html');

// enough of a DOM for render() to build its string
const out = {};
const store = {};
global.localStorage = { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } };
const el = {
  set innerHTML(v) { out.html = v; }, get innerHTML() { return out.html || ''; },
  classList: { add() {}, remove() {} }, querySelectorAll: () => [], textContent: '',
};
global.document = { querySelector: () => el, querySelectorAll: () => [] };
global.window = { matchMedia: () => ({ matches: false }) };
global.matchMedia = () => ({ matches: false });
global.addEventListener = () => {};
global.requestAnimationFrame = (f) => f(0);
global.performance = { now: () => 0 };

const m = new Function(block.split('(async()=>{')[0] + '\nreturn { render, drawerHTML };')();

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
};

const full = {
  hasAnything: true,
  totals: { minutes: 84, sessions: 6, phrasesOwned: 7, episodesTotal: 30 },
  streak: 3, pace: 118, monthsWithData: 3, episodesTotal: 30, untouchedEpisodes: 24,
  bars: [{ label: 'Jul', minutes: 20, sessions: 3 }, { label: 'Aug', minutes: 35, sessions: 5 },
         { label: 'Sep', minutes: 29, sessions: 4 }],
  mastery: [{ n: 280, title: 'Listen & Speak', owned: 2, started: 1, untouched: 3,
              words: [{ w: 'a', state: 'owned' }] }],
  byType: { 'clue-room': 1 }, types: [{ type: 'clue-room', name: 'Clue Room' }],
  recent: [{ t: Date.parse('2026-09-12'), episodeId: 'ep280', n: 280, title: 'Listen & Speak',
             minutes: 2, words: ['retrieve'], wpm: 110 }],
  weeks: [{ week: '2026-W30', active: false, current: false },
          { week: '2026-W37', active: true, current: true }],
  next: { why: 'x', cta: 'Go', href: '/' },
};

m.render(full);
let h = out.html;

ok('a member with history gets four clickable tiles',
  (h.match(/<button type="button" class="k/g) || []).length === 4);
ok('minutes points at the chart card it already has', /data-card="cb-speaking"/.test(h));
ok('phrases points at the mastery card it already has', /data-card="cb-phrases"/.test(h));
ok('recordings owns a drawer', /data-go="recent"[^>]*aria-expanded="false"/.test(h));
ok('streak owns a drawer', /data-go="weeks"/.test(h));
ok('the drawer starts closed', /id="kdraw" style="max-height:0"/.test(h));

// a first-week member: no chart yet, no phrases owned, no active week
const thin = {
  ...full, monthsWithData: 1, mastery: [],
  weeks: [{ week: '2026-W37', active: false, current: true }],
  totals: { minutes: 2, sessions: 1, phrasesOwned: 0, episodesTotal: 30 }, streak: 1,
};
m.render(thin);
h = out.html;
ok('with nothing to show, only the tile that leads somewhere is a button',
  (h.match(/<button type="button" class="k/g) || []).length === 1, 'the rest are plain divs');
ok('...and it is recordings', /data-go="recent"/.test(h));
ok('no dead affordance on the empty tiles',
  !/data-card="cb-phrases"/.test(h) && !/data-card="cb-speaking"/.test(h));

const rec = m.drawerHTML(full, 'recent');
ok('recent drawer names the episode', /EP280/.test(rec));
ok('recent drawer gives minutes and pace', /2 min/.test(rec) && /110 wpm/.test(rec));
ok('recent drawer says the audio is not kept', /never the audio/.test(rec));

const wk = m.drawerHTML(full, 'weeks');
ok('week strip marks a practised week', /class="on/.test(wk));
ok('week strip rings the current week', /cur/.test(wk));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
