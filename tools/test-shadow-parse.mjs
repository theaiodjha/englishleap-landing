/* node tools/test-shadow-parse.mjs
 *
 * The shadowing aligner reads a narration script and works out its structure — six word
 * blocks, each with an announcement, a respelling, a meaning, two cues and two repeat runs,
 * then a keeper line and an outro. Get that wrong and the player has 75 unlabelled
 * utterances instead of something a member can navigate.
 *
 * This lifts smartParse() OUT of tools/shadow-align.html and runs it, so what is tested is
 * what ships rather than a copy that drifted. The fixture is synthetic on purpose: the real
 * scripts are paid Patreon content and are gitignored, so a test that depended on one would
 * pass on Fahad's machine and fail everywhere else.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = fs.readFileSync(path.join(ROOT, 'tools', 'shadow-align.html'), 'utf8');
const block = [...page.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((x) => x[1])[0];

const pre = /const NUM = [\s\S]*?const isRespell[^\n]*\n/.exec(block);
const fn = /function smartParse[\s\S]*?\n}\n/.exec(block);
if (!pre || !fn) throw new Error('smartParse() not found in tools/shadow-align.html');
const smartParse = new Function(pre[0] + fn[0] + '\nreturn smartParse;')();

// Same shape as a real exercise, two words instead of six. Deliberate quirks: word 2's
// repeat is missing its full stop (that happens — EP282 had one), and its line repeats
// four times rather than three, because the repeat count must be read off the audio and
// not assumed.
const FIXTURE = `
Welcome to your shadowing practice with the English Leap Club.
Say it back in the pauses.
Word one. Reassuring.
ree-uh-SHOOR-ing.
Making you feel safer, calmer or more certain.
Just the word, three times.
Reassuring.
Reassuring.
Reassuring.
Now the whole line, three times.
It was reassuring to hear that.
It was reassuring to hear that.
It was reassuring to hear that.
Word two. Linger.
LING-ger.
To stay somewhere longer than expected.
Just the word, three times.
Linger
Linger.
Linger.
Now the whole line, four times.
We lingered over coffee.
We lingered over coffee.
We lingered over coffee.
We lingered over coffee.
One line to keep, three times.
The cup is calm. You are not.
The cup is calm. You are not.
The cup is calm. You are not.
That's all the words, plus one line to keep.
Pick one and use it today.
`;

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  — ' + extra : ''));
};

const items = smartParse(FIXTURE);
const kinds = {};
items.forEach((x) => (kinds[x.kind] = (kinds[x.kind] || 0) + 1));
const groups = [...new Set(items.map((x) => x.group).filter(Boolean))];
const of = (g, k) => items.filter((x) => x.group === g && x.kind === k);

ok('every line is classified', items.every((x) => x.kind), JSON.stringify(kinds));
ok('blank lines are dropped', items.length === 31, 'got ' + items.length);
ok('two word blocks plus the keeper', groups.join(' ') === 'w1 w2 keeper', groups.join(' '));

ok('the lines before the first word are the intro', kinds.intro === 2);
ok('the lines after the keeper are the outro', kinds.outro === 2,
  'these come last and must not be swept into the keeper block');

ok('an announcement names its word', of('w1', 'announce')[0].word === 'Reassuring');
ok('the respelling is told from the meaning',
  of('w1', 'respell')[0].text === 'ree-uh-SHOOR-ing.' && of('w1', 'meaning').length === 1,
  'both are single unrepeated lines in the same place — only the CAPS-and-hyphen shape separates them');
ok('a lower-case respelling with a stressed syllable still reads as one',
  of('w2', 'respell')[0].text === 'LING-ger.');

ok('the word repeats are found', of('w1', 'word').length === 3);
ok('...and numbered', of('w1', 'word').map((x) => x.rep + '/' + x.of).join(' ') === '1/3 2/3 3/3');
ok('the line repeats are separated from the word repeats', of('w1', 'line').length === 3,
  'both are runs of identical lines; only matching the text against the word tells them apart');

ok('a missing full stop does not break a repeat run', of('w2', 'word').length === 3,
  '"Linger" and "Linger." are the same utterance');
ok('the repeat count is read, not assumed', of('w2', 'line').length === 4,
  'four this time — a hard-coded 3 would have split the run');

ok('the keeper is its own block', of('keeper', 'keeper').length === 3);
ok('...and is not mistaken for a line', of('keeper', 'line').length === 0);

const cues = items.filter((x) => x.kind === 'cue');
ok('cues are not treated as utterances to repeat', cues.every((x) => !x.rep) && cues.length === 5,
  'got ' + cues.length);
ok('every repeat carries its block', items.filter((x) => x.rep).every((x) => x.group));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
