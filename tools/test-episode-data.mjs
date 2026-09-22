/* node tools/test-episode-data.mjs [epId]
 *
 * The arcade catalogue, checked against what the five games actually assume at runtime.
 * With no argument it checks EVERY episode; pass an id to check one.
 *
 * Adding an episode means hand-writing five blocks of content that have to agree with each
 * other, and most mistakes are silent — a game renders something slightly wrong rather than
 * throwing. The rule that caught EP282: Listening Gap cuts its blank with
 * `indexOf(phrase)`, so a sentence carrying an inflected form ("lingered") while the phrase
 * is the base form ("linger") leaves the ending stranded: "We ___ed over coffee."
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const { ARCADE } = await import('file://' + path.join(ROOT, 'lib/arcade-data.js').replace(/\\/g, '/'));
const { EPISODE_TITLES } = await import('file://' + path.join(ROOT, 'lib/episode-titles.js').replace(/\\/g, '/'));

const ONLY = process.argv[2] || null;
const PALETTE = ['#f6479a', '#ff8a63', '#ffcd46', '#1fc4b6', '#1f86c9', '#8b6cff'];
// exactly what games/clue-room geom() understands (anything else silently becomes ico)
const GEOS = ['ico', 'box', 'sphere', 'torus', 'octa', 'dodeca', 'cone', 'cyl'];

let bad = 0, notes = 0;
const fail = (ep, msg, extra = '') => {
  bad++;
  console.log(`FAIL ${ep}  ${msg}${extra ? '  — ' + extra : ''}`);
};
// conventions worth seeing but not worth blocking a deploy over
const note = (ep, msg, extra = '') => {
  notes++;
  console.log(`note ${ep}  ${msg}${extra ? '  — ' + extra : ''}`);
};
const sameSet = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');

/* The phrases that carry hand-drawn artwork instead of a generated tile, read out of
   slugFor() in the game itself so the two cannot drift apart. */
