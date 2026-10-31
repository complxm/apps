// ScriptureBridge offline worker.
// Keeps the app and whatever you have read on this device, so it opens and reads without a connection.
// Only files from this site are cached: the NLT, read live from Tyndale's API, is never stored.
const CACHE = 'sb-v4';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/apple-touch-icon.png',
  '/apps/vendor/fvl/css/fonts.css', '/apps/vendor/fvl/css/fvl.css', '/apps/vendor/fvl/ui/fvl-components.js',
  '/apps/vendor/fvl/atmosphere/fvl-atmosphere.js', '/apps/vendor/gsap/gsap.min.js', '/apps/vendor/gsap/DrawSVGPlugin.min.js',
  '/apps/vendor/fvl/fonts/inter-latin-opsz-normal.woff2', '/apps/vendor/fvl/fonts/inter-latin-ext-opsz-normal.woff2', '/apps/vendor/fvl/brand/favicon.svg',
  './data/bible/books.json', './data/books_66.json', './data/prophecies_66_books.json', './data/canonical_threads.json',
  './data/appointed_times.json', './data/evidence.json', './data/review.json', './data/pl/prophecies.json', './data/pl/threads.json',
  './data/pl/appointed_times.json', './data/studies/index.json', './data/studies/verses.json', './data/maps.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('sb-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// The page can ask for files to be kept ahead of time (the passages of every bridge, the studies).
self.addEventListener('message', (e) => {
  const urls = e.data && e.data.warm;
  if (!Array.isArray(urls)) return;
  e.waitUntil(caches.open(CACHE).then(async (c) => {
    for (const u of urls) { if (!(await c.match(u))) await c.add(u).catch(() => {}); }
  }));
});

self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // never the NLT or any other site
  // The page itself: the newest when online (so updates arrive), the kept copy when not.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return r; })
      .catch(() => caches.match('./index.html').then((r) => r || caches.match('./'))));
    return;
  }
  // Bible text, original words, people and places, dictionary, fonts and vendor code rarely change:
  // the kept copy at once, refreshed in the background.
  const stable = /\/data\/(bible|orig|who|person|place|lex|occ)\/|\/vendor\//.test(url.pathname);
  if (stable) {
    e.respondWith(caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit || Promise.reject(new Error('offline')));
      return hit || net;
    }));
    return;
  }
  // The app's own code and data (bridges, threads, studies) change with each update: the newest when online,
  // the kept copy only when offline, so a change is never a load behind.
  e.respondWith(caches.open(CACHE).then((c) => fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; })
    .catch(() => c.match(req).then((hit) => hit || Promise.reject(new Error('offline'))))));
});
