// ToolHub service worker.
// Cache name is bumped on every release so old CSS/JS cannot survive a deploy.
const CACHE = "toolhub-2026-07-29-v57-10";

// Never cache these: the Skills shards total ~72 MB and would blow past the
// origin storage quota, and they are already versioned with ?v= plus long
// HTTP cache headers. API responses must stay live.
const BYPASS = [/^\/assets\/data\/skills\//, /^\/api\//, /^\/healthz$/];

self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (BYPASS.some(function (rx) { return rx.test(url.pathname); })) return;

  // HTML: network first, cached copy only as an offline fallback.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (r) {
      const copy = r.clone();
      caches.open(CACHE).then(function (ca) { ca.put(req, copy); });
      return r;
    }).catch(function () {
      return caches.match(req).then(function (m) { return m || caches.match("/index.html"); });
    }));
    return;
  }

  // Assets: stale-while-revalidate, so a deploy is picked up on the next visit
  // instead of being pinned forever by a cache-first hit.
  e.respondWith(caches.match(req).then(function (hit) {
    const network = fetch(req).then(function (r) {
      if (r && r.ok) {
        const copy = r.clone();
        caches.open(CACHE).then(function (ca) { ca.put(req, copy); });
      }
      return r;
    }).catch(function () { return hit; });
    return hit || network;
  }));
});
