// /api/auth/login — kick off "Continue with Patreon".
import crypto from 'crypto';
import { patreonAuthUrl } from '../../lib/session.js';

export default function handler(req, res) {
  // CSRF state: random value stored in a short cookie, echoed back by Patreon.
  const state = crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `elc_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  res.redirect(302, patreonAuthUrl(state));
}
