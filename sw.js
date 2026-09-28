// Offline: la app se sirve desde caché; promos.json se busca primero en la red para tomar actualizaciones.
const CACHE = "cqp-v1";
const SHELL = ["./", "index.html", "local-db.js", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png", "promos.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  const networkFirst = url.pathname.endsWith("promos.json") || url.pathname.endsWith("/") || url.pathname.endsWith("index.html");
  if (networkFirst) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
