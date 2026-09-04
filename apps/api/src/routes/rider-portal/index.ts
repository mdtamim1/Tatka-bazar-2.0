import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";

// Rider Portal Routes — all protected with JWT role:rider
export async function riderPortalRoutes(fastify: FastifyInstance) {

  // Auth Middleware
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
      const payload = request.user as { role: string; sub: string };
      if (payload.role !== "rider") {
        return reply.status(403).send({ success: false, error: "Rider access only" });
      }
    } catch {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }
  });

  // GET /rider-portal/me
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
          createdAt: true,
        },
      });
      if (!rider) return reply.status(404).send({ success: false, error: "Rider not found" });
      return reply.send({ success: true, data: rider });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
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
      const updated = await prisma.deliveryRider.update({
        where: { id: riderId },
        data: {
          fatherName: body.fatherName, motherName: body.motherName,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
          presentAddress: body.presentAddress, permanentAddress: body.permanentAddress,
          nidNumber: body.nidNumber, nidFrontUrl: body.nidFrontUrl,
          nidBackUrl: body.nidBackUrl, photoUrl: body.photoUrl,
          kycStatus: "SUBMITTED", kycSubmittedAt: new Date(),
        },
        select: { id: true, kycStatus: true, kycSubmittedAt: true },
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

  // GET /rider-portal/tasks — available orders
  fastify.get("/tasks", async (_request, reply) => {
    try {
      const orders = await prisma.order.findMany({
        where: { status: "READY_FOR_PICKUP", deliveryAssignment: null },
        include: {
          user: { select: { name: true, phone: true } },
          address: { select: { line1: true, area: true, city: true } },
          items: {
            include: {
              product: { select: { name: true } },
              vendor: { select: { businessName: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 20,
      });
      const rate = await prisma.deliveryRate.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
      const formatted = orders.map(o => ({
        id: o.id, orderNumber: o.orderNumber,
        customerName: o.user.name, customerPhone: o.user.phone,
        deliveryAddress: `${o.address.line1}, ${o.address.area}, ${o.address.city}`,
        vendorName: o.items[0]?.vendor?.businessName ?? "Tatka Bazar",
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        total: o.total, earnings: rate?.amount ?? 50, createdAt: o.createdAt,
      }));
      return reply.send({ success: true, data: formatted });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /rider-portal/tasks/active
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
      return reply.send({ success: true, data: assignments.map(a => ({
        assignmentId: a.id, status: a.status, assignedAt: a.assignedAt, pickedAt: a.pickedAt,
        order: {
          id: a.order.id, orderNumber: a.order.orderNumber,
          customerName: a.order.user.name, customerPhone: a.order.user.phone,
          deliveryAddress: `${a.order.address.line1}, ${a.order.address.area}, ${a.order.address.city}`,
          vendorName: a.order.items[0]?.vendor?.businessName ?? "Tatka Bazar",
          items: a.order.items.map(i => ({ name: i.name, qty: i.quantity })),
          earnings: rate?.amount ?? 50,
        },
      }))});
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /rider-portal/tasks/:orderId/accept
  fastify.post("/tasks/:orderId/accept", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const { orderId } = request.params as { orderId: string };
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { deliveryAssignment: true } });
      if (!order) return reply.status(404).send({ success: false, error: "Order not found" });
      if (order.status !== "READY_FOR_PICKUP") return reply.status(409).send({ success: false, error: "Order is no longer available" });
      if (order.deliveryAssignment) return reply.status(409).send({ success: false, error: "Order already taken" });

      const [, assignment] = await prisma.$transaction([
        prisma.order.update({ where: { id: orderId }, data: { status: "OUT_FOR_DELIVERY" } }),
        prisma.deliveryAssignment.create({ data: { orderId, riderId, status: "ASSIGNED" } }),
        prisma.deliveryRider.update({ where: { id: riderId }, data: { status: "BUSY" } }),
      ]);
      return reply.send({ success: true, data: assignment });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /rider-portal/tasks/:assignmentId/deliver
  fastify.post("/tasks/:assignmentId/deliver", async (request, reply) => {
    const { sub: riderId } = request.user as { sub: string };
    const { assignmentId } = request.params as { assignmentId: string };
    try {
      const assignment = await prisma.deliveryAssignment.findUnique({
        where: { id: assignmentId }, include: { order: true },
      });
      if (!assignment || assignment.riderId !== riderId) return reply.status(404).send({ success: false, error: "Assignment not found" });
      if (assignment.status === "DELIVERED") return reply.status(409).send({ success: false, error: "Already delivered" });

      const rate = await prisma.deliveryRate.findFirst({ where: { isActive: true }, orderBy: { createdAt: "desc" } });
      const earning = Number(rate?.amount ?? 50);

      const [, , , earningRecord] = await prisma.$transaction([
        prisma.deliveryAssignment.update({ where: { id: assignmentId }, data: { status: "DELIVERED", deliveredAt: new Date() } }),
        prisma.order.update({ where: { id: assignment.orderId }, data: { status: "DELIVERED" } }),
        prisma.deliveryRider.update({
          where: { id: riderId },
          data: { balance: { increment: earning }, totalEarned: { increment: earning }, status: "AVAILABLE" },
        }),
        prisma.riderEarning.create({
          data: { riderId, orderId: assignment.orderId, amount: earning,
            description: `???????? ??????? — ?????? #${assignment.order.orderNumber}`, type: "DELIVERY" },
        }),
      ]);
      return reply.send({ success: true, data: { earning, earningRecord } });
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
          description: `?????? — ${w.paymentMethod} (${w.paymentAccount})`, status: w.status, createdAt: w.createdAt })),
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
}
