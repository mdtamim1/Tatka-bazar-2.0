// Tatka Rider Service Worker (Offline Support & PWA Caching)
const CACHE_NAME = "tatka-rider-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/home",
  "/tasks",
  "/history",
  "/profile",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests or external APIs
  if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-First with Cache Fallback for HTML pages
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If HTML request failed and not in cache, fallback to home
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/home");
          }
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        });
      })
  );
});
