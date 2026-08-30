import "../lib/quiet-deprecations.js";
// /api/use-it-live — record-and-review speaking practice.
//   POST { action:'usage' }                                  → minutes left this month
//   POST { action:'analyze', audio, mimeType, durationSec, episodeId }
//         → warm feedback on the recording, and meters its length against the
//           member's 100-minute monthly quota (only on success).
//
// Fluency Club only (same cents>=200 rule as /api/games). Audio is analysed by
// Gemini (Claude can't take audio); swap analyzeAudio() for any audio model.

import { readSession } from '../lib/session.js';
import { getUsage, addUsage, clampRecordingSec, LIMIT_MIN, MAX_REC_SEC } from '../lib/quota.js';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FLUENCY_MIN_CENTS = 200; // Transcript = 100¢, Fluency Club = 299¢ (mirrors /api/games)

// Minimal episode context so feedback is anchored to the words being taught.
const EPISODES = {
  ep234: {
    number: 234,
    title: 'Morning Routine for Self-Discipline',
    prompt: 'Talk for up to a minute about your morning routine. What is the first thing you do, and how does it make you feel?',
    words: ['scattered', 'ritual', 'foundation', 'cultivate', 'anchor', 'rewire'],
  },
};
const DEFAULT_EP = 'ep234';

function fluencyOK(s) {
  if (!s) return false;
  if (s.cents === undefined) return true;            // legacy session issued before tiering
  return (Number(s.cents) || 0) >= FLUENCY_MIN_CENTS;
}

function analysisPrompt(ep) {
  return `You are Anna and Jake, the warm hosts of the "Speak English With Class" podcast, giving friendly feedback to a B1–B2 English learner. They recorded themselves speaking for this task from Episode ${ep.number} ("${ep.title}"):

TASK THEY WERE GIVEN: "${ep.prompt}"
TARGET WORDS from the episode: ${ep.words.join(', ')}

Listen to the audio and reflect it back kindly. This is NOT a grammar test and NOT a score sheet. Focus on confidence, flow, and the words they used well. Be specific and point to real moments. Use plain, warm B1–B2 English.

Return ONLY a JSON object with this exact shape:
{
  "transcript": "<a clean transcript of what the learner said>",
  "summary": "<one warm sentence describing what they talked about>",
  "wins": ["<specific thing they did well>", "<a second specific win>"],
  "tweak": "<ONE small, gentle, doable suggestion for next time — about confidence or flow, not a grammar nitpick>",
  "words_used": ["<any TARGET words they actually used naturally, base form>"],
  "closing": "<one short encouraging line>"
}
If the audio is empty, silent, or not speech, return the same shape with empty wins, a gentle tweak asking them to try recording again, and an empty transcript.`;
}

async function analyzeAudio(base64, mimeType, ep) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{
      parts: [
        { text: analysisPrompt(ep) },
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
  if (!r.ok) throw new Error(`gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const text = (j?.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
  let out;
  try { out = JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { out = { transcript: '', summary: '', wins: [], tweak: 'I could not hear that clearly — could you record again?', words_used: [], closing: '' }; }
  return out;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Use POST.' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const s = readSession(req);

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

  if (!fluencyOK(s)) {
    return res.status(s ? 403 : 401).json({
      ok: false, login: !s, upgrade: !!s,
      error: s ? 'Use It Live is part of Fluency Club ($2.99).' : 'Sign in with Patreon to use this.',
    });
  }

  const { action } = body;
  const ep = EPISODES[body.episodeId] || EPISODES[DEFAULT_EP];

  // --- usage: how many minutes are left this month ---
  if (action === 'usage') {
    const u = await getUsage(s.uid);
    return res.json({ ok: true, name: s.name, ...publicUsage(u), prompt: ep.prompt, episode: ep.number, words: ep.words });
  }

  // --- analyze: review a recording, then meter its length ---
  if (action === 'analyze') {
    if (!GEMINI_KEY) return res.status(500).json({ ok: false, error: 'Audio analysis is not configured yet.' });

    const before = await getUsage(s.uid);
    if (before.over) {
      return res.status(429).json({
        ok: false, quota: true, ...publicUsage(before),
        error: `You've used your ${LIMIT_MIN} practice minutes this month. They refresh on the 1st — see you then!`,
      });
    }

    const audio = String(body.audio || '');
    const mimeType = String(body.mimeType || 'audio/webm');
    const durationSec = clampRecordingSec(body.durationSec);
    if (!audio || durationSec < 1) return res.status(400).json({ ok: false, error: 'No audio received. Please record first.' });
    if (durationSec > MAX_REC_SEC) return res.status(413).json({ ok: false, error: `Please keep recordings under ${Math.round(MAX_REC_SEC/60)} minutes.` });

    let feedback;
    try { feedback = await analyzeAudio(audio, mimeType, ep); }
    catch (e) { return res.status(502).json({ ok: false, error: 'The coach could not analyse that just now. Please try again.', detail: String(e.message || e) }); }

    // Meter only after a successful analysis, so failures never cost minutes.
    const after = await addUsage(s.uid, durationSec);
    return res.json({ ok: true, feedback, ...publicUsage(after) });
  }

  return res.status(400).json({ ok: false, error: 'Unknown action.' });
}

function publicUsage(u) {
  return { usedMin: u.usedMin, limitMin: u.limitMin, remainingMin: u.remainingMin, over: u.over, unmetered: !!u.unmetered };
}
