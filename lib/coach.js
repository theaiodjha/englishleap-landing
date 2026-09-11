// lib/coach.js — the small amount of judgement that turns practice history into
// "what should I do next". Pure functions, no I/O, so they are cheap to test.
//
// Two ideas do most of the work:
//   • a word is OWNED once it has been used naturally OWNED_AT times. Below that it
//     is still "due" — this is the spaced-repetition signal, and it comes free from
//     the w:{word} counters lib/history.js already keeps.
//   • the next action is whatever closes the biggest gap, in a fixed priority order,
//     so the recommendation is always explainable in one sentence.

export const OWNED_AT = 3;        // times a word must be used naturally to count as owned
export const FOCUS_MAX = 2;       // words we ask a member to reach for in one session
const MIN_PER_SESSION = 6;        // rough minutes for "speak + review"

const key = (w) => String(w || '').toLowerCase().trim();

// Stable tie-break. Sorting by count alone leaves equal counts in their original order,
// so a member with no history yet gets words 1 and 2 of EVERY episode — switching
// episode appeared to highlight "the same positions again". Ordering ties by a hash of
// the word itself keeps the pick stable for a given word (it never flickers between
// visits) while varying across episodes, which is what makes it feel chosen.
function wordSeed(w) {
  const s = key(w);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Words from this episode the member has not yet owned — least-used first, so a word
// they have never said outranks one they have used twice.
export function focusFor(words, counts, max = FOCUS_MAX) {
  return (Array.isArray(words) ? words : [])
    .map((w) => ({ w, n: (counts || {})[key(w)] || 0 }))
    .filter((x) => x.n < OWNED_AT)
    .sort((a, b) => a.n - b.n || wordSeed(a.w) - wordSeed(b.w))
    .slice(0, Math.max(0, max))
    .map((x) => x.w);
}

// How far through an episode's vocabulary the member is, 0..1.
export function ownership(words, counts) {
  const ws = Array.isArray(words) ? words : [];
  if (!ws.length) return 0;
  const owned = ws.filter((w) => ((counts || {})[key(w)] || 0) >= OWNED_AT).length;
  return owned / ws.length;
}

// Episodes the member has spoken about at least once, newest practice first.
export function practisedEpisodes(sessions) {
  const seen = new Map();
  for (const s of Array.isArray(sessions) ? sessions : []) {
    if (s && s.e && !seen.has(s.e)) seen.set(s.e, s.t || 0);
  }
  return [...seen.keys()];
}

// The single next best thing to do. `episodes` is [{id, n, title, words}], newest
// first; `games` is the elc:games hash; `types` is the arcade's game type list.
// Priority order, deliberately fixed so the reason is always one sentence:
//   1. words in the current episode they have never used  → speak
//   2. the current episode's games they have not finished → play
//   3. the oldest episode still holding unowned words     → speak (revision)
//   4. nothing due → a gentle free-choice nudge
export function nextAction({ episodes, counts, games, sessions, types } = {}) {
  const eps = Array.isArray(episodes) ? episodes : [];
  if (!eps.length) return null;
  const done = games || {};
  const cur = eps[0];

  const curFocus = focusFor(cur.words, counts);
  if (curFocus.length) {
    return {
      kind: 'speak',
      episodeId: cur.id, episode: cur.n, title: cur.title,
      words: curFocus,
      minutes: MIN_PER_SESSION,
      why: curFocus.length > 1
        ? `You have not used “${curFocus[0]}” or “${curFocus[1]}” out loud yet.`
        : `You have not used “${curFocus[0]}” out loud yet.`,
      cta: 'Practise speaking',
      href: `/use-it-live.html?ep=${encodeURIComponent(cur.id)}`,
    };
  }

  const unplayed = (Array.isArray(types) ? types : []).find((t) => !done[`${t.type}:${cur.id}`]);
  if (unplayed) {
    return {
      kind: 'play',
      episodeId: cur.id, episode: cur.n, title: cur.title,
      words: [], minutes: 5,
      why: `You know this week’s words — try them in ${unplayed.name}.`,
      cta: `Play ${unplayed.name}`,
      href: `/games/${unplayed.type}/?ep=${encodeURIComponent(cur.id)}`,
    };
  }

  // Revision: the episode they practised longest ago that still has words to own.
  const practised = practisedEpisodes(sessions).slice().reverse();
  for (const id of practised) {
    const ep = eps.find((e) => e.id === id);
    if (!ep) continue;
    const focus = focusFor(ep.words, counts);
    if (!focus.length) continue;
    return {
      kind: 'revise',
      episodeId: ep.id, episode: ep.n, title: ep.title,
      words: focus,
      minutes: MIN_PER_SESSION,
      why: `“${focus[0]}” from EP${ep.n} has not settled yet — come back to it.`,
      cta: 'Practise again',
      href: `/use-it-live.html?ep=${encodeURIComponent(ep.id)}`,
    };
  }

  return {
    kind: 'free',
    episodeId: cur.id, episode: cur.n, title: cur.title,
    words: [], minutes: MIN_PER_SESSION,
    why: 'You are on top of this week — pick anything that sounds fun.',
    cta: 'Browse the Arcade',
    href: '/arcade-browse.html',
  };
}

// Deterministic speech measures, computed from the transcript rather than asked of the
// model — the same input always gives the same number, which is what makes a trend real.
export function speechMetrics(transcript, durationSec) {
  const words = String(transcript || '').toLowerCase().match(/[a-z][a-z']*/g) || [];
  const secs = Number(durationSec) || 0;
  const uniq = new Set(words).size;
  return {
    words: words.length,
    wpm: secs > 0 ? Math.round(words.length / (secs / 60)) : 0,
    ttr: words.length ? Math.round((uniq / words.length) * 100) : 0, // type-token ratio, %
  };
}
