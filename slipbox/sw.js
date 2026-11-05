// Slipbox offline worker. Your notes are in this browser's storage, not here: this only keeps the app's own files,
// so it opens without a connection. Network first (you always get the newest version online), kept copy when offline.
const CACHE = 'slipbox-1';
const SHELL = ['./', './index.html', './app.css?v=1', './app.js?v=1', './manifest.webmanifest', './icons/icon-192.png', './icons/apple-touch-icon.png', './icons/favicon-32.png',
  '/apps/vendor/fvl/css/fonts.css', '/apps/vendor/fvl/css/fvl.css',
  '/apps/vendor/fvl/fonts/inter-latin-opsz-normal.woff2', '/apps/vendor/fvl/fonts/inter-latin-ext-opsz-normal.woff2',
  '/apps/vendor/fvl/fonts/jetbrains-mono-latin-wght-normal.woff2'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('slipbox-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: u.pathname.endsWith('/') || u.pathname.endsWith('.html') }).then((hit) => hit || caches.match('./index.html'))));
});
