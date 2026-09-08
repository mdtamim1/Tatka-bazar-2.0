import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/hubStore";
import { getDbSettlements, updateDbSettlement, logDbActivity } from "@/lib/hubDb";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/vendors/settlements
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const settlements = await getDbSettlements();
  return NextResponse.json({ success: true, data: settlements });
}

// PATCH /api/vendors/settlements
export async function PATCH(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "VIEWER" || session.role === "SUPPORT_AGENT") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const settlements = await getDbSettlements();
  const idx = settlements.findIndex((s) => s.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "Settlement not found" }, { status: 404 });

  const settlement = settlements[idx];
  if (settlement.status !== "PENDING") {
    return NextResponse.json({ success: false, error: "Already processed" }, { status: 400 });
  }

  const updated = await updateDbSettlement(
    body.id,
    body.action === "APPROVE" ? "APPROVE" : "REJECT",
    session.name
  );

  await logDbActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: `SETTLEMENT_${body.action === "APPROVE" ? "APPROVED" : "REJECTED"}`,
    targetType: "VENDOR",
    targetId: settlement.vendorId,
    targetName: settlement.vendorName,
    details: `Tk.${settlement.amount} via ${settlement.payoutMethod}`,
  });

  return NextResponse.json({ success: true, data: updated || settlement });
}
