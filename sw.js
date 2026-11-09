/* Orii offline support. Change VERSION whenever the app files change so phones pick up the update. */
const VERSION = 'orii-v2';
const SHELL = [
  './',
  './index.html',
  './app.js',
  './compliments.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
  './favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'orii-fonts').map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* App files: answer from the cache right away, refresh the cache in the background. */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(VERSION).then(cache =>
        cache.match(req, { ignoreSearch: true }).then(hit => {
          const fresh = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
          return hit || fresh;
        })
      )
    );
    return;
  }

  /* Google Fonts: keep a copy so the lettering still shows offline. */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open('orii-fonts').then(cache =>
        cache.match(req).then(hit => hit || fetch(req).then(res => { cache.put(req, res.clone()); return res; }))
      )
    );
  }
});
