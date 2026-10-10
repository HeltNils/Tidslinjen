const CACHE_NAME = 'tidslinjen-static-v38';
const APP_SHELL = [
  './',
  './index.html',
  './matchmaking.html',
  './matchmaking.css',
  './matchmaking.js',
  './duel-rules.mjs',
  './card-suggestion.html',
  './card-suggestion.css',
  './card-suggestion.js',
  './card-suggestions-review.html',
  './card-suggestions-review.css',
  './card-suggestions-review.js',
  './styles.css',
  './height-backgrounds.css',
  './account.css',
  './archive-theme.css',
  './journey.css',
  './journey.js',
  './layout.js',
  './layout.css',
  './assets/journey/rustic.png',
  './assets/journey/earth.png',
  './assets/journey/land.png',
  './assets/journey/ocean.png',
  './assets/journey/space.png',
  './assets/journey/civilization.png',
  './assets/events/tananger-ungdomsskole.png',
  './events.js',
  './learning.js',
  './achievements.js',
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
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api/')) return;
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
