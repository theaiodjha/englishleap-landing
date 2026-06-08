// /api/list — returns the archive for a logged-in member.
// Re-confirms membership with Patreon at most every RECHECK_HOURS. If they cancelled, the archive
// closes itself. If Patreon's API is briefly down, the cached status is honoured so real members
// aren't locked out by an outage.
import { readSession, sessionCookie, clearCookie, signedLink, checkMembership, refreshToken, RECHECK_HOURS } from '../lib/session.js';

// Add one block per episode as you publish. (Or move this into KV to avoid redeploys.)
// `cover` is a PUBLIC image (your pack cover is fine to be public — it's marketing art).
// Drop the cover PNGs in your site's /public/covers/ folder, or point at any URL.
const ARCHIVE = [
  { ep: 'EP232', title: 'Manage Your Time', current: true, cover: '/covers/ep232.png', files: [
    { name: 'Transcript', pillar: 'read', kind: 'PDF', id: 'ep232/transcript.pdf' },
    { name: 'Interactive Transcript', pillar: 'read', kind: 'HTML', id: 'ep232/interactive.html' },
    { name: 'Word Tour', pillar: 'read', kind: 'PDF', id: 'ep232/word-tour.pdf' },
    { name: 'Shadowing (+audio)', pillar: 'hear', kind: 'PDF', id: 'ep232/shadowing.pdf' },
    { name: 'Games', pillar: 'practise', kind: 'PDF', id: 'ep232/games.pdf' },
    { name: 'Quiz Workbook', pillar: 'practise', kind: 'PDF', id: 'ep232/quiz.pdf' },
    { name: 'Scenarios', pillar: 'use', kind: 'PDF', id: 'ep232/scenarios.pdf' },
    { name: 'Mini-Story', pillar: 'use', kind: 'PDF', id: 'ep232/mini-story.pdf' },
  ]},
  { ep: 'EP231', title: 'Talk About Yesterday', cover: '/covers/ep231.png', files: [
    { name: 'Transcript', pillar: 'read', kind: 'PDF', id: 'ep231/transcript.pdf' },
    { name: 'Shadowing (+audio)', pillar: 'hear', kind: 'PDF', id: 'ep231/shadowing.pdf' },
    { name: 'Games', pillar: 'practise', kind: 'PDF', id: 'ep231/games.pdf' },
    { name: 'Mini-Story', pillar: 'use', kind: 'PDF', id: 'ep231/mini-story.pdf' },
  ]},
];

export default async function handler(req, res) {
  let s = readSession(req);
  if (!s) return res.status(401).json({ ok: false, error: 'Not signed in.' });

  // Time to re-confirm with Patreon? (refresh the access token first if it's expired)
  if (s.access && s.rt && Date.now() > (s.recheck || 0)) {
    const doRefresh = async (rt) => {
      const t = await refreshToken(rt);
      return { at: t.access_token, rt: t.refresh_token || rt, atexp: Date.now() + (t.expires_in ? t.expires_in * 1000 : 30 * 864e5) };
    };
    try {
      let at = s.at, rt = s.rt, atexp = s.atexp;
      if (!atexp || Date.now() > atexp - 60000) ({ at, rt, atexp } = await doRefresh(rt)); // expired/near → refresh
      let mem;
      try { mem = await checkMembership(at); }
      catch { ({ at, rt, atexp } = await doRefresh(rt)); mem = await checkMembership(at); } // stale token → refresh once, retry
      if (mem.status === 'none') { // cancelled / expired → close the archive
        res.setHeader('Set-Cookie', clearCookie);
        return res.status(403).json({ ok: false, error: 'Your membership looks inactive now.' });
      }
      s = { ...s, at, rt, atexp, access: mem.status, tier: mem.status === 'paid' ? 'fluency' : 'trial', recheck: Date.now() + RECHECK_HOURS * 3600e3 };
      res.setHeader('Set-Cookie', sessionCookie(s)); // refresh cached status + tokens
    } catch {
      // Patreon API unreachable → keep serving the cached status (outage-safe). Try again next visit.
    }
  }

  const paid = s.access === 'paid';
  const items = ARCHIVE
    .filter(ep => paid || ep.current)   // trial members see only the current episode
    .map(ep => ({
      ep: ep.ep, title: ep.title, current: !!ep.current, cover: ep.cover || null,
      files: ep.files.map(f => ({ name: f.name, pillar: f.pillar, kind: f.kind, url: signedLink(f.id) })),
    }));

  return res.json({ ok: true, name: s.name, access: s.access, items });
}
