/* node tools/shadow-build.mjs <script.txt> <aligner.json> [-o out.json]
 *
 * Joins the two halves of a shadowing exercise: the STRUCTURE, read out of the narration
 * script, and the TIMINGS, measured by tools/shadow-align.html. Emits the exercise JSON the
 * player reads, and refuses to emit anything it cannot verify.
 *
 * The split exists because the two halves come from different places and go stale
 * independently — re-edit the script and the timings are wrong; re-record and the structure
 * still holds. Keeping them separate until the last moment means a mismatch is caught here
 * rather than showing up as a line that highlights two seconds late in front of a member.
 *
 * It imports smartParse() out of the aligner page rather than keeping a second copy, for the
 * same reason tools/test-shadow-parse.mjs does: one parser, tested once.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const oi = args.findIndex((a) => a === '-o' || a === '--out');
const OUT = oi >= 0 ? args[oi + 1] : null;
const [TXT, JSONP] = args.filter((a, i) => a !== '-o' && a !== '--out' && i !== oi + 1);
if (!TXT || !JSONP) {
  console.error('usage: node tools/shadow-build.mjs <script.txt> <aligner.json> [-o out.json]');
  process.exit(2);
}

/* ---------------------------------------------------------------- the parser */
const page = fs.readFileSync(path.join(ROOT, 'tools', 'shadow-align.html'), 'utf8');
const block = [...page.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((x) => x[1])[0];
const pre = /const NUM = [\s\S]*?const isRespell[^\n]*\n/.exec(block);
const fn = /function smartParse[\s\S]*?\n}\n/.exec(block);
if (!pre || !fn) throw new Error('smartParse() not found in tools/shadow-align.html');
const smartParse = new Function(pre[0] + fn[0] + '\nreturn smartParse;')();

/* ---------------------------------------------------------------- inputs */
const items = smartParse(fs.readFileSync(TXT, 'utf8'));
const align = JSON.parse(fs.readFileSync(JSONP, 'utf8'));
const timed = align.lines || [];

let bad = 0, warn = 0;
const fail = (m, extra = '') => { bad++; console.log('FAIL  ' + m + (extra ? '  — ' + extra : '')); };
const note = (m, extra = '') => { warn++; console.log('note  ' + m + (extra ? '  — ' + extra : '')); };
const ok = (m, extra = '') => console.log('ok    ' + m + (extra ? '  — ' + extra : ''));

const norm = (s) => String(s).toLowerCase().replace(/[.,!?;:'"]+/g, '').replace(/\s+/g, ' ').trim();

/* --- the two halves must describe the same utterances ---------------------- */
if (items.length !== timed.length) {
  fail('the script and the timings disagree on how many utterances there are',
    items.length + ' in the script, ' + timed.length + ' timed');
  console.log('\nNothing written. Re-run the aligner against THIS script.');
  process.exit(1);
}
ok(items.length + ' utterances in both');

let drift = 0;
items.forEach((it, i) => {
  if (norm(it.text) !== norm(timed[i].text)) {
    drift++;
    if (drift <= 3) fail('line ' + (i + 1) + ' differs',
      '\n        script: ' + it.text + '\n        timed : ' + timed[i].text);
  }
});
if (drift > 3) fail('...and ' + (drift - 3) + ' more lines differ');
if (!drift) ok('every line matches the timed one', 'the timings belong to this script');

/* --- the timings have to be usable ---------------------------------------- */
const missing = timed.filter((l) => l.t == null).length;
if (missing) fail(missing + ' utterances were never placed');
const dur = align.duration || 0;
let last = -1, outOfOrder = 0;
timed.forEach((l) => { if (l.t != null) { if (l.t < last) outOfOrder++; last = l.t; } });
if (outOfOrder) fail(outOfOrder + ' timings run backwards');
else if (!missing) ok('timings are in order and complete', '0 → ' + dur.toFixed(2) + 's');

/* --- the check that actually proves the alignment ------------------------- */
/* Every repeat run says the SAME words, so its spans should be nearly the same length. A
   boundary dropped on the wrong side of a pause shows up here as one span far from its
   siblings — which no amount of eyeballing a waveform reliably catches. */
const span = (i) => (i + 1 < timed.length ? timed[i + 1].t : dur) - timed[i].t;
const runs = new Map();
items.forEach((it, i) => {
  if (!it.rep) return;
  const key = it.group + '|' + it.kind;
  if (!runs.has(key)) runs.set(key, []);
  runs.get(key).push({ i, s: span(i) });
});
let worst = { key: null, dev: 0 };
for (const [key, arr] of runs) {
  const mean = arr.reduce((a, b) => a + b.s, 0) / arr.length;
  const dev = Math.max(...arr.map((x) => Math.abs(x.s - mean)));
  if (dev > worst.dev) worst = { key, dev, mean };
  if (dev > 0.7) note('uneven repeat in ' + key,
    arr.map((x) => x.s.toFixed(2)).join(' / ') + 's — check that boundary');
}
if (worst.key) {
  ok('repeat runs are self-consistent',
    'worst spread ' + worst.dev.toFixed(2) + 's in ' + worst.key
    + (worst.dev <= 0.7 ? ' — well inside tolerance' : ''));
}

/* --- how much of each slot is pause, which is what a shadower actually uses -- */
const CPS = 14.5;                       // characters per second of speech, measured-ish
let speech = 0, slots = 0;
items.forEach((it, i) => {
  if (!it.rep) return;
  slots++;
  speech += Math.min(span(i), it.text.length / CPS);
});
if (slots) {
  const total = items.filter((x) => x.rep).reduce((a, x, n, arr) => a, 0);
  const sum = items.reduce((a, it, i) => a + (it.rep ? span(i) : 0), 0);
  const pause = (sum - speech) / slots;
  console.log('\n      ' + slots + ' repeat slots, averaging '
    + (sum / slots).toFixed(2) + 's each — roughly ' + (speech / slots).toFixed(2)
    + 's of speech and ' + pause.toFixed(2) + 's of pause.');
  if (pause < 0.8) note('the pauses are short for shadowing',
    'the player can stretch them by pausing between lines');
}

/* ---------------------------------------------------------------- output */
const groups = [...new Set(items.map((x) => x.group).filter(Boolean))];
const pick = (g, k) => (items.find((x) => x.group === g && x.kind === k) || {}).text || null;
const exercise = {
  ep: align.ep || null,
  audio: align.audio || null,             // storage id, set when the mp3 is uploaded
  duration: dur,
  blocks: groups.map((g) => ({
    id: g,
    word: (items.find((x) => x.group === g && x.word) || {}).word || null,
    respell: pick(g, 'respell'),
    meaning: pick(g, 'meaning'),
    line: pick(g, 'line') || pick(g, 'keeper'),
    from: items.findIndex((x) => x.group === g),
  })),
  lines: items.map((it, i) => ({
    i, kind: it.kind, group: it.group || null,
    rep: it.rep || null, of: it.of || null,
    text: it.text,
    t: timed[i].t,
    end: +(timed[i].t + span(i)).toFixed(2),
  })),
};

console.log('\n      blocks: ' + exercise.blocks.map((b) => b.id + (b.word ? '=' + b.word : '')).join('  '));

if (bad) {
  console.log('\n' + bad + ' problem(s) — nothing written.');
  process.exit(1);
}
const text = JSON.stringify(exercise, null, 2);
if (OUT) { fs.writeFileSync(OUT, text); console.log('\nwrote ' + OUT + ' (' + text.length + ' bytes)'); }
else { console.log('\n(no -o given; not written)'); }
console.log(warn ? warn + ' note(s).' : 'clean.');
