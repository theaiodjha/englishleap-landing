// /api/download — validates the short-lived signed link from /api/list, then serves the private file.
import { checkLink } from '../lib/session.js';

function resolve(fileId) {
  try { return JSON.parse(process.env.BLOB_MAP || '{}')[fileId] || null; } catch { return null; }
}

export default async function handler(req, res) {
  const { f, exp, sig } = req.query;
  if (!checkLink(f, exp, sig)) return res.status(403).send('Invalid or expired link. Reopen the archive for a fresh one.');
  const target = resolve(f);
  if (!target) return res.status(404).send('Not found');
  res.setHeader('Cache-Control', 'private, no-store');
  // Stricter option: fetch(target) and stream the bytes so the storage URL is never exposed.
  return res.redirect(302, target);
}
