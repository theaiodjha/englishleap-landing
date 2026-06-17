# English Leap Club — Practice Arcade · Handoff / Resume Notes

_Last updated: this session. Attach this file + `englishleap-merged.zip` to a new chat (in the same Project) to resume._

## What this is
B1–B2 English-learning brand (parent: Leap Labs, UAE). YouTube → Patreon funnel.
- Site: **englishleap.app** (Vercel). Member area links to Patreon.
- Hosts: Anna & Jake. Mascot: **Oriva** (teal bird, "oh-REE-vah") — never redraw; use the 6 canonical PNG poses from the starter kit.
- Patreon tiers: Transcript ($1), Fluency Club ($2.99). Disclaimer on all materials: "A practice community - not a replacement for formal English education."
- Brand (warm, NO blue/cyan): Ink #171030, Violet #8b6cff, Pink/Read #f6479a, Coral/Hear #ff8a63, Practise #8b6cff, Teal/Use #1fc4b6, Mint #57e6c4. Fonts: Clash Display + General Sans (web), Poppins TTFs for PIL.

## Tech / workflow
- Static HTML + Vercel serverless (`api/`). Upstash KV storage. Patreon OAuth.
- Working dir: `/home/claude/site`. Re-zip each round:
  `cd /home/claude && rm -f /mnt/user-data/outputs/englishleap-merged.zip && zip -rq /mnt/user-data/outputs/englishleap-merged.zip site -x 'site/.git/*' 'site/node_modules/*'`
- Deploy: user runs `git add -A; commit; push` → Vercel. KV reseed (`tools/seed-arcade.js`) ONLY when `lib/arcade-data.js` changed.
- **Always give a one-line commit message with every change.**
- Validate inline JS (`node --check`) before zipping. Run `python3 tools/audit.py` before shipping (pre-push hook installed; one-time: `git config core.hooksPath tools/hooks`).

## Pages / files
- `index.html` homepage (dark aurora). Mobile menu `#mobileMenu` is full-height + scrollable; theme toggle relocated INTO the menu on mobile (≤1080px) via MutationObserver, floats bottom-right on desktop.
- `practice-arcade.html` hub (data-driven from `/api/games`). Member Login → `/api/auth/login?next=/practice-arcade.html`.
- `arcade-type.html` episode picker. `archive.html` Member Archive.
- `games/{clue-room,phrase-pairs,listening-gap,story-unlock,sentence-builder}/index.html`
- `lib/arcade-data.js` (ARCADE array, 5 game types). `api/games.js` (catalog + gating).
- `api/auth/{login,callback,signout}.js` — OAuth now honors a validated `?next=` return URL (cookie `elc_oauth_next`), redirect_uri stays `/api/auth/callback`.
- Shared JS: `progress.js` (ELC.markComplete/orivaCheer/playVideo/howToPlay), `nav-progress.js` (top progress bar + held highlight), `elc-tour.js` (tour FAB; icon-only on mobile, stacks above theme toggle on desktop, hides on scroll-down), `theme.js`/`theme.css`, `pwa.js`/`sw.js`.
- `tools/audit.py` (site audit) + `tools/hooks/pre-push` (gate). `package.json` has `npm run audit`.
- PIL/ffmpeg generators live in `/home/claude` (not in repo): `make_covers.py`, `make_posts.py`, `render_walkthroughs.py`, `make_clue_tiles.py`.

## State of the 5 games (all consistent now)
- Unified WIN: clean centered result card (headline + keeper + Oriva, fireworks BEHIND via z-index:60), no floating banner. Back button is a small pill (`.back`; in phrase-pairs scoped card faces to `.face.back`/`.face.front`).
- **Clue Room**: 3D, responsive layout, pre-baked emoji PNG tiles, celebration choreography.
- **Phrase Pairs / Listening Gap / Sentence Builder**: card games; Sentence Builder Clear re-shuffles the bank (no longer reveals order).
- **Story Unlock**: on solve → fireworks + 2s pause → auto-read whole story with **karaoke word highlighting** (Web Speech `onboundary`; graceful fallback where unsupported) → on finish, hide story, reveal result + bonus cards. Stoppable narration (floating "Stop" bar + read buttons toggle). **Voice picker + speed control** (`#voiceControls`, persisted in localStorage `elc_voice`/`elc_rate`, default rate 0.85). Unmute reminder toast (lifted above the read bar so they don't overlap). "Read the story again" = clean reading view (hides result/bonus, shows story + Stop). Play Again restores the story card.

## Polish pass done this session (homepage)
- Hero top padding responsive `clamp(104px,15vw,170px)`.
- Lighter muted text tokens (`--muted #b6b2dd`, `--muted-2 #8e8ab6`) for AA contrast.
- `h2` + `.eco-card h3` letter-spacing.
- Tour FAB: higher offset, hide-on-scroll-down, and reliably stacks above the theme toggle on desktop (positionLauncher re-runs at intervals + on breakpoint change; gap = toggle height + 34).
- Verified live via Claude-in-Chrome at phone + desktop widths.

## Open / next
- **Games screenshot sweep** (NOT yet done): win screens + Story Unlock reading/karaoke view at phone/tablet/desktop via connected Chrome. Connect Chrome (desktop only, paid plan), grant site access in the extension side panel (not Chrome privacy settings).
- **Premium narration** (recommended): pre-generate story/bonus MP3 + word timestamps via ElevenLabs/Gemini at build time; build a hybrid player that uses the MP3 + timings when present (consistent expressive voice + reliable karaoke on all devices) and falls back to the browser voice when absent.
- **Member Hub** on members.englishleap.app: branded recommended library from ELC's own catalog. Needs: same repo or separate deploy? + per-episode Patreon post URLs.
- "Use It Live" AI roleplay (episode-anchored) — pending deployment/live backend verification.
- Walkthrough video audio (videos are silent) — mux user VO or render longer cut.
- `byleap` footer → Leap Labs URL (pending).

## Key principles
- Mobile-first; pre-baked emoji PNGs (never live canvas emoji on mobile).
- Differentiator = episode-anchored roleplay w/ target-word activation, not generic chat.
- Content protection = the weekly stream + community, not download-blocking; don't delete old posts.
- EPUB: numeric XML entities only; mimetype stored first (ZIP_STORED); EPUB3 + EPUB2 fallback.
- TTS prompts: Google AI Studio (Gemini) format (Scene/Sample Context/Audio Profile/Speaker), remove contractions, append no-text line, "Pronounce the name Oriva as oh-REE-vah" in every scene.
- New chat per episode build, starting with starter-kit zip + transcript.
