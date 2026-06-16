# Practice Arcade — Walkthrough Scripts

> **Rendered videos are ready** at `/assets/walkthroughs/<game>-walkthrough.mp4` (HD 1920×1080, ~15–17s each, silent visual demos). The catalog `walkthrough` fields are already wired to them.
> The voiceover is **not** burned in — lay it over the video in your editor, or run the lines through your Gemini TTS and mux the audio. (If you send me an audio file, I can mux it with ffmpeg.)

## Timed voiceover (matches the rendered MP4s)

**Sentence Builder** (~16.9s)
- 0:00 — This is Sentence Builder.
- 0:03 — Tap the words… in the right order… to build the sentence.
- 0:11 — Press Check. The words turn green… and you hear it.
- 0:14 — Build it, word by word. Now you try.

**Listening Gap** (~14.4s)
- 0:00 — This is Listening Gap.
- 0:03 — Press "Hear the sentence"… and listen.
- 0:07 — Then tap the phrase that fills the gap.
- 0:11 — The gap fills in. Ready to listen?

**Story Unlock** (~16.5s)
- 0:00 — This is Story Unlock.
- 0:03 — Tap the right phrase to fill the glowing gap.
- 0:09 — Fill them all… and the story comes to life —
- 0:13 — with a bonus ending to enjoy.

**Phrase Pairs** (~15.8s)
- 0:00 — This is Phrase Pairs.
- 0:03 — Turn over a card to see a phrase…
- 0:07 — then find the card with its meaning.
- 0:11 — A match speaks the phrase aloud. Match them all!

*Want a slower, longer cut (e.g. 30–40s with more narration room)? I can re-render with longer holds — just say the word. The fuller 60-second storyboards and scripts are kept below for that.*

---


Production scripts for the four remaining game walkthroughs, matching the Clue Room one.
Each is written for a **slow, calm pace** so B1–B2 learners can follow every step.

## Global production notes
- **Length:** aim for 50–75 seconds. Slower is better than rushed.
- **Pace:** hold ~1–1.5 seconds on each action before moving on. Move the cursor slowly. Let every tap land before the next.
- **Capture:** record the real game in a clean browser window (no devtools). 16:9 is ideal (e.g. 1280×720 or 1920×1080).
- **Voiceover:** record separately (or run the script through your Gemini TTS). Target rate ≈ **0.85–0.9×** — unhurried, warm, encouraging. Pause at each "…" and at line breaks.
- **Music (optional):** soft, low (-22 dB or quieter) so narration stays clear.
- **Export:** MP4 (H.264), then drop each file at the path below (same convention as Clue Room):
  - `/assets/walkthroughs/phrase-pairs-walkthrough.mp4`
  - `/assets/walkthroughs/listening-gap-walkthrough.mp4`
  - `/assets/walkthroughs/story-unlock-walkthrough.mp4`
  - `/assets/walkthroughs/sentence-builder-walkthrough.mp4`
- **Wiring:** once a file exists, set its `walkthrough` field in `lib/arcade-data.js` (exact one-line edits are at the end of this doc), then re-seed KV.

---

## 1) Phrase Pairs  *(a memory match — flip cards, pair each phrase with its meaning)*

**Storyboard**

| Time | On screen | Voiceover |
|------|-----------|-----------|
| 0:00–0:05 | Game opens on the card grid | Welcome to Phrase Pairs. |
| 0:05–0:13 | Slowly pan the grid of face-down cards | Here you'll see a grid of cards, all face down. Some show a phrase… others show what it means. |
| 0:13–0:22 | Tap one card — it flips to a phrase | Tap a card to turn it over. This one says… "make amends." |
| 0:22–0:34 | Tap a second card — its meaning; they match and the phrase is spoken | Now find its meaning. "Fix things after an argument." That's a match — and you'll hear the phrase out loud. |
| 0:34–0:44 | Tap two cards that don't match — they flip back | If two cards don't go together, they simply turn back over. There's no penalty — just try again. |
| 0:44–0:56 | Continue until all pairs are matched; win screen with Oriva | Match every pair to finish. Take your time, listen to each phrase… and say it with us. |
| 0:56–1:02 | Hold on the celebration | That's Phrase Pairs. Your turn. |

**Voiceover script (clean):**
> Welcome to Phrase Pairs.
> Here you'll see a grid of cards, all face down… Some show a phrase… others show what it means.
> Tap a card to turn it over. This one says… "make amends."
> Now find its meaning. "Fix things after an argument." That's a match — and you'll hear the phrase out loud.
> If two cards don't go together, they simply turn back over. There's no penalty — just try again.
> Match every pair to finish. Take your time, listen to each phrase… and say it with us.
> That's Phrase Pairs. Your turn.

---

## 2) Listening Gap  *(hear the sentence, tap the phrase that fills the blank)*

**Storyboard**

