# English Leap Club — Practice Arcade & Site · HANDOFF

Single "start here" for continuing in a fresh chat. The full, current codebase is
this folder (`englishleap-landing/`). Hand this whole folder (zipped) to the next
session along with any new episode transcript.

---

## 1. What this project is

- **englishleap.app** — a B1–B2 English-learning brand (parent: Leap Labs, UAE).
  YouTube podcast → Patreon funnel. Mascot: **Oriva** (teal bird).
- **Stack:** static HTML on **Vercel** + serverless functions in `api/` +
  **Upstash KV** + **Patreon OAuth**. Vanilla JS, no framework.
  Fonts: Clash Display + General Sans (Fontshare). Dark "aurora" aesthetic.
- **Practice Arcade** — every episode becomes **5 web games**:
  `clue-room` (free), `phrase-pairs` (Transcript tier),
  `listening-gap` / `story-unlock` / `sentence-builder` (Fluency tier).

## 2. Current state (as of this handoff)

**Episodes live** (newest → oldest; `*` = current / "THIS WEEK"):
`ep272*` Dream Jobs · `ep271` Friendship · `ep270` Inner Peace · `ep269` Keep It Going · `ep268` Dreams & Goals · `ep267` Overthinking · `ep263` Awkward Talks · `ep262` Stay Positive · `ep251` Purpose · `ep250` Online Reviews · `ep249` Confidence · `ep248` Modern Love · `ep247` Calm Nights · `ep246` Speaking
· `ep243` Change · `ep242` Climate · `ep239` Workday · `ep238` Exercise · `ep235`
· `ep234` · `ep232` · `ep231`.

**Tiers** (must match Patreon):
- **Transcript Library** — $1/mo, **has a 1-week free trial**. Transcripts + Word Tour.
- **Fluency Club** — $2.99/mo, **NO free trial**. Unlocks the full Practice Arcade
  (all 5 interactive games) + role-play, shadowing, quizzes, etc.
- **Free:** the Clue Room only.

**Auth (Patreon OAuth) — all fixes applied:**
- OAuth handshake cookies use `SameSite=None` (survive Safari/ITP round-trip).
- `checkMembership()` filters memberships by **`PATREON_CAMPAIGN_ID`** so members
  who back multiple creators (and free-trial members) resolve to the right
  membership. Campaign id = **16096836**.
- Requests `identity[email]`; on "no membership" it shows the (masked) account
  email + a "Log out of Patreon / Sign in with another account" switch flow.

## 3. Environment variables (Vercel)

Required: `PATREON_CLIENT_ID`, `PATREON_CLIENT_SECRET`, `PATREON_REDIRECT_URI`,
`SESSION_SECRET`, and **`PATREON_CAMPAIGN_ID=16096836`** (without this the
multi-membership / free-trial fix is inert).
Present but optional for this workflow: `KV_REST_API_URL`, `KV_REST_API_TOKEN`
(only used if you seed KV — see §4).

## 4. Deploy workflow (IMPORTANT — how the site actually ships)

Download the files produced → update the repo → `git push` → Vercel redeploys.
**That's the whole process.**

**No KV seed is needed.** `lib/arcade-store.js` reads the catalogue from KV *only*
if the `arcade:catalog` key is populated; it isn't, so the app falls back to the
bundled `lib/arcade-data.js` — i.e. **the deployed file is live**. Do **NOT** run
`tools/seed-arcade.js` unless you deliberately adopt the KV workflow: seeding once
flips the site to KV-first, after which every episode would then require a reseed.

## 5. How to add a new episode (the pipeline)

Given a transcript `.txt`:

1. **Identify the 6 words/phrases** (the "Word Tour"). If the episode only taught
   5, add a 6th that's genuinely discussed in the transcript — the games are built
   for **exactly 6** (Phrase Pairs needs 6 pairs for its 3x4 grid).
2. **Assign colors in order:** pink `#f6479a`, violet `#8b6cff`, coral `#ff8a63`,
   teal `#1fc4b6`, deep-teal `#1ca8a2`, mint `#57e6c4`.
