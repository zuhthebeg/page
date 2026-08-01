// FanTrack (동해) 서비스워커 — 코드/API 응답은 네트워크 우선, 아이콘만 캐시 우선
const CACHE = 'fantrack-superjunior-v1';
const HEAVY_RE = /\.(svg|png)(\?|$)/;

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!url.pathname.startsWith('/fantrack/c/superjunior/')) return;

  if (HEAVY_RE.test(url.pathname)) {
    e.respondWith(
      caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; })))
    );
    return;
  }
  e.respondWith(
    fetch(req).then(res => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return res; })
       .catch(() => caches.match(req))
  );
});
