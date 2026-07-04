// lib/session.js — shared helpers for signed sessions + Patreon API calls.
// No npm packages: built-in crypto + fetch only.

import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET;
export const SESSION_DAYS = 30;
export const RECHECK_HOURS = 24; // re-confirm membership with Patreon at most this often

// ---- signed cookie (HMAC, stateless) ----
export function signSession(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}
export function readSession(req) {
  const c = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('elc_session='));
  if (!c) return null;
  const [data, sig] = c.slice('elc_session='.length).split('.');
  if (!data || !sig) return null;
  const expect = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  if (sig.length !== expect.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) return null;
  let p; try { p = JSON.parse(Buffer.from(data, 'base64url').toString()); } catch { return null; }
  if (!p.exp || p.exp < Date.now()) return null;
  return p;
}
export function sessionCookie(payload) {
  return `elc_session=${signSession(payload)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 86400}`;
}
export const clearCookie = 'elc_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';

// ---- short-lived signed download links ----
export function signedLink(fileId, ttlMin = 10) {
  const exp = Date.now() + ttlMin * 60000;
  const sig = crypto.createHmac('sha256', SECRET).update(`${fileId}.${exp}`).digest('base64url');
  return `/api/download?f=${encodeURIComponent(fileId)}&exp=${exp}&sig=${sig}`;
}
export function checkLink(f, exp, sig) {
  if (!f || !exp || !sig || Date.now() > Number(exp)) return false;
  const expect = crypto.createHmac('sha256', SECRET).update(`${f}.${exp}`).digest('base64url');
  return sig.length === expect.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect));
}

// ---- Patreon OAuth + membership check ----
const P = {
  authorize: 'https://www.patreon.com/oauth2/authorize',
  token: 'https://www.patreon.com/api/oauth2/token',
  identity: 'https://www.patreon.com/api/oauth2/v2/identity',
};

export function patreonAuthUrl(state) {
  const u = new URL(P.authorize);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', process.env.PATREON_CLIENT_ID);
  u.searchParams.set('redirect_uri', process.env.PATREON_REDIRECT_URI);
  // identity = who they are; identity.memberships = their membership to YOUR campaign
  u.searchParams.set('scope', 'identity identity.memberships');
  u.searchParams.set('state', state);
  return u.toString();
}

export async function exchangeCode(code) {
  const body = new URLSearchParams({
    code, grant_type: 'authorization_code',
    client_id: process.env.PATREON_CLIENT_ID,
    client_secret: process.env.PATREON_CLIENT_SECRET,
    redirect_uri: process.env.PATREON_REDIRECT_URI,
  });
  const r = await fetch(P.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!r.ok) throw new Error('token exchange failed');
  return r.json(); // { access_token, refresh_token, ... }
}

// Swap an expired/expiring access token for a fresh one using the stored refresh token.
// Returns the new token set (or throws). Patreon refresh tokens are long-lived.
export async function refreshToken(refresh_token) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token,
    client_id: process.env.PATREON_CLIENT_ID,
    client_secret: process.env.PATREON_CLIENT_SECRET,
  });
  const r = await fetch(P.token, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!r.ok) throw new Error('token refresh failed');
  return r.json(); // { access_token, refresh_token, expires_in, ... }
}

// Returns { status: 'paid' | 'trial' | 'none', name }
// 'paid'  = active member who has actually been charged at least once → full archive
// 'trial' = active member, not yet charged → current episode only
// 'none'  = not a member of your campaign
export async function checkMembership(accessToken) {
  const u = new URL(P.identity);
  // include each membership's campaign so we can pick OURS — /identity returns a
  // user's memberships across EVERY creator they support, not just this campaign.
  u.searchParams.set('include', 'memberships.campaign');
  u.searchParams.set('fields[member]', 'patron_status,last_charge_status,last_charge_date,currently_entitled_amount_cents');
  u.searchParams.set('fields[user]', 'full_name');
  const r = await fetch(u, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error('identity fetch failed');
  const j = await r.json();

  const name = j?.data?.attributes?.full_name || 'Member';
  const id = j?.data?.id || null;                 // stable Patreon user id → quota key
  const members = (j.included || []).filter(x => x.type === 'member');

  // Pick the membership that belongs to OUR campaign. Taking members[0] blindly can
  // grab a *different* creator's membership for anyone who also backs other creators,
  // and wrongly report "not a member" — this is what broke free-trial logins.
  const CAMPAIGN_ID = process.env.PATREON_CAMPAIGN_ID;
  const ours = CAMPAIGN_ID
    ? members.find((x) => x?.relationships?.campaign?.data?.id === CAMPAIGN_ID)
    : members[0]; // fallback until PATREON_CAMPAIGN_ID is set (see warning below)

  const m = ours?.attributes;
  if (!m || m.patron_status !== 'active_patron') {
    // Safe diagnostic (no tokens/PII): what memberships came back, so a failed login
    // is debuggable from Vercel logs — and reveals your campaign id the first time.
    console.warn('[checkMembership] no active membership for our campaign', {
      campaignIdSet: !!CAMPAIGN_ID,
      memberships: members.map((x) => ({
        campaign: x?.relationships?.campaign?.data?.id || null,
        status: x?.attributes?.patron_status || null,
      })),
    });
    return { status: 'none', name, id };
  }

  const charged = m.last_charge_status === 'Paid' && !!m.last_charge_date;
  const cents = Number(m.currently_entitled_amount_cents) || 0; // their current tier's price
  return { status: charged ? 'paid' : 'trial', name, cents, id };
}
