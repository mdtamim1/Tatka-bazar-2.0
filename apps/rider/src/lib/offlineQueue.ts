/**
 * Tatka Rider — Offline Action Queue
 * Uses IndexedDB to store failed API calls when offline.
 * Service Worker's Background Sync will replay them when online.
 * Also provides a client-side fallback replay mechanism.
 */

export interface OfflineAction {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  tag: string; // e.g., "accept-order", "duty-status"
  createdAt: string;
  retryCount: number;
}

const DB_NAME = "tatka-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "actions";

// ── IndexedDB Setup ──────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("tag", "tag", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ── Queue an offline action ──────────────────────────────────
export async function queueOfflineAction(action: Omit<OfflineAction, "id" | "createdAt" | "retryCount">): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.add({
      ...action,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    // Register background sync if supported
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await (reg as any).sync.register("tatka-offline-queue");
      } catch {
        // Background sync not available, will use client-side replay
      }
    }
  } catch (err) {
    console.warn("[OfflineQueue] Failed to queue action:", err);
  }
}

// ── Get all pending actions ──────────────────────────────────
export async function getPendingActions(): Promise<OfflineAction[]> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return [];

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// ── Delete an action after success ──────────────────────────
export async function deleteAction(id: number): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
  } catch {}
}

// ── Client-side replay (when SW background sync unavailable) ─
export async function replayOfflineQueue(token: string | null): Promise<void> {
  const actions = await getPendingActions();
  if (actions.length === 0) return;

  console.log(`[OfflineQueue] Replaying ${actions.length} pending actions...`);

  for (const action of actions) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...action.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(action.url, {
        method: action.method,
        headers,
        ...(action.body !== null && action.body !== undefined
          ? { body: JSON.stringify(action.body) }
          : {}),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok && action.id) {
        await deleteAction(action.id);
        window.dispatchEvent(new CustomEvent("offline_action_replayed", {
          detail: { action }
        }));
      }
    } catch {
      // Will retry next time
    }
  }
}

// ── Wrap an API call with offline fallback ───────────────────
export async function fetchWithOfflineFallback(
  url: string,
  options: RequestInit & { tag: string },
  token: string | null
): Promise<Response | null> {
  const { tag, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(fetchOptions.headers as Record<string, string> || {}),
      },
      signal: AbortSignal.timeout(8000),
    });
    return response;
  } catch {
    // Network failed — queue for later
    await queueOfflineAction({
      url,
      method: (fetchOptions.method as string) || "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : null,
      tag,
    });

    // Dispatch event so UI can show "queued" feedback
    window.dispatchEvent(new CustomEvent("action_queued_offline", { detail: { tag } }));
    return null;
  }
}
