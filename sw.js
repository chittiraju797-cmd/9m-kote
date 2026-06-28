// AUTO VERSION — changes every deploy, forces update on all devices
const CACHE_VERSION = '1782625689';
const CACHE_NAME = 'kote9m-' + CACHE_VERSION;
const urlsToCache = [
  '/9m-kote/',
  '/9m-kote/index.html',
  '/9m-kote/manifest.json',
  '/9m-kote/icon-192.png',
  '/9m-kote/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Take control of all tabs immediately
});

self.addEventListener('fetch', e => {
  // Network first — always get latest, fall back to cache offline
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(e.request).then(cached => {
          return cached || caches.match('/9m-kote/index.html');
        });
      })
  );
});

// Notify all open tabs to reload when new version is ready
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
