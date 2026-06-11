// English Leap Club — service worker.
// App-shell caching for an installable, fast, offline-tolerant PWA.
// SECURITY: gated content lives behind /api/* and is NEVER cached.
const CACHE = 'elc-shell-v1';
const SHELL = [
  '/', '/index.html', '/practice-arcade.html', '/archive.html',
  '/games/clue-room/', '/games/clue-room/index.html',
  '/theme.css', '/theme.js', '/pwa.js', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never touch gated/auth endpoints — always go to network, never cache.
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) return;

  // Page navigations: network-first, fall back to cache, then to the home shell.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r; })
        .catch(() => caches.match(req).then((m) => m || caches.match('/')))
    );
    return;
  }

  // Same-origin static assets: cache-first, then runtime-cache.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(req).then((m) => m || fetch(req).then((r) => {
        const cp = r.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); return r;
      }).catch(() => m))
    );
  }
});
