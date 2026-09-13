// node tools/test-support.mjs — the help form's server route.
//
// The properties worth protecting:
//   * the support mailbox NEVER reaches the visitor — not in a success, not in an error,
//     not when the mail provider fails with a message that names it;
//   * every piece of visitor input is escaped before it lands in the email's HTML;
//   * the honeypot, the size/type limits and the rate limit do what they claim, and a KV
//     outage lets a report through rather than blocking it.

const MAILBOX = 'secret-support-box@englishleap.app';
process.env.KV_REST_API_URL = 'https://kv.example.invalid';
process.env.KV_REST_API_TOKEN = 'kv';
process.env.RESEND_API_KEY = 're_test';
process.env.SUPPORT_TO = MAILBOX;
process.env.SUPPORT_FROM = 'English Leap <noreply@englishleap.app>';

const mod = await import('../api/support.js');
const { default: handler, validate, composeEmail, LIMITS } = mod;

let bad = 0;
const ok = (label, cond, extra = '') => {
  if (!cond) bad++;
  console.log((cond ? 'ok   ' : 'FAIL ') + label + (extra ? '  ' + extra : ''));
};

const good = {
  category: 'game',
  message: 'The Phrase Pairs board froze after the third match.',
  email: 'learner@example.com',
  name: 'Ana',
  page: '/games/phrase-pairs/?ep=ep278',
  files: [],
};
const PNG = Buffer.from('fake-png-bytes-for-a-test').toString('base64');

// ------------------------------------------------------------------ validation
ok('a complete report passes', validate(good).ok === true);
ok('an unknown category is refused', validate({ ...good, category: 'nope' }).field === 'category');
ok('a one-word message is refused', validate({ ...good, message: 'broken' }).field === 'message');
ok('a message over the limit is refused',
  validate({ ...good, message: 'x'.repeat(LIMITS.messageMax + 1) }).field === 'message');
ok('no email means no way to reply, so it is refused', validate({ ...good, email: '' }).field === 'email');
ok('a malformed email is refused', validate({ ...good, email: 'ana@' }).field === 'email');
ok('more than three screenshots is refused',
  validate({ ...good, files: Array(4).fill({ type: 'image/png', data: PNG }) }).field === 'files');
ok('a non-image attachment is refused',
  validate({ ...good, files: [{ type: 'application/pdf', data: PNG }] }).field === 'files');
ok('an oversized screenshot is refused',
  validate({ ...good, files: [{ type: 'image/png', data: 'A'.repeat(Math.ceil(LIMITS.fileBytes * 4 / 3) + 8) }] }).field === 'files');
ok('non-base64 data is refused',
  validate({ ...good, files: [{ type: 'image/png', data: '<script>' }] }).field === 'files');
const withShot = validate({ ...good, files: [{ type: 'image/png', data: PNG }] });
ok('a valid screenshot becomes a named attachment',
  withShot.ok && withShot.clean.attachments[0].filename === 'screenshot-1.png');

