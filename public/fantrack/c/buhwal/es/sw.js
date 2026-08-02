// FanTrack (동해) 서비스워커 — 코드/API 응답은 네트워크 우선, 아이콘만 캐시 우선
const CACHE = 'fantrack-buhwal-es-v3';
const HEAVY_RE = /\.(svg|png)(\?|$)/;

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!url.pathname.startsWith('/fantrack/c/buhwal/es/')) return;

  if (HEAVY_RE.test(url.pathname)) {
    e.respondWith(
      caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; })))
    );
    return;
  }
  // 코드/HTML은 캐시에 넣지 않는다. 넣으면 배포 후에도 옛 페이지가 계속 뜬다(실제로 겪음).
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
