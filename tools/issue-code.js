#!/usr/bin/env node
// Issue/revoke fallback codes. KV_REST_API_URL=... KV_REST_API_TOKEN=... node tools/issue-code.js new fluency "name"
import crypto from 'crypto';
const [,,cmd,a1,a2]=process.argv, URL=process.env.KV_REST_API_URL, TOK=process.env.KV_REST_API_TOKEN;
if(!URL||!TOK){console.error('Set KV_REST_API_URL and KV_REST_API_TOKEN');process.exit(1);}
const kv=(p,o={})=>fetch(`${URL}/${p}`,{...o,headers:{Authorization:`Bearer ${TOK}`,...(o.headers||{})}}).then(r=>r.json());
const code=()=>`ELC-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
(async()=>{
  if(cmd==='new'){const c=code();await kv(`set/code:${c}`,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({tier:a1||'fluency',paid:true,member:a2||''})});console.log('\n  New code:',c,'\n');}
  else if(cmd==='revoke'){await kv(`del/code:${(a1||'').toUpperCase()}`,{method:'POST'});console.log('Revoked',a1);}
  else console.log('Usage: new <tier> "<member>"  |  revoke <CODE>');
})();
