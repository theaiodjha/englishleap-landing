// /api/unlock — fallback path: redeem a member code (for gifts/comps or non-Patreon joins).
// Sets the same session shape as OAuth, with access:'paid' (no Patreon token → never re-checked).
import { sessionCookie } from '../lib/session.js';
const KV_URL=process.env.KV_REST_API_URL, KV_TOKEN=process.env.KV_REST_API_TOKEN;
async function kvGet(key){
  const r=await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`,{headers:{Authorization:`Bearer ${KV_TOKEN}`}});
  if(!r.ok) return null; const j=await r.json(); return j.result??null;
}
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({ok:false});
  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const code=(body.code||'').trim().toUpperCase();
  if(!code) return res.status(400).json({ok:false,error:'Please enter your code.'});
  const raw=await kvGet(`code:${code}`);
  if(!raw) return res.status(401).json({ok:false,error:'That code is not valid (or was turned off).'});
  const rec=typeof raw==='string'?JSON.parse(raw):raw;
  if(!rec.paid) return res.status(403).json({ok:false,error:'Your archive opens after your first payment.'});
  res.setHeader('Set-Cookie', sessionCookie({name:rec.member||'Member', tier:rec.tier||'fluency', access:'paid', exp:Date.now()+30*864e5}));
  return res.json({ok:true});
}
