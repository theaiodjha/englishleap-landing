// /api/auth/signout — clear the session on this device.
import { clearCookie } from '../../lib/session.js';
export default function handler(req, res) {
  res.setHeader('Set-Cookie', clearCookie);
  return res.json({ ok: true });
}
