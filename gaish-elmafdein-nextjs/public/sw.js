self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  clients.claim();
});

// Simple fetch pass-through (placeholder for future caching)
self.addEventListener('fetch', () => {});
