// ============================================================
// Tatka Bazar — Real-Time Rider Location & Live Tracking Engine
// High-throughput In-Memory + Optional Redis GEO storage
// ============================================================

import { liveBus } from "../events/live-bus.js";

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

// In-Memory store for fast sub-millisecond location reads
const activeRiderLocations = new Map<string, LiveRiderCoord>();

/**
 * Record or update a live rider's GPS coordinates
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

  activeRiderLocations.set(coord.riderId, updated);
  liveBus.broadcast("LOCATION_UPDATE", updated);
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
 * Fallback coordinate generator in central Dhaka (near Karwan Bazar / Farmgate)
 * Used when GPS is unavailable in testing environments
 */
export function getDhakaFallbackCoord(offset = 0) {
  return {
    lat: 23.7508 + (Math.sin(offset) * 0.015),
    lng: 90.3920 + (Math.cos(offset) * 0.015),
  };
}
