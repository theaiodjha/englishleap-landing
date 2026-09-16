import "../lib/quiet-deprecations.js";
// /api/use-it-live — record-and-review speaking practice.
//   POST { action:'usage' }                                  → minutes left this month
//   POST { action:'analyze', audio, mimeType, durationSec, episodeId }
//         → warm feedback on the recording, and meters its length against the
//           member's 100-minute monthly quota (only on success).
//
// Fluency Club only (same cents>=200 rule as /api/games). Audio is analysed by
// Gemini (Claude can't take audio); swap analyzeAudio() for any audio model.

import { readSession, revalidateSession, planOf } from '../lib/session.js';
import { getUsage, addUsage, clampRecordingSec, limitFor, MAX_REC_SEC } from '../lib/quota.js';
import { getEpisodes } from '../lib/arcade-store.js';
import { logSession, getAggregates } from '../lib/history.js';
import { focusFor, allNew, speechMetrics } from '../lib/coach.js';

// Audio analysis of a 3-minute clip can take well past the platform default, and a
// killed function looks like a generic failure to the member. Give it real headroom.
export const config = { maxDuration: 60 };

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'; // 2.5-flash is retired for new API keys
const FLUENCY_MIN_CENTS = 200; // Transcript = 100¢, Fluency Club = 299¢ (mirrors /api/games)

// The speaking task comes from the SAME six words the Arcade teaches for an episode.
// clue-room is the free-tier game, so it carries every episode — reading it there keeps
// Use It Live in step with the arcade automatically, with no second list to maintain.
// Hand-written prompts win where they exist; everything else gets a warm generic one.
// Per-episode speaking tasks. Each one asks for a specific memory or opinion rather
// than "the theme", because a nervous B1 learner can start a story immediately but
// stalls on an abstraction — and each is built so the episode's six words are the
// natural vocabulary for answering it. Drafts: rewrite in Anna & Jake's voice.
const PROMPTS = {
  ep283: 'Tell us about a day when everything went wrong at once — what happened, how you felt in the middle of it, and how the day ended.',
  ep282: 'Tell us about the first drink of your day — coffee, tea, or something else. What do you do while you drink it, and how does a morning feel when you have to skip it?',
  ep280: 'Think about the last time you had to speak English with no time to prepare. What happened when the word you wanted would not come — and what do you do now when that happens?',
  ep279: 'Tell us about a plan you made with someone recently — where to eat, what to buy, how to get somewhere. How did the two of you decide, and did either of you change your mind?',
  ep278: 'Talk about a time you listened to English that felt far too fast — a film, a podcast, or a stranger speaking to you. How much did you actually catch, and what helps you now?',
  ep277: 'Talk about someone or something you decided to step back from. How did it feel at the time, and how do you feel about it now?',
  ep276: 'Tell us about something you worked at for a long time before it paid off. Was there a moment you nearly gave up?',
  ep275: 'Talk about a time you changed direction — a job, a city, a habit, a friendship. What made you stop and rethink?',
  ep274: 'Is there a part of your life that feels stuck at the moment, and another part that feels alive? Talk about both.',
  ep273: 'Talk about something you have kept doing even on the days you did not feel like it. What keeps you going?',
  ep272: 'If you could do any job for one year, with no need to earn money, what would you choose? What are you already good at that would help you?',
  ep271: 'Talk about a friend you trust completely. What do they do that earns that trust — and have you ever misjudged someone?',
  ep270: 'What unsettles you most easily? Talk about the last time it happened and how you got calm again.',
  ep269: 'Think about meeting someone new — at work, at a party, or online. How do you start, and what do you do when the conversation goes quiet?',
  ep268: 'Tell us about a goal you are working towards right now. What is the very next step, and what got in the way last time?',
  ep267: 'Talk about a moment when you knew exactly what you wanted to say, but it came out wrong. What were you worried about?',
  ep263: 'Talk about a time you misunderstood someone, or they misunderstood you. How did the two of you sort it out?',
  ep262: 'Talk about a small thing that lifted your mood recently, and a small thing that spoiled a day. Why do the bad ones feel bigger?',
  ep251: 'Which part of your life feels most meaningful right now? Talk about whether the way you spend your days matches that.',
  ep250: 'Talk about the last thing you bought after reading reviews. Did you believe them — and how do you spot a fake one?',
  ep249: 'Talk about a time you had to explain something important — at work, to a doctor, or to a friend. How did you keep it clear?',
  ep248: 'Do you think it is harder to build a lasting relationship now than it was for your parents? Talk about why.',
  ep247: 'What happens in your head when you get into bed? Talk about a night you could not switch off, and what you try now.',
  ep246: 'In which situation does speaking English frighten you most? Talk about what you are afraid will happen.',
  ep243: 'Talk about a habit you have tried to change more than once. What stops you, and what would actually help?',
  ep242: 'What is one thing you have changed about how you live for the sake of the planet — and one thing you know you should change but have not?',
  ep239: 'Walk us through yesterday at work or at your studies. When were you most productive, and what pulled you away?',
  ep238: 'Talk about how your body moves through a normal week. Is there something you used to do that you have stopped?',
  ep235: 'Talk about something from your upbringing you are grateful for, and something you would do differently in your own family.',
  ep234: 'Talk for up to a minute about your morning routine. What is the first thing you do, and how does it make you feel?',
  ep232: 'Where does your time actually go? Talk about a day that disappeared on you, and one thing you keep putting off.',
  ep231: 'Tell us about yesterday, from the moment you woke up. Did anything happen that you did not expect?',
};

