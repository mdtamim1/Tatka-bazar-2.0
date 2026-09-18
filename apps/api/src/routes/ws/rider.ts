import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { liveBus } from "../../services/events/live-bus.js";

// ============================================================
// Tatka Bazar — Rider WebSocket Server
// Real-time bidirectional communication for:
// - New order notifications (TASK_NEW)
// - Order status updates (TASK_UPDATED, TASK_CANCELLED)  
// - Duty status changes (DUTY_CHANGED)
// - Suspension alerts (RIDER_SUSPENDED)
// - Heartbeat / connection health (PING/PONG)
// ============================================================

const PING_INTERVAL_MS = 30000; // 30s server-side ping

export type ServerWsMessageType =
  | "CONNECTED"
  | "TASK_NEW"
  | "TASK_UPDATED"
  | "TASK_CANCELLED"
  | "NOTIFICATION"
  | "DUTY_CHANGED"
  | "RIDER_SUSPENDED"
  | "RIDER_ACTIVATED"
  | "PONG"
  | "ERROR";

export interface ServerWsMessage {
  type: ServerWsMessageType;
  riderId?: string;
  payload?: unknown;
  timestamp: string;
}

// In-memory map of connected riders: riderId → Set<WebSocket>
// (One rider can have multiple tabs/devices connected)
const connectedRiders = new Map<string, Set<any>>();

/**
 * Broadcast a message to a specific rider (all their connections)
 */
export function broadcastToRider(riderId: string, msg: ServerWsMessage): number {
  const sockets = connectedRiders.get(riderId);
  if (!sockets || sockets.size === 0) return 0;

  const payload = JSON.stringify(msg);
  let sent = 0;
  for (const socket of sockets) {
    try {
      if (socket.readyState === 1 /* OPEN */) {
        socket.send(payload);
        sent++;
      }
    } catch {
      sockets.delete(socket);
    }
  }
  return sent;
}

/**
 * Broadcast to ALL connected riders
 */
export function broadcastToAll(msg: ServerWsMessage): void {
  for (const [, sockets] of connectedRiders) {
    const payload = JSON.stringify(msg);
    for (const socket of sockets) {
      try {
        if (socket.readyState === 1) socket.send(payload);
      } catch {
        sockets.delete(socket);
      }
    }
  }
}

/**
 * Get count of currently connected riders (unique)
 */
export function getConnectedRiderCount(): number {
  return connectedRiders.size;
}

export async function riderWebSocketRoutes(fastify: FastifyInstance) {
  // GET /ws/rider?riderId=xxx&token=xxx
  fastify.get("/rider", { websocket: true }, async (socket: any, request: any) => {
    const query = request.query as Record<string, string>;
    const token = query["token"];
    const riderId = query["riderId"];

    // --- JWT Authentication ---
    let authenticatedRiderId: string | null = null;

    if (token) {
      try {
        const decoded = fastify.jwt.verify(token) as { sub: string; role: string };
        if (decoded?.role === "rider" && decoded?.sub) {
          authenticatedRiderId = decoded.sub;
        }
      } catch {
        // Token invalid — try to use riderId from query (for backward compat)
      }
    }

    // Fallback: trust riderId if DB confirms it exists (basic auth only)
    if (!authenticatedRiderId && riderId) {
      try {
        const rider = await prisma.deliveryRider.findUnique({
          where: { id: riderId },
          select: { id: true, isActive: true },
        });
        if (rider?.isActive) {
          authenticatedRiderId = rider.id;
        }
      } catch {
        // DB unavailable
      }
    }

    if (!authenticatedRiderId) {
      socket.close(4001, "Unauthorized");
      return;
    }

    const finalRiderId = authenticatedRiderId;

    // --- Register connection ---
    if (!connectedRiders.has(finalRiderId)) {
      connectedRiders.set(finalRiderId, new Set());
    }
    connectedRiders.get(finalRiderId)!.add(socket);

    console.log(`[WS] Rider ${finalRiderId} connected. Total connected: ${connectedRiders.size}`);

    // Send welcome message
    socket.send(JSON.stringify({
      type: "CONNECTED",
      riderId: finalRiderId,
      timestamp: new Date().toISOString(),
      payload: { message: "Connected to Tatka Bazar real-time server" },
    } satisfies ServerWsMessage));

    // --- Server-side ping to keep connection alive ---
    const pingInterval = setInterval(() => {
      try {
        if (socket.readyState === 1) {
          socket.send(JSON.stringify({
            type: "PONG",
            timestamp: new Date().toISOString(),
          }));
        }
      } catch {
        clearInterval(pingInterval);
      }
    }, PING_INTERVAL_MS);

    // --- Subscribe to live events for this rider ---
    const onLiveEvent = (payload: any) => {
      try {
        const eventData = payload?.data || payload;
        const ridersToNotify: string[] = eventData?.riderId
          ? [eventData.riderId]
          : eventData?.riderIds || [];

        // Only forward if this event is for this rider (or broadcast)
        const isBroadcast = ridersToNotify.length === 0;
        const isForThisRider = ridersToNotify.includes(finalRiderId);

        if (isBroadcast || isForThisRider) {
          const msg: ServerWsMessage = {
            type: payload.type === "ORDER_CREATED" || payload.type === "READY_FOR_PICKUP"
              ? "TASK_NEW"
              : payload.type === "TASK_CLAIMED" || payload.type === "ORDER_DELIVERED"
                ? "TASK_UPDATED"
                : "NOTIFICATION",
            riderId: finalRiderId,
            payload: eventData,
            timestamp: new Date().toISOString(),
          };
          if (socket.readyState === 1) {
            socket.send(JSON.stringify(msg));
          }
        }
      } catch {
        // Non-critical — event forwarding can fail silently
      }
    };

    liveBus.on("*", onLiveEvent);

    // --- Handle incoming messages from client ---
    socket.on("message", (rawData: Buffer | string) => {
      try {
        const msg = JSON.parse(rawData.toString());

        // Handle PING → respond with PONG
        if (msg.type === "PING") {
          socket.send(JSON.stringify({
            type: "PONG",
            timestamp: new Date().toISOString(),
          }));
          return;
        }

        // Handle GPS updates from rider
        if (msg.type === "GPS_UPDATE" && msg.payload) {
          const { lat, lng, heading, accuracy, speed } = msg.payload as any;
          if (lat && lng) {
            liveBus.broadcast("LOCATION_UPDATE", {
              riderId: finalRiderId,
              lat,
              lng,
              heading,
              accuracy,
              speed,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch {
        // Malformed message — ignore
      }
    });

    // --- Cleanup on disconnect ---
    socket.on("close", () => {
      clearInterval(pingInterval);
      liveBus.off("*", onLiveEvent);

      const sockets = connectedRiders.get(finalRiderId);
      if (sockets) {
        sockets.delete(socket);
        if (sockets.size === 0) {
          connectedRiders.delete(finalRiderId);
        }
      }

      console.log(`[WS] Rider ${finalRiderId} disconnected. Total connected: ${connectedRiders.size}`);
    });

    socket.on("error", (err: Error) => {
      console.warn(`[WS] Socket error for rider ${finalRiderId}:`, err.message);
    });
  });
}
