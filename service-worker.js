// Service worker: يجلب النسخة الجديدة من الموقع أولاً، ولا يعتمد على الكاش إلا عند انقطاع الإنترنت.
const CACHE = 'cashier-ledger-v2';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase والخطوط وغيرها تُجلب مباشرة

  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(function (res) {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (r) { return r || caches.match('index.html'); });
      })
  );
});
