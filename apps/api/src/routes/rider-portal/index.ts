import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { encryptPII, maskPII } from "@tatka-bazar/shared";
import { isRiderFraudLocked } from "../../services/security/fraud-watchdog.js";
import { createAuditRecord } from "../../services/security/audit-logger.js";
import { queueNotification, queueTripSummary } from "../../workers/background-jobs.js";

// Helper to mask customer phone numbers for rider privacy & anti-harassment (e.g. 017*****890)
function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length < 8) return phone;
  const start = cleaned.slice(0, 3);
  const end = cleaned.slice(-3);
  return `${start}*****${end}`;
}

// Rider Portal Routes — all protected with JWT role:rider
export async function riderPortalRoutes(fastify: FastifyInstance) {

  // Auth Middleware — supports Authorization Header and HttpOnly rider_token Cookie
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      if (!request.headers.authorization) {
        const cookieHeader = request.headers.cookie || "";
        const match = cookieHeader.match(/rider_token=([^;]+)/);
        if (match && match[1]) {
          request.headers.authorization = `Bearer ${match[1].trim()}`;
        }
      }
      await request.jwtVerify();
      const payload = request.user as { role: string; sub: string };
      if (payload.role !== "rider") {
        return reply.status(403).send({ success: false, error: "Rider access only" });
      }
    } catch {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }
  });

  // GET /rider-portal/me — Live authoritative profile directly from PostgreSQL
  fastify.get("/me", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const rider = await prisma.deliveryRider.findUnique({
        where: { id: riderId },
        select: {
          id: true, name: true, phone: true, email: true,
          vehicleType: true, vehicleNumber: true, status: true,
          balance: true, totalEarned: true,
          kycStatus: true, kycSubmittedAt: true, kycApprovedAt: true,
          fatherName: true, motherName: true, dateOfBirth: true,
          presentAddress: true, permanentAddress: true,
          nidNumber: true, nidFrontUrl: true, nidBackUrl: true, photoUrl: true,
          paymentMethod: true, paymentAccount: true, paymentAccountLocked: true,
          isFlaggedForSpoofing: true, spoofReason: true, flaggedAt: true,
          createdAt: true,
        },
      });
      if (!rider) return reply.status(404).send({ success: false, error: "Rider not found" });

      // Mask sensitive PII for client display
      const formatted = {
        ...rider,
        nidNumber: rider.nidNumber ? maskPII(rider.nidNumber, "NID") : null,
        paymentAccount: rider.paymentAccount ? maskPII(rider.paymentAccount, "BKASH") : null,
      };

      return reply.send({ success: true, data: formatted });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // PATCH /rider-portal/duty-status — update rider ONLINE/OFFLINE directly in PostgreSQL
  fastify.patch("/duty-status", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const body = (request.body || {}) as { status?: "ONLINE" | "OFFLINE" };
    const targetStatus = body.status === "OFFLINE" ? "OFFLINE" : "AVAILABLE";

    try {
      // Prevent flagged riders from turning ONLINE
      if (targetStatus !== "OFFLINE") {
        const fraud = await isRiderFraudLocked(riderId);
        if (fraud.locked) {
          return reply.status(403).send({
            success: false,
            error: fraud.reason,
            fraudLocked: true,
          });
        }
      }

      const updated = await prisma.deliveryRider.update({
        where: { id: riderId },
        data: { status: targetStatus },
        select: { id: true, status: true, name: true },
      });

      // Immutable Audit Log
      createAuditRecord({
        riderId,
        actorRole: "RIDER",
        action: "DUTY_STATUS_CHANGED",
        entity: "DeliveryRider",
        entityId: riderId,
        newValues: { status: targetStatus },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      return reply.send({ success: true, data: updated });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /rider-portal/kyc
  fastify.post("/kyc", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const rider = await prisma.deliveryRider.findUnique({ where: { id: riderId } });
      if (!rider) return reply.status(404).send({ success: false, error: "Not found" });
      if (rider.kycStatus === "APPROVED") {
        return reply.status(403).send({ success: false, error: "KYC already approved. Contact support to make changes." });
      }
      const body = request.body as {
        fatherName?: string; motherName?: string; dateOfBirth?: string;
        presentAddress?: string; permanentAddress?: string; nidNumber?: string;
        nidFrontUrl?: string; nidBackUrl?: string; photoUrl?: string;
      };

      // Encrypt NID with AES-256-GCM before saving to database
      const encryptedNid = body.nidNumber ? encryptPII(body.nidNumber) : null;

      const updated = await prisma.deliveryRider.update({
        where: { id: riderId },
        data: {
          fatherName: body.fatherName ?? null, motherName: body.motherName ?? null,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
          presentAddress: body.presentAddress ?? null, permanentAddress: body.permanentAddress ?? null,
          nidNumber: encryptedNid, nidFrontUrl: body.nidFrontUrl ?? null,
          nidBackUrl: body.nidBackUrl ?? null, photoUrl: body.photoUrl ?? null,
          kycStatus: "SUBMITTED", kycSubmittedAt: new Date(),
        },
        select: { id: true, kycStatus: true, kycSubmittedAt: true },
      });

      // Immutable Audit Log
      createAuditRecord({
        riderId,
        actorRole: "RIDER",
        action: "KYC_SUBMITTED",
        entity: "DeliveryRider",
        entityId: riderId,
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      return reply.send({ success: true, data: updated });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // GET /rider-portal/balance
  fastify.get("/balance", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const rider = await prisma.deliveryRider.findUnique({
        where: { id: riderId },
        select: { balance: true, totalEarned: true },
      });
      if (!rider) return reply.status(404).send({ success: false, error: "Not found" });
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayEarnings = await prisma.riderEarning.aggregate({
        where: { riderId, createdAt: { gte: today } },
        _sum: { amount: true }, _count: true,
      });
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
      const weekEarnings = await prisma.riderEarning.aggregate({
        where: { riderId, createdAt: { gte: weekAgo } },
        _sum: { amount: true },
      });
      return reply.send({ success: true, data: {
        balance: rider.balance, totalEarned: rider.totalEarned,
        todayEarning: todayEarnings._sum.amount ?? 0,
        todayDeliveries: todayEarnings._count,
        weekEarning: weekEarnings._sum.amount ?? 0,
      }});
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /rider-portal/tasks — available orders FOR THIS RIDER ONLY (Masked customer phone)
  fastify.get("/tasks", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const rate = await prisma.deliveryRate.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });

      // Get vendor IDs this rider is assigned to
      const riderVendorAssignments = await prisma.vendorRiderAssignment.findMany({
        where: { riderId },
        select: { vendorId: true },
      });
      const assignedVendorIds = riderVendorAssignments.map(a => a.vendorId);

      const itemsFilter = assignedVendorIds.length > 0
        ? { some: { vendorId: { in: assignedVendorIds } } }
        : undefined;

      const orders = await prisma.order.findMany({
        where: {
          status: "READY_FOR_PICKUP",
          deliveryAssignment: null,
          ...(itemsFilter ? { items: itemsFilter } : {}),
        },
        include: {
          user: { select: { name: true, phone: true } },
          address: { select: { line1: true, area: true, city: true } },
          items: {
            include: {
              product: { select: { name: true } },
              vendor: { select: { id: true, businessName: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 30,
      });

      const formatted = orders.map(o => {
        const deliveryFee = Number(o.deliveryFee);
        const earnings = deliveryFee > 0 ? Math.round(deliveryFee * 0.5) : Number(rate?.amount ?? 50);
        return {
          id: o.id, orderNumber: o.orderNumber,
          customerName: o.user.name,
          customerPhone: maskPhoneNumber(o.user.phone),
          deliveryAddress: `${o.address.line1}, ${o.address.area}, ${o.address.city}`,
          vendorName: o.items[0]?.vendor?.businessName ?? "Tatka Bazar",
          vendorId: o.items[0]?.vendor?.id,
          itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
          subtotal: Number(o.subtotal),
          deliveryFee,
          total: Number(o.total),
          earnings,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          items: o.items.map(i => ({ name: i.name, qty: i.quantity, price: Number(i.price), total: Number(i.total) })),
          createdAt: o.createdAt,
        };
      });
      return reply.send({ success: true, data: formatted, assignedVendors: assignedVendorIds.length });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /rider-portal/tasks/active — Active deliveries for this rider (Masked customer phone)
  fastify.get("/tasks/active", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const assignments = await prisma.deliveryAssignment.findMany({
        where: { riderId, status: { in: ["ASSIGNED", "PICKED_UP"] } },
        include: {
          order: {
            include: {
              user: { select: { name: true, phone: true } },
              address: true,
              items: { include: { product: { select: { name: true } }, vendor: { select: { businessName: true } } } },
            },
          },
        },
      });
      const rate = await prisma.deliveryRate.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
      return reply.send({ success: true, data: assignments.map(a => {
        const deliveryFee = Number(a.order.deliveryFee);
        const earnings = deliveryFee > 0 ? Math.round(deliveryFee * 0.5) : (rate?.amount ?? 50);
        return {
          assignmentId: a.id, status: a.status, assignedAt: a.assignedAt, pickedAt: a.pickedAt,
          order: {
            id: a.order.id, orderNumber: a.order.orderNumber,
            customerName: a.order.user.name,
            customerPhone: maskPhoneNumber(a.order.user.phone),
            deliveryAddress: `${a.order.address.line1}, ${a.order.address.area}, ${a.order.address.city}`,
            vendorName: a.order.items[0]?.vendor?.businessName ?? "Tatka Bazar",
            items: a.order.items.map(i => ({ name: i.name, qty: i.quantity, price: Number(i.price), total: Number(i.total) })),
            subtotal: Number(a.order.subtotal),
            deliveryFee,
            total: Number(a.order.total),
            earnings,
            paymentStatus: a.order.paymentStatus,
            paymentMethod: a.order.paymentMethod,
          },
        };
      })});
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /rider-portal/tasks/:orderId/accept — Atomic order acceptance with 4-digit Handover OTP generation
  fastify.post("/tasks/:orderId/accept", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const { orderId } = request.params as { orderId: string };
    try {
      // Check if rider is locked for fraud/spoofing
      const fraud = await isRiderFraudLocked(riderId);
      if (fraud.locked) {
        return reply.status(403).send({
          success: false,
          error: fraud.reason,
          fraudLocked: true,
        });
      }

      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { deliveryAssignment: true } });
      if (!order) return reply.status(404).send({ success: false, error: "Order not found" });
      if (order.status !== "READY_FOR_PICKUP") {
        return reply.status(409).send({ success: false, error: "অর্ডারটি আর পাওয়া যাচ্ছে না।", alreadyAccepted: true });
      }
      if (order.deliveryAssignment) {
        return reply.status(409).send({
          success: false,
          error: "অর্ডারটি ইতিমধ্যে অন্য রাইডার গ্রহণ করেছেন।",
          alreadyAccepted: true,
        });
      }

      // Generate 4-digit Customer Handover OTP
      const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

      const [, assignment] = await prisma.$transaction([
        prisma.order.update({ where: { id: orderId }, data: { status: "OUT_FOR_DELIVERY" } }),
        prisma.deliveryAssignment.create({
          data: {
            orderId,
            riderId,
            status: "ASSIGNED",
            deliveryOtp,
          },
        }),
        prisma.deliveryRider.update({ where: { id: riderId }, data: { status: "BUSY" } }),
      ]);

      // Immutable Audit Log
      createAuditRecord({
        riderId,
        actorRole: "RIDER",
        action: "ORDER_ACCEPTED",
        entity: "DeliveryAssignment",
        entityId: assignment.id,
        newValues: { orderId, assignmentId: assignment.id },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      return reply.send({ success: true, data: assignment, alreadyAccepted: false });
    } catch (err: any) {
      // Unique constraint violation = another rider claimed it simultaneously
      if (err?.code === "P2002") {
        return reply.status(409).send({
          success: false,
          error: "অর্ডারটি ইতিমধ্যে অন্য রাইডার গ্রহণ করেছেন।",
          alreadyAccepted: true,
        });
      }
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /rider-portal/tasks/:assignmentId/deliver — IDOR Protected + Customer 4-digit Handover OTP Verification
  fastify.post("/tasks/:assignmentId/deliver", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const { assignmentId } = request.params as { assignmentId: string };
    const body = (request.body || {}) as { deliveryOtp?: string; proofNote?: string };

    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId }, include: { order: true },
      });

      // Strict IDOR ownership check
      if (!assignment || assignment.riderId !== riderId) {
        return reply.status(404).send({ success: false, error: "Assignment not found or not owned by you" });
      }
      if (assignment.status === "DELIVERED") {
        return reply.status(409).send({ success: false, error: "Already delivered" });
      }

      // Strict Delivery OTP Verification
      const inputOtp = body.deliveryOtp ? String(body.deliveryOtp).trim() : "";
      if (!assignment.deliveryOtp || assignment.deliveryOtp !== inputOtp) {
        return reply.status(400).send({
          success: false,
          error: "ভুল ডেলিভারি ওটিপি! কাস্টমারের মোবাইলে আসা ৪ সংখ্যার ওটিপি সংগ্রহ করে প্রদান করুন।",
          invalidOtp: true,
        });
      }

      const deliveryFee = Number(assignment.order.deliveryFee);
      const rate = await prisma.deliveryRate.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
      const earning = deliveryFee > 0 ? Math.round(deliveryFee * 0.5) : Number(rate?.amount ?? 50);
      const totalBill = Number(assignment.order.total);
      const isPaid = assignment.order.paymentStatus === "PAID" || (assignment.order.paymentMethod && assignment.order.paymentMethod !== "COD");
      const deduction = isPaid ? 0 : totalBill;
      const netBalanceChange = earning - deduction;

      const [, , , earningRecord] = await prisma.$transaction([
        prisma.deliveryAssignment.update({
          where: { id: assignmentId },
          data: {
            status: "DELIVERED",
            deliveredAt: new Date(),
            deliveryOtpVerifiedAt: new Date(),
            note: body.proofNote || assignment.note,
          },
        }),
        prisma.order.update({
          where: { id: assignment.orderId },
          data: { status: "DELIVERED", paymentStatus: "PAID", paidAt: new Date() },
        }),
        prisma.deliveryRider.update({
          where: { id: riderId },
          data: {
            balance: { increment: netBalanceChange },
            totalEarned: { increment: earning },
            status: "AVAILABLE",
          },
        }),
        prisma.riderEarning.create({
          data: {
            riderId,
            orderId: assignment.orderId,
            amount: earning,
            description: `ডেলিভারি আয় (৫০% ডেলিভারি চার্জ) — অর্ডার #${assignment.order.orderNumber}`,
            type: "DELIVERY",
          },
        }),
      ]);

      // Immutable Audit Log
      createAuditRecord({
        riderId,
        actorRole: "RIDER",
        action: "ORDER_DELIVERED",
        entity: "DeliveryAssignment",
        entityId: assignmentId,
        newValues: {
          orderId: assignment.orderId,
          earning,
          cashDeduction: deduction,
          netBalanceChange,
          otpVerified: true,
        },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      // Async Background Jobs: Push notification & trip summary (0ms lag for rider)
      queueNotification({
        channel: "FCM",
        recipientId: riderId,
        title: "ডেলিভারি সম্পন্ন হয়েছে! 🛵",
        body: `অর্ডার #${assignment.order.orderNumber} সফলভাবে ডেলিভারি সম্পন্ন হয়েছে। আয়: +৳${earning}`,
        data: { assignmentId, orderId: assignment.orderId },
      });

      queueTripSummary({
        riderId,
        assignmentId,
        orderId: assignment.orderId,
        deliveryOtpVerifiedAt: new Date().toISOString(),
      });

      return reply.send({
        success: true,
        data: {
          earning,
          totalBill,
          cashDeduction: deduction,
          isPaid,
          netBalanceChange,
          earningRecord,
        },
      });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // GET /rider-portal/history
  fastify.get("/history", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const query = request.query as { type?: string; from?: string; to?: string; page?: string; limit?: string };
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(50, Number(query.limit || 30));
    const skip = (page - 1) * limit;
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;
    const dateFilter = (from || to) ? { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } } : {};

    try {
      const [earnings, withdrawals] = await Promise.all([
        query.type === "withdrawal" ? [] : prisma.riderEarning.findMany({
          where: { riderId, ...dateFilter }, orderBy: { createdAt: "desc" }, take: limit, skip,
        }),
        query.type === "income" ? [] : prisma.riderWithdrawal.findMany({
          where: { riderId, ...dateFilter }, orderBy: { createdAt: "desc" }, take: limit, skip,
        }),
      ]);

      const merged = [
        ...earnings.map(e => ({ id: e.id, type: "income" as const, amount: e.amount, description: e.description, createdAt: e.createdAt })),
        ...withdrawals.map(w => ({ id: w.id, type: "withdrawal" as const, amount: w.amount,
          description: `উত্তোলন — ${w.paymentMethod} (${w.paymentAccount})`, status: w.status, createdAt: w.createdAt })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return reply.send({ success: true, data: merged });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /rider-portal/payment-account
  fastify.post("/payment-account", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const rider = await prisma.deliveryRider.findUnique({ where: { id: riderId } });
      if (!rider) return reply.status(404).send({ success: false, error: "Not found" });
      if (rider.paymentAccountLocked) return reply.status(403).send({ success: false, error: "Payment account is locked. Contact support to change." });
      const body = request.body as { paymentMethod: "BKASH" | "NAGAD" | "BANK"; paymentAccount: string };
      if (!body.paymentMethod || !body.paymentAccount) return reply.status(400).send({ success: false, error: "Required fields missing" });
      const updated = await prisma.deliveryRider.update({
        where: { id: riderId },
        data: { paymentMethod: body.paymentMethod, paymentAccount: body.paymentAccount, paymentAccountLocked: true },
        select: { paymentMethod: true, paymentAccount: true, paymentAccountLocked: true },
      });
      return reply.send({ success: true, data: updated });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /rider-portal/withdraw
  fastify.post("/withdraw", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const rider = await prisma.deliveryRider.findUnique({ where: { id: riderId } });
      if (!rider) return reply.status(404).send({ success: false, error: "Not found" });
      if (!rider.paymentAccount || !rider.paymentMethod) return reply.status(400).send({ success: false, error: "Please add a payment account first" });
      const body = request.body as { amount: number };
      const amount = Number(body.amount);
      if (!amount || amount < 100) return reply.status(400).send({ success: false, error: "Minimum withdrawal is 100 taka" });
      if (Number(rider.balance) < amount) return reply.status(400).send({ success: false, error: "Insufficient balance" });
      const withdrawal = await prisma.riderWithdrawal.create({
        data: { riderId, amount, paymentMethod: rider.paymentMethod, paymentAccount: rider.paymentAccount, status: "PENDING" },
      });
      return reply.send({ success: true, data: withdrawal });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // GET /rider-portal/tasks/stream — SSE real-time
  fastify.get("/tasks/stream", async (request, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no");
    reply.raw.flushHeaders();
    const send = (data: unknown) => reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    send({ type: "connected", timestamp: new Date().toISOString() });
    const interval = setInterval(async () => {
      try {
        const count = await prisma.order.count({ where: { status: "READY_FOR_PICKUP", deliveryAssignment: null } });
        send({ type: "task_count", count, timestamp: new Date().toISOString() });
      } catch { /* ignore */ }
    }, 10000);
    request.raw.on("close", () => { clearInterval(interval); reply.raw.end(); });
  });

  // POST /rider-portal/batch-collect — Rider picks up multiple orders in one trip (Generates 4-digit OTP for each)
  fastify.post("/batch-collect", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const body = (request.body || {}) as { orderIds: string[] };
    const { orderIds } = body;

    if (!orderIds || orderIds.length === 0) {
      return reply.status(400).send({ success: false, error: "orderIds is required" });
    }

    const MAX_BATCH = 5;
    if (orderIds.length > MAX_BATCH) {
      return reply.status(400).send({
        success: false,
        error: `একসাথে সর্বোচ্চ ${MAX_BATCH}টি অর্ডার নেওয়া যাবে।`,
      });
    }

    try {
      // Check current active deliveries for this rider
      const currentActive = await prisma.deliveryAssignment.count({
        where: { riderId, status: { in: ["ASSIGNED", "PICKED_UP"] } },
      });

      const canTake = MAX_BATCH - currentActive;
      if (canTake <= 0) {
        return reply.status(400).send({
          success: false,
          error: `আপনার কাছে ইতিমধ্যে ${currentActive}টি সক্রিয় ডেলিভারি আছে। নতুন অর্ডার নেওয়ার আগে কিছু ডেলিভারি সম্পন্ন করুন।`,
          currentActive,
          canTakeMore: 0,
        });
      }

      const toProcess = orderIds.slice(0, canTake);
      const results: { orderId: string; success: boolean; error?: string }[] = [];

      for (const orderId of toProcess) {
        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { deliveryAssignment: true },
          });

          if (!order || order.status !== "READY_FOR_PICKUP" || order.deliveryAssignment) {
            results.push({ orderId, success: false, error: "অর্ডারটি আর পাওয়া যাচ্ছে না অথবা অন্য রাইডার নিয়েছেন।" });
            continue;
          }

          const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

          await prisma.$transaction([
            prisma.order.update({ where: { id: orderId }, data: { status: "OUT_FOR_DELIVERY" } }),
            prisma.deliveryAssignment.create({
              data: {
                orderId,
                riderId,
                status: "ASSIGNED",
                deliveryOtp,
              },
            }),
          ]);

          results.push({ orderId, success: true });
        } catch (itemErr: any) {
          if (itemErr?.code === "P2002") {
            results.push({ orderId, success: false, error: "অন্য রাইডার আগেই নিয়েছেন।" });
          } else {
            results.push({ orderId, success: false, error: itemErr.message });
          }
        }
      }

      const claimed = results.filter(r => r.success);
      if (claimed.length > 0) {
        await prisma.deliveryRider.update({ where: { id: riderId }, data: { status: "BUSY" } });
      }

      return reply.send({
        success: true,
        claimedCount: claimed.length,
        results,
        message: `${claimed.length}টি অর্ডার সফলভাবে গ্রহণ করা হয়েছে।`,
        currentActive: currentActive + claimed.length,
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // POST /rider-portal/tasks/:assignmentId/transit
  // Stage 1 → 2: রাইডার দোকান থেকে পার্সেল তুলে নিয়েছে
  // ASSIGNED → PICKED_UP
  // ============================================================
  fastify.post("/tasks/:assignmentId/transit", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const { assignmentId } = request.params as { assignmentId: string };

    try {
      const assignment = await (prisma.deliveryAssignment as any).findUnique({
        where: { id: assignmentId },
        include: { order: { select: { id: true, orderNumber: true } } },
      });

      if (!assignment || assignment.riderId !== riderId) {
        return reply.status(404).send({ success: false, error: "Assignment পাওয়া যায়নি বা আপনার নয়।" });
      }
      if (assignment.status !== "ASSIGNED") {
        return reply.status(409).send({ success: false, error: `বর্তমান স্ট্যাটাস '${assignment.status}' — transit করা যাবে না।` });
      }

      const updated = await (prisma.deliveryAssignment as any).update({
        where: { id: assignmentId },
        data: { status: "PICKED_UP", pickedAt: new Date() },
      });

      createAuditRecord({
        riderId,
        actorRole: "RIDER",
        action: "ORDER_PICKED_UP",
        entity: "DeliveryAssignment",
        entityId: assignmentId,
        newValues: { status: "PICKED_UP", pickedAt: updated.pickedAt },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      // Return full task shape for frontend state update
      return reply.send({
        success: true,
        data: {
          assignmentId: updated.id,
          status: updated.status,
          pickedAt: updated.pickedAt,
          order: {
            id: assignment.order.id,
            orderNumber: assignment.order.orderNumber,
          },
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // GET /rider-portal/tasks/today-summary
  // আজকের ডেলিভারি পরিসংখ্যান
  // ============================================================
  fastify.get("/tasks/today-summary", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [completedAgg, active, available, returned] = await Promise.all([
        // Today's delivered earnings
        prisma.riderEarning.aggregate({
          where: { riderId, createdAt: { gte: today, lt: tomorrow } },
          _sum: { amount: true },
          _count: true,
        }),
        // Active (in-progress) assignments
        (prisma.deliveryAssignment as any).count({
          where: { riderId, status: { in: ["ASSIGNED", "PICKED_UP"] } },
        }),
        // Unassigned orders available for this rider
        prisma.order.count({
          where: { status: "READY_FOR_PICKUP", deliveryAssignment: null },
        }),
        // Cancelled/returned today
        (prisma.deliveryAssignment as any).count({
          where: { riderId, status: "CANCELLED", updatedAt: { gte: today, lt: tomorrow } },
        }),
      ]);

      const todayEarning = Number(completedAgg._sum.amount ?? 0);
      const completedCount = completedAgg._count;

      return reply.send({
        success: true,
        data: {
          todayDate: today.toISOString().split("T")[0],
          completedCount,
          processingCount: Number(active),
          pendingCount: Number(available),
          returnedCount: Number(returned),
          totalTodayCount: completedCount + Number(active) + Number(returned),
          todayEarning,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // POST /rider-portal/tasks/:assignmentId/note
  // Delivery progress note / tracking note যোগ করা
  // ============================================================
  fastify.post("/tasks/:assignmentId/note", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const { assignmentId } = request.params as { assignmentId: string };
    const body = (request.body || {}) as { note: string };

    if (!body.note?.trim()) {
      return reply.status(400).send({ success: false, error: "Note text required" });
    }

    try {
      const assignment = await (prisma.deliveryAssignment as any).findUnique({
        where: { id: assignmentId },
        include: { rider: { select: { name: true } } },
      });

      if (!assignment || assignment.riderId !== riderId) {
        return reply.status(404).send({ success: false, error: "Assignment পাওয়া যায়নি।" });
      }
      if (assignment.status === "DELIVERED" || assignment.status === "CANCELLED") {
        return reply.status(409).send({ success: false, error: "সম্পন্ন বা বাতিল assignment-এ note যোগ করা যাবে না।" });
      }

      const existingNotes: any[] = Array.isArray(assignment.riderNotes) ? assignment.riderNotes : [];
      const newNote = {
        id: `note-${Date.now()}`,
        note: body.note.trim(),
        riderName: assignment.rider?.name || "রাইডার",
        createdAt: new Date().toISOString(),
      };
      const updatedNotes = [...existingNotes, newNote];

      const updated = await (prisma.deliveryAssignment as any).update({
        where: { id: assignmentId },
        data: {
          riderNotes: updatedNotes,
          note: body.note.trim(), // also update short note field
        },
      });

      return reply.send({
        success: true,
        data: {
          task: { assignmentId: updated.id, riderNotes: updated.riderNotes, riderNote: updated.note },
          note: newNote,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // POST /rider-portal/tasks/:assignmentId/cancel-request
  // রাইডার কারণ দিয়ে বাতিল অনুরোধ পাঠায় (Admin approval needed)
  // ============================================================
  fastify.post("/tasks/:assignmentId/cancel-request", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const { assignmentId } = request.params as { assignmentId: string };
    const body = (request.body || {}) as { reason: string };

    if (!body.reason?.trim()) {
      return reply.status(400).send({ success: false, error: "বাতিলের কারণ লিখুন।" });
    }

    try {
      const assignment = await (prisma.deliveryAssignment as any).findUnique({
        where: { id: assignmentId },
        include: { order: { select: { orderNumber: true } } },
      });

      if (!assignment || assignment.riderId !== riderId) {
        return reply.status(404).send({ success: false, error: "Assignment পাওয়া যায়নি।" });
      }
      if (assignment.status === "DELIVERED") {
        return reply.status(409).send({ success: false, error: "ডেলিভার হয়ে যাওয়া অর্ডার বাতিল করা যাবে না।" });
      }
      if (assignment.cancelRequestedAt) {
        return reply.status(409).send({ success: false, error: "বাতিল অনুরোধ ইতোমধ্যে পাঠানো হয়েছে।" });
      }

      const updated = await (prisma.deliveryAssignment as any).update({
        where: { id: assignmentId },
        data: {
          cancelReason: body.reason.trim(),
          cancelRequestedAt: new Date(),
        },
      });

      createAuditRecord({
        riderId,
        actorRole: "RIDER",
        action: "CANCEL_REQUESTED",
        entity: "DeliveryAssignment",
        entityId: assignmentId,
        newValues: { reason: body.reason, orderId: assignment.orderId },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      // Notify admin/hub about cancellation request
      queueNotification({
        channel: "FCM",
        recipientId: "admin",
        title: "⚠️ রাইডার বাতিল অনুরোধ",
        body: `অর্ডার #${assignment.order?.orderNumber} — কারণ: ${body.reason}`,
        data: { assignmentId, riderId, reason: body.reason },
      });

      return reply.send({
        success: true,
        data: {
          assignmentId: updated.id,
          cancelReason: updated.cancelReason,
          cancelRequestedAt: updated.cancelRequestedAt,
          status: updated.status,
          message: "বাতিল অনুরোধ অ্যাডমিন প্যানেলে পাঠানো হয়েছে। অনুমোদনের জন্য অপেক্ষা করুন।",
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // POST /rider-portal/tasks/:assignmentId/verify-return-code
  // রাইডার দোকানদারের 4-digit রিটার্ন কোড যাচাই করে
  // ============================================================
  fastify.post("/tasks/:assignmentId/verify-return-code", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const { assignmentId } = request.params as { assignmentId: string };
    const body = (request.body || {}) as { returnCode: string };

    if (!body.returnCode?.trim()) {
      return reply.status(400).send({ success: false, error: "দোকানদারের রিটার্ন কোড দিন।" });
    }

    try {
      const assignment = await (prisma.deliveryAssignment as any).findUnique({
        where: { id: assignmentId },
        include: { order: { select: { orderNumber: true, deliveryFee: true } } },
      });

      if (!assignment || assignment.riderId !== riderId) {
        return reply.status(404).send({ success: false, error: "Assignment পাওয়া যায়নি।" });
      }
      if (assignment.returnVerifiedAt) {
        return reply.status(409).send({ success: false, error: "রিটার্ন ইতোমধ্যে সম্পন্ন হয়েছে।" });
      }

      // Match 4-digit return code (stored in assignment.returnCode set by Hub/Admin)
      const expectedCode = assignment.returnCode;
      if (!expectedCode || String(body.returnCode).trim() !== String(expectedCode).trim()) {
        return reply.status(400).send({
          success: false,
          error: "ভুল রিটার্ন কোড! দোকানদারকে তাঁর Hub প্যানেল থেকে কোডটি নিতে বলুন।",
          invalidCode: true,
        });
      }

      // Return allowance = 50% of delivery fee (or stored amount)
      const deliveryFee = Number(assignment.order?.deliveryFee ?? 0);
      const rate = await prisma.deliveryRate.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
      const returnAllowance = assignment.returnAllowance
        ? Number(assignment.returnAllowance)
        : deliveryFee > 0
          ? Math.round(deliveryFee * 0.5)
          : Number(rate?.amount ?? 25);

      await (prisma as any).$transaction([
        (prisma.deliveryAssignment as any).update({
          where: { id: assignmentId },
          data: {
            status: "CANCELLED",
            returnVerifiedAt: new Date(),
            returnAllowance: returnAllowance,
          },
        }),
        prisma.order.update({
          where: { id: assignment.orderId },
          data: { status: "CANCELLED" },
        }),
        prisma.deliveryRider.update({
          where: { id: riderId },
          data: {
            balance: { increment: returnAllowance },
            status: "AVAILABLE",
          },
        }),
        prisma.riderEarning.create({
          data: {
            riderId,
            orderId: assignment.orderId,
            amount: returnAllowance,
            description: `রিটার্ন ভাতা — অর্ডার #${assignment.order?.orderNumber}`,
            type: "ADJUSTMENT",
          },
        }),
      ]);

      createAuditRecord({
        riderId,
        actorRole: "RIDER",
        action: "RETURN_VERIFIED",
        entity: "DeliveryAssignment",
        entityId: assignmentId,
        newValues: { returnAllowance, orderId: assignment.orderId },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      return reply.send({
        success: true,
        data: {
          returnAllowance,
          message: `রিটার্ন সম্পন্ন! রিটার্ন ভাতা +৳${returnAllowance} আপনার ব্যালেন্সে যোগ হয়েছে।`,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // GET /rider-portal/notifications
  // রাইডারের নোটিফিকেশন তালিকা
  // ============================================================
  fastify.get("/notifications", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const notifs = await (prisma as any).riderNotification.findMany({
        where: { riderId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return reply.send({ success: true, data: notifs });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // POST /rider-portal/notifications/read
  // সব নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা
  // ============================================================
  fastify.post("/notifications/read", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      await (prisma as any).riderNotification.updateMany({
        where: { riderId, isRead: false },
        data: { isRead: true },
      });
      return reply.send({ success: true, message: "সব নোটিফিকেশন পঠিত হিসেবে চিহ্নিত হয়েছে।" });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // GET /rider-portal/deposits
  // রাইডারের ক্যাশ ডিপোজিট ইতিহাস
  // ============================================================
  fastify.get("/deposits", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const deposits = await (prisma as any).riderCashDeposit.findMany({
        where: { riderId },
        orderBy: { createdAt: "desc" },
        take: 30,
      });
      return reply.send({ success: true, data: deposits });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // ============================================================
  // POST /rider-portal/deposit
  // নতুন ক্যাশ ডিপোজিট রিকোয়েস্ট জমা দেওয়া (COD cash reconciliation)
  // ============================================================
  fastify.post("/deposit", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const body = (request.body || {}) as {
      amount: number;
      lastFour: string;
      paymentMethod: string; // "bKash" | "Nagad"
    };

    const amount = Number(body.amount);
    if (!amount || amount < 10) {
      return reply.status(400).send({ success: false, error: "সর্বনিম্ন ৳১০ জমা করুন।" });
    }
    if (!body.lastFour || !/^\d{4}$/.test(String(body.lastFour))) {
      return reply.status(400).send({ success: false, error: "Transaction-এর শেষ ৪ সংখ্যা দিন।" });
    }
    if (!body.paymentMethod) {
      return reply.status(400).send({ success: false, error: "Payment method দিন (bKash / Nagad)।" });
    }

    try {
      const deposit = await (prisma as any).riderCashDeposit.create({
        data: {
          riderId,
          amount,
          paymentMethod: body.paymentMethod,
          lastFour: String(body.lastFour),
          status: "PENDING",
        },
      });

      createAuditRecord({
        riderId,
        actorRole: "RIDER",
        action: "CASH_DEPOSIT_SUBMITTED",
        entity: "RiderCashDeposit",
        entityId: deposit.id,
        newValues: { amount, paymentMethod: body.paymentMethod, lastFour: body.lastFour },
        ipAddress: request.ip,
        userAgent: request.headers["user-agent"],
      });

      // Notify hub/admin for approval
      queueNotification({
        channel: "FCM",
        recipientId: "admin",
        title: "💰 ক্যাশ ডিপোজিট অনুরোধ",
        body: `রাইডার ${body.paymentMethod}-এ ৳${amount} জমা দিয়েছেন। যাচাই করুন।`,
        data: { depositId: deposit.id, riderId, amount: String(amount) },
      });

      return reply.status(201).send({
        success: true,
        data: {
          message: "ডিপোজিট অনুরোধ জমা হয়েছে। Hub যাচাই করার পর ব্যালেন্সে যোগ হবে।",
          deposit,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
  // POST /rider-portal/sos
  fastify.post("/sos", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const body = (request.body || {}) as { lat: number; lng: number; reason?: string };
    if (!body.lat || !body.lng) return reply.status(400).send({ success: false, error: "GPS location required." });
    try {
      const rider = await prisma.deliveryRider.findUnique({ where: { id: riderId }, select: { name: true, phone: true } });
      if (!rider) return reply.status(404).send({ success: false, error: "Rider not found." });
      const existing = await (prisma as any).riderSosAlert.findFirst({ where: { riderId, status: "ACTIVE" } });
      let sosAlert: any;
      if (existing) {
        sosAlert = await (prisma as any).riderSosAlert.update({ where: { id: existing.id }, data: { lat: body.lat, lng: body.lng, reason: body.reason || existing.reason } });
      } else {
        sosAlert = await (prisma as any).riderSosAlert.create({ data: { riderId, riderName: rider.name, riderPhone: rider.phone, lat: body.lat, lng: body.lng, reason: body.reason || null, status: "ACTIVE" } });
      }
      createAuditRecord({ riderId, actorRole: "RIDER", action: "SOS_TRIGGERED", entity: "RiderSosAlert", entityId: sosAlert.id, newValues: { lat: body.lat, lng: body.lng }, ipAddress: request.ip, userAgent: request.headers["user-agent"] });
      queueNotification({ channel: "FCM", recipientId: "admin", title: "SOS ALERT", body: `${rider.name} (${rider.phone}) SOS triggered`, data: { type: "SOS", sosId: sosAlert.id, riderId, lat: String(body.lat), lng: String(body.lng) } });
      return reply.status(201).send({ success: true, data: { id: sosAlert.id, status: sosAlert.status, message: "SOS Alert sent. Hub team will contact you shortly." } });
    } catch (err: any) { return reply.status(500).send({ success: false, error: err.message }); }
  });

  // POST /rider-portal/sos/resolve
  fastify.post("/sos/resolve", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const active = await (prisma as any).riderSosAlert.findFirst({ where: { riderId, status: "ACTIVE" } });
      if (!active) return reply.status(404).send({ success: false, error: "No active SOS found." });
      await (prisma as any).riderSosAlert.update({ where: { id: active.id }, data: { status: "RESOLVED", resolvedAt: new Date(), resolvedNote: "Self-resolved by rider" } });
      return reply.send({ success: true, message: "SOS resolved." });
    } catch (err: any) { return reply.status(500).send({ success: false, error: err.message }); }
  });

  // GET /rider-portal/performance
  fastify.get("/performance", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    try {
      const [ratingsAgg, deliveryCount, cancelledCount, allRatings, recentRatings] = await Promise.all([
        (prisma as any).riderRating.aggregate({ where: { riderId }, _avg: { rating: true }, _count: { rating: true } }),
        (prisma.deliveryAssignment as any).count({ where: { riderId, status: "DELIVERED" } }),
        (prisma.deliveryAssignment as any).count({ where: { riderId, status: "CANCELLED" } }),
        (prisma as any).riderRating.findMany({ where: { riderId }, select: { rating: true } }),
        (prisma as any).riderRating.findMany({ where: { riderId }, orderBy: { createdAt: "desc" }, take: 5 }),
      ]);
      const totalDeliveries = Number(deliveryCount);
      const totalCancelled = Number(cancelledCount);
      const totalJobs = totalDeliveries + totalCancelled;
      const avgRating = ratingsAgg._avg?.rating ? Number(ratingsAgg._avg.rating) : 5.0;
      const totalRatings = ratingsAgg._count?.rating || 0;
      const cancellationRate = totalJobs > 0 ? Math.round((totalCancelled / totalJobs) * 100) : 0;
      let tier = "BRONZE", tierTitleBn = "Bronze Rider", tierBadgeEmoji = "🥉", tierPerkBn = "Basic commission";
      let nextTierTarget: any = { targetTier: "SILVER", deliveriesNeeded: Math.max(0, 50 - totalDeliveries), minRating: 4.0 };
      if (totalDeliveries >= 500) { tier = "PLATINUM"; tierTitleBn = "Platinum Rider"; tierBadgeEmoji = "💎"; tierPerkBn = "Max commission + priority dispatch"; nextTierTarget = null; }
      else if (totalDeliveries >= 200) { tier = "GOLD"; tierTitleBn = "Gold Rider"; tierBadgeEmoji = "🥇"; tierPerkBn = "High commission + weekly bonus"; nextTierTarget = { targetTier: "PLATINUM", deliveriesNeeded: 500 - totalDeliveries, minRating: 4.5 }; }
      else if (totalDeliveries >= 50) { tier = "SILVER"; tierTitleBn = "Silver Rider"; tierBadgeEmoji = "🥈"; tierPerkBn = "Medium commission + weekly bonus"; nextTierTarget = { targetTier: "GOLD", deliveriesNeeded: 200 - totalDeliveries, minRating: 4.2 }; }
      const starsBreakdown = { star5: 0, star4: 0, star3: 0, star2: 0, star1: 0 };
      for (const r of allRatings) {
        if (r.rating === 5) starsBreakdown.star5++; else if (r.rating === 4) starsBreakdown.star4++; else if (r.rating === 3) starsBreakdown.star3++; else if (r.rating === 2) starsBreakdown.star2++; else if (r.rating === 1) starsBreakdown.star1++;
      }
      return reply.send({ success: true, data: { tier, tierTitleBn, tierBadgeEmoji, tierPerkBn, totalDeliveries, rating: Number(avgRating.toFixed(1)), totalRatings, onTimeRate: 98, acceptanceRate: Math.max(0, 100 - cancellationRate), cancellationRate, nextTierTarget, starsBreakdown, recentReviews: recentRatings.map((r: any) => ({ id: r.id, rating: r.rating, comment: r.comment || "", date: r.createdAt })) } });
    } catch (err: any) { return reply.status(500).send({ success: false, error: err.message }); }
  });
}