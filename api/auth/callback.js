// /api/auth/callback — Patreon sends the member back here with ?code & ?state.
import { exchangeCode, checkMembership, sessionCookie, RECHECK_HOURS } from '../../lib/session.js';

function getCookie(req, name) {
  const m = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : null;
}
function safePath(n) {
  if (!n || typeof n !== 'string') return '';
  if (!n.startsWith('/') || n.startsWith('//')) return '';
  if (/[\r\n\t]/.test(n)) return '';
  return n;
}
function withParam(url, kv) { return url + (url.includes('?') ? '&' : '?') + kv; }

export default async function handler(req, res) {
  const { code, state } = req.query;
  const cookieState = getCookie(req, 'elc_oauth_state');
  // where the member started (e.g. /practice-arcade.html); default to the archive
  const next = safePath(getCookie(req, 'elc_oauth_next')) || '/archive.html';
  const clearOauth = [
    'elc_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    'elc_oauth_next=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
  ];

  if (!code || !state || state !== cookieState) {
    res.setHeader('Set-Cookie', clearOauth);
    return res.redirect(302, withParam(next, 'e=auth'));
  }

  try {
    const tokens = await exchangeCode(code);
    const { status, name, cents } = await checkMembership(tokens.access_token);

    if (status === 'none') {
      res.setHeader('Set-Cookie', clearOauth);
      return res.redirect(302, withParam(next, 'e=notmember'));
    }

    const session = {
      name, tier: status === 'paid' ? 'fluency' : 'trial',
      access: status,                       // 'paid' | 'trial'
      cents,                                // current tier price in cents (gates Fluency-only features)
      at: tokens.access_token,
      rt: tokens.refresh_token,
      atexp: Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : 30 * 864e5),
      recheck: Date.now() + RECHECK_HOURS * 3600e3,
      exp: Date.now() + 30 * 864e5,
    };
    res.setHeader('Set-Cookie', [sessionCookie(session), ...clearOauth]);
    return res.redirect(302, next);          // back to where the member started
  } catch (e) {
    res.setHeader('Set-Cookie', clearOauth);
    return res.redirect(302, withParam(next, 'e=auth'));
  }
}
