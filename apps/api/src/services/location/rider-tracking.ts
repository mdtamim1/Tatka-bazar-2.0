// ============================================================
// Tatka Bazar — Real-Time Rider Location & Live Tracking Engine
// High-throughput In-Memory + Resilient Redis GEO storage
// Scales easily to 500+ active delivery riders
// ============================================================

import { liveBus } from "../events/live-bus.js";
import {
  getRedisClient,
  publishEvent,
  subscribeEvents,
  REDIS_CHANNELS,
} from "@tatka-bazar/redis";

export interface LiveRiderCoord {
  riderId: string;
  riderName: string;
  phone?: string | undefined;
  lat: number;
  lng: number;
  heading?: number | undefined;
  speed?: number | undefined;
  accuracy?: number | undefined;
  dutyStatus: "ONLINE" | "BUSY" | "OFFLINE";
  updatedAt: number;
}

// In-Memory store for sub-millisecond local reads (L1 cache)
const activeRiderLocations = new Map<string, LiveRiderCoord>();

const REDIS_GEO_KEY = "tatka:riders:geo";
const REDIS_META_PREFIX = "tatka:riders:meta:";

// Subscribe to Redis PubSub for horizontal cluster sync (multi-instance support)
subscribeEvents(REDIS_CHANNELS.DISPATCH, (msg) => {
  if (msg.type === "LOCATION_UPDATE" && msg.data?.riderId) {
    const remote = msg.data as LiveRiderCoord;
    const existing = activeRiderLocations.get(remote.riderId);
    if (!existing || existing.updatedAt < remote.updatedAt) {
      activeRiderLocations.set(remote.riderId, remote);
    }
  }
}).catch(() => {
  // Safe if Redis is running in offline fallback mode
});

/**
 * Record or update a live rider's GPS coordinates
 * Writes to local memory + Redis GEO + publishes event for real-time dispatchers
 */
export function updateRiderLocation(coord: {
  riderId: string;
  riderName?: string | undefined;
  phone?: string | undefined;
  lat: number;
  lng: number;
  heading?: number | undefined;
  speed?: number | undefined;
  accuracy?: number | undefined;
  dutyStatus?: "ONLINE" | "BUSY" | "OFFLINE" | undefined;
}): LiveRiderCoord {
  const now = Date.now();
  const existing = activeRiderLocations.get(coord.riderId);

  const updated: LiveRiderCoord = {
    riderId: coord.riderId,
    riderName: coord.riderName || existing?.riderName || "রাইডার",
    phone: coord.phone || existing?.phone || "",
    lat: Number(coord.lat),
    lng: Number(coord.lng),
    heading: coord.heading ?? existing?.heading ?? 0,
    speed: coord.speed ?? existing?.speed ?? 0,
    accuracy: coord.accuracy ?? existing?.accuracy ?? 10,
    dutyStatus: coord.dutyStatus || existing?.dutyStatus || "ONLINE",
    updatedAt: now,
  };

  // 1. Fast L1 In-Memory Update
  activeRiderLocations.set(coord.riderId, updated);

  // 2. Broadcast to local SSE / WebSockets
  liveBus.broadcast("LOCATION_UPDATE", updated);

  // 3. Asynchronously persist to Redis GEO & Pub/Sub (non-blocking)
  try {
    const redis = getRedisClient();
    // Redis GEOADD accepts longitude first, then latitude
    redis.geoadd(REDIS_GEO_KEY, updated.lng, updated.lat, updated.riderId).catch(() => {});
    // Store metadata with 5 minute TTL
    redis.setex(
      `${REDIS_META_PREFIX}${updated.riderId}`,
      300,
      JSON.stringify(updated)
    ).catch(() => {});

    // Publish to Redis channel for multi-instance clustering
    publishEvent(REDIS_CHANNELS.DISPATCH, "LOCATION_UPDATE", updated).catch(() => {});
  } catch {
    // Graceful fallback if Redis is unreachable
  }

  return updated;
}

/**
 * Retrieve current coordinates for a specific rider
 */
export function getRiderLocation(riderId: string): LiveRiderCoord | null {
  const coord = activeRiderLocations.get(riderId);
  if (!coord) return null;
  // If no update for more than 10 minutes, consider offline
  if (Date.now() - coord.updatedAt > 10 * 60 * 1000) {
    coord.dutyStatus = "OFFLINE";
  }
  return coord;
}

/**
 * Get all online or active riders (updated within the last 5 minutes)
 */
export function getAllActiveRiderLocations(): LiveRiderCoord[] {
  const now = Date.now();
  const active: LiveRiderCoord[] = [];

  for (const coord of activeRiderLocations.values()) {
    // Within 5 minutes
    if (now - coord.updatedAt <= 5 * 60 * 1000 && coord.dutyStatus !== "OFFLINE") {
      active.push(coord);
    }
  }

  return active;
}

/**
 * Haversine formula for distance calculation in kilometers
 */
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find nearby active riders within a given radius (km)
 * Uses Redis GEO if available, falls back to memory Haversine
 */
export async function getNearbyRiders(
  lat: number,
  lng: number,
  radiusKm = 5
): Promise<(LiveRiderCoord & { distanceKm: number })[]> {
  const results: (LiveRiderCoord & { distanceKm: number })[] = [];

  try {
    const redis = getRedisClient();
    // Use GEOSEARCH (Redis 6.2+)
    const nearbyMembers = (await redis.geosearch(
      REDIS_GEO_KEY,
      "FROMLONLAT",
      lng,
      lat,
      "BYRADIUS",
      radiusKm,
      "km",
      "WITHDIST",
      "ASC"
    )) as [string, string][];

    if (Array.isArray(nearbyMembers) && nearbyMembers.length > 0) {
      for (const [riderId, distStr] of nearbyMembers) {
        const local = activeRiderLocations.get(riderId);
        if (local && local.dutyStatus === "ONLINE") {
          results.push({
            ...local,
            distanceKm: parseFloat(distStr) || 0,
          });
        }
      }
      return results;
    }
  } catch {
    // Fall back to memory calculation if Redis GEO is offline
  }

  // Memory fallback
  const all = getAllActiveRiderLocations();
  for (const rider of all) {
    if (rider.dutyStatus === "ONLINE") {
      const dist = calculateDistanceKm(lat, lng, rider.lat, rider.lng);
      if (dist <= radiusKm) {
        results.push({ ...rider, distanceKm: Math.round(dist * 100) / 100 });
      }
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm);
}

/**
 * Fallback coordinate generator in central Dhaka (near Karwan Bazar / Farmgate)
 * Used when GPS is unavailable in testing environments
 */
export function getDhakaFallbackCoord(offset = 0) {
  return {
    lat: 23.7508 + Math.sin(offset) * 0.015,
    lng: 90.392 + Math.cos(offset) * 0.015,
  };
}
