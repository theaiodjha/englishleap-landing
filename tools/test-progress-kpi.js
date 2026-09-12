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
  // wireKpi() listens on the drawer and measures it; give the stub just enough to survive
  addEventListener() {}, style: { setProperty() {}, getPropertyValue: () => '' },
  scrollHeight: 0, getBoundingClientRect: () => ({ left: 0, width: 0 }),
};
// wireKpi() binds Escape on the document, so the stub needs a listener sink
global.document = { querySelector: () => el, querySelectorAll: () => [], addEventListener() {} };
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
  bars: [{ ym: '2026-07', label: 'Jul', minutes: 20, sessions: 3 },
         { ym: '2026-08', label: 'Aug', minutes: 35, sessions: 5 },
         { ym: '2026-09', label: 'Sep', minutes: 29, sessions: 0 }],
  mastery: [{ n: 280, title: 'Listen & Speak', owned: 2, started: 1, untouched: 3,
              words: [{ w: 'a', state: 'owned' }] }],
  byType: { 'clue-room': 1 },
  types: [{ type: 'clue-room', name: 'Clue Room', icon: '\u{1F50D}', accent: '#8b6cff' }],
  usedMin: 2, limitMin: 100,
  recent: [{ t: Date.parse('2026-09-12'), episodeId: 'ep280', n: 280, title: 'Listen & Speak',
             minutes: 2, words: ['retrieve'], wpm: 110,
             wins: ['You kept going when you paused.', 'Nice use of "retrieve".'],
             tweak: 'Try slowing down on the last sentence.' }],
  weeks: [{ week: '2026-W30', active: false, current: false },
          { week: '2026-W37', active: true, current: true }],
  next: { why: 'x', cta: 'Go', href: '/', words: ['put off', 'slip away'] },
};

m.render(full);
let h = out.html;
const hFull = h;   // kept for the assertions further down, after `h` is reassigned

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

// --- the three cards below the KPI row ---
ok('the KPI card may overflow, so a selected tile is not clipped',
  /class="card wide nofold"/.test(hFull));
// The allowance must match the METER (what Use It Live enforces), not the practice
// history — the two are separate counters and the meter can legitimately be ahead.
ok('allowance shows the meter, not the history aggregate',
  /2 <span>of 100 minutes used this month/.test(hFull) && /98 left/.test(hFull),
  'history for that month says 29 min; the meter says 2');
ok('...and says what it counts, so it cannot be read as the all-time total',
  /Counted when a recording is analysed/.test(hFull));
ok('episode rows open to name the phrases, not just count them',
  /class="ep opens"/.test(hFull) && /class="epwords"/.test(hFull));
ok('...and do NOT reuse .go, which is the page gradient CTA class',
  !/class="ep go"/.test(hFull));
ok('row highlights are inset, not bled past a clipping card body',
  !/margin:0 calc\(var\(--sp-2\) \* -1\)/.test(page));
// the account avatar already names who is signed in; the page header does not repeat it
ok('the header carries no greeting', !/id="hi"/.test(page));
ok('...and each phrase carries its own state', /<i class="owned">a<\/i>/.test(hFull));
ok('game rows are links into that game',
  /<a class="gt" href="\/arcade-type.html\?type=clue-room"/.test(hFull));
ok('...wearing the catalogue accent and icon',
  /--ga:#8b6cff/.test(hFull) && /class="gi"[^>]*>\u{1F50D}</u.test(hFull));
ok('no duplicate style attribute on the track', !/style="[^"]*" style="/.test(hFull));

ok('a month with sessions is a clickable column', /class="col" data-ym="2026-08"/.test(hFull));
ok('...with a hit area bigger than the bar itself', /class="hit"/.test(hFull));
ok('What next shows the phrases it means', /class="nextwords"/.test(hFull) && /<i>put off<\/i>/.test(hFull));

// the blank first visit names what will appear rather than showing four zeros
m.render({ hasAnything: false, totals: {} });
const hEmpty = out.html;
ok('empty state lists what the page will show', /class="soon"/.test(hEmpty)
  && /Minutes practised/.test(hEmpty) && /Phrases you own/.test(hEmpty));
ok('empty state still offers a way to start', /Start practising/.test(hEmpty));

const rec = m.drawerHTML(full, 'recent', {e:'M'});
ok('recent drawer names the episode', /EP280/.test(rec));
ok('recent drawer gives minutes and pace', /2 min/.test(rec) && /110 wpm/.test(rec));
ok('recent drawer says the audio is not kept', /never the audio/.test(rec));

// the panel must say which tile it belongs to, for anyone who cannot use colour or the
// connector line
ok('recent drawer is titled', /kdraw-head/.test(rec) && /Your last 1 recording</.test(rec));
ok('...and says "recording", not "recordings"', !/1 recordings/.test(rec));
ok('recent drawer repeats the tile emoji', /class="ic" aria-hidden="true">M</.test(rec));

// the feedback, read back in the order it was given
ok('feedback is shown for a recording', /class="fb"/.test(rec) && /Oriva&rsquo;s feedback/.test(rec));
ok('both wins appear', /You kept going when you paused\./.test(rec)
  && /Nice use of &quot;retrieve&quot;\./.test(rec));
ok('the tweak appears too', /Try slowing down on the last sentence\./.test(rec));
ok('wins come BEFORE the tweak — that order is the format',
  rec.indexOf('You kept going') < rec.indexOf('Try slowing down'));
ok('it is collapsed by default', !/<details class="fb" open/.test(rec));

// a recording made before wins were stored as text
const old = m.drawerHTML({ ...full, recent: [{ ...full.recent[0], wins: [], tweak: 'Try a slower pace.' }] },
  'recent', { e: 'M' });
ok('an older recording shows its note without pretending to have wins',
  /Oriva&rsquo;s note/.test(old) && !/Oriva&rsquo;s feedback/.test(old));
ok('...and still shows the tweak', /Try a slower pace\./.test(old));

// nothing stored at all -> no empty disclosure widget
const none = m.drawerHTML({ ...full, recent: [{ ...full.recent[0], wins: [], tweak: '' }] },
  'recent', { e: 'M' });
ok('a recording with no feedback shows no toggle', !/class="fb"/.test(none));

const wk = m.drawerHTML(full, 'weeks', {e:'F'});
ok('week strip marks a practised week', /class="on/.test(wk));
ok('week strip rings the current week', /cur/.test(wk));
ok('week drawer is titled with the count', /kdraw-head/.test(wk) && /1 week of the last 2</.test(wk));
ok('week drawer labels both ends of the strip', /2w ago/.test(wk) && /now</.test(wk));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
