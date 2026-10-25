import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { getSessionFromRequest, unauthorized, forbidden } from "@/lib/authMiddleware";
import { isDbAvailable, logDbActivity } from "@/lib/hubDb";

// GET /api/riders/withdrawals — list all withdrawal requests
export async function GET(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();

  try {
    if (await isDbAvailable()) {
      const records = await prisma.riderWithdrawal.findMany({
        include: {
          rider: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      });

      const data = records.map((w) => ({
        id: w.id,
        riderId: w.riderId,
        riderName: w.rider?.name || "Rider",
        riderPhone: w.rider?.phone || "",
        amount: Number(w.amount),
        paymentMethod: w.paymentMethod,
        paymentAccount: w.paymentAccount,
        status: w.status,
        adminNote: w.adminNote || undefined,
        processedAt: w.processedAt ? w.processedAt.toISOString() : undefined,
        proofUrl: w.proofUrl || undefined,
        createdAt: w.createdAt.toISOString(),
      }));

      return NextResponse.json({ success: true, data });
    }
  } catch (err) {
    console.warn("[Hub Withdrawals] DB error:", (err as Error).message);
  }

  return NextResponse.json({ success: true, data: [] });
}

// PATCH /api/riders/withdrawals — approve or reject a withdrawal
export async function PATCH(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return unauthorized();
  if (session.role === "VIEWER" || session.role === "SUPPORT_AGENT") return forbidden();

  const body = await req.json();
  const { id, action, adminNote } = body;

  if (!id || !action) {
    return NextResponse.json({ success: false, error: "id and action are required" }, { status: 400 });
  }
  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ success: false, error: "action must be APPROVE or REJECT" }, { status: 400 });
  }

  try {
    if (await isDbAvailable()) {
      // Verify withdrawal exists
      const withdrawal = await prisma.riderWithdrawal.findUnique({ where: { id } });
      if (!withdrawal) {
        return NextResponse.json({ success: false, error: "Withdrawal not found" }, { status: 404 });
      }
      if (withdrawal.status !== "PENDING") {
        return NextResponse.json({ success: false, error: "Already processed" }, { status: 400 });
      }

      const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";

      // If approving, deduct balance from rider's wallet (they withdrew cash)
      if (action === "APPROVE") {
        await prisma.deliveryRider.update({
          where: { id: withdrawal.riderId },
          data: {
            balance: {
              decrement: withdrawal.amount,
            },
          },
        });
      }

      const updated = await prisma.riderWithdrawal.update({
        where: { id },
        data: {
          status: newStatus as any,
          processedAt: new Date(),
          processedById: session.memberId,
          adminNote: adminNote || undefined,
        },
        include: { rider: { select: { name: true, phone: true } } },
      });

      await logDbActivity({
        actorId: session.memberId,
        actorName: session.name,
        action: `WITHDRAWAL_${newStatus}`,
        targetType: "RIDER",
        targetId: withdrawal.riderId,
        targetName: updated.rider?.name || "Rider",
        details: `Tk.${Number(withdrawal.amount)} via ${withdrawal.paymentMethod}${adminNote ? ` — ${adminNote}` : ""}`,
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          riderId: updated.riderId,
          riderName: updated.rider?.name || "Rider",
          riderPhone: updated.rider?.phone || "",
          amount: Number(updated.amount),
          paymentMethod: updated.paymentMethod,
          paymentAccount: updated.paymentAccount,
          status: updated.status,
          adminNote: updated.adminNote || undefined,
          processedAt: updated.processedAt ? updated.processedAt.toISOString() : undefined,
          createdAt: updated.createdAt.toISOString(),
        },
      });
    }
  } catch (err) {
    console.error("[Hub Withdrawals] PATCH error:", (err as Error).message);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 });
}
