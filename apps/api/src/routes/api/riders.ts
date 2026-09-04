import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";

export async function riderRoutes(fastify: FastifyInstance) {
  // GET /api/riders — list all delivery riders with counts
  fastify.get("/", async (_request, reply) => {
    try {
      const riders = await prisma.deliveryRider.findMany({
        include: {
          assignments: {
            where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
            select: { id: true, status: true, orderId: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = riders.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        nid: r.nidNumber || "N/A",
        vehicleType: r.vehicleType,
        status: r.status,
        kycStatus: r.kycStatus,
        balance: r.balance,
        totalEarned: r.totalEarned,
        activeDeliveriesCount: r.assignments.length,
        rating: 4.9,
      }));

      return reply.send({ success: true, data: formatted });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/riders/:id — single rider detail (for admin KYC view)
  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const rider = await prisma.deliveryRider.findUnique({
        where: { id },
        include: {
          assignments: { orderBy: { assignedAt: "desc" }, take: 10 },
          earningHistory: { orderBy: { createdAt: "desc" }, take: 20 },
          withdrawRequests: { orderBy: { createdAt: "desc" }, take: 10 },
        },
      });
      if (!rider) return reply.status(404).send({ success: false, error: "Rider not found" });
      return reply.send({ success: true, data: rider });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/riders — register new rider
  fastify.post("/", async (request, reply) => {
    try {
      const body = request.body as {
        name: string; phone: string; email?: string;
        nid?: string; vehicleType?: "BICYCLE" | "MOTORCYCLE" | "VAN";
      };
      const passwordHash = await bcrypt.hash("Rider@tatka2024!", 12);
      const rider = await (prisma.deliveryRider.create as any)({
        data: {
          name: body.name, phone: body.phone,
          email: body.email || `rider_${body.phone.replace(/[^0-9]/g, "")}@tatkabazar.com`,
          nidNumber: body.nid || null,
          vehicleType: body.vehicleType || "MOTORCYCLE",
          status: "AVAILABLE", passwordHash,
        },
      });
      return reply.status(201).send({ success: true, data: rider });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/riders/:id — update rider status/vehicle
  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: any; vehicleType?: any };
    try {
      const rider = await prisma.deliveryRider.update({
        where: { id },
        data: {
          ...(body.status && { status: body.status }),
          ...(body.vehicleType && { vehicleType: body.vehicleType }),
        },
      });
      return reply.send({ success: true, data: rider });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/riders/:id/kyc — approve or reject KYC
  fastify.patch("/:id/kyc", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { kycAction: "APPROVE" | "REJECT"; note?: string };
    try {
      const rider = await prisma.deliveryRider.update({
        where: { id },
        data: {
          kycStatus: body.kycAction === "APPROVE" ? "APPROVED" : "REJECTED",
          kycApprovedAt: body.kycAction === "APPROVE" ? new Date() : null,
        },
      });
      return reply.send({ success: true, data: rider });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // GET /api/riders/withdrawals — all withdrawal requests
  fastify.get("/withdrawals", async (request, reply) => {
    const query = request.query as { status?: string };
    try {
      const withdrawals = await prisma.riderWithdrawal.findMany({
        where: query.status && query.status !== "all" ? { status: query.status as any } : {},
        include: { rider: { select: { id: true, name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      const formatted = withdrawals.map(w => ({
        id: w.id, riderId: w.riderId,
        riderName: w.rider.name, riderPhone: w.rider.phone,
        amount: w.amount, paymentMethod: w.paymentMethod,
        paymentAccount: w.paymentAccount, status: w.status,
        createdAt: w.createdAt, adminNote: w.adminNote,
      }));
      return reply.send({ success: true, data: formatted });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/riders/withdrawals/:id — approve or reject withdrawal
  fastify.patch("/withdrawals/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status: "COMPLETED" | "REJECTED" | "PROCESSING";
      adminNote?: string; deductFromBalance?: boolean;
      riderId?: string; amount?: number;
    };
    try {
      const [withdrawal] = await prisma.$transaction(async (tx) => {
        const w = await tx.riderWithdrawal.update({
          where: { id },
          data: {
            status: body.status,
            processedAt: body.status === "COMPLETED" ? new Date() : null,
            adminNote: body.adminNote ?? null,
          },
        });
        // Deduct from rider balance on completion
        if (body.status === "COMPLETED" && body.deductFromBalance && body.riderId && body.amount) {
          await tx.deliveryRider.update({
            where: { id: body.riderId },
            data: { balance: { decrement: Number(body.amount) } },
          });
          // Record as negative earning for history
          await tx.riderEarning.create({
            data: {
              riderId: body.riderId, amount: Number(body.amount),
              description: `উইথড্র সম্পন্ন — ${w.paymentMethod} (${w.paymentAccount})`,
              type: "ADJUSTMENT",
            },
          });
        }
        return [w];
      });
      return reply.send({ success: true, data: withdrawal });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // GET /api/delivery-rates — get rates
  fastify.get("/delivery-rates", async (_request, reply) => {
    try {
      const rates = await prisma.deliveryRate.findMany({ orderBy: { createdAt: "desc" } });
      return reply.send({ success: true, data: rates });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/delivery-rates — set new active rate
  fastify.post("/delivery-rates", async (request, reply) => {
    try {
      const body = request.body as { amount: number; note?: string };
      // Deactivate old rates
      await prisma.deliveryRate.updateMany({ where: { isActive: true }, data: { isActive: false } });
      const rate = await prisma.deliveryRate.create({
        data: { amount: body.amount, note: body.note ?? null, isActive: true },
      });
      return reply.status(201).send({ success: true, data: rate });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}

