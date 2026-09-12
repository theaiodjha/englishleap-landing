// /api/stats — the public numbers behind the home page's social-proof strip.
//
// Aggregates only. No uid, no name, nothing that identifies a member — and deliberately
// no traffic figures: Vercel Web Analytics owns visitors, and a KV write per page load
// would burn the free tier while counting bots as people.
//
// Two rules make the difference between proof and theatre:
//
//   1. CACHED AT THE EDGE. s-maxage means Vercel serves one cached copy to everyone for
//      ten minutes, so a thousand visitors cost ONE KV read. Without this, social proof
//      would be the most expensive thing on the site.
//   2. A FLOOR, and rounded DOWN. "412 members" invites arithmetic; "400+ members" reads
//      as a fact. Below MIN_MEMBERS nothing is published at all — small true numbers do
//      more harm than no numbers, and a visitor who can infer the membership is about
//      nine people has learned something you did not mean to tell them.
import '../lib/quiet-deprecations.js';
import { getSiteStats } from '../lib/history.js';

export const MIN_MEMBERS = 25;   // below this, the strip does not exist
const MIN_GAMES = 200;

// Round down to a granularity that suits the size, so the figure moves in believable
// steps and never overstates. 412 -> 400, 1_180 -> 1_000, 87 -> 80.
function floorTo(n) {
  if (n < 100) return Math.floor(n / 10) * 10;
  if (n < 1000) return Math.floor(n / 100) * 100;
  return Math.floor(n / 1000) * 1000;
}

export default async function handler(req, res) {
  const s = await getSiteStats();

  // One shared copy for ten minutes; serve the stale one for an hour while it refreshes,
  // so a cold cache never makes a visitor wait on KV.
  res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');

  const show = s.members >= MIN_MEMBERS;
  if (!show) return res.json({ ok: true, show: false });

  return res.json({
    ok: true,
    show: true,
    members: floorTo(s.members),
    // "active this week" is only worth saying when it is not a near-copy of the total
    active: s.active >= 10 ? floorTo(s.active) : null,
    games: s.games >= MIN_GAMES ? floorTo(s.games) : null,
    minutes: s.uilsec >= 6000 ? floorTo(Math.round(s.uilsec / 60)) : null,
  });
}