3. **Author content** per game and prepend an episode object to each of the 5 game
   types in `lib/arcade-data.js` (set the new one `current:true`, flip the previous
   `current:false`). Shapes:
   - `clue-room`: `intro`, `clues[6]` `{id,word,color,emoji,geo,clue,example,position}`,
     `puzzle{segments[7], answers[6], keeper}`. geos cycle
     `ico,box,sphere,torus,octa,dodeca`; positions mirror the standard 6 (copy an
     existing episode).
   - `phrase-pairs`: `intro`, `pairs[6]` `{word,meaning,color}`, `keeper`.
   - `listening-gap`: `intro`, `rounds[6]` `{text,phrase,color}`, `keeper`.
   - `story-unlock`: `intro`, `phrases[6]` `{word,color}`, `story` (with 6 `{word}`
     gaps), `bonusEnding`, `keeper`.
   - `sentence-builder`: `intro`, `sentences[6]` `{text,phrase,color}`, `keeper`.
   - **Rules:** `listening-gap` and `sentence-builder` share the *identical* 6
     sentences; each listening `text` must contain its `phrase` verbatim; the clue
     `puzzle.answers` order matches the `segments` blanks.
4. **Covers (5):** one per game, seeded by the EP number. `clue-room` shows the
   first 3 clue emojis; `phrase-pairs` shows a representative word/meaning; the
   other 3 are branded/seeded. Save to `covers/<type>-ep<N>.png` (1280x720).
5. **Clue tiles (6):** pre-baked glossy app-icons at
   `games/clue-room/icons/auto/<key>.png`, where `key` =
   emoji codepoints joined by `-`, then `_`, then the color hex **without** `#`
   (e.g. `1f4aa_f6479a.png`; VS16 emoji like `♻️` -> `267b-fe0f_...`).
6. **Render-review before shipping** (see §6).

The renderers/harness used to build covers, bake tiles, and screenshot games are
**not** in the repo — they live in the build chat. In a new chat, ask the
assistant to regenerate them (standard headless-Chromium + Pillow scripts; the
assistant knows the exact patterns from prior episodes).

## 6. Conventions & gotchas (learned the hard way)

- **Emojis for clue tiles:** prefer single-codepoint, **color-rendering** emoji
  (faces, objects, people, hearts). **Avoid symbol/arrow emoji** — `🔄 ↔️ ⏸ 🔀`
  render **monochrome/white** in Noto. VS16 object emoji (`♻️ 🗑️`) are fine.
  Don't repeat an emoji within the same episode; reuse across episodes is OK.
- **Overflow:** long single words (e.g. "overconsumption", "vulnerability") can
  clip. `phrase-pairs` already has `overflow-wrap:break-word; hyphens:auto` on the
  card faces to handle this. Always render-review Phrase Pairs, the Story bank, and
  the Clue Room sentence slots. Two-sentence keepers are fine.
- **Keeper** = one short memorable line (em-dash style works well).
- **Gating:** `api/games.js` unlocks by `cents >= 200` (Fluency). A trial member
  carries their tier's entitled cents, so a valid membership unlocks correctly.
- **Title on covers:** short/theme-only (auto-fits). One or two words.

## 7. Key files

| File | Purpose |
|---|---|
| `lib/arcade-data.js` | The catalogue (episodes + all game content). Edit to add episodes. |
| `lib/arcade-store.js` | `getArcade()` — KV with static fallback (see §4). |
| `lib/session.js` | Patreon OAuth helpers + `checkMembership` (campaign filter, email scope). |
| `api/auth/login.js`, `callback.js` | OAuth start / callback (SameSite=None, masked-account switch). |
| `api/games.js`, `api/list.js` | Serve catalogue + tier gating. |
| `games/<type>/index.html` | The 5 game engines (generic — read `content`). |
| `index.html` | Landing page (tiers, pillars, legend). |
| `practice-arcade.html` | Arcade hub + login/error messaging. |
| `archive.html`, `use-it-live.html` | Transcript archive; speaking-feedback feature. |
| `tools/seed-arcade.js` | Optional KV seeder (NOT needed for deploy-only). |
| `covers/`, `games/clue-room/icons/auto/` | Per-episode covers and clue tiles. |

## 8. On the horizon / not yet built

- **Shadowing player** (interactive transcript + optional custom voiceover, speed
  control, loop-N, "listen & repeat"): designed but not built. Recommended path —
  vanilla component + forced-alignment (aeneas/WhisperX) build step for timings +
  PWA "save for offline". Audio comes from Google AI Studio (Gemini TTS) -> ffmpeg
  to mono mp3/m4a.
- **Use It Live** (record + AI speaking feedback) exists but nav is gated behind an
  `UIL_ENABLED` flag.

## 9. What the next chat needs from you

- The **episode transcript** `.txt` for each new episode (that's all you've been
  uploading; the assistant builds on the latest codebase).
- **Only if the repo changed outside the assistant's deliveries**, upload the
  latest zip too, so it doesn't build on a stale base.
