// /api/auth/callback — Patreon sends the member back here with ?code & ?state.
import { exchangeCode, checkMembership, sessionCookie, RECHECK_HOURS } from '../../lib/session.js';

export default async function handler(req, res) {
  const { code, state } = req.query;
  const cookieState = (req.headers.cookie || '').split(';').map(s => s.trim())
    .find(s => s.startsWith('elc_oauth_state='))?.split('=')[1];

  if (!code || !state || state !== cookieState) {
    return res.redirect(302, '/archive.html?e=auth');
  }

  try {
    const tokens = await exchangeCode(code);
    const { status, name } = await checkMembership(tokens.access_token);

    if (status === 'none') return res.redirect(302, '/archive.html?e=notmember');

    // Store the access status + a recheck deadline in the signed cookie.
    // We keep the Patreon access token too, so later visits can silently re-confirm.
    const session = {
      name, tier: status === 'paid' ? 'fluency' : 'trial',
      access: status,                       // 'paid' | 'trial'
      at: tokens.access_token,
      rt: tokens.refresh_token,
      atexp: Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : 30 * 864e5),
      recheck: Date.now() + RECHECK_HOURS * 3600e3,
      exp: Date.now() + 30 * 864e5,
    };
    res.setHeader('Set-Cookie', [
      sessionCookie(session),
      'elc_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    ]);
    return res.redirect(302, '/archive.html');
  } catch (e) {
    return res.redirect(302, '/archive.html?e=auth');
  }
}
