import { NextRequest, NextResponse } from "next/server";
import { getDeposits, getRiders, validateSession } from "@/lib/hubStore";
import { getDbRiders, updateDbRider, logDbActivity } from "@/lib/hubDb";
import type { RiderDepositRequest } from "@/types/hub";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/riders/deposits
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ success: true, data: getDeposits() });
}

// PATCH /api/riders/deposits — approve or reject a deposit
export async function PATCH(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "VIEWER" || session.role === "SUPPORT_AGENT") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const deposits = getDeposits();
  const idx = deposits.findIndex((d) => d.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "Deposit not found" }, { status: 404 });

  const deposit = deposits[idx];
  if (deposit.status !== "PENDING") {
    return NextResponse.json({ success: false, error: "Already processed" }, { status: 400 });
  }

  deposit.status = body.action === "APPROVE" ? "APPROVED" : "REJECTED";
  deposit.processedAt = new Date().toISOString();
  deposit.processedBy = session.name;
  if (body.action === "REJECT") deposit.rejectionReason = body.reason || "Insufficient verification proof";

  // If approved, add balance to rider in memory and DB
  if (body.action === "APPROVE") {
    const riders = await getDbRiders();
    const targetRider = riders.find((r) => r.id === deposit.riderId);
    if (targetRider) {
      const newBalance = (targetRider.balance || 0) + deposit.amount;
      await updateDbRider(deposit.riderId, { balance: newBalance });
    }
  }

  await logDbActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: `DEPOSIT_${deposit.status}`,
    targetType: "RIDER",
    targetId: deposit.riderId,
    targetName: deposit.riderName,
    details: `Tk.${deposit.amount} via ${deposit.paymentMethod}`,
  });

  return NextResponse.json({ success: true, data: deposit });
}
