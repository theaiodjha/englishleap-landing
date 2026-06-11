// Seed / update the server-side arcade catalogue in Vercel KV (Upstash Redis).
//
//   KV_REST_API_URL=...  KV_REST_API_TOKEN=...  node tools/seed-arcade.js
//
// Source of truth for the seed is lib/arcade-data.js. Edit that, re-run this,
// and /api/games picks up the new data within ~60s (in-memory cache TTL) with
// no redeploy. You can also push hand-authored JSON to the same key.

import { ARCADE } from "../lib/arcade-data.js";

const URL = process.env.KV_REST_API_URL;
const TOK = process.env.KV_REST_API_TOKEN;
const KEY = "arcade:catalog";

if (!URL || !TOK) {
  console.error("Missing KV_REST_API_URL / KV_REST_API_TOKEN in the environment.");
  process.exit(1);
}

const body = JSON.stringify(ARCADE);

const res = await fetch(`${URL}/set/${KEY}`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOK}`, "Content-Type": "text/plain" },
  body,
});

const text = await res.text();
if (!res.ok) {
  console.error("Seed failed:", res.status, text);
  process.exit(1);
}
console.log(`Seeded ${ARCADE.length} game type(s), ${ARCADE.reduce((n, g) => n + g.episodes.length, 0)} episode(s) → KV key "${KEY}".`);
console.log("KV response:", text);
