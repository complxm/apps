// ScriptureBridge offline worker.
// Keeps the app and whatever you have read on this device, so it opens and reads without a connection.
// Only files from this site are cached: the NLT, read live from Tyndale's API, is never stored.
// Renamed with every release (it matches the ?v= in index.html), so kept copies always belong to the running version.
const CACHE = 'sbn-20261104d';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/apple-touch-icon.png',
  '/apps/vendor/fvl/css/fonts.css', '/apps/vendor/fvl/css/fvl.css', '/apps/vendor/fvl/ui/fvl-components.js',
  '/apps/vendor/gsap/gsap.min.js', '/apps/vendor/gsap/DrawSVGPlugin.min.js',
  '/apps/vendor/fvl/fonts/inter-latin-opsz-normal.woff2', '/apps/vendor/fvl/fonts/inter-latin-ext-opsz-normal.woff2', './icons/favicon-32.png',
  './fonts/newsreader-latin-opsz-normal.woff2', './fonts/newsreader-latin-ext-opsz-normal.woff2', './fonts/newsreader-latin-opsz-italic.woff2',
  './data/bible/books.json', '../scripturebridge/data/books_66.json', '../scripturebridge/data/prophecies_66_books.json', '../scripturebridge/data/canonical_threads.json',
  '../scripturebridge/data/appointed_times.json', '../scripturebridge/data/evidence.json', './data/review.json', '../scripturebridge/data/pl/prophecies.json', '../scripturebridge/data/pl/threads.json',
  '../scripturebridge/data/pl/appointed_times.json', '../scripturebridge/data/studies/index.json', '../scripturebridge/data/studies/verses.json', '../scripturebridge/data/maps.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
// Keep the previous release's copies too (only older ones are removed): if this release's copies are still
// incomplete when the connection drops, the app can still open from the last good set.
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => {
    const ours = ks.filter((k) => k.startsWith('sbn-') && k !== CACHE).sort();
    return Promise.all(ours.slice(0, -1).map((k) => caches.delete(k)));
  }).then(() => self.clients.claim()));
});
// A kept copy from this release, else from any earlier one.
const kept = (c, req) => c.match(req).then((hit) => hit || caches.match(req));

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
    const net = fetch(req).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return r; });
    e.respondWith(caches.match('./index.html').then((hit) => {
      if (!hit) return net.catch(() => caches.match('./'));
      return Promise.race([net.catch(() => hit), new Promise((res) => setTimeout(() => res(hit), 2500))]);
    }));
    return;
  }
  // Bible text, original words, people and places, dictionary, fonts and vendor code rarely change:
  // the kept copy at once, refreshed in the background.
  const stable = /\/data\/(bible|orig|who|person|place|lex|occ)\/|\/vendor\//.test(url.pathname);
  if (stable) {
    e.respondWith(caches.open(CACHE).then(async (c) => {
      const hit = await kept(c, req);
      const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit || Promise.reject(new Error('offline')));
      return hit || net;
    }));
    return;
  }
  // The app's own code and data: the newest copy when the network answers within 2.5 s, else the kept copy
  // (the fetch carries on and refreshes it). Kept copies are from this release, since the cache is renamed with each.
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; });
    const hit = await kept(c, req);
    if (!hit) return net;
    const slow = new Promise((res) => setTimeout(() => res(hit), 2500));
    return Promise.race([net.catch(() => hit), slow]);
  }));
});
