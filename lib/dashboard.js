// lib/dashboard.js — shapes the practice history into everything the progress page
// draws. Pure functions over data the member already generated: no model call, no I/O.
//
// Deliberately NOT included: the rubric as a number. It trends internally (see
// api/use-it-live.js) but a learner sees words, minutes and phrases — not a score.

import { OWNED_AT } from './coach.js';

const key = (w) => String(w || '').toLowerCase().trim();
const MONTHS_SHOWN = 6;

function monthLabel(ym) {
  const [y, m] = String(ym).split('-').map(Number);
  // en-GB returns "Sept" for September; slice so every axis label is the same width
  return new Date(Date.UTC(y, m - 1, 2))
    .toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }).slice(0, 3);
}

function backMonths(now, n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

// ISO week key, so a streak survives year boundaries.
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - day + 3);
  const firstThu = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((t - firstThu) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Consecutive weeks with at least one session, ending this week or last (a week's grace,
// so someone who practises on Sunday then Monday is not told their streak broke).
export function streakWeeks(sessions, now = new Date()) {
  const weeks = new Set((Array.isArray(sessions) ? sessions : [])
    .filter((s) => s && s.t).map((s) => isoWeek(new Date(s.t))));
  if (!weeks.size) return 0;
  const at = (back) => isoWeek(new Date(now.getTime() - back * 7 * 86400000));
  let start = weeks.has(at(0)) ? 0 : (weeks.has(at(1)) ? 1 : null);
  if (start === null) return 0;
  let n = 0;
  while (weeks.has(at(start + n))) n++;
  return n;
}

// A phrase is owned at OWNED_AT natural uses, started at 1-2, untouched at 0.
export function phraseState(count) {
  const n = Number(count) || 0;
  return n >= OWNED_AT ? 'owned' : n > 0 ? 'started' : 'untouched';
}

export function buildDashboard({ months = {}, words = {}, games = {}, sessions = [], episodes = [], now = new Date() } = {}) {
  const list = Array.isArray(sessions) ? sessions : [];

  // ---- practice over time ----
  const span = backMonths(now, MONTHS_SHOWN);
  const bars = span.map((ym) => {
    const a = months[ym] || {};
    return {
      ym,
      label: monthLabel(ym),
      minutes: Math.round((Number(a.sec) || 0) / 60),
      sessions: Number(a.n) || 0,
    };
  });
  const monthsWithData = bars.filter((b) => b.sessions > 0).length;

  // ---- phrase mastery, per episode ----
  const mastery = (episodes || []).map((e) => {
    const ws = (e.words || []).map((w) => ({ w, n: Number(words[key(w)]) || 0 }));
    const withState = ws.map((x) => ({ ...x, state: phraseState(x.n) }));
    const owned = withState.filter((x) => x.state === 'owned').length;
    const started = withState.filter((x) => x.state === 'started').length;
    return {
      id: e.id, n: e.n, title: e.title,
      words: withState, owned, started,
      untouched: withState.length - owned - started,
      touched: owned + started,
    };
  });
  const active = mastery.filter((m) => m.touched > 0).sort((a, b) => b.n - a.n);

  // ---- totals ----
  const allCounts = Object.values(words).map((n) => Number(n) || 0);
  const totals = {
    minutes: Math.round(Object.values(months).reduce((a, m) => a + (Number(m.sec) || 0), 0) / 60),
    sessions: Object.values(months).reduce((a, m) => a + (Number(m.n) || 0), 0) || list.length,
    phrasesOwned: allCounts.filter((n) => n >= OWNED_AT).length,
    phrasesStarted: allCounts.filter((n) => n > 0 && n < OWNED_AT).length,
    episodesTouched: active.length,
    episodesTotal: (episodes || []).length,
  };

  // ---- games finished, per type ----
  const done = games || {};
  const byType = {};
  for (const k of Object.keys(done)) {
    const t = String(k).split(':')[0];
    byType[t] = (byType[t] || 0) + 1;
  }

  // ---- pace, descriptive not evaluative ----
  const paceSamples = list.map((s) => Number(s.wpm) || 0).filter(Boolean);
  const pace = paceSamples.length
    ? Math.round(paceSamples.reduce((a, b) => a + b, 0) / paceSamples.length)
    : 0;

  return {
    totals,
    bars,
    monthsWithData,
    mastery: active,
    untouchedEpisodes: mastery.length - active.length,
    byType,
    pace,
    streak: streakWeeks(list, now),
    hasAnything: totals.sessions > 0 || Object.keys(done).length > 0,
  };
}
