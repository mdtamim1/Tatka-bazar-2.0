import { NextRequest, NextResponse } from "next/server";
import { getVendors, getSettlements, logActivity, validateSession } from "@/lib/hubStore";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/vendors
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  return NextResponse.json({ success: true, data: getVendors() });
}

// PATCH /api/vendors — approve, suspend, commission change, tier, etc.
export async function PATCH(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  if (session.role === "VIEWER") {
    return NextResponse.json({ success: false, error: "অনুমতি নেই" }, { status: 403 });
  }
  const body = await req.json();
  const vendors = getVendors();
  const idx = vendors.findIndex((v) => v.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "ভেন্ডর পাওয়া যায়নি" }, { status: 404 });

  const prev = vendors[idx];
  const updated = { ...prev, ...body };

  if (body.status === "ACTIVE" && prev.status === "PENDING_APPROVAL") {
    updated.approvedAt = new Date().toISOString();
    updated.approvedBy = session.name;
  }
  if (body.status === "SUSPENDED") {
    updated.suspendedAt = new Date().toISOString();
    updated.suspendReason = body.suspendReason || "Hub admin action";
    updated.vacationMode = false;
  }
  if (body.status === "REJECTED") {
    updated.rejectionReason = body.rejectionReason || "শর্ত পূরণ হয়নি";
  }

  vendors[idx] = updated;

  logActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: `VENDOR_${body.status || (body.commissionRate !== undefined ? "COMMISSION_UPDATED" : "UPDATED")}`,
    targetType: "VENDOR",
    targetId: updated.id,
    targetName: updated.storeName,
    details: body.commissionRate !== undefined
      ? `Commission: ${prev.commissionRate}% → ${body.commissionRate}%`
      : body.suspendReason || body.rejectionReason,
  });

  return NextResponse.json({ success: true, data: updated });
}