// Last resort only: used if the catalogue is unreachable AND the static seed is empty.
const FALLBACK_EP = {
  id: 'ep234', number: 234, title: 'Morning Routine for Self-Discipline',
  prompt: PROMPTS.ep234,
  words: ['scattered', 'ritual', 'foundation', 'cultivate', 'anchor', 'rewire'],
};

function promptFor(id, title) {
  return PROMPTS[id]
    || `Talk for a minute or two about this episode’s theme — “${title}”. What does it mean to you, and can you share a real example from your own life?`;
}

// Resolve a requested episode id, else the one flagged `current`, else the newest.
async function episodeFor(wanted) {
  let eps = [];
  try { eps = await getEpisodes(); } catch { /* fall through to the static fallback */ }
  if (!eps.length) return FALLBACK_EP;
  const e = (wanted && eps.find((x) => x.id === wanted)) || eps.find((x) => x.current) || eps[0];
  return { id: e.id, number: e.n, title: e.title, prompt: promptFor(e.id, e.title), words: e.words };
}

// Everything the member can practise, newest first — feeds the episode picker.
async function episodeChoices() {
  try {
    return (await getEpisodes()).map((e) => ({ id: e.id, n: e.n, title: e.title }));
  } catch { return []; }
}

function fluencyOK(s) {
  if (!s) return false;
  if (s.cents === undefined) return true;            // legacy session issued before tiering
  return (Number(s.cents) || 0) >= FLUENCY_MIN_CENTS;
}

function analysisPrompt(ep, focus) {
  return `You are Anna and Jake, the warm hosts of the "Speak English With Class" podcast, giving friendly feedback to a B1–B2 English learner. They recorded themselves speaking for this task from Episode ${ep.number} ("${ep.title}"):

TASK THEY WERE GIVEN: "${ep.prompt}"
TARGET WORDS from the episode: ${ep.words.join(', ')}${(focus && focus.length) ? `
STILL WORKING ON: ${focus.join(', ')} — if they use one of these naturally, say so specifically in a win.` : ''}

Listen to the audio and reflect it back kindly. This is NOT a grammar test and NOT a score sheet. Focus on confidence, flow, and the words they used well. Be specific and point to real moments. Use plain, warm B1–B2 English.

Return ONLY a JSON object with this exact shape:
{
  "transcript": "<a clean transcript of what the learner said>",
  "summary": "<one warm sentence describing what they talked about>",
  "wins": ["<specific thing they did well>", "<a second specific win>"],
  "tweak": "<ONE small, gentle, doable suggestion for next time — about confidence or flow, not a grammar nitpick>",
  "words_used": ["<any TARGET words they actually used naturally, base form>"],
  "closing": "<one short encouraging line>",
  "rubric": { "fluency": <1-5>, "clarity": <1-5>, "vocabulary": <1-5>, "task": <1-5> }
}
The rubric is INTERNAL — it is never shown to the learner and must never change the warmth
of the text above. Score honestly and consistently so the same performance always scores the
same: 3 is a solid B1-B2 answer, 5 is confident and natural, 1 is barely attempted.
If the audio is empty, silent, or not speech, return the same shape with empty wins, a gentle tweak asking them to try recording again, and an empty transcript.`;
}

