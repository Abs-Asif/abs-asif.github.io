const CACHE_NAME = 'book-editor-v1';
const FONT_CACHE_NAME = 'book-editor-fonts-v1';

const ASSETS = [
  '/book',
  '/medic',
  '/medic-data.json',
  '/manifest.webmanifest',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Font caching strategy: Cache First
  if (
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com' ||
    url.pathname.includes('/fonts/') ||
    request.destination === 'font' ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff')
  ) {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          return response || fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Default strategy: Cache with Network Fallback
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});
