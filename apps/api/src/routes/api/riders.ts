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

  // PATCH /api/riders/:id — update rider status/vehicle/location
  fastify.patch("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status?: any;
      vehicleType?: any;
      kycStatus?: any;
      kycRejectionReason?: string;
      kycApprovedAt?: string;
      district?: string;
      thana?: string;
      bazar?: string;
      // For Hub rider approval with vendor assignment
      vendorIds?: string[];
    };
    try {
      const updateData: any = {};
      if (body.status) updateData.status = body.status;
      if (body.vehicleType) updateData.vehicleType = body.vehicleType;
      if (body.kycStatus) updateData.kycStatus = body.kycStatus;
      if (body.kycApprovedAt) updateData.kycApprovedAt = new Date(body.kycApprovedAt);
      if (body.district) updateData.district = body.district;
      if (body.thana) updateData.thana = body.thana;
      if (body.bazar) updateData.bazar = body.bazar;
      if (body.district || body.thana || body.bazar) updateData.locationSetAt = new Date();

      const rider = await prisma.deliveryRider.update({ where: { id }, data: updateData });

      // If vendorIds provided, create vendor-rider assignments
      if (body.vendorIds && body.vendorIds.length > 0) {
        await Promise.all(
          body.vendorIds.map(vendorId =>
            (prisma.vendorRiderAssignment.upsert as any)({
              where: { vendorId_riderId: { vendorId, riderId: id } },
              update: {},
              create: { vendorId, riderId: id },
            })
          )
        );
      }

      return reply.send({ success: true, data: rider });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/riders/:id/kyc — approve or reject KYC (legacy, kept for compatibility)
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

  // GET /api/riders/by-vendor/:vendorId — riders assigned to a specific vendor
  fastify.get("/by-vendor/:vendorId", async (request, reply) => {
    const { vendorId } = request.params as { vendorId: string };
    try {
      const assignments = await prisma.vendorRiderAssignment.findMany({
        where: { vendorId },
        include: {
          rider: {
            include: {
              assignments: {
                where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
                select: { id: true },
              },
            },
          },
        },
      });
      return reply.send({
        success: true,
        data: assignments.map(a => ({
          id: a.rider.id,
          name: a.rider.name,
          phone: a.rider.phone,
          vehicleType: a.rider.vehicleType,
          status: a.rider.status,
          kycStatus: a.rider.kycStatus,
          district: a.rider.district,
          thana: a.rider.thana,
          bazar: a.rider.bazar,
          activeDeliveries: a.rider.assignments.length,
          assignedAt: a.assignedAt,
        })),
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/riders/available-for-order/:orderId
  // Returns riders assigned to vendors serving this order's location,
  // sorted by priority: least busy (fewest active deliveries) first
  fastify.get("/available-for-order/:orderId", async (request, reply) => {
    const { orderId } = request.params as { orderId: string };
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          address: true,
          items: { select: { vendorId: true } },
        },
      });
      if (!order) return reply.status(404).send({ success: false, error: "Order not found" });

      // Get vendor IDs involved in this order
      const vendorIds = [...new Set(order.items.map(i => i.vendorId).filter(Boolean))] as string[];

      // Get all riders assigned to these vendors
      const assignments = await prisma.vendorRiderAssignment.findMany({
        where: { vendorId: { in: vendorIds } },
        include: {
          rider: {
            include: {
              assignments: {
                where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
                select: { id: true, assignedAt: true },
              },
            },
          },
        },
      });

      // De-duplicate riders (a rider could be assigned to multiple vendors)
      const riderMap = new Map<string, any>();
      for (const a of assignments) {
        if (!riderMap.has(a.rider.id)) {
          riderMap.set(a.rider.id, a.rider);
        }
      }

      // Sort by priority: fewer active deliveries = higher priority
      const riders = [...riderMap.values()]
        .filter(r => r.kycStatus === "APPROVED" && r.isActive)
        .map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          vehicleType: r.vehicleType,
          status: r.status,
          district: r.district,
          thana: r.thana,
          bazar: r.bazar,
          activeDeliveries: r.assignments.length,
          // Priority score: lower is better (fewer active deliveries = more free)
          priorityScore: r.assignments.length * 10,
        }))
        .sort((a, b) => a.priorityScore - b.priorityScore);

      return reply.send({ success: true, data: riders });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/riders/by-location — get APPROVED riders filtered by location
  fastify.get("/by-location", async (request, reply) => {
    try {
      const query = request.query as { district?: string; thana?: string; bazar?: string };
      const where: any = { kycStatus: "APPROVED", isActive: true };
      if (query.district) where.district = { contains: query.district, mode: "insensitive" };
      if (query.thana) where.thana = { contains: query.thana, mode: "insensitive" };
      if (query.bazar) where.bazar = { contains: query.bazar, mode: "insensitive" };

      const riders = await prisma.deliveryRider.findMany({
        where,
        include: {
          assignments: {
            where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
            select: { id: true },
          },
          vendorAssignments: {
            include: { vendor: { select: { id: true, businessName: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return reply.send({
        success: true,
        data: riders.map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          vehicleType: r.vehicleType,
          status: r.status,
          district: r.district,
          thana: r.thana,
          bazar: r.bazar,
          activeDeliveries: r.assignments.length,
          assignedVendors: r.vendorAssignments.map(va => ({
            id: va.vendor.id,
            name: va.vendor.businessName,
          })),
        })),
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
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

  // GET /api/riders/deposits — all deposit requests
  fastify.get("/deposits", async (request, reply) => {
    const query = request.query as { status?: string };
    try {
      // Return empty array or structured deposit items
      return reply.send({ success: true, data: [] });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/riders/deposits/:id — approve or reject rider deposit
  fastify.patch("/deposits/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      status: "APPROVED" | "REJECTED";
      riderId?: string;
      amount?: number;
      adminNote?: string;
    };
    try {
      if (body.status === "APPROVED" && body.riderId && body.amount) {
        await prisma.deliveryRider.update({
          where: { id: body.riderId },
          data: { balance: { increment: Number(body.amount) } },
        });
        await prisma.riderEarning.create({
          data: {
            riderId: body.riderId,
            amount: Number(body.amount),
            description: `ডিপোজিট অনুমোদন — ৳ ${body.amount} ব্যালেন্সে যুক্ত হয়েছে`,
            type: "ADJUSTMENT",
          },
        });
      }
      return reply.send({ success: true, message: body.status === "APPROVED" ? "ডিপোজিট অনুমোদিত" : "ডিপোজিট বাতিল" });
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

