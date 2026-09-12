/* smartBack() against every arrival route.
 *
 * The stub models DOCUMENT ORDER, which the first version of this test did not: the back
 * link sits below <script src="/elc-nav.js"> in the markup, so while the page is still
 * parsing it is not queryable. A stub that always returns the link hid a bug where
 * smartBack() ran too early and found nothing. Here the link only appears once
 * DOMContentLoaded has fired, exactly as the browser behaves.
 */
function run(referrer, pathname) {
  const label = { textContent: 'Practice Arcade' };
  const link = { href: '/practice-arcade.html', querySelector: () => label };
  let parsed = false;
  const listeners = [];

  global.document = {
    referrer,
    get readyState() { return parsed ? 'complete' : 'loading'; },
    getElementById: () => null,
    querySelector: (sel) =>
      (sel === 'a.elcback[data-smart]' && parsed) ? link : null,
    addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') listeners.push(fn); }
  };
  global.location = { pathname, origin: 'https://englishleap.app', search: '' };
  global.window = global;
  global.addEventListener = () => {};
  global.URL = URL;
  global.ELCTheme = { mode: () => 'auto', set() {}, hide() {}, show() {} };

  new Function(require('fs').readFileSync('elc-nav.js', 'utf8'))();

  parsed = true;              // the rest of the document arrives
  listeners.forEach((f) => f());

  return (link.href + '  |  ' + label.textContent);
}

const P = 'https://englishleap.app';
const cases = [
  ['from the game-type page', P + '/arcade-type.html?type=phrase-pairs', '/arcade-type.html?type=phrase-pairs  |  Phrase Pairs'],
  ['from browse',             P + '/arcade-browse.html',                 '/arcade-browse.html  |  Browse the arcade'],
  ['from the arcade',         P + '/practice-arcade.html',               '/practice-arcade.html  |  Practice Arcade'],
  ['from Use It Live',        P + '/use-it-live.html',                   '/use-it-live.html  |  Use It Live'],
  ['from the marketing home', P + '/',                                   '/  |  Home'],
  ['a reload (self)',         P + '/progress.html',                      '/practice-arcade.html  |  Practice Arcade'],
  ['from off-site',           'https://patreon.com/x',                   '/practice-arcade.html  |  Practice Arcade'],
  ['no referrer at all',      '',                                        '/practice-arcade.html  |  Practice Arcade'],
  ['from inside a game',      P + '/games/phrase-pairs/',                '/games/phrase-pairs/  |  Phrase Pairs'],
  ['a game with a query',     P + '/games/story-unlock/?ep=ep280',       '/games/story-unlock/?ep=ep280  |  Story Unlock'],
  ['an unnamed page',         P + '/assets/whatever.html',               '/practice-arcade.html  |  Practice Arcade']
];

let bad = 0;
for (const [why, ref, want] of cases) {
  const got = run(ref, '/progress.html');
  const ok = got === want;
  if (!ok) bad++;
  console.log((ok ? 'ok   ' : 'FAIL ') + why.padEnd(26) + got + (ok ? '' : '   want: ' + want));
}
console.log(bad ? bad + ' FAILED' : 'all ' + cases.length + ' routes correct');
process.exit(bad ? 1 : 0);
