import { NextRequest, NextResponse } from "next/server";
import { getSettlements, getVendors, logActivity, validateSession } from "@/lib/hubStore";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/vendors/settlements
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  return NextResponse.json({ success: true, data: getSettlements() });
}

// PATCH /api/vendors/settlements
export async function PATCH(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  if (session.role === "VIEWER" || session.role === "SUPPORT_AGENT") {
    return NextResponse.json({ success: false, error: "অনুমতি নেই" }, { status: 403 });
  }
  const body = await req.json();
  const settlements = getSettlements();
  const idx = settlements.findIndex((s) => s.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "সেটেলমেন্ট পাওয়া যায়নি" }, { status: 404 });

  const settlement = settlements[idx];
  if (settlement.status !== "PENDING") {
    return NextResponse.json({ success: false, error: "ইতোমধ্যে প্রক্রিয়া হয়েছে" }, { status: 400 });
  }

  settlement.status = body.action === "APPROVE" ? "APPROVED" : "REJECTED";
  settlement.processedAt = new Date().toISOString();
  settlement.processedBy = session.name;

  // Deduct from vendor balance
  if (body.action === "APPROVE") {
    const vendors = getVendors();
    const vIdx = vendors.findIndex((v) => v.id === settlement.vendorId);
    if (vIdx !== -1) {
      vendors[vIdx].settlementBalance = Math.max(0, (vendors[vIdx].settlementBalance || 0) - settlement.amount);
    }
  }

  logActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: `SETTLEMENT_${settlement.status}`,
    targetType: "VENDOR",
    targetId: settlement.vendorId,
    targetName: settlement.vendorName,
    details: `৳${settlement.amount} via ${settlement.payoutMethod}`,
  });

  return NextResponse.json({ success: true, data: settlement });
}
