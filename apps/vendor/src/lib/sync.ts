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
 * Dispatches a ready-for-pickup order to Rider portals across Vercel cloud and local environments
 */
export async function dispatchOrderToRiders(orderPayload: any) {
  if (typeof window === "undefined") return;

  const endpoints = [
    // 1. Production Rider endpoint on Vercel
    "https://tatka-bazar-2-0-rider-seven.vercel.app/api/dispatch",
    // 2. Current app dispatch route (Vercel serverless / local)
    "/api/dispatch",
    // 3. Local Rider dev server
    "http://localhost:3003/api/dispatch",
    // 4. Local Fastify API dev server
    "http://localhost:4000/api/dispatch/ready-for-pickup",
  ];

  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")) {
    endpoints.unshift(`${process.env.NEXT_PUBLIC_API_URL}/api/dispatch/ready-for-pickup`);
  }

  const postPromises = endpoints.map(async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "READY_FOR_PICKUP", task: orderPayload }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  });

  await Promise.allSettled(postPromises);
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
