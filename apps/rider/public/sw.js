// ============================================================
// Tatka Rider Service Worker — Production Grade
// ============================================================
// Cache versioning: injected at build time, falls back to timestamp
const BUILD_ID = self.__BUILD_ID || Date.now().toString();
const CACHE_NAME = `tatka-rider-v2-${BUILD_ID}`;
const OFFLINE_CACHE = `tatka-rider-offline-v2`;
const OFFLINE_URL = '/offline';

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  '/',
  '/home',
  '/tasks',
  '/history',
  '/profile',
  '/manifest.json',
  '/offline',
];

// ── INSTALL ────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Pre-cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch(() => {
          // Silently fail if some pages don't exist yet
        });
      }),
      // Cache offline fallback separately
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.addAll(['/offline']).catch(() => {});
      }),
    ])
  );
  // Activate immediately — don't wait for old SW to expire
  self.skipWaiting();
});

// ── ACTIVATE ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete old caches
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== OFFLINE_CACHE) {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
      }),
      // Take control of all open tabs immediately
      self.clients.claim(),
    ])
  );
});

// ── FETCH ──────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET or cross-origin API requests
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  // Skip WebSocket upgrade requests
  if (event.request.headers.get('upgrade') === 'websocket') return;

  // Skip external domains (map tiles are ok to cache)
  const isMapTile = url.hostname.includes('tile.openstreetmap.org');
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin && !isMapTile) return;

  // Map tiles — Cache First (they don't change)
  if (isMapTile) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }

  // HTML navigation — Network First with offline fallback
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          // Ultimate fallback — offline page
          const offline = await caches.match(OFFLINE_URL, { cacheName: OFFLINE_CACHE });
          return offline || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images) — Stale While Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const networkFetch = fetch(event.request).then((response) => {
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      }).catch(() => cached);

      return cached || networkFetch;
    })
  );
});

// ── PUSH NOTIFICATIONS ─────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = {
    title: 'Tatka Rider',
    body: 'নতুন আপডেট আছে।',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'tatka-rider-notification',
    data: { url: '/home' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || data.body,
        icon: payload.icon || data.icon,
        badge: data.badge,
        tag: payload.tag || data.tag,
        data: { url: payload.url || '/home', ...payload.data },
      };
    } catch {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: data.data,
      requireInteraction: data.data?.requireInteraction || false,
      vibrate: [200, 100, 200, 100, 200], // Attention vibration pattern
      actions: data.data?.actions || [],
      silent: false,
    })
  );
});

// ── NOTIFICATION CLICK ─────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/home';
  const action = event.action;

  // Handle action buttons
  if (action === 'accept') {
    const taskUrl = event.notification.data?.taskUrl || '/tasks';
    event.waitUntil(openOrFocusWindow(taskUrl));
    return;
  }
  if (action === 'dismiss') {
    return; // Just close the notification
  }

  event.waitUntil(openOrFocusWindow(targetUrl));
});

async function openOrFocusWindow(url) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

  // If app is already open, focus it and navigate
  for (const client of clients) {
    if (client.url.includes(self.location.origin)) {
      await client.focus();
      client.postMessage({ type: 'NAVIGATE', url });
      return;
    }
  }

  // Otherwise open a new window
  await self.clients.openWindow(url);
}

// ── BACKGROUND SYNC ────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'tatka-offline-queue') {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  // Open IndexedDB and process queued offline actions
  const db = await openOfflineDB();
  const actions = await getAllOfflineActions(db);

  for (const action of actions) {
    try {
      const response = await fetch(action.url, {
        method: action.method || 'POST',
        headers: { 'Content-Type': 'application/json', ...action.headers },
        body: JSON.stringify(action.body),
      });

      if (response.ok) {
        await deleteOfflineAction(db, action.id);
        // Notify the app
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((client) => {
          client.postMessage({ type: 'OFFLINE_SYNC_SUCCESS', action });
        });
      }
    } catch {
      // Will retry on next sync event
    }
  }
}

// Simple IndexedDB helpers
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('tatka-offline-queue', 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllOfflineActions(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('actions', 'readonly');
    const store = tx.objectStore('actions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function deleteOfflineAction(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('actions', 'readwrite');
    const store = tx.objectStore('actions');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ── MESSAGE HANDLER ────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: BUILD_ID, cacheName: CACHE_NAME });
  }
});
