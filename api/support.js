// api/support.js — the help form. Takes a message and up to three screenshots and emails
// them to the support mailbox, which the visitor never sees.
//
// The mailbox address lives ONLY in the SUPPORT_TO env var. It is never sent to the page,
// never echoed in a response, and the email goes out FROM a no-reply address with the
// visitor's own address as Reply-To — so hitting Reply in your inbox answers them directly
// without either side seeing anything they should not.
//
// Delivery is Resend's REST API (no SDK — the stack is buildless). Needs, in Vercel:
//   RESEND_API_KEY   the key from resend.com
//   SUPPORT_TO       where complaints go            e.g. help@englishleap.app
//   SUPPORT_FROM     a sender on a VERIFIED domain  e.g. "English Leap <noreply@englishleap.app>"
//
// Abuse controls, in order of cheapness:
//   * a honeypot field a person never fills — a bot that fills it is told "sent" and nothing
//     is mailed, so it has no signal to adapt to;
//   * hard size and type limits (a mail provider is a very expensive way to host files);
//   * at most RATE_MAX sends per IP per hour, counted in KV. KV unreachable → the send is
//     allowed: blocking a member who is trying to report a problem is the worse failure.
import '../lib/quiet-deprecations.js';
import { readSession, planOf } from '../lib/session.js';

export const config = { maxDuration: 20 };

export const CATEGORIES = {
  signin:   "I can't sign in",
  game:     "A game isn't working",
  billing:  'Membership or billing',
  display:  'Something looks wrong',
  idea:     'A suggestion',
  other:    'Something else',
};
export const LIMITS = {
  messageMin: 10,
  messageMax: 4000,
  files: 3,
  fileBytes: 1.5 * 1024 * 1024,   // after client-side compression a screenshot is ~200-400KB
  types: ['image/png', 'image/jpeg', 'image/webp'],
};
const RATE_MAX = 5;
const RATE_WINDOW = 3600;

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOK = process.env.KV_REST_API_TOKEN;

export const esc = (t) => String(t == null ? '' : t)
  .replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const EMAIL_RE = /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,24}$/i;

// Everything a request must satisfy, without touching the network. Returns
// { ok:true, clean } or { ok:false, field, error } — exported so it can be tested directly.
export function validate(body) {
  const b = body && typeof body === 'object' ? body : {};
  const category = String(b.category || '');
  if (!CATEGORIES[category]) return { ok: false, field: 'category', error: 'Choose what this is about.' };

  const message = String(b.message || '').trim();
  if (message.length < LIMITS.messageMin) {
    return { ok: false, field: 'message', error: 'Tell us a little more, so we can help.' };
  }
  if (message.length > LIMITS.messageMax) {
    return { ok: false, field: 'message', error: `Please keep it under ${LIMITS.messageMax} characters.` };
  }

  const email = String(b.email || '').trim();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, field: 'email', error: 'Add an email address so we can reply.' };
  }

  const name = String(b.name || '').trim().slice(0, 80);
  const files = Array.isArray(b.files) ? b.files : [];
  if (files.length > LIMITS.files) {
    return { ok: false, field: 'files', error: `Up to ${LIMITS.files} screenshots, please.` };
  }
  const attachments = [];
  for (const [i, f] of files.entries()) {
    const type = String(f && f.type || '');
    if (!LIMITS.types.includes(type)) {
      return { ok: false, field: 'files', error: 'Screenshots need to be PNG, JPEG or WebP images.' };
    }
    const data = String(f && f.data || '');
    if (!/^[A-Za-z0-9+/]+=*$/.test(data)) {
      return { ok: false, field: 'files', error: 'One of the screenshots could not be read.' };
    }
    const bytes = Math.floor(data.length * 3 / 4);
    if (bytes > LIMITS.fileBytes) {
      return { ok: false, field: 'files', error: 'One screenshot is too large — try a smaller one.' };
    }
    const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    attachments.push({ filename: `screenshot-${i + 1}.${ext}`, content: data });
  }

  return {
    ok: true,
    clean: {
      category, message, email, name, attachments,
      page: String(b.page || '').slice(0, 300),
    },
  };
}

