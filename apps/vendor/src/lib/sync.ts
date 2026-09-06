// =============================================================================
// Tatka Bazar Vendor Portal — Cross-App Synchronization Utility
// Broadcasts and listens to tatka_sync_event across vendor, rider, and storefront
// =============================================================================

export interface SyncPayload {
  type:
    | "NEW_ORDER"
    | "PAYOUT_APPROVED"
    | "PAYOUT_REJECTED"
    | "RIDER_ASSIGNED"
    | "ORDER_CANCELLED"
    | "STOCK_ALERT";
  amount?: number;
  orderId?: string;
  riderName?: string;
  riderPhone?: string;
  message?: string;
  timestamp?: string;
}

const EVENT_NAME = "tatka_sync_event";
const STORAGE_KEY = "tatka_sync_broadcast";

/**
 * Broadcast an event to other tabs / portals
 */
export function broadcastSyncEvent(payload: SyncPayload) {
  if (typeof window === "undefined") return;
  const enriched: SyncPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: enriched }));
  } catch (err) {
    console.warn("Broadcast sync error:", err);
  }
}

/**
 * Subscribe to cross-app synchronization events
 */
export function subscribeSyncEvent(callback: (payload: SyncPayload) => void) {
  if (typeof window === "undefined") return () => {};

  const handleCustomEvent = (e: any) => {
    if (e.detail) callback(e.detail);
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch {}
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
