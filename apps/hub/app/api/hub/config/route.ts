import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { getConfig, updateConfig, validateSession } from "@/lib/hubStore";
import { isDbAvailable, logDbActivity } from "@/lib/hubDb";
import type { HubConfig } from "@/types/hub";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/hub/config
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const currentConfig = getConfig();

  // If DB available, check if DeliveryRate is set
  try {
    if (await isDbAvailable()) {
      const activeRate = await prisma.deliveryRate.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      });
      if (activeRate) {
        currentConfig.defaultDeliveryFee = Number(activeRate.amount);
      }
    }
  } catch (err) {
    console.warn("[Hub Config] GET DB rate error:", (err as Error).message);
  }

  return NextResponse.json({ success: true, data: currentConfig });
}

// POST /api/hub/config — save global config
export async function POST(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN" && session.role !== "OPS_MANAGER") {
    return NextResponse.json({ success: false, error: "Forbidden: Super Admin or Ops Manager required" }, { status: 403 });
  }

  const body = await req.json();
  const updates: Partial<HubConfig> = {};

  if (body.defaultDeliveryFee !== undefined) {
    updates.defaultDeliveryFee = Number(body.defaultDeliveryFee) || 60;
  }
  if (body.defaultCommissionRate !== undefined) {
    updates.defaultCommissionRate = Number(body.defaultCommissionRate) || 10;
  }
  if (body.riderVercelUrl) updates.riderVercelUrl = String(body.riderVercelUrl).trim();
  if (body.vendorVercelUrl) updates.vendorVercelUrl = String(body.vendorVercelUrl).trim();
  if (body.adminVercelUrl) updates.adminVercelUrl = String(body.adminVercelUrl).trim();
  if (body.storefrontVercelUrl) updates.storefrontVercelUrl = String(body.storefrontVercelUrl).trim();
  if (body.maintenanceMode !== undefined) updates.maintenanceMode = Boolean(body.maintenanceMode);

  // Update in-memory store
  const newConfig = updateConfig(updates);

  // Persist to DB if available
  try {
    if (await isDbAvailable()) {
      if (updates.defaultDeliveryFee !== undefined) {
        // Deactivate previous active rates and create a new active rate
        await prisma.deliveryRate.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });

        await prisma.deliveryRate.create({
          data: {
            amount: updates.defaultDeliveryFee,
            note: `Set by Hub Admin (${session.name})`,
            setById: session.memberId,
            isActive: true,
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          adminUserId: session.memberId.startsWith("hub-") ? null : session.memberId,
          actorRole: "HUB",
          action: "CONFIG_UPDATED",
          entity: "SYSTEM",
          newValues: {
            updatedBy: session.name,
            updatedFields: Object.keys(updates),
            config: updates,
          },
        },
      });
    }
  } catch (err) {
    console.warn("[Hub Config] DB persist error:", (err as Error).message);
  }

  await logDbActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: "CONFIG_UPDATED",
    targetType: "SYSTEM",
    details: `Updated parameters: ${Object.keys(updates).join(", ")}`,
  });

  return NextResponse.json({ success: true, data: newConfig, message: "Configuration saved successfully" });
}
