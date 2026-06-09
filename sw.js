// 서비스워커 - 오프라인 캐싱 (모든 파일 같은 디렉토리)
const CACHE_NAME = 'naui-mirae-v4';
const CACHE_FILES = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './byeolun.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CACHE_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) =>
    Promise.all(ks.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((r) => {
      if (r && r.status === 200 && r.type === 'basic') {
        const c = r.clone();
        caches.open(CACHE_NAME).then((cc) => cc.put(e.request, c));
      }
      return r;
    }).catch(() => caches.match(e.request).then((c) => c || caches.match('./index.html')))
  );
});
