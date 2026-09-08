// Tatka Real-Time Cross-App Sync Engine (BroadcastChannel + LocalStorage Event Bus)

export type SyncEventType =
  | "DEPOSIT_APPROVED"
  | "DEPOSIT_REJECTED"
  | "CANCELLATION_APPROVED"
  | "TASK_STATUS_CHANGED"
  | "DUTY_STATUS_CHANGED"
  | "SOS_ALERT";

export interface SyncPayload {
  type: SyncEventType;
  riderId?: string | undefined;
  depositId?: string | undefined;
  taskId?: string | undefined;
  amount?: number | undefined;
  message?: string | undefined;
  timestamp: string;
}

// Rider-specific channel name to avoid collision with Vendor portal's BroadcastChannel
const CHANNEL_NAME = "tatka_rider_realtime_sync_channel";
const STORAGE_SYNC_KEY = "tatka_sync_bus_event";

let broadcastChannel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (!broadcastChannel && typeof window.BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {}
  }
  return broadcastChannel;
}

/**
 * Emits a real-time sync event across all browser tabs and apps (Rider & Admin)
 */
export function emitSyncEvent(payload: Omit<SyncPayload, "timestamp">): void {
  const fullPayload: SyncPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  // 1. BroadcastChannel (modern inter-tab)
  const channel = getChannel();
  if (channel) {
    try {
      channel.postMessage(fullPayload);
    } catch {}
  }

  // 2. LocalStorage event bus (cross-tab fallback)
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_SYNC_KEY, JSON.stringify(fullPayload));
      // In same tab, dispatch custom event
      window.dispatchEvent(new CustomEvent("tatka_realtime_event", { detail: fullPayload }));
    } catch {}
  }
}

/**
 * Subscribes to real-time sync events
 */
export function subscribeSyncEvent(
  handler: (payload: SyncPayload) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleMessage = (event: MessageEvent) => {
    if (event.data && event.data.type) {
      handler(event.data);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_SYNC_KEY && e.newValue) {
      try {
        const payload: SyncPayload = JSON.parse(e.newValue);
        handler(payload);
      } catch {}
    }
  };

  const handleCustom = (e: any) => {
    if (e.detail) {
      handler(e.detail);
    }
  };

  const channel = getChannel();
  if (channel) {
    channel.addEventListener("message", handleMessage);
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener("tatka_realtime_event", handleCustom);

  return () => {
    if (channel) {
      channel.removeEventListener("message", handleMessage);
    }
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("tatka_realtime_event", handleCustom);
  };
}
