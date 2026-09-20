const CACHE_NAME = 'tidslinjen-static-v13';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './height-backgrounds.css',
  './account.css',
  './archive-theme.css',
  './journey.css',
  './journey.js',
  './assets/journey/rustic.png',
  './assets/journey/earth.png',
  './assets/journey/land.png',
  './assets/journey/ocean.png',
  './assets/journey/space.png',
  './assets/journey/civilization.png',
  './events.js',
  './learning.js',
  './background.js',
  './game.js',
  './account.js',
  './username-policy.js',
  './pwa.js',
  './manifest.webmanifest',
  './supabase-config.js?v=2',
  './app-icon.svg',
  './dog-car.jpg',
  './nils-hybrid.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(response => response || caches.match('./index.html')))
  );
});
