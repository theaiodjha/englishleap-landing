/* node tools/test-tweak-prompt.mjs
 *
 * The "one gentle tweak" was the same breathing advice every session. The cause was in the
 * schema: the wins were required to be specific and to point at real moments, while the
 * tweak only had to be ABOUT A TOPIC ("confidence or flow, not a grammar nitpick"). That
 * leaves roughly breathe / slow down / pause, so the model picked the safest one forever.
 * It was never asked to look at the recording.
 *
 * Model output cannot be asserted here — but the PROMPT can, and the prompt is where the
 * bug was. This lifts analysisPrompt() out of the route and checks that what reaches Gemini
 * still carries the anchor requirement, still bans the default answers, and still carries
 * the learner's previous tweaks so it does not repeat itself.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'api', 'out-loud.js'), 'utf8');
/* Brace-count to the end of the function rather than regexing for a line-initial "}".
   The body is one big template literal containing a JSON example, so the first such "}"
   is inside the string, not the end of the function — matching on it truncates, and the
   extracted source will not even parse. Braces count only outside a template literal. */
function lift(name) {
  const at = src.indexOf('function ' + name + '(');
  if (at < 0) throw new Error(name + '() not found in api/out-loud.js');
  let depth = 0, tpl = false, started = false;
  for (let i = at; i < src.length; i++) {
    const c = src[i];
    if (c === '\\') { i++; continue; }              // skip whatever is escaped
    if (c === '`') { tpl = !tpl; continue; }
    if (tpl) continue;
    if (c === '{') { depth++; started = true; }
    else if (c === '}') { depth--; if (started && depth === 0) return src.slice(at, i + 1); }
  }
  throw new Error('unbalanced ' + name + '()');
}
const analysisPrompt = new Function(lift('analysisPrompt') + '\nreturn analysisPrompt;')();

const EP = {
  number: 285, title: 'Start Your Day With Peace',
  prompt: 'Tell us how your mornings actually start.',
  words: ['scattered', 'overwhelmed', 'ease into', 'get carried away', 'shake off', 'unwind'],
};

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  — ' + extra : ''));
};

/* The prompt is hard-wrapped, so a phrase can straddle a newline — "name a target\nword".
   Match phrases against a whitespace-flattened copy; assertions that are ABOUT the line
   structure use the raw text. */
const flat = (t) => t.replace(/\s+/g, ' ');

// ---------------------------------------------------------------- a first session
const first = analysisPrompt(EP, ['scattered'], []);
const F = flat(first);

ok('the task and the target words still reach the model',
  F.includes('Start Your Day With Peace') && F.includes('get carried away'));
ok('the focus word is still singled out for a win', F.includes('STILL WORKING ON: scattered'));

ok('the tweak must be anchored to this recording',
  /anchored to a real moment in THIS recording/i.test(F),
  'without this the tweak is only required to be about a topic');
ok('the model is told to name the moment', /Name the moment/i.test(F));

// the actual defaults it kept falling back on
for (const word of ['breathing', 'relaxing', 'slowing down', 'taking your time']) {
  ok(`"${word}" is ruled out as a default answer`, F.toLowerCase().includes(word.toLowerCase()));
}
ok('...but only conditionally — a genuinely rushed recording should still get that advice',
  /unless[\s\S]{0,120}rushing/i.test(F),
  'an absolute ban would make the coach wrong for the learner who IS panicking');

ok('a fluent recording gets a fallback that is still specific',
  /name a target word they did not use/i.test(F));

ok('with no history, no "already given" section appears',
  !/already given this learner/i.test(F),
  'a first-time learner must not be told the coach is repeating itself');

// ---------------------------------------------------------------- disfluency
/* A learner who stammers, blocks, or has a broken voice must not be marked down for it.
   Their English fluency and their speech fluency are different things, and only one of
   them is any of the coach's business. Left unsaid, the model treats a stammer as a
   confidence problem and offers advice that is useless at best. */
ok('the model is told that speech is not what it is judging',
  /HOW THEY SPEAK IS NOT WHAT YOU ARE JUDGING/.test(F));
for (const w of ['stammer', 'stutter', 'blocking', 'hoarse', 'smoothness', 'speed']) {
  ok(`  "${w}" is named as off limits`, F.toLowerCase().includes(w.toLowerCase()));
}
ok('...and "sounding confident" is ruled out as praise too',
  /never mention[\s\S]{0,240}tone of voice/i.test(F),
  'you are hearing a voice, not a feeling');
ok('a slow speaker is explicitly not a weak one',
  /ninety seconds to say three excellent sentences/i.test(F));
ok('searching for a WORD is kept as a fair observation',
  /searched for a WORD/i.test(F),
  'that is a language event; struggling with a SOUND is not');

ok('the tweak rules no longer invite "you restarted that sentence"',
  !/a sentence they restarted/i.test(F) && /restarted sentence or a repeated word is NOT/i.test(F),
  'a person who stammers restarts sentences constantly');

ok('the rubric scores language fluency, not delivery',
  /never how smooth or fast the delivery sounded/i.test(F));
ok('...and the top score is no longer "confident and natural"',
  !/5 is confident and natural/.test(F), 'that scored the voice');

// ---------------------------------------------------------------- a returning member
const HIST = [
  'Take a slow, deep breath right before you press record.',
  'Try pausing at the end of each sentence.',
];
const again = analysisPrompt(EP, ['scattered'], HIST);
const A = flat(again);

ok('previous tweaks are sent back to the model', /already given this learner/i.test(A));
HIST.forEach((t, i) => ok(`  tweak ${i + 1} is listed verbatim`, A.includes(flat(t)), t.slice(0, 40)));
ok('...as a bulleted list, one per line',
  HIST.every((t) => again.includes('  - ' + t)),
  'joined with a real newline, not the two characters backslash-n');
ok('the "say something different" instruction is there',
  /Say something different/i.test(A));

ok('the returning prompt is a superset of the first',
  again.length > first.length && A.includes('anchored to a real moment'));

// ---------------------------------------------------------------- shape is intact
for (const field of ['transcript', 'summary', 'wins', 'tweak', 'words_used', 'closing', 'rubric']) {
  ok(`the JSON contract still names "${field}"`, A.includes(`"${field}"`));
}
ok('the rubric is still marked internal', /rubric is INTERNAL/i.test(A));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
