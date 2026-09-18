import { EventEmitter } from "events";
import {
  publishEvent,
  subscribeEvents,
  REDIS_CHANNELS,
} from "@tatka-bazar/redis";

// ============================================================
// Tatka Bazar — Distributed Real-Time Event Bus
// Transparent multi-instance horizontal scaling via Redis Pub/Sub
// ============================================================

export type EventType =
  | "ORDER_CREATED"
  | "READY_FOR_PICKUP"
  | "TASK_CLAIMED"
  | "LOCATION_UPDATE"
  | "ORDER_DELIVERED"
  | "SYSTEM_ALERT"
  | "HEARTBEAT";

export interface LiveEventPayload<T = any> {
  id: string;
  type: EventType;
  timestamp: string;
  data: T;
}

// Unique instance identifier to prevent echo loops across cluster nodes
const NODE_ID = `api-${process.pid}-${Math.random().toString(36).slice(2, 7)}`;

class LiveEventBus extends EventEmitter {
  public readonly nodeId = NODE_ID;

  constructor() {
    super();
    // High-concurrency listener support for thousands of SSE / WebSocket connections
    this.setMaxListeners(10000);
    this.initRedisPubSubBridge();
  }

  /**
   * Initializes Redis Pub/Sub subscription for horizontal clustering
   */
  private initRedisPubSubBridge() {
    try {
      subscribeEvents(REDIS_CHANNELS.PORTAL_EVENTS, (msg) => {
        try {
          const payload = msg.data as (LiveEventPayload & { originNodeId?: string });
          // Only process events that originated from OTHER instances
          if (payload && payload.originNodeId && payload.originNodeId !== this.nodeId) {
            this.emit(msg.type, payload);
            this.emit("*", payload);
          }
        } catch {
          // Ignore malformed cluster messages
        }
      }).catch(() => {
        // Safe offline fallback if Redis is unavailable
      });
    } catch {
      // Safe offline fallback
    }
  }

  /**
   * Broadcast an event to all subscribers across the entire ecosystem.
   * Emits locally and fans out horizontally through Redis Pub/Sub.
   */
  broadcast<T = any>(type: EventType, data: T, localOnly = false): LiveEventPayload<T> {
    const payload: LiveEventPayload<T> = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    // 1. Emit locally for immediate dispatch to connected clients on this node
    this.emit(type, payload);
    this.emit("*", payload);

    // 2. Publish to Redis Pub/Sub for horizontal distribution to other API cluster nodes
    if (!localOnly) {
      publishEvent(REDIS_CHANNELS.PORTAL_EVENTS, type, {
        ...payload,
        originNodeId: this.nodeId,
      }).catch(() => {
        // Graceful non-blocking fallback if Redis is unreachable
      });
    }

    return payload;
  }
}

export const liveBus = new LiveEventBus();
