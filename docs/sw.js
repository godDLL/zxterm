// Keeps the app's own files for offline start. Network first, so a new push shows at once.
// Music is not stored, and nothing else on this site is touched.
const SHELL = ['index.html', 'tracks.json', 'tracks-no_cover.jpg', 'manifest.webmanifest', 'icon-192.png']
  .map(f => new URL(f, self.location).href);
const CACHE = 'matador';

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  let url = e.request.url.split(/[?#]/)[0];
  if (url === new URL('./', self.location).href) url += 'index.html';
  if (e.request.method !== 'GET' || !SHELL.includes(url)) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(url, copy)); }
    return r;
  }).catch(async () => (await caches.match(url)) || Response.error()));
});
