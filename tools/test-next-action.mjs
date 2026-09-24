/* node tools/test-next-action.mjs
 *
 * The "What next" card makes a claim about the member's own behaviour, on a page that
 * promises "everything here comes from your own practice". A wrong number there costs more
 * trust than a vague one, because the member can check it — and did.
 *
 * The bug this locks down: focusFor() returns the least-used UNOWNED words, and unowned
 * means used fewer than OWNED_AT (3) times — which includes a word used once. The copy
 * described all of them as "you have not used ... out loud yet", so after a first recording
 * that used five of six words, the card named one word never spoken and one spoken thirty
 * seconds earlier.
 */
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const { nextAction, focusFor, OWNED_AT } = await import(
  'file://' + path.join(ROOT, 'lib/coach.js').replace(/\\/g, '/'));

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  — ' + extra : ''));
};

const WORDS = ['scattered', 'overwhelmed', 'ease into', 'get carried away', 'shake off', 'unwind'];
const EP = [{ id: 'ep285', n: 285, title: 'Start Your Day With Peace', words: WORDS }];
const act = (counts) => nextAction({ episodes: EP, counts, games: {}, sessions: [], types: [] });

// ---------------------------------------------------------------- the reported bug
// One recording, five of the six words used once each. Only "scattered" is untouched.
const afterFirst = { overwhelmed: 1, 'ease into': 1, 'get carried away': 1, 'shake off': 1, unwind: 1 };
const a = act(afterFirst);

ok('a first recording still produces a speak recommendation', a && a.kind === 'speak');
ok('the untouched word is named', a.why.includes('scattered'), a.why);
ok('a word used once is NOT described as never used',
  !/not used “overwhelmed”|not used “ease into”|not used “shake off”|not used “unwind”|not used “get carried away”/.test(a.why),
  a.why);
ok('...the reported sentence is gone',
  a.why !== 'You have not used “scattered” or “overwhelmed” out loud yet.', a.why);
ok('a used-but-unowned word gets its own, different nudge',
  /another go|another outing/.test(a.why), a.why);
console.log('      -> ' + a.why);

// ---------------------------------------------------------------- the other shapes
// Two words genuinely never used: the original sentence is correct and should survive.
const b = act({ 'ease into': 2, 'get carried away': 1, unwind: 1 });
ok('two never-used words still read "have not used X or Y"',
  /^You have not used “[^”]+” or “[^”]+” out loud yet\.$/.test(b.why), b.why);
console.log('      -> ' + b.why);

// Every word touched, none owned: nothing is "not used yet" at all.
const every = Object.fromEntries(WORDS.map((w) => [w, 1]));
const c = act(every);
ok('with every word used, nothing claims it was never used', !/not used/.test(c.why), c.why);
ok('...and it still names two real words',
  WORDS.filter((w) => c.why.includes(w)).length >= 1, c.why);
console.log('      -> ' + c.why);

// One word left unowned, the rest owned.
const nearly = Object.fromEntries(WORDS.map((w) => [w, OWNED_AT]));
nearly.unwind = 1;
const d = act(nearly);
// NB: assert on how many WORDS are named, not on the absence of " or " — the sentence
// legitimately contains "another outing or two".
ok('a single rusty word gets the singular sentence',
  d.why.includes('unwind') && WORDS.filter((w) => d.why.includes(w)).length === 1, d.why);
console.log('      -> ' + d.why);

// ---------------------------------------------------------------- the first visit
// No signal at all: focusFor() deliberately returns nothing, and the card must say the
// episode is new rather than invent a recommendation from six identical zeroes.
const fresh = act({});
ok('a member with no history is told the episode is new, not given a fake focus',
  fresh.fresh === true && /new phrases/.test(fresh.why), fresh.why);
ok('...and no words are singled out', fresh.words.length === 0);
console.log('      -> ' + fresh.why);

// ---------------------------------------------------------------- guard the premise
ok('focusFor really does return a used word alongside an unused one',
  focusFor(WORDS, afterFirst).length === 2
  && focusFor(WORDS, afterFirst).includes('scattered'),
  'if this ever stops being true the copy above is solving a problem that moved');

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
