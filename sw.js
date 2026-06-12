const CACHE_NAME = 'harambes-dozen-v5';
const DATA_CACHE_PREFIX = 'hd-data'; // app-managed data cache — never delete here
const ASSETS = ['./', 'index.html', 'manifest.json', 'harambe-logo.png'];

// Origins whose responses must stay FRESH (live league data) — network first.
// Cache-first here silently froze contract-sheet edits and dynasty values
// for every installed user until CACHE_NAME was bumped.
const FRESH_ORIGINS = ['api.fantasycalc.com', 'docs.google.com'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && !k.startsWith(DATA_CACHE_PREFIX)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function networkFirst(req) {
  return fetch(req).then(res => {
    if (res.ok) {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
    }
    return res;
  }).catch(() => caches.match(req));
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Live data (Sleeper, FantasyCalc, contracts sheet): network first,
  // cached copy only as an offline fallback
  if (url.hostname === 'api.sleeper.app' || FRESH_ORIGINS.some(o => url.hostname.endsWith(o))) {
    e.respondWith(networkFirst(req));
    return;
  }

  // HTML: network first, fall back to cache
  if (req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(networkFirst(req));
    return;
  }

  // Static assets: cache first, but never cache error responses
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
      }
      return res;
    }))
  );
});
