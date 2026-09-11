# English Leap Club — project guide for Claude Code

Read this first. It captures how this repo works, the house rules, and the current
state of in-flight work so any session starts oriented.

## What this is

**English Leap Club (ELC)** — a B1–B2 English-learning brand built around the
"Speak English With Class" podcast (hosts **Anna** & **Jake**). Members practise on
**englishleap.app**; membership + billing is **Patreon** (two tiers: Transcript
Library $1, Fluency Club $2.99). The Fluency tier includes the interactive Practice
Arcade; the free trial is currently framed on the Transcript Library.

Four-pillar framework — **Read it · Hear it · Practise it · Use it** — colours:
Read `#f6479a` (pink) · Hear `#ff8a63` (coral) · Practise `#8b6cff` (violet) ·
Use `#1fc4b6` (teal). Mascot: **Oriva** (teal bird).

## Stack & deploy

- **Buildless static HTML + Vercel serverless functions** (`api/*.js`). No bundler,
  no framework. Keep it that way unless asked.
- **Upstash KV** via REST (`KV_REST_API_URL` / `KV_REST_API_TOKEN`) — idiom in
  `lib/arcade-store.js` and `lib/quota.js` (`fetch(`${URL}/get|set|incrby|expire/…`,
  Bearer token, read `.result`). Fail open on KV hiccups; never hard-block a paying member.
- **Patreon OAuth** for identity; **Anthropic** and **Gemini** APIs for AI features.
- Serverless files use ESM (`import`/`export`); `package.json` has no `"type":"module"`
  but Vercel handles it. `node --check` may warn about module type — harmless.
- Deploy = `git add -A && commit && push`. Hosting/env changes happen in the Vercel
  and Patreon dashboards (Claude Code can't do those).

## House rules (do these every time)

- **Validate before packaging:** `node --check` every changed JS; extract and
  `node --check` inline `<script>` blocks in changed HTML; then run `python3 tools/audit.py`
  (wired into the pre-push hook). Fix HIGH/MED; LOW at discretion.
- **Never redraw Oriva.** Only use the six real PNG poses from the kit
  (celebrate, exercise, happy, point, read, think). If a PNG is absent, hide it gracefully.
- **Conventional one-line git commits** (e.g. `fix(auth): …`, `feat(uil): …`).
- **Two design systems, never mixed:** the marketing/member site uses **Clash Display +
  General Sans** (Fontshare) with the dark "aurora" aesthetic (see `practice-arcade.html`
  / `use-it-live.html`); the premium PDF/print pipeline uses **Poppins**.
- **Render-review is mandatory** for any generated visual/asset — check overflow and
  layout before shipping.
- **Zip from inside the project dir** (`cd <root> && zip -rq ../out.zip .`).
- Footer disclaimer on all member-facing content:
  *"A practice community - not a replacement for formal English education."*
- Fahad makes all product/design calls; execute conventions without hand-holding but
  flag anything ambiguous.

## Repo map

```
index.html                 marketing home (ecosystem, watch, club, tiers, free, cta)
practice-arcade.html       the Arcade (Patreon-gated mini-games) + "Browse games" links
arcade-browse.html         browse the whole game catalogue by episode
arcade-type.html           per-game-type page
archive.html               Member Archive (gated content library)
use-it-live.html           Use It Live — record & get AI feedback (FLAGGED OFF, see below)
elc-tour.js                guided Oriva tour (home + arcade); auto-runs first visit
api/auth/{login,callback,signout}.js   Patreon OAuth flow
api/{games,list,download,unlock}.js    arcade data, archive list/download, code redemption
api/use-it-live.js         Use It Live: usage + audio analysis (Gemini), flag-gated
lib/session.js             session cookie (HMAC), readSession(), checkMembership() → tier/uid/email,
                           revalidateSession() → shared 24h live Patreon re-check
lib/quota.js               monthly 100-min audio quota (Upstash), keyed to session.uid
lib/arcade-store.js        KV read/write for arcade data (static fallback)
lib/arcade-data.js         static arcade catalogue (short cover titles)
lib/episode-titles.js      long/searchable episode titles for the arcade browser
lib/quiet-deprecations.js  silences DEP0169 (Vercel adapter's url.parse); imported by api routes
tools/audit.py             cross-renderer/consistency audit (pre-push hook)
tools/{seed-arcade,issue-code}.js      seed arcade to KV; issue member codes
games/*                    5 game types (clue-room, phrase-pairs, listening-gap,
                           sentence-builder, story-unlock)
```

## Auth & entitlement

- Login: `/api/auth/login?next=…` → Patreon → `/api/auth/callback` sets a signed
  session cookie (`SameSite=Lax`). Cookie carries `name`, `tier` (`fluency`|`trial`),
  `access` (`paid`|`trial`), `cents`, and **`uid`** (`p:<patreonId>` or `c:<code>`).
- **Membership is resolved to OUR campaign** via `PATREON_CAMPAIGN_ID`
  (`lib/session.js`). This is important: a user may back several creators, and taking
  `members[0]` blindly can grab a *different* creator's membership and wrongly report
  "not a member" — that was the free-trial login bug. **`PATREON_CAMPAIGN_ID` is now
  set in Vercel, so this fix is live.** If it is ever missing, the code falls back to
  `members[0]` and logs a `console.warn` (which also reveals your campaign id in Vercel
  logs the first time) — keep the env var set.
- **Fluency entitlement** = `cents >= 200` (Transcript = 100¢, Fluency = 299¢); a legacy
  session with `cents === undefined` counts as full. Mirror this anywhere you gate
  Fluency-only features (see `api/games.js` and `api/use-it-live.js`).
- **Re-check membership on every gated route** with `revalidateSession(res, s)` — it
  refreshes the token, re-confirms with Patreon at most every `RECHECK_HOURS`, backfills
  `cents` on legacy sessions, and returns `null` (clearing the cookie) once a membership
  goes inactive. Without it a cancelled member keeps their access for the cookie's 30 days.
  `api/games.js` and `api/use-it-live.js` use it; **`api/list.js` still has its own inline
  copy** — fold it in when you next touch that file.
- **Wrong-account UX:** callback requests `identity[email]`, masks it (`ja***@gmail.com`),
  and passes `&who=` on `e=notmember`; the arcade names the account and offers a
  "log out of Patreon to switch account" link (Patreon has no account picker / `prompt`).

### Canonical host (hygiene, dashboard-only)
Patreon's registered redirect URI is the **apex**: `https://englishleap.app/api/auth/callback`,
and `PATREON_REDIRECT_URI` must equal it. Vercel currently redirects apex→www; for the
OAuth state cookie to always share the callback origin, make **apex the primary domain**
(Vercel → Domains) so www redirects to apex. Do NOT add a www→apex `vercel.json` while
the dashboard still does apex→www (it loops). The core "not a member" failures are now
fixed in code (campaign id); this remains good hygiene for state-cookie robustness.

## Use It Live — CURRENT STATE: hidden behind a flag

Record-and-review speaking practice: the learner records audio, **Gemini** analyses it
(Claude can't take audio) and returns warm feedback (2 wins + 1 gentle tweak,
confidence-focused, never grammar-policing). Metered at **100 audio-minutes/month** per
member (`lib/quota.js`), Fluency-gated.

**The task is derived from the Arcade**, not a second list: `episodeFor()` reads the
clue-room block of the catalogue (`getArcade()`), takes the episode flagged `current`
(or the requested `episodeId`) and uses its six clue words. Long titles come from
`lib/episode-titles.js`. Per-episode hand-written prompts live in `PROMPTS` in
`api/use-it-live.js`; anything absent gets a generic prompt built from the title.

**Recorder is multi-take:** each take is decoded to an `AudioBuffer` and held client-side;
on submit every take is concatenated, downmixed to mono and encoded as a single 16-bit PCM
WAV, sent as **one** analyze request (`mimeType:'audio/wav'`). **60s minimum / 180s maximum**
total. Sample rate steps down (16k → 12k → 8k) so even a 3-min session stays under Vercel's
~4.5MB body limit — 16-bit mono at 16kHz is 32KB/s, so 180s would be ~7.7MB once base64'd.

**Intentionally OFF for the audience** until tested:
- `api/use-it-live.js` returns a `coming_soon` 503 unless `UIL_ENABLED=true`.
- `use-it-live.html` shows a clean "coming soon" card in that state.
- Nav links are **commented out** — search `Use It Live hidden until verified` across
  `index.html`, `archive.html`, `practice-arcade.html` (and the tour step in `elc-tour.js`).

**Owner preview while hidden** (either):
- open `/use-it-live.html?preview=TOKEN` where `TOKEN === UIL_PREVIEW_TOKEN`, or
- add your uid (e.g. `p:12345`) to `UIL_PREVIEW_UIDS` (comma-separated).

Preview bypasses the flag only — the Fluency gate still applies, and the creator account
is usually not a patron of its own campaign. Easiest owner login: mint a member code
(`node tools/issue-code.js new fluency "preview"`, which prints the `c:<CODE>` uid to
paste into `UIL_PREVIEW_UIDS`), redeem it on the arcade, then `revoke` it after testing.

**To launch:** set `UIL_ENABLED=true` and uncomment the nav links + tour step.

## Environment variables (Vercel)

```
# identity / billing
PATREON_CLIENT_ID, PATREON_CLIENT_SECRET
PATREON_REDIRECT_URI     must equal the apex callback registered in Patreon
PATREON_CAMPAIGN_ID      SET (live) — resolves membership to your campaign (fixed trial logins)
# data
KV_REST_API_URL, KV_REST_API_TOKEN     Upstash (arcade + quota)
# Use It Live
GEMINI_API_KEY           required for audio analysis (Google AI Studio key)
GEMINI_MODEL             optional, default gemini-3.6-flash (2.5-flash is retired for new keys)
UIL_ENABLED              'true' to open the feature to everyone (default: off)
UIL_PREVIEW_TOKEN        secret for owner ?preview= access while off
UIL_PREVIEW_UIDS         comma-separated uids that bypass the flag
```

## Next up / launch checklist

0. ~~Set `PATREON_CAMPAIGN_ID`~~ — **done**: set in Vercel, campaign-membership
   resolution is live and the fallback warning is gone.
1. **Confirm apex-canonical** in Vercel Domains + `PATREON_REDIRECT_URI` = apex callback.
2. **Set `GEMINI_API_KEY`** (Use It Live is inert without it).
3. **Test Use It Live privately** via preview; verify an **iPhone/Safari** recording
   (MP4/AAC) analyses end-to-end, and desktop mics work once OS/browser permission is
   granted (the page shows step-by-step OS guidance on failure).
4. **Launch:** `UIL_ENABLED=true` + uncomment nav/tour.

## Open decisions

- Quota: meter by wall-clock vs. words; fail-open vs. fail-closed on KV.
- iOS audio-format fallback (add a server-side conversion step only if Safari fails).
- Free-vs-$1 CTA on transcript-only Patreon posts (long-standing).
- Offered, not built: post-login arcade game-ladder tour; "manage subscription"
  deep-link; unified app shell; word-chip "pop" when Gemini confirms a target word.

## Known gotchas

- Inlining a script that contains the literal `</script>` (e.g. in a comment) breaks
  the page — keep `elc-tour.js` external.
- Gemini audio accepts ogg/mp3/aac/wav/flac (WebM worked in testing, but is undocumented).
  `use-it-live.html` no longer relies on the `MediaRecorder` container at all — it decodes
  each take and re-encodes one WAV, so Chrome/Safari differences stop at decode time.
- Gemini model ids retire: `gemini-2.5-flash` is refused for new API keys with a **404**
  naming its replacement. Default is `gemini-3.6-flash`; override with `GEMINI_MODEL`.
- KV keys: no whitespace/slashes/quotes; `encodeURIComponent` them.
- DEP0169 in logs is harmless (Vercel adapter) — already silenced via
  `lib/quiet-deprecations.js`; import it in any new api route if the warning reappears.
