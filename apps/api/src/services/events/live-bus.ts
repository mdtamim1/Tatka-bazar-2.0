import { EventEmitter } from "events";

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

class LiveEventBus extends EventEmitter {
  constructor() {
    super();
    // High-concurrency listener support for thousands of SSE connections
    this.setMaxListeners(5000);
  }

  /**
   * Broadcast an event to all subscribers across the ecosystem
   */
  broadcast<T = any>(type: EventType, data: T): LiveEventPayload<T> {
    const payload: LiveEventPayload<T> = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    // Emit typed event and generic wildcard
    this.emit(type, payload);
    this.emit("*", payload);

    return payload;
  }
}

export const liveBus = new LiveEventBus();
