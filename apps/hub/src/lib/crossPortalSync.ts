// apps/hub/src/lib/crossPortalSync.ts
// Cross-portal event dispatcher using Redis Pub/Sub, Queue & Webhook bridge

import { publishEvent, enqueueJob, REDIS_CHANNELS, QUEUES } from "@tatka-bazar/redis";

export interface PortalSyncEvent {
  type:
    | "RIDER_SUSPENDED"
    | "RIDER_ACTIVATED"
    | "RIDER_KYC_APPROVED"
    | "RIDER_DEPOSIT_APPROVED"
    | "VENDOR_SUSPENDED"
    | "VENDOR_ACTIVATED"
    | "VENDOR_APPROVED"
    | "VENDOR_SETTLEMENT_PAID"
    | "DISPATCH_BROADCAST";
  targetId: string;
  targetType: "RIDER" | "VENDOR";
  payload: Record<string, any>;
  timestamp: string;
}

const RIDER_ENDPOINTS = [
  "http://localhost:3003/api/sync/events",
  "https://tatka-bazar-2-0-rider-seven.vercel.app/api/sync/events",
];

const VENDOR_ENDPOINTS = [
  "http://localhost:3006/api/sync/events",
  "https://tatka-bazar-2-0-vendor.vercel.app/api/sync/events",
];

const ADMIN_ENDPOINTS = [
  "https://tatka-bazar-2-0-admin.vercel.app/api/dispatch",
];

export async function broadcastToPortals(event: PortalSyncEvent): Promise<void> {
  // 1. Redis Pub/Sub Realtime Broadcast (Non-blocking)
  publishEvent(REDIS_CHANNELS.PORTAL_EVENTS, event.type, event).catch(() => {});

  // 2. Redis Durable Queue for Guaranteed Delivery with Retries
  enqueueJob(QUEUES.SYNC, event, { maxRetries: 3 }).catch(() => {});

  // 3. Direct HTTP Webhooks (Fire and forget)
  const baseTargets = event.targetType === "RIDER" ? RIDER_ENDPOINTS : VENDOR_ENDPOINTS;
  const targets = [...baseTargets, ...ADMIN_ENDPOINTS];

  targets.forEach(async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch {
      // Endpoint may be offline in local dev or unreachable, silently ignore
    }
  });
}
