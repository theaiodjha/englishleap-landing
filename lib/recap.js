// lib/recap.js — "how your month went", assembled from data the member already generated.
//
// Two layers, matching the tier split:
//   FACTS  — minutes, sessions, episodes, words used and owned. Pure arithmetic over the
//            history, no model call, so it costs nothing and cannot fail. Every Fluency
//            member gets this.
//   DEPTH  — reading the rubric trend back as a sentence, and a goal for next month.
//            Needs a model call, so it sits behind the higher tier (see needsDeep()).
//
// The rubric NEVER surfaces as a number. It is a measuring instrument, not a score to
// show a learner — same reason api/out-loud.js deletes it before responding.

import { OWNED_AT } from './coach.js';

export const ymOf = (ts) => {
  const d = new Date(Number(ts) || 0);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

export function prevMonth(ym) {
  const [y, m] = String(ym).split('-').map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

export function thisMonth(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

// A month worth reflecting on. `sessions` is the capped history list (newest first),
// `months`/`words` the never-trimmed aggregates.
export function buildRecap(ym, { months = {}, words = {}, sessions = [], episodes = [] } = {}) {
  const inMonth = (Array.isArray(sessions) ? sessions : []).filter((s) => s && ymOf(s.t) === ym);
  const agg = months[ym] || null;

  // Aggregates are authoritative (never trimmed); the log fills in the detail they
  // cannot hold, and covers a month whose aggregate predates a counter being added.
  const seconds = agg && agg.sec ? agg.sec : inMonth.reduce((a, s) => a + (Number(s.d) || 0), 0);
  const count = agg && agg.n ? agg.n : inMonth.length;
  if (!count) return { month: ym, has: false };

  const epIds = [...new Set(inMonth.map((s) => s.e).filter(Boolean))];
  const byId = Object.fromEntries((episodes || []).map((e) => [e.id, e]));
  const used = [...new Set(inMonth.flatMap((s) => (Array.isArray(s.w) ? s.w : [])))];
  const owned = Object.keys(words).filter((w) => (words[w] || 0) >= OWNED_AT);

  const prev = months[prevMonth(ym)] || null;
  const prevMin = prev && prev.sec ? Math.round(prev.sec / 60) : 0;
  const minutes = Math.round(seconds / 60);

  // Pace is descriptive, not a grade — "you spoke around N words a minute".
  const wpmSamples = inMonth.map((s) => Number(s.wpm) || 0).filter(Boolean);
  const wpm = wpmSamples.length
    ? Math.round(wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length)
    : (agg && agg.wpm && count ? Math.round(agg.wpm / count) : 0);

  return {
    month: ym,
    has: true,
    minutes,
    sessions: count,
    longest: inMonth.reduce((m, s) => Math.max(m, Number(s.d) || 0), 0),
    episodes: epIds.map((id) => ({
      id,
      n: byId[id] ? byId[id].n : Number(String(id).replace(/[^0-9]/g, '')) || 0,
      title: byId[id] ? byId[id].title : id,
    })),
    wordsUsed: used,
    wordsOwned: owned.length,
    wpm,
    prevMinutes: prevMin,
    minutesDelta: prevMin ? minutes - prevMin : null,
  };
}

// The higher tier unlocks interpretation. 400 is the Fluency+ allowance in lib/quota.js.
export function needsDeep(allowanceMin) {
  return (Number(allowanceMin) || 0) >= 400;
}

// One warm, factual line — no model, no score. Used as the card's headline.
export function headline(r) {
  if (!r || !r.has) return '';
  const mins = r.minutes === 1 ? '1 minute' : `${r.minutes} minutes`;
  const eps = r.episodes.length;
  const bits = [`You practised out loud for ${mins}`];
  if (eps) bits.push(eps === 1 ? 'across 1 episode' : `across ${eps} episodes`);
  if (r.wordsUsed.length) {
    bits.push(r.wordsUsed.length === 1
      ? 'and used 1 target phrase naturally'
      : `and used ${r.wordsUsed.length} target phrases naturally`);
  }
  return bits.join(' ') + '.';
}