// The email itself. Every piece of visitor input is escaped: this HTML is rendered by a
// mail client, and a complaint must not be able to inject markup into your inbox.
export function composeEmail(clean, ctx = {}) {
  const topic = CATEGORIES[clean.category];
  const first = clean.message.replace(/\s+/g, ' ').slice(0, 60);
  const who = ctx.member
    ? `${ctx.member.name || 'Member'} (${ctx.member.plan}, ${ctx.member.uid})`
    : 'Not signed in';

  const rows = [
    ['About', topic],
    ['From', clean.name ? `${clean.name} <${clean.email}>` : clean.email],
    ['Account', who],
    ['Page', clean.page || '—'],
    ['Browser', ctx.userAgent || '—'],
    ['Sent', ctx.when || new Date().toISOString()],
    ['Screenshots', String(clean.attachments.length)],
  ];

  const html =
    `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:14px;color:#241f3a">` +
    `<p style="white-space:pre-wrap;font-size:15px;line-height:1.55;margin:0 0 18px">${esc(clean.message)}</p>` +
    `<table cellpadding="6" style="border-collapse:collapse;font-size:13px;color:#5b5680">` +
    rows.map(([k, v]) => `<tr><td style="font-weight:600;padding-right:14px">${esc(k)}</td>` +
      `<td>${esc(v)}</td></tr>`).join('') +
    `</table><p style="font-size:12px;color:#847fa6;margin-top:18px">` +
    `Reply to this email to answer them directly.</p></div>`;

  const text = `${clean.message}\n\n` + rows.map(([k, v]) => `${k}: ${v}`).join('\n');

  return {
    subject: `[Help] ${topic}: ${first}${clean.message.length > 60 ? '…' : ''}`,
    html, text,
  };
}

async function overLimit(ip) {
  if (!KV_URL || !KV_TOK || !ip) return false;
  const key = `support:ip:${encodeURIComponent(ip)}`;
  try {
    const r = await fetch(`${KV_URL}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOK}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(RATE_WINDOW), 'NX']]),
    });
    if (!r.ok) return false;
    const j = await r.json();
    return (Number(j && j[0] && j[0].result) || 0) > RATE_MAX;
  } catch (e) {
    console.warn('[support] rate limit check failed', String(e.message || e));
    return false;                                   // fail open: never block a report
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed.' });

  const body = req.body || {};

  // honeypot: a person never sees this field. Answer as though it worked.
  if (body.website) return res.json({ ok: true });

  const v = validate(body);
  if (!v.ok) return res.status(400).json({ ok: false, field: v.field, error: v.error });

  const KEY = process.env.RESEND_API_KEY;
  const TO = process.env.SUPPORT_TO;
  const FROM = process.env.SUPPORT_FROM;
  if (!KEY || !TO || !FROM) {
    console.warn('[support] not configured: set RESEND_API_KEY, SUPPORT_TO and SUPPORT_FROM');
    return res.status(503).json({
      ok: false,
      error: 'The help form is not switched on yet. Please message us on Patreon for now.',
    });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (await overLimit(ip)) {
    return res.status(429).json({
      ok: false, error: 'We have your messages — please give us a little time to reply.',
    });
  }

  const s = readSession(req);
  const member = s ? { name: s.name, plan: planOf(s), uid: s.uid } : null;
  const mail = composeEmail(v.clean, {
    member, userAgent: String(req.headers['user-agent'] || '').slice(0, 200),
  });

  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 12000);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: ctl.signal,
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: TO.split(',').map((x) => x.trim()).filter(Boolean),
        reply_to: v.clean.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        attachments: v.clean.attachments,
      }),
    });
    if (!r.ok) {
      // log the provider's reason for us; never forward it (it can name the mailbox)
      console.warn('[support] send failed', r.status, (await r.text()).slice(0, 300));
      return res.status(502).json({
        ok: false, error: 'We could not send that just now. Please try again in a minute.',
      });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.warn('[support] send error', String(e.message || e));
    return res.status(502).json({
      ok: false, error: 'We could not send that just now. Please try again in a minute.',
    });
  } finally {
    clearTimeout(t);
  }
}
