// =============================================================================
// Tatka Bazar Vendor Portal — Cross-App Synchronization Utility
// Broadcasts and listens to tatka_sync_event across vendor, rider, and storefront
// =============================================================================

export interface SyncPayload {
  type:
    | "NEW_ORDER"
    | "ADMIN_DISPATCH_TO_ZONE"
    | "VENDOR_CLAIM_ORDER"
    | "ORDER_CLAIMED_BY_ANOTHER"
    | "ORDER_READY_FOR_PICKUP"
    | "RIDER_PICKED_UP"
    | "RIDER_DELIVERED"
    | "ORDER_RETURNED"
    | "PAYOUT_APPROVED"
    | "PAYOUT_REJECTED"
    | "RIDER_ASSIGNED"
    | "ORDER_CANCELLED"
    | "STOCK_ALERT";
  amount?: number;
  orderId?: string;
  claimedByVendorId?: string;
  claimedByStoreName?: string;
  deliveryZone?: string;
  riderName?: string;
  riderPhone?: string;
  message?: string;
  timestamp?: string;
}

const EVENT_NAME = "tatka_sync_event";
const STORAGE_KEY = "tatka_sync_broadcast";
const BROADCAST_CHANNEL_NAME = "tatka_realtime_sync_channel";

let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!broadcastChannel && typeof window.BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch {}
  }
  return broadcastChannel;
}

/**
 * Broadcast an event to other tabs / portals
 */
export function broadcastSyncEvent(payload: SyncPayload) {
  if (typeof window === "undefined") return;
  const enriched: SyncPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  // 1. BroadcastChannel
  const ch = getBroadcastChannel();
  if (ch) {
    try {
      ch.postMessage(enriched);
    } catch {}
  }

  // 2. LocalStorage Event Bus
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

  const handleChannelMessage = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      callback(e.data);
    }
  };

  const ch = getBroadcastChannel();
  if (ch) {
    ch.addEventListener("message", handleChannelMessage);
  }

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    if (ch) {
      ch.removeEventListener("message", handleChannelMessage);
    }
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