// ------------------------------------------------------------------ escaping
const hostile = validate({
  ...good,
  message: '<img src=x onerror=alert(1)> please help',
  name: '"><script>steal()</script>',
}).clean;
const mail = composeEmail(hostile, { member: null, userAgent: '<b>ua</b>' });
ok('a message cannot inject markup into the email', !/<img/i.test(mail.html) && /&lt;img/.test(mail.html));
ok('a name cannot inject markup either', !/<script>/i.test(mail.html));
ok('nor can the user agent', !/<b>ua<\/b>/.test(mail.html));
ok('the subject names the topic', /^\[Help\] A game isn't working:/.test(mail.subject), mail.subject);
ok('a signed-out sender is labelled as such', /Not signed in/.test(mail.text));
const memberMail = composeEmail(validate(good).clean, { member: { name: 'Ana', plan: 'fluency', uid: 'p:42' } });
ok('a signed-in sender is identified by plan and uid', /fluency, p:42/.test(memberMail.text));

// ------------------------------------------------------------------ the route
function reqRes(body, { method = 'POST', ip = '203.0.113.9' } = {}) {
  const out = { status: 200, body: null, headers: {} };
  const res = {
    setHeader: (k, v) => { out.headers[k.toLowerCase()] = v; },
    status(c) { out.status = c; return res; },
    json(b) { out.body = b; return res; },
  };
  const req = { method, body, headers: { 'x-forwarded-for': ip, 'user-agent': 'test', cookie: '' } };
  return { req, res, out };
}

// intercept everything the route sends out
let sent = [];
let kvCount = 0;
let resendReply = { ok: true, status: 200, text: async () => '{}' };
globalThis.fetch = async (url, opts) => {
  if (String(url).includes('kv.example.invalid')) {
    kvCount++;
    return { ok: true, json: async () => [{ result: kvCount }, { result: 1 }] };
  }
  sent.push({ url, body: JSON.parse(opts.body) });
  return resendReply;
};

let t = reqRes(good);
await handler(t.req, t.res);
ok('a good report is accepted', t.out.status === 200 && t.out.body.ok === true);
ok('...and actually sent', sent.length === 1);
ok('...to the mailbox, server-side', sent[0].body.to.includes(MAILBOX));
ok('...from the no-reply sender', /noreply@/.test(sent[0].body.from));
ok('...with Reply-To set to the visitor, so a reply reaches them directly',
  sent[0].body.reply_to === good.email);
ok('the response to the visitor does not contain the mailbox',
  !JSON.stringify(t.out.body).includes(MAILBOX));
ok('the response is never cached', t.out.headers['cache-control'] === 'no-store');

// the provider fails with a body that names the mailbox — it must not be forwarded
sent = [];
resendReply = { ok: false, status: 422, text: async () => `invalid recipient ${MAILBOX}` };
t = reqRes(good, { ip: '198.51.100.7' });
await handler(t.req, t.res);
ok('a provider failure is reported as a failure', t.out.status === 502 && t.out.body.ok === false);
ok('...WITHOUT passing on the provider message that names the mailbox',
  !JSON.stringify(t.out.body).includes(MAILBOX), t.out.body.error);
resendReply = { ok: true, status: 200, text: async () => '{}' };

// honeypot
sent = [];
t = reqRes({ ...good, website: 'http://spam.example' });
await handler(t.req, t.res);
ok('a filled honeypot is told it worked', t.out.status === 200 && t.out.body.ok === true);
ok('...but nothing is mailed', sent.length === 0);

// validation errors come back as a field + message, and nothing is sent
sent = [];
t = reqRes({ ...good, email: 'nope' });
await handler(t.req, t.res);
ok('a bad field is named in the response', t.out.status === 400 && t.out.body.field === 'email');
ok('...and nothing is mailed', sent.length === 0);

// only POST
t = reqRes(good, { method: 'GET' });
await handler(t.req, t.res);
ok('GET is refused', t.out.status === 405);

// rate limit: the sixth send from one IP in the window is held back
kvCount = 0; sent = [];
for (let i = 0; i < 5; i++) { t = reqRes(good, { ip: '192.0.2.50' }); await handler(t.req, t.res); }
ok('five sends in an hour are allowed', sent.length === 5);
t = reqRes(good, { ip: '192.0.2.50' });
await handler(t.req, t.res);
ok('the sixth is held back', t.out.status === 429 && sent.length === 5);

// KV down: fail OPEN — a member reporting a problem must not be blocked by our outage
globalThis.fetch = async (url, opts) => {
  if (String(url).includes('kv.example.invalid')) throw new Error('kv down');
  sent.push({ url, body: JSON.parse(opts.body) });
  return { ok: true, status: 200, text: async () => '{}' };
};
sent = [];
t = reqRes(good, { ip: '192.0.2.99' });
await handler(t.req, t.res);
ok('with KV down, the report still goes through', t.out.status === 200 && sent.length === 1);

// not configured: a clear message, and still no mailbox
delete process.env.RESEND_API_KEY;
t = reqRes(good);
await handler(t.req, t.res);
ok('unconfigured, the form says so plainly', t.out.status === 503 && /not switched on/.test(t.out.body.error));

console.log(bad ? `\n${bad} FAILED` : '\nall assertions passed');
process.exit(bad ? 1 : 0);
