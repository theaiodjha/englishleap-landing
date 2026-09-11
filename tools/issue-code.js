#!/usr/bin/env node
// Issue/revoke fallback member codes (gifts/comps, non-Patreon joins, owner testing).
//
//   KV_REST_API_URL=... KV_REST_API_TOKEN=... node tools/issue-code.js new fluency "name"
//   node tools/issue-code.js revoke ELC-A1B2-C3D4
//
// A redeemed code signs a session with uid `c:<CODE>` (see api/unlock.js), so the
// printed c:… line is exactly what UIL_PREVIEW_UIDS wants for an owner preview.
import crypto from 'crypto';
const [,,cmd,a1,a2]=process.argv, URL=process.env.KV_REST_API_URL, TOK=process.env.KV_REST_API_TOKEN;
if(!URL||!TOK){console.error('Set KV_REST_API_URL and KV_REST_API_TOKEN');process.exit(1);}
const TIERS=['fluency','transcript'];
const kv=(p,o={})=>fetch(`${URL}/${p}`,{...o,headers:{Authorization:`Bearer ${TOK}`,...(o.headers||{})}}).then(async r=>{
  if(!r.ok) throw new Error(`kv ${r.status}: ${(await r.text()).slice(0,200)}`);
  return r.json();
});
const code=()=>`ELC-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
const usage='Usage: new [fluency|transcript] "<member>"  |  revoke <CODE>';
(async()=>{
  if(cmd==='new'){
    const tier=a1||'fluency';
    if(!TIERS.includes(tier)){console.error(`Unknown tier "${tier}". Use one of: ${TIERS.join(', ')}`);process.exit(1);}
    const c=code();
    // A silent write failure used to print a code that could never be redeemed.
    await kv(`set/code:${c}`,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({tier,paid:true,member:a2||''})});
    console.log(`\n  New code:  ${c}   (${tier}${a2?` · ${a2}`:''})`);
    console.log(`  Redeem at: /practice-arcade.html  or  /archive.html`);
    console.log(`\n  UIL_PREVIEW_UIDS value for this code:\n\n      c:${c}\n`);
  }
  else if(cmd==='revoke'){
    const c=(a1||'').trim().toUpperCase();
    if(!c){console.error(usage);process.exit(1);}
    const existed=await kv(`del/code:${encodeURIComponent(c)}`,{method:'POST'});
    console.log(Number(existed?.result)?`Revoked ${c}`:`${c} was not found (nothing to revoke)`);
  }
  else console.log(usage);
})().catch(e=>{console.error(String(e.message||e));process.exit(1);});