| Time | On screen | Voiceover |
|------|-----------|-----------|
| 0:00–0:05 | Game opens on a sentence with one blank | Welcome to Listening Gap. This game trains your ears. |
| 0:05–0:13 | Highlight the sentence and the empty gap | You'll see a sentence with one phrase missing. |
| 0:13–0:22 | Tap "Hear the sentence"; audio plays | Press "Hear the sentence"… and listen carefully. |
| 0:22–0:28 | Tap "Play again" once | You can play it as many times as you like. |
| 0:28–0:40 | Hover the chips, then tap the correct one; the gap fills | Then tap the phrase that fits the gap. Listen… and choose. When you're right, the gap fills in. |
| 0:40–0:50 | Next sentence appears; tap a wrong chip (it fades), then the right one | If a choice isn't right, just pick another — and go at your own pace. |
| 0:50–0:58 | Finish the round; win screen | Complete every sentence to finish the round. |
| 0:58–1:04 | Hold on the celebration | That's Listening Gap. Ready to listen? |

**Voiceover script (clean):**
> Welcome to Listening Gap. This game trains your ears.
> You'll see a sentence with one phrase missing.
> Press "Hear the sentence"… and listen carefully.
> You can play it as many times as you like.
> Then tap the phrase that fits the gap. Listen… and choose. When you're right, the gap fills in.
> If a choice isn't right, just pick another — and go at your own pace.
> Complete every sentence to finish the round.
> That's Listening Gap. Ready to listen?

---

## 3) Story Unlock  *(fill each glowing gap with the right phrase; unlock the story + a bonus ending)*

**Storyboard**

| Time | On screen | Voiceover |
|------|-----------|-----------|
| 0:00–0:05 | Game opens on the story with gaps | Welcome to Story Unlock. |
| 0:05–0:14 | Point to the story; the first gap is glowing | You'll complete a short story… one phrase at a time. The glowing gap is the one to fill next. |
| 0:14–0:24 | Read the line; tap the matching phrase chip; it drops into the gap | Read the sentence, then tap the phrase that fits. Watch it drop into place. |
| 0:24–0:32 | Tap a wrong chip — it shakes — then the right one | If it isn't the right one, it gives a gentle shake. Just choose again. |
| 0:32–0:44 | Fill the remaining gaps one by one | Fill each gap in order… and the story slowly comes to life. |
| 0:44–0:54 | Last gap fills; the bonus ending card appears | When the story is complete, a bonus ending unlocks — a little extra to enjoy. |
| 0:54–1:02 | Tap "Read the story" to hear it | You can listen to the whole story, too. |
| 1:02–1:08 | Hold on the celebration | That's Story Unlock. Let's read together. |

**Voiceover script (clean):**
> Welcome to Story Unlock.
> You'll complete a short story… one phrase at a time. The glowing gap is the one to fill next.
> Read the sentence, then tap the phrase that fits. Watch it drop into place.
> If it isn't the right one, it gives a gentle shake. Just choose again.
> Fill each gap in order… and the story slowly comes to life.
> When the story is complete, a bonus ending unlocks — a little extra to enjoy.
> You can listen to the whole story, too.
> That's Story Unlock. Let's read together.

---

## 4) Sentence Builder  *(tap the scrambled words into the right order, then hear it)*

**Storyboard**

| Time | On screen | Voiceover |
|------|-----------|-----------|
| 0:00–0:05 | Game opens on the build screen | Welcome to Sentence Builder. |
| 0:05–0:14 | Point to the mixed words, the empty tray, and the phrase hint | You'll see a set of mixed-up words… and the phrase to build with. |
| 0:14–0:28 | Tap words one by one into the tray, slowly | Tap the words, one by one, to build your sentence. Start with the first word… then the next… |
| 0:28–0:36 | Tap a word in the tray to send it back | Changed your mind? Tap a word in the tray to send it back down. |
| 0:36–0:46 | Press "Check"; correct words turn green; sentence is spoken | When it looks right, press "Check." The correct words turn green… and you'll hear the whole sentence. |
| 0:46–0:54 | Show a word out of place shaking, then fixed | If a word is out of place, it shakes — just move it, and check again. |
| 0:54–1:02 | Finish all sentences; win screen with Oriva | Build every sentence to finish. |
| 1:02–1:08 | Hold on the celebration | That's Sentence Builder. Now you try. |

**Voiceover script (clean):**
> Welcome to Sentence Builder.
> You'll see a set of mixed-up words… and the phrase to build with.
> Tap the words, one by one, to build your sentence. Start with the first word… then the next…
> Changed your mind? Tap a word in the tray to send it back down.
> When it looks right, press "Check." The correct words turn green… and you'll hear the whole sentence.
> If a word is out of place, it shakes — just move it, and check again.
> Build every sentence to finish.
> That's Sentence Builder. Now you try.

---

## Wiring (apply per game once its MP4 exists)

In `lib/arcade-data.js`, set the matching `walkthrough` field, then re-seed KV:

```js
// phrase-pairs
walkthrough: "/assets/walkthroughs/phrase-pairs-walkthrough.mp4",
// listening-gap
walkthrough: "/assets/walkthroughs/listening-gap-walkthrough.mp4",
// story-unlock
walkthrough: "/assets/walkthroughs/story-unlock-walkthrough.mp4",
// sentence-builder
walkthrough: "/assets/walkthroughs/sentence-builder-walkthrough.mp4",
```

Leave a field empty until its file is live — the "How to play" button only appears when `walkthrough` is set, so an empty value avoids a broken video link.
