import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { getDeposits, validateSession } from "@/lib/hubStore";
import { getDbRiders, updateDbRider, logDbActivity, getDbDeposits, isDbAvailable } from "@/lib/hubDb";
import type { RiderDepositRequest } from "@/types/hub";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/riders/deposits
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const deposits = await getDbDeposits();
  return NextResponse.json({ success: true, data: deposits });
}

// PATCH /api/riders/deposits — approve or reject a deposit
export async function PATCH(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  if (session.role === "VIEWER" || session.role === "SUPPORT_AGENT") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, action, reason } = body;

  if (!id || !action) {
    return NextResponse.json({ success: false, error: "id and action are required" }, { status: 400 });
  }
  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ success: false, error: "action must be APPROVE or REJECT" }, { status: 400 });
  }

  // 1. Try DB first if available
  try {
    if (await isDbAvailable()) {
      const dbDeposit = await (prisma as any).riderCashDeposit.findUnique({
        where: { id },
        include: { rider: { select: { id: true, name: true, phone: true } } },
      });

      if (dbDeposit) {
        if (dbDeposit.status !== "PENDING") {
          return NextResponse.json({ success: false, error: "Already processed" }, { status: 400 });
        }

        const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

        // If approved, increment rider's wallet balance
        if (action === "APPROVE") {
          await prisma.deliveryRider.update({
            where: { id: dbDeposit.riderId },
            data: {
              balance: {
                increment: dbDeposit.amount,
              },
            },
          });
        }

        const updated = await (prisma as any).riderCashDeposit.update({
          where: { id },
          data: {
            status: newStatus,
            approvedAt: new Date(),
            approvedById: session.name || session.memberId,
            adminNote: action === "REJECT" ? (reason || "Rejected by Hub Admin") : undefined,
          },
          include: { rider: { select: { id: true, name: true, phone: true } } },
        });

        await logDbActivity({
          actorId: session.memberId,
          actorName: session.name,
          action: `DEPOSIT_${newStatus}`,
          targetType: "RIDER",
          targetId: dbDeposit.riderId,
          targetName: updated.rider?.name || "Rider",
          details: `Tk.${Number(dbDeposit.amount)} via ${dbDeposit.paymentMethod}${reason ? ` — ${reason}` : ""}`,
        });

        const resData: RiderDepositRequest = {
          id: updated.id,
          riderId: updated.riderId,
          riderName: updated.rider?.name || "Rider",
          riderPhone: updated.rider?.phone || "",
          amount: Number(updated.amount),
          paymentMethod: updated.paymentMethod,
          transactionId: updated.lastFour ? `TXN-***${updated.lastFour}` : "N/A",
          lastFour: updated.lastFour || "",
          status: updated.status as "PENDING" | "APPROVED" | "REJECTED",
          requestedAt: updated.createdAt.toISOString(),
          processedAt: updated.approvedAt ? updated.approvedAt.toISOString() : undefined,
          processedBy: updated.approvedById || undefined,
          rejectionReason: updated.adminNote || undefined,
        };

        return NextResponse.json({ success: true, data: resData });
      }
    }
  } catch (err) {
    console.warn("[Hub Deposits] DB error:", (err as Error).message);
  }

  // 2. In-memory fallback
  const deposits = getDeposits();
  const idx = deposits.findIndex((d) => d.id === id);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: "Deposit not found" }, { status: 404 });
  }

  const deposit = deposits[idx];
  if (deposit.status !== "PENDING") {
    return NextResponse.json({ success: false, error: "Already processed" }, { status: 400 });
  }

  deposit.status = action === "APPROVE" ? "APPROVED" : "REJECTED";
  deposit.processedAt = new Date().toISOString();
  deposit.processedBy = session.name;
  if (action === "REJECT") deposit.rejectionReason = reason || "Insufficient verification proof";

  if (action === "APPROVE") {
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