// Gemini's transient failures are worth waiting out: 429 RESOURCE_EXHAUSTED (rate
// limit — TPM binds first for us at roughly 300 requests/min) and 503 UNAVAILABLE
// (overloaded). Returns the seconds to wait, or 0 for a real error. Gemini often
// names its own delay in a RetryInfo block; honour it when it does.
function transientWait(status, text) {
  if (status !== 429 && status !== 503) return 0;
  const m = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(text || '');
  const named = m ? Math.ceil(Number(m[1])) : 0;
  return Math.min(60, Math.max(5, named || (status === 429 ? 20 : 8)));
}

async function analyzeAudio(base64, mimeType, ep, focus) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{
      parts: [
        { text: analysisPrompt(ep, focus) },
        { inline_data: { mime_type: mimeType, data: base64 } },
      ],
    }],
    generationConfig: { temperature: 0.4, responseMimeType: 'application/json' },
  };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text();
    const wait = transientWait(r.status, text);
    const err = new Error(`gemini ${r.status}: ${text.slice(0, 300)}`);
    if (wait) { err.transient = true; err.retryAfter = wait; }
    throw err;
  }
  const j = await r.json();
  const text = (j?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  let out;
  try { out = JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { out = { transcript: '', summary: '', wins: [], tweak: 'I could not hear that clearly — could you record again?', words_used: [], closing: '' }; }
  return out;
}

// A rate-limited call fails in well under a second, so one short wait still fits the
// function budget — and retrying HERE means the member never re-uploads their audio.
async function analyzeWithRetry(base64, mimeType, ep, focus) {
  try {
    return await analyzeAudio(base64, mimeType, ep, focus);
  } catch (e) {
    if (!e.transient) throw e;
    const wait = Math.min(e.retryAfter, 6) * 1000 + Math.floor(Math.random() * 900); // jitter spreads a burst
    await new Promise((r) => setTimeout(r, wait));
    return analyzeAudio(base64, mimeType, ep, focus);
  }
}

// Which of this episode's words the member still owes, from their own usage counters.
// `fresh` means they have used none of them yet — every word is new, so nothing is
// singled out and the page says so instead of inventing a pair.
async function focusWords(uid, words) {
  try {
    const agg = await getAggregates(uid);
    return { focus: focusFor(words, agg.words), fresh: allNew(words, agg.words) };
  } catch { return { focus: [], fresh: false }; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Use POST.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  let s = readSession(req);

  // --- feature flag: hidden from the audience until tested & verified ---
  // Turn the feature on for everyone by setting env  UIL_ENABLED=true
  // While off, you can still preview it yourself via either:
  //   • open /use-it-live.html?preview=TOKEN  where TOKEN === env UIL_PREVIEW_TOKEN
  //   • add your Patreon uid (e.g. p:12345) to env UIL_PREVIEW_UIDS (comma-separated)
  const ENABLED = ['true', '1'].includes(String(process.env.UIL_ENABLED));
  const previewToken = process.env.UIL_PREVIEW_TOKEN || '';
  const token = String(body.preview || (req.query && req.query.preview) || '');
  const previewUids = String(process.env.UIL_PREVIEW_UIDS || '').split(',').map(x => x.trim()).filter(Boolean);
  const preview = (previewToken && token && token === previewToken) || (s && s.uid && previewUids.includes(s.uid));
  if (!ENABLED && !preview) {
    return res.status(503).json({ ok: false, coming_soon: true, message: 'Use It Live is coming soon \u2014 we\u2019re testing it now.' });
  }

  // Entitlement must track live Patreon status: without this a cancelled member keeps
  // spending AI minutes for the 30-day life of their cookie (mirrors /api/games).
  if (s) s = await revalidateSession(res, s); // null once the membership goes inactive

  if (!fluencyOK(s)) {
    return res.status(s ? 403 : 401).json({
      ok: false, login: !s, upgrade: !!s,
      error: s ? 'Use It Live is part of Fluency Club ($2.99).' : 'Sign in with Patreon to use this.',
    });
  }

  const { action } = body;
  const allowance = limitFor(s.cents);   // monthly minutes this member's tier is entitled to
  const ep = await episodeFor(body.episodeId);

  // --- usage: how many minutes are left this month ---
  if (action === 'usage') {
    const u = await getUsage(s.uid, allowance);
    return res.json({
      ok: true, name: s.name, plan: planOf(s), ...publicUsage(u),
      prompt: ep.prompt, episode: ep.number, episodeId: ep.id, title: ep.title, words: ep.words,
      ...(await focusWords(s.uid, ep.words)),     // { focus, fresh }
      episodes: await episodeChoices(),
    });
  }

  // --- analyze: review a recording, then meter its length ---
  if (action === 'analyze') {
    if (!GEMINI_KEY) return res.status(500).json({ ok: false, error: 'Audio analysis is not configured yet.' });

    const before = await getUsage(s.uid, allowance);
    if (before.over) {
      return res.status(429).json({
        ok: false, quota: true, ...publicUsage(before),
        error: `You've used your ${allowance} practice minutes this month. They refresh on the 1st — see you then!`,
      });
    }

    const audio = String(body.audio || '');
    const mimeType = String(body.mimeType || 'audio/webm');
    const durationSec = clampRecordingSec(body.durationSec);
    if (!audio || durationSec < 1) return res.status(400).json({ ok: false, error: 'No audio received. Please record first.' });
    if (durationSec > MAX_REC_SEC) return res.status(413).json({ ok: false, error: `Please keep recordings under ${Math.round(MAX_REC_SEC/60)} minutes.` });

    const { focus } = await focusWords(s.uid, ep.words);

    let feedback;
    try { feedback = await analyzeWithRetry(audio, mimeType, ep, focus); }
    catch (e) {
      // Busy is a wait, not a failure, and emphatically not "you are out of minutes" —
      // the client keys off `busy` so it never shows the quota message for a burst.
      if (e.transient) {
        res.setHeader('Retry-After', String(e.retryAfter));
        return res.status(429).json({
          ok: false, busy: true, retryAfter: e.retryAfter, ...publicUsage(before),
          error: 'The coach is helping a lot of learners right now. Give it a moment.',
        });
      }
      return res.status(502).json({ ok: false, error: 'The coach could not analyse that just now. Please try again.', detail: String(e.message || e) });
    }

    // Meter only after a successful analysis, so failures never cost minutes.
    const after = await addUsage(s.uid, durationSec, allowance);

    // Keep the session in the member's practice history (metadata only, no transcript).
    // logSession fails open and never throws, so history can't break a practice session.
    const rb = (feedback && feedback.rubric) || {};
    await logSession(s.uid, {
      episodeId: ep.id,
      episode: ep.number,
      durationSec,
      wordsUsed: feedback && feedback.words_used,
      wins: feedback && Array.isArray(feedback.wins) ? feedback.wins : [],   // the words, not the count
      tweak: feedback && feedback.tweak,
      rubric: [rb.fluency, rb.clarity, rb.vocabulary, rb.task],
      metrics: speechMetrics(feedback && feedback.transcript, durationSec),
    });

    // The rubric is for the chart, not the member — never send a score to the page.
    if (feedback) delete feedback.rubric;

    return res.json({ ok: true, feedback, ...publicUsage(after) });
  }

  return res.status(400).json({ ok: false, error: 'Unknown action.' });
}

function publicUsage(u) {
  return { usedMin: u.usedMin, limitMin: u.limitMin, remainingMin: u.remainingMin, over: u.over, unmetered: !!u.unmetered };
}
