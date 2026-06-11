// PWA: the site stays installable (manifest + icons), but the service worker is
// DISABLED during active development to avoid stale-cache issues.
//
// This also actively tears down any service worker + caches a device may have
// already installed from an earlier build, so nobody gets served old files.
// To re-enable later, restore the registration call (sw.js is still in place).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
  if (self.caches && caches.keys) {
    caches.keys()
      .then((keys) => keys.forEach((k) => { if (k.startsWith('elc-')) caches.delete(k); }))
      .catch(() => {});
  }
}