const HAND_DRAWN = (() => {
  const src = fs.readFileSync(path.join(ROOT, 'games', 'clue-room', 'index.html'), 'utf8');
  const m = /const slugFor\s*=\s*w\s*=>\s*\(\{([\s\S]*?)\}\[/.exec(src);
  if (!m) { console.log('note (catalogue)  could not read slugFor() — icon check will be strict'); return new Set(); }
  return new Set([...m[1].matchAll(/'([^']+)'\s*:/g)].map((x) => x[1].toLowerCase()));
})();

const missingTiles = [];
const byType = Object.fromEntries(ARCADE.map((g) => [g.type, g]));
const TYPES = Object.keys(byType);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wholeWord = (p, text) => new RegExp('\\b' + escRe(p) + '\\b', 'i').test(text);

// the six words a game exposes, in its own shape
const wordsOf = {
  'clue-room': (c) => c.clues.map((x) => x.word),
  'phrase-pairs': (c) => c.pairs.map((x) => x.word),
  'listening-gap': (c) => c.rounds.map((x) => x.phrase),
  'story-unlock': (c) => c.phrases.map((x) => x.word),
  'sentence-builder': (c) => c.sentences.map((x) => x.phrase),
};
const coloursOf = {
  'clue-room': (c) => c.clues.map((x) => x.color),
  'phrase-pairs': (c) => c.pairs.map((x) => x.color),
  'listening-gap': (c) => c.rounds.map((x) => x.color),
  'story-unlock': (c) => c.phrases.map((x) => x.color),
  'sentence-builder': (c) => c.sentences.map((x) => x.color),
};

// ---------------------------------------------------------------- catalogue-wide
for (const t of TYPES) {
  const cur = byType[t].episodes.filter((e) => e.current).map((e) => e.id);
  if (cur.length !== 1) fail('(catalogue)', `${t}: exactly one episode must be "current"`, cur.join(',') || 'none');
}
const currents = new Set(TYPES.map((t) => (byType[t].episodes.find((e) => e.current) || {}).id));
if (currents.size !== 1) fail('(catalogue)', 'every game must mark the SAME episode current', [...currents].join(' / '));

const ids = ONLY ? [ONLY] : [...new Set(byType['clue-room'].episodes.map((e) => e.id))];

// ---------------------------------------------------------------- per episode
for (const id of ids) {
  const eps = {};
  let missing = false;
  for (const t of TYPES) {
    eps[t] = byType[t].episodes.find((e) => e.id === id);
    if (!eps[t]) { fail(id, `missing from ${t}`); missing = true; }
  }
  if (missing) continue;

  // --- meta
  const titles = new Set(TYPES.map((t) => eps[t].title));
  if (titles.size !== 1) fail(id, 'the five games disagree on the short title', [...titles].join(' / '));
  for (const t of TYPES) {
    if (eps[t].ep !== id.toUpperCase()) fail(id, `${t}: ep label does not match the id`, eps[t].ep);
    if (eps[t].cover && !fs.existsSync(path.join(ROOT, eps[t].cover.replace(/^\//, '')))) {
      fail(id, `${t}: cover file is referenced but missing`, eps[t].cover);
    }
  }
  if (!EPISODE_TITLES[id]) fail(id, 'no long title in lib/episode-titles.js');

  // --- the clue tiles. A missing one does not throw: buildIcon() keeps the canvas
  // placeholder and swallows the 404, so the clue quietly renders in the device's emoji
  // font while its five siblings use the baked tile.
  for (const c of eps['clue-room'].content.clues) {
    if (HAND_DRAWN.has(String(c.word).toLowerCase())) continue;   // uses its own artwork
    const key = [...(c.emoji || '')].map((ch) => ch.codePointAt(0).toString(16)).join('-')
      + '_' + String(c.color || '').replace('#', '');
    if (!fs.existsSync(path.join(ROOT, 'games', 'clue-room', 'icons', 'auto', key + '.png'))) {
      // the current episode is the one members open this week — its tiles should be there
      if (eps['clue-room'].current) fail(id, `clue-room: no baked tile for "${c.word}"`, key + '.png');
      else missingTiles.push({ id, word: c.word, key });
    }
  }

  // --- the six words, shared by every game
  const ref = wordsOf['clue-room'](eps['clue-room'].content);
  if (ref.length !== 6) note(id, `has ${ref.length} words, not the usual six`);
  if (new Set(ref).size !== ref.length) fail(id, 'a word is repeated', ref.join(','));

  // Order is free — story-unlock's bank order is display only — but the SET must match and
  // a word must keep its colour wherever it appears, or the same phrase changes identity
  // between games.
  const refColour = new Map(ref.map((w, i) => [w, coloursOf['clue-room'](eps['clue-room'].content)[i]]));
  for (const t of TYPES) {
    const w = wordsOf[t](eps[t].content);
    if (!sameSet(w, ref)) fail(id, `${t}: words differ from Clue Room`, w.join(','));
    const c = coloursOf[t](eps[t].content);
    w.forEach((word, i) => {
      if (refColour.has(word) && refColour.get(word) !== c[i]) {
        fail(id, `${t}: "${word}" changes colour between games`, `${refColour.get(word)} vs ${c[i]}`);
      }
    });
    if (new Set(c).size !== c.length || !c.every((x) => PALETTE.includes(String(x).toLowerCase()))) {
      fail(id, `${t}: colours must be distinct values from the validated palette`, c.join(' '));
    }
  }

  // --- clue room
  const cr = eps['clue-room'].content;
  // against the clue COUNT, not a hard six — an episode may legitimately carry five
  if (new Set(cr.clues.map((c) => c.id)).size !== cr.clues.length) {
    fail(id, 'clue-room: clue ids are not unique (the 3D scene keys its solved set on id)',
      cr.clues.map((c) => c.id).join(','));
  }
  if (!cr.clues.every((c) => GEOS.includes(c.geo))) fail(id, 'clue-room: unknown geometry', cr.clues.map((c) => c.geo).join(','));
  if (!cr.clues.every((c) => c.clue && c.example && c.emoji)) fail(id, 'clue-room: a clue is missing its text, example or emoji');
  // the paragraph reads in its own order, so the answers are a permutation of the words
  if (!sameSet(cr.puzzle.answers, ref)) {
    fail(id, 'clue-room: puzzle answers are not the six clue words', cr.puzzle.answers.join(','));
  }
  if (cr.puzzle.segments.length !== cr.puzzle.answers.length + 1) {
    fail(id, 'clue-room: needs one more segment than answers', `${cr.puzzle.segments.length} vs ${cr.puzzle.answers.length}`);
  }

  // --- the two sentence games: the gap is cut by indexOf, so the phrase must appear WHOLE
  for (const t of ['listening-gap', 'sentence-builder']) {
    const rows = t === 'listening-gap' ? eps[t].content.rounds : eps[t].content.sentences;
    for (const r of rows) {
      if (!r.text.toLowerCase().includes(r.phrase.toLowerCase())) {
        fail(id, `${t}: sentence does not contain its phrase`, `"${r.phrase}" / ${r.text}`);
      } else if (!wholeWord(r.phrase, r.text)) {
        const tok = r.text.split(/\s+/).find((w) => w.toLowerCase().includes(r.phrase.toLowerCase()));
        fail(id, `${t}: phrase appears only INSIDE a longer word — the gap will strand the ending`,
          `"${r.phrase}" in "${tok}" → ${r.text}`);
      }
    }
  }
  const sb = eps['sentence-builder'].content.sentences;
  for (const s of sb) {
    if (s.text.trim().split(/\s+/).length < 4) fail(id, 'sentence-builder: sentence too short to order', s.text);
  }

  // --- phrase pairs
  const pp = eps['phrase-pairs'].content;
  if (!pp.pairs.every((p) => p.meaning)) fail(id, 'phrase-pairs: a pair has no meaning');
  // two identical meanings make the match ambiguous: either card is "right"
  if (new Set(pp.pairs.map((p) => p.meaning)).size !== pp.pairs.length) {
    fail(id, 'phrase-pairs: two pairs share a meaning');
  }

  // --- story unlock
  const su = eps['story-unlock'].content;
  const gaps = [...su.story.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
  if (gaps.length !== ref.length) {
    fail(id, `story-unlock: ${gaps.length} gaps for ${ref.length} phrases`, gaps.join(','));
  }
  if (!gaps.every((g) => ref.includes(g))) {
    fail(id, 'story-unlock: a gap names something that is not one of the six phrases',
      gaps.filter((g) => !ref.includes(g)).join(','));
  }
  if (new Set(gaps).size !== gaps.length) fail(id, 'story-unlock: a phrase is used in two gaps', gaps.join(','));
  if (!su.bonusEnding) fail(id, 'story-unlock: no bonus ending');

  // --- Use It Live derives the current episode's speaking task from this catalogue
  if (eps['clue-room'].current) {
    const uil = fs.readFileSync(path.join(ROOT, 'api', 'use-it-live.js'), 'utf8');
    if (!new RegExp(`\\b${escRe(id)}\\s*:`).test(uil)) {
      fail(id, 'is CURRENT but has no hand-written prompt in api/use-it-live.js PROMPTS — '
        + 'Use It Live would fall back to the generic title-built task');
    }
  }
}

/* One line, not fifty-five. Every one of these traces to the same event, so say that
   rather than listing each clue and burying everything else in the report. */
if (missingTiles.length) {
  const colours = [...new Set(missingTiles.map((m) => m.key.split('_')[1]))];
  const shows = [...new Set(missingTiles.map((m) => m.id))];
  note('(icons)', `${missingTiles.length} baked clue tiles are missing across ${shows.length} older episodes`,
    'all of them ' + colours.map((c) => '#' + c).join(' / ')
    + ' — the two colours the palette fix introduced. Those clues fall back to the device emoji font.');
}

const scope = `${ids.length} episode${ids.length === 1 ? '' : 's'}`;
console.log(bad
  ? `\n${bad} problem${bad === 1 ? '' : 's'} across ${scope}${notes ? `, ${notes} note(s)` : ''}`
  : `\nall checks passed across ${scope}${notes ? `, ${notes} note(s)` : ''}`);
process.exit(bad ? 1 : 0);
