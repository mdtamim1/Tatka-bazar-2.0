import { NextRequest, NextResponse } from "next/server";
import { getDeposits, getRiders, logActivity, validateSession } from "@/lib/hubStore";
import type { RiderDepositRequest } from "@/types/hub";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/riders/deposits
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  return NextResponse.json({ success: true, data: getDeposits() });
}

// PATCH /api/riders/deposits — approve or reject a deposit
export async function PATCH(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "অনুমোদিত নয়" }, { status: 401 });
  if (session.role === "VIEWER" || session.role === "SUPPORT_AGENT") {
    return NextResponse.json({ success: false, error: "অনুমতি নেই" }, { status: 403 });
  }
  const body = await req.json();
  const deposits = getDeposits();
  const idx = deposits.findIndex((d) => d.id === body.id);
  if (idx === -1) return NextResponse.json({ success: false, error: "ডিপোজিট পাওয়া যায়নি" }, { status: 404 });

  const deposit = deposits[idx];
  if (deposit.status !== "PENDING") {
    return NextResponse.json({ success: false, error: "ইতোমধ্যে প্রক্রিয়া হয়েছে" }, { status: 400 });
  }

  deposit.status = body.action === "APPROVE" ? "APPROVED" : "REJECTED";
  deposit.processedAt = new Date().toISOString();
  deposit.processedBy = session.name;
  if (body.action === "REJECT") deposit.rejectionReason = body.reason || "প্রমাণ যথেষ্ট নয়";

  // If approved, add balance to rider
  if (body.action === "APPROVE") {
    const riders = getRiders();
    const riderIdx = riders.findIndex((r) => r.id === deposit.riderId);
    if (riderIdx !== -1) {
      riders[riderIdx].balance = (riders[riderIdx].balance || 0) + deposit.amount;
    }
  }

  logActivity({
    actorId: session.memberId,
    actorName: session.name,
    action: `DEPOSIT_${deposit.status}`,
    targetType: "RIDER",
    targetId: deposit.riderId,
    targetName: deposit.riderName,
    details: `৳${deposit.amount} via ${deposit.paymentMethod}`,
  });

  return NextResponse.json({ success: true, data: deposit });
}
