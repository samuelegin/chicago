// ─── bump this string on every deploy to force cache invalidation ────────────
const CACHE_VERSION = 'v' + Date.now(); // auto-busts on every SW file change
const CACHE_NAME = 'chicago-social-' + CACHE_VERSION;

// Only pre-cache truly static assets that never change filename
const PRECACHE_ASSETS = [
  // Do not pre-cache the root HTML ('/') to avoid serving a stale index
  // during development or immediately after deploys. Keep static assets.
  '/manifest.json',
  '/logo.jpg',
];

// ─── Install: pre-cache shell assets only ────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // activate immediately, don't wait for old tabs to close
  );
});

// ─── Activate: delete ALL old caches immediately ─────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim()) // take control of all open tabs immediately
  );
});

// ─── Fetch strategy ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET and non-http(s) requests (chrome-extension://, etc.)
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);

  // ── Vite hashed assets (JS/CSS with content hash in filename) ──
  // These are safe to cache aggressively because the hash changes on rebuild.
  // Pattern: /assets/index-AbCdEfGh.js  or  /assets/index-AbCdEfGh.css
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }

  // ── HTML navigation requests — always network-first ──
  // This is the key fix: index.html must ALWAYS come from the network
  // so the latest hashed asset filenames are picked up after a deploy.
  if (request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Update the cache with the fresh HTML
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match('/')) // offline fallback
    );
    return;
  }

  // ── Everything else — network-first, cache as fallback ──
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
