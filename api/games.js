import "../lib/quiet-deprecations.js";
// /api/games — Practice Arcade.
//   GET /api/games                      → catalogue the member can access
//   GET /api/games?type=clue-room&ep=ep232 → the gated content for one game
// Reuses the exact membership logic from lib/session.js (same live re-check as
// /api/list), so access tracks paying status identically to the archive.
import {
  readSession, sessionCookie, clearCookie,
  checkMembership, refreshToken, RECHECK_HOURS,
} from "../lib/session.js";
import { getArcade } from "../lib/arcade-store.js";
import { fullTitleFor } from "../lib/episode-titles.js";

// Same 24h live re-check used by /api/list. Returns the (possibly updated)
// session, or null if membership is now inactive (cookie cleared).
async function revalidate(req, res, s) {
  const needTier = s.cents === undefined && !!s.rt; // session issued before tiering existed
  if (!(s.access && s.rt && (needTier || Date.now() > (s.recheck || 0)))) return s;
  const doRefresh = async (rt) => {
    const t = await refreshToken(rt);
    return { at: t.access_token, rt: t.refresh_token || rt, atexp: Date.now() + (t.expires_in ? t.expires_in * 1000 : 30 * 864e5) };
  };
  try {
    let { at, rt, atexp } = s;
    if (!atexp || Date.now() > atexp - 60000) ({ at, rt, atexp } = await doRefresh(rt));
    let mem;
    try { mem = await checkMembership(at); }
    catch { ({ at, rt, atexp } = await doRefresh(rt)); mem = await checkMembership(at); }
    if (mem.status === "none") { res.setHeader("Set-Cookie", clearCookie); return null; }
    const next = { ...s, at, rt, atexp, access: mem.status, cents: mem.cents, tier: mem.status === "paid" ? "fluency" : "trial", recheck: Date.now() + RECHECK_HOURS * 3600e3 };
    res.setHeader("Set-Cookie", sessionCookie(next));
    return next;
  } catch {
    return s; // Patreon unreachable → honour cached status (outage-safe)
  }
}

export default async function handler(req, res) {
  // Logged-in members get a live re-check; anonymous visitors are still allowed a taster.
  let s = readSession(req);
  if (s) s = await revalidate(req, res, s); // becomes null if membership went inactive

  const ARCADE = await getArcade(); // server-side store (KV) with static fallback

  // Access ladder: each game declares a tier; your Patreon level unlocks every
  // game at or below it. free → everyone (no login needed); transcript → $1+;
  // fluency → $2.99 only. All episodes of an unlocked game are playable.
  const FLUENCY_MIN_CENTS = 200; // Transcript = 100¢, Fluency Club = 299¢
  const RANK = { free: 0, transcript: 1, fluency: 2 };
  const userRank = !s ? 0 : (s.cents === undefined ? 2 : ((Number(s.cents) || 0) >= FLUENCY_MIN_CENTS ? 2 : 1));
  const tierLabel = ["none", "transcript", "fluency"][userRank];
  const gameRank = (gt) => (RANK[gt.access] ?? 2);
  const unlocked = (gt) => userRank >= gameRank(gt);

  const { type, ep } = req.query;

  // --- catalogue --- every game is shown; locked ones carry a flag + tier so
  // the hub can render them as upsell tiles. Episode meta is always listed.
  if (!type || !ep) {
    const arcade = ARCADE.map((gt) => ({
      type: gt.type, name: gt.name, icon: gt.icon, accent: gt.accent, tagline: gt.tagline, walkthrough: gt.walkthrough || "", walkthroughPoster: gt.walkthroughPoster || "",
      access: gt.access || "fluency", locked: !unlocked(gt),
      episodes: gt.episodes.map((e) => ({
        id: e.id, ep: e.ep, title: e.title, fullTitle: fullTitleFor(e.id, e.title), current: !!e.current, cover: e.cover || null,
        words: ((e.content && (
          (e.content.clues && e.content.clues.map((c) => c.word)) ||
          (e.content.pairs && e.content.pairs.map((p) => p.word)) ||
          (e.content.rounds && e.content.rounds.map((r) => r.phrase)) ||
          (e.content.phrases && e.content.phrases.map((p) => p.word)) ||
          (e.content.sentences && e.content.sentences.map((x) => x.phrase))
        )) || []),
      })),
    }));
    return res.json({ ok: true, name: s ? s.name : null, level: tierLabel, userRank, arcade });
  }

  // --- one game's content ---
  const gi = ARCADE.findIndex((g) => g.type === type);
  const gt = gi >= 0 ? ARCADE[gi] : null;
  const e = gt ? gt.episodes.find((x) => x.id === ep) : null;
  if (!gt || !e) return res.status(404).json({ ok: false, error: "Game not found." });

  if (!unlocked(gt)) {
    const tierName = (gt.access === "transcript") ? "the Transcript tier ($1)" : "Fluency Club ($2.99)";
    if (!s) return res.status(401).json({ ok: false, login: true, access: gt.access, walkthrough: gt.walkthrough || "", walkthroughPoster: gt.walkthroughPoster || "", error: "Sign in with Patreon to play this game." });
    return res.status(403).json({ ok: false, upgrade: true, access: gt.access, walkthrough: gt.walkthrough || "", walkthroughPoster: gt.walkthroughPoster || "", error: "This game is part of " + tierName + "." });
  }
  return res.json({ ok: true, ep: e.ep, title: e.title, type: gt.type, name: gt.name, walkthrough: gt.walkthrough || "", walkthroughPoster: gt.walkthroughPoster || "", user: s ? s.name : null, content: e.content });
}
