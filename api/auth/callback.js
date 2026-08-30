import "../../lib/quiet-deprecations.js";
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
// Mask an email for display so the user can spot a wrong account without exposing the
// full address in a URL / browser history / logs: jane@gmail.com -> ja***@gmail.com
function maskEmail(e) {
  if (!e || typeof e !== 'string' || e.indexOf('@') < 1) return '';
  const [u, d] = e.split('@');
  const head = u.length <= 2 ? u.slice(0, 1) : u.slice(0, 2);
  return `${head}***@${d}`;
}

export default async function handler(req, res) {
  const { code, state } = req.query;
  const cookieState = getCookie(req, 'elc_oauth_state');
  // where the member started (e.g. /practice-arcade.html); default to the archive
  const next = safePath(getCookie(req, 'elc_oauth_next')) || '/archive.html';
  const clearOauth = [
    'elc_oauth_state=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0',
    'elc_oauth_next=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0',
  ];

  if (!code || !state || state !== cookieState) {
    res.setHeader('Set-Cookie', clearOauth);
    return res.redirect(302, withParam(next, 'e=auth'));
  }

  try {
    const tokens = await exchangeCode(code);
    const { status, name, email, cents, id } = await checkMembership(tokens.access_token);

    if (status === 'none') {
      res.setHeader('Set-Cookie', clearOauth);
      const who = maskEmail(email);
      return res.redirect(302, withParam(next, 'e=notmember' + (who ? '&who=' + encodeURIComponent(who) : '')));
    }

    const session = {
      name, tier: status === 'paid' ? 'fluency' : 'trial',
      uid: id ? `p:${id}` : null,           // stable id for per-user monthly AI-minutes quota
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
