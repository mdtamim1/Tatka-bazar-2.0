import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { getSessionFromRequest, unauthorized, forbidden } from "@/lib/authMiddleware";
import { isDbAvailable, logDbActivity } from "@/lib/hubDb";
import { broadcastToPortals } from "@/lib/crossPortalSync";

// ─── In-memory fallback store for broadcast history ──────────────────────────
declare global {
  var __hub_broadcast_history__: BroadcastRecord[] | undefined;
}
if (!globalThis.__hub_broadcast_history__) {
  globalThis.__hub_broadcast_history__ = [];
}

export interface BroadcastRecord {
  id: string;
  title: string;
  body: string;
  targetType: "ALL_RIDERS" | "ALL_VENDORS" | "ALL";
  sentBy: string;
  sentByName: string;
  recipientCount: number;
  sentAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/hub/notifications — broadcast history
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    if (await isDbAvailable()) {
      const logs = await prisma.auditLog.findMany({
        where: {
          action: "BROADCAST_SENT",
          actorRole: "HUB",
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      if (logs.length > 0) {
        const history: BroadcastRecord[] = logs.map((l) => {
          const nv = (l.newValues as any) || {};
          return {
            id: l.id,
            title: nv.title || "",
            body: nv.body || "",
            targetType: nv.targetType || "ALL_RIDERS",
            sentBy: l.adminUserId || "system",
            sentByName: nv.actorName || "Admin",
            recipientCount: nv.recipientCount || 0,
            sentAt: l.createdAt.toISOString(),
          };
        });
        return NextResponse.json({ success: true, data: history });
      }
    }
  } catch (err) {
    console.warn("[Hub Notifications] GET DB error:", (err as Error).message);
  }

  // Fallback to in-memory
  return NextResponse.json({
    success: true,
    data: globalThis.__hub_broadcast_history__ || [],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/hub/notifications — send broadcast to all riders/vendors
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  if (session.role === "VIEWER") return forbidden();

  const body = await req.json();
  const { title, body: msgBody, targetType } = body;

  if (!title?.trim() || !msgBody?.trim()) {
    return NextResponse.json(
      { success: false, error: "Title and body are required" },
      { status: 400 }
    );
  }
  if (!["ALL_RIDERS", "ALL_VENDORS", "ALL"].includes(targetType)) {
    return NextResponse.json(
      { success: false, error: "Invalid targetType" },
      { status: 400 }
    );
  }

  let riderCount = 0;
  let vendorCount = 0;
  const broadcastId = `bc-${Date.now()}`;

  try {
    if (await isDbAvailable()) {
      // ── 1. Persist RiderNotification for each active rider ──────────────────
      if (targetType === "ALL_RIDERS" || targetType === "ALL") {
        const riders = await prisma.deliveryRider.findMany({
          where: { isActive: true, kycStatus: "APPROVED" },
          select: { id: true },
        });

        if (riders.length > 0) {
          await prisma.riderNotification.createMany({
            data: riders.map((r) => ({
              riderId: r.id,
              type: "SYSTEM",
              title: title.trim(),
              body: msgBody.trim(),
              data: {
                broadcastId,
                sentBy: session.memberId,
                sentByName: session.name,
                targetType,
              },
            })),
            skipDuplicates: true,
          });
          riderCount = riders.length;
        }
      }

      // ── 2. Fire cross-portal sync event to rider portal ─────────────────────
      if (targetType === "ALL_RIDERS" || targetType === "ALL") {
        broadcastToPortals({
          type: "DISPATCH_BROADCAST",
          targetId: "ALL",
          targetType: "RIDER",
          payload: { broadcastId, title: title.trim(), body: msgBody.trim(), targetType },
          timestamp: new Date().toISOString(),
        });
      }

      // ── 3. Fire cross-portal sync event to vendor portal ────────────────────
      if (targetType === "ALL_VENDORS" || targetType === "ALL") {
        const vendors = await prisma.vendor.findMany({
          where: { isActive: true, status: "APPROVED" },
          select: { id: true },
        });
        vendorCount = vendors.length;

        broadcastToPortals({
          type: "DISPATCH_BROADCAST",
          targetId: "ALL",
          targetType: "VENDOR",
          payload: { broadcastId, title: title.trim(), body: msgBody.trim(), targetType },
          timestamp: new Date().toISOString(),
        });
      }

      // ── 4. Persist broadcast record in AuditLog ──────────────────────────────
      await prisma.auditLog.create({
        data: {
          adminUserId: null,
          actorRole: "HUB",
          action: "BROADCAST_SENT",
          entity: "SYSTEM",
          entityId: broadcastId,
          newValues: {
            title: title.trim(),
            body: msgBody.trim(),
            targetType,
            actorName: session.name,
            recipientCount: riderCount + vendorCount,
          },
        },
      });
    }
  } catch (err) {
    console.warn("[Hub Notifications] DB write error:", (err as Error).message);
  }

  // Always push to in-memory fallback regardless of DB availability
  const record: BroadcastRecord = {
    id: broadcastId,
    title: title.trim(),
    body: msgBody.trim(),
    targetType,
    sentBy: session.memberId,
    sentByName: session.name,
    recipientCount: riderCount + vendorCount,
    sentAt: new Date().toISOString(),
  };
  globalThis.__hub_broadcast_history__!.unshift(record);
  if (globalThis.__hub_broadcast_history__!.length > 100) {
    globalThis.__hub_broadcast_history__!.pop();
  }

  // Also log to hub activity feed
  await logDbActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: "BROADCAST_SENT",
    targetType: "SYSTEM",
    details: `"${title.trim()}" → ${targetType} (${riderCount + vendorCount} recipients)`,
  });

  return NextResponse.json({
    success: true,
    data: record,
    message: `Broadcast sent to ${riderCount + vendorCount} recipients`,
  });
}
