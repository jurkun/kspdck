const CACHE_NAME = 'simkredit-v3';
const ASSETS = [
  '/kspdck/',
  '/kspdck/index.html',
  '/kspdck/manifest.json',
  '/kspdck/icon-192.png',
  '/kspdck/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network-first: selalu coba ambil versi terbaru dari server dulu,
  // baru fallback ke cache kalau offline.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (e.request.method === 'GET' && res.ok) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
