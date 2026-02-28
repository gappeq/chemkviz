const CACHE = 'chemkviz-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Cormorant+Garamond:wght@400;700&family=DM+Serif+Display:ital@0;1&family=Bebas+Neue&family=Nunito:wght@400;700;900&family=Playfair+Display:ital,wght@1,700&family=VT323&family=Outfit:wght@300;400;700&display=swap',
];

self.addEventListener('message', e => {
  if (e.data && e.data.action === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache local assets reliably, fonts best-effort
      return cache.addAll(['./index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'])
        .then(() => cache.add('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Cormorant+Garamond:wght@400;700&family=DM+Serif+Display:ital@0;1&family=Bebas+Neue&family=Nunito:wght@400;700;900&family=Playfair+Display:ital,wght@1,700&family=VT323&family=Outfit:wght@300;400;700&display=swap').catch(() => {}));
    })
  );
  // skipWaiting is triggered by user via message
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
