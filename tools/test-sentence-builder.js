/* node tools/test-sentence-builder.js
 *
 * The tile label. Rendering a token verbatim hands the member two positions for free —
 * the only capitalised word is obviously first, the one carrying the full stop obviously
 * last — so a seven-word puzzle is really a five-word one.
 *
 * What must hold: the label hides those cues, the TOKEN behind it is untouched (the answer
 * is still checked against the real sentence), and case that carries meaning — "I", proper
 * nouns — survives.
 */
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(
  path.join(__dirname, '..', 'games', 'sentence-builder', 'index.html'), 'utf8');
const m = src.match(/function label\(tok, isFirst\)\{[\s\S]*?\n\}/);
if (!m) throw new Error('label() not found');
const label = new Function(m[0] + '\nreturn label;')();

let bad = 0;
const ok = (l, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + l + (extra ? '  ' + extra : ''));
};

// the sentence from the screenshot that prompted this
const sentence = "Don't chicken out at the last minute.".split(' ');
const shown = sentence.map((t, i) => label(t, i === 0));

ok('the first word loses its capital', shown[0] === "don't", shown[0]);
ok('the last word loses its full stop', shown[6] === 'minute', shown[6]);
ok('no tile is the only capitalised one',
  shown.filter((w) => /^[A-Z]/.test(w)).length === 0, shown.join(' '));
ok('no tile carries sentence punctuation',
  shown.every((w) => !/[.!?,;:]$/.test(w)), shown.join(' '));
ok('nothing else about the words changes',
  shown.slice(1, 6).join(' ') === 'chicken out at the last');

// case that means something must survive
ok('"I" keeps its capital', label('I', true) === 'I');
ok('"I\'ve" keeps its capital', label("I've", true) === "I've");
ok('a proper noun mid-sentence is untouched', label('London', false) === 'London');
ok('a mid-sentence capital is never folded', label('Monday', false) === 'Monday');
ok('an acronym keeps its shape', label('BBC', true) === 'BBC');

// punctuation inside a word is not sentence punctuation
ok("an apostrophe survives", label("don't", false) === "don't");
ok('a hyphen survives', label('well-known', false) === 'well-known');
ok('a comma is dropped like a full stop', label('however,', false) === 'however');
ok('an ellipsis is dropped', label('wait…', false) === 'wait');

// the token behind the label is what gets compared — proven by the page still checking
// against `orig`, and restoring the real tokens once the sentence is right
ok('the answer is still checked against the raw token',
  /const ok=t\.tok===orig\[i\]/.test(src));
ok('a correct sentence is re-rendered in its proper form',
  /el\.textContent=orig\[i\]/.test(src));

// the emphasis swap
ok('bank chips are quiet, not accent-filled',
  /\.chip\{[^}]*background:rgba\(255,255,255,\.07\)/.test(src));
ok('a word takes the accent only in the tray',
  /\.tray \.chip\{[^}]*color-mix\(in srgb,var\(--accent/.test(src));
ok('Check reads as waiting, not dead',
  /\.check:disabled\{[^}]*background:transparent/.test(src));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
