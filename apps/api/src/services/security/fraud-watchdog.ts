import { prisma } from "@tatka-bazar/database";
import { getRiderLocation } from "../location/rider-tracking.js";
import { createAuditRecord } from "./audit-logger.js";
import { liveBus } from "../events/live-bus.js";
import { publishEvent, REDIS_CHANNELS } from "@tatka-bazar/redis";

// ============================================================
// Tatka Bazar — Anti-Fraud & Teleportation Watchdog
// Detects Fake GPS, Mock Locations, and Impossible Velocity
// ============================================================

const MAX_REALISTIC_SPEED_KMH = 95; // Real-world max delivery speed in Bangladesh
const MIN_DISTANCE_THRESHOLD_KM = 0.4; // 400m minimum to ignore GPS jitter / cell tower jump

/**
 * Haversine distance formula in kilometers
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
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

export interface LocationValidationInput {
  riderId: string;
  riderName?: string | undefined;
  lat: number;
  lng: number;
  isMock?: boolean | undefined;
  clientSpeed?: number | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string | undefined;
  calculatedSpeedKmh?: number | undefined;
}

/**
 * Validates rider location coordinates for Mock GPS or Teleportation
 */
export async function validateRiderLocation(input: LocationValidationInput): Promise<ValidationResult> {
  const { riderId, riderName, lat, lng, isMock, ipAddress, userAgent } = input;

  // 1. Native / Client-Reported Mock Location Check
  if (isMock === true) {
    const reason = "ফেক জিপিএস (Mock Location) শনাক্ত হয়েছে। আপনার অ্যাকাউন্ট সাময়িক স্থগিত করা হয়েছে।";

    // Flag rider in database
    await prisma.deliveryRider.update({
      where: { id: riderId },
      data: {
        isFlaggedForSpoofing: true,
        spoofReason: "Native Mock Location flag reported by device",
        flaggedAt: new Date(),
        status: "OFFLINE",
      },
    }).catch(() => {});

    // Record immutable audit entry
    await createAuditRecord({
      riderId,
      actorRole: "RIDER",
      action: "SPOOFING_DETECTED",
      entity: "DeliveryRider",
      entityId: riderId,
      newValues: { violation: "MOCK_LOCATION_FLAG", lat, lng },
      ipAddress,
      userAgent,
    });

    // Broadcast security alert to dispatchers
    const alertData = {
      type: "MOCK_LOCATION",
      riderId,
      riderName: riderName || "রাইডার",
      message: "সতর্কতা: রাইডার ফেক জিপিএস ব্যবহার করছেন!",
      timestamp: new Date().toISOString(),
    };
    liveBus.broadcast("SYSTEM_ALERT", alertData);
    publishEvent(REDIS_CHANNELS.SYSTEM, "SECURITY_ALERT", alertData).catch(() => {});

    return { isValid: false, reason };
  }

  // 2. Server-side Teleportation & Impossible Velocity Watchdog
  const prevCoord = getRiderLocation(riderId);
  if (prevCoord && prevCoord.lat && prevCoord.lng && prevCoord.updatedAt) {
    const elapsedMs = Date.now() - prevCoord.updatedAt;

    // Ignore if two packets arrive within 1.5s
    if (elapsedMs >= 1500) {
      const elapsedHours = elapsedMs / (1000 * 3600);
      const distanceKm = haversineDistanceKm(prevCoord.lat, prevCoord.lng, lat, lng);
      const calculatedSpeedKmh = distanceKm / elapsedHours;

      // Teleportation condition: Distance > 400m and speed exceeds 95 km/h
      if (distanceKm >= MIN_DISTANCE_THRESHOLD_KM && calculatedSpeedKmh > MAX_REALISTIC_SPEED_KMH) {
        const reason = `অস্বাভাবিক গতিবেগ (${calculatedSpeedKmh.toFixed(0)} km/h) ও অসম্ভব দূরত্ব পরিবর্তন শনাক্ত হয়েছে। অ্যাকাউন্ট যাচাই না হওয়া পর্যন্ত অর্ডার ডেলিভারি স্থগিত।`;

        // Flag rider in database
        await prisma.deliveryRider.update({
          where: { id: riderId },
          data: {
            isFlaggedForSpoofing: true,
            spoofReason: `Teleportation detected: ${calculatedSpeedKmh.toFixed(1)} km/h over ${distanceKm.toFixed(2)} km in ${(elapsedMs / 1000).toFixed(0)}s`,
            flaggedAt: new Date(),
            status: "OFFLINE",
          },
        }).catch(() => {});

        // Immutable Audit Log
        await createAuditRecord({
          riderId,
          actorRole: "RIDER",
          action: "TELEPORTATION_DETECTED",
          entity: "DeliveryRider",
          entityId: riderId,
          newValues: {
            speedKmh: Math.round(calculatedSpeedKmh),
            distanceKm: Math.round(distanceKm * 100) / 100,
            elapsedSeconds: Math.round(elapsedMs / 1000),
            from: { lat: prevCoord.lat, lng: prevCoord.lng },
            to: { lat, lng },
          },
          ipAddress,
          userAgent,
        });

        // Broadcast alert to Hub
        const alertData = {
          type: "TELEPORTATION",
          riderId,
          riderName: riderName || "রাইডার",
          message: `টেলিপোর্টেশন অ্যালার্ট: ${distanceKm.toFixed(1)} কিমি জাম্প ${(elapsedMs / 1000).toFixed(0)} সেকেন্ডে (${calculatedSpeedKmh.toFixed(0)} কিমি/ঘণ্টা)!`,
          timestamp: new Date().toISOString(),
        };
        liveBus.broadcast("SYSTEM_ALERT", alertData);
        publishEvent(REDIS_CHANNELS.SYSTEM, "SECURITY_ALERT", alertData).catch(() => {});

        return { isValid: false, reason, calculatedSpeedKmh };
      }
    }
  }

  // 3. Update Rider's Last Known Coordinates in Database (Asynchronous)
  prisma.deliveryRider.update({
    where: { id: riderId },
    data: {
      lastKnownLat: lat,
      lastKnownLng: lng,
      lastLocationTime: new Date(),
    },
  }).catch(() => {});

  return { isValid: true };
}

/**
 * Check if a rider is currently flagged or suspended for fraud
 */
export async function isRiderFraudLocked(riderId: string): Promise<{ locked: boolean; reason?: string }> {
  try {
    const rider = await prisma.deliveryRider.findUnique({
      where: { id: riderId },
      select: { isFlaggedForSpoofing: true, spoofReason: true, status: true },
    });

    if (!rider) return { locked: false };

    if (rider.isFlaggedForSpoofing) {
      return {
        locked: true,
        reason: rider.spoofReason || "অ্যাকাউন্টে সম্ভাব্য লোকেশন জালিয়াতি শনাক্ত হয়েছে। দয়া করে কন্ট্রোল রুমে যোগাযোগ করুন।",
      };
    }

    return { locked: false };
  } catch {
    return { locked: false };
  }
}
