// /api/auth/login — kick off "Continue with Patreon".
// Accepts ?next=/some/path to return the member to where they started after auth.
import crypto from 'crypto';
import { patreonAuthUrl } from '../../lib/session.js';

function safePath(n) {
  // same-site absolute paths only (no open redirects, no header injection)
  if (!n || typeof n !== 'string') return '';
  if (!n.startsWith('/') || n.startsWith('//')) return '';
  if (/[\r\n\t]/.test(n)) return '';
  return n;
}

export default function handler(req, res) {
  // CSRF state: random value stored in a short cookie, echoed back by Patreon.
  const state = crypto.randomBytes(16).toString('hex');
  const next = safePath(req.query && req.query.next);
  const cookies = [
    `elc_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
  ];
  if (next) cookies.push(`elc_oauth_next=${encodeURIComponent(next)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  res.setHeader('Set-Cookie', cookies);
  res.redirect(302, patreonAuthUrl(state));
}
