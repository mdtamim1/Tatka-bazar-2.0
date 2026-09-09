import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { getAllActiveRiderLocations, getRiderLocation } from "../../services/location/rider-tracking.js";
import { liveBus } from "../../services/events/live-bus.js";

// Fast in-memory cache for admin metrics (5-second TTL to handle intense admin refreshing)
let cachedMetrics: any = null;
let metricsExpiresAt = 0;

export async function adminRoutes(fastify: FastifyInstance) {
  // GET /api/admin/metrics — Ultra-fast real-time system metrics aggregator (<5ms)
  fastify.get("/metrics", async (_request, reply) => {
    const now = Date.now();
    if (cachedMetrics && now < metricsExpiresAt) {
      reply.header("X-Cache", "HIT-RAM");
      return reply.send({ success: true, data: cachedMetrics, cached: true });
    }

    try {
      const activeCoords = getAllActiveRiderLocations();

      // Parallel DB aggregates with error resiliency
      const [
        totalOrders,
        pendingOrders,
        readyOrders,
        deliveringOrders,
        deliveredOrders,
        totalRiders,
        totalVendors,
        recentOrders,
      ] = await Promise.all([
        prisma.order.count().catch(() => 0),
        prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),
        prisma.order.count({ where: { status: "READY_FOR_PICKUP" } }).catch(() => 0),
        prisma.order.count({ where: { status: "OUT_FOR_DELIVERY" } }).catch(() => 0),
        prisma.order.count({ where: { status: "DELIVERED" } }).catch(() => 0),
        prisma.deliveryRider.count().catch(() => 0),
        prisma.vendor.count().catch(() => 0),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: "desc" },
          select: { id: true, orderNumber: true, total: true, status: true, paymentMethod: true, createdAt: true },
        }).catch(() => []),
      ]);

      const totalRevenue = recentOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const memUsage = process.memoryUsage();

      const metrics = {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          readyForPickup: readyOrders,
          outForDelivery: deliveringOrders,
          delivered: deliveredOrders,
        },
        fleet: {
          totalRegistered: totalRiders,
          activeGpsOnline: activeCoords.length,
          currentlyDelivering: deliveringOrders,
          idleOnline: Math.max(0, activeCoords.length - deliveringOrders),
        },
        vendors: {
          total: totalVendors,
        },
        revenue: {
          sampleGmv: totalRevenue,
          currency: "BDT",
        },
        system: {
          uptimeSeconds: Math.floor(process.uptime()),
          heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
          rssMb: Math.round(memUsage.rss / 1024 / 1024),
          timestamp: new Date().toISOString(),
        },
      };

      cachedMetrics = metrics;
      metricsExpiresAt = now + 5000; // 5 seconds RAM cache

      reply.header("X-Cache", "MISS-FRESH");
      return reply.send({ success: true, data: metrics, cached: false });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/admin/riders — Full fleet status with live GPS
  fastify.get("/riders", async (_request, reply) => {
    try {
      const riders = await prisma.deliveryRider.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          vehicleType: true,
          status: true,
          kycStatus: true,
          isActive: true,
          balance: true,
          totalEarned: true,
          district: true,
          thana: true,
          assignments: {
            where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
            select: { id: true, orderId: true, status: true },
          },
        },
        take: 100,
      });

      const enriched = riders.map((r) => {
        const liveGps = getRiderLocation(r.id);
        return {
          ...r,
          balance: Number(r.balance),
          totalEarned: Number(r.totalEarned),
          activeDeliveriesCount: r.assignments.length,
          gps: liveGps ? {
            lat: liveGps.lat,
            lng: liveGps.lng,
            heading: liveGps.heading,
            speed: liveGps.speed,
            lastSeen: liveGps.updatedAt,
          } : null,
        };
      });

      return reply.send({ success: true, data: enriched, total: enriched.length });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/admin/riders/:id/approve-kyc — Instant KYC verification
  fastify.post("/riders/:id/approve-kyc", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updated = await prisma.deliveryRider.update({
        where: { id },
        data: {
          kycStatus: "APPROVED",
          kycApprovedAt: new Date(),
          isActive: true,
        },
      });

      liveBus.broadcast("SYSTEM_ALERT", {
        action: "RIDER_KYC_APPROVED",
        riderId: id,
        riderName: updated.name,
      });

      return reply.send({
        success: true,
        message: `রাইডার ${updated.name}-এর KYC সফলভাবে অনুমোদন করা হয়েছে।`,
        data: updated,
      });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/admin/vendors/:id/approve — Instant Vendor approval
  fastify.post("/vendors/:id/approve", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updated = await prisma.vendor.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          isActive: true,
        },
      });

      liveBus.broadcast("SYSTEM_ALERT", {
        action: "VENDOR_APPROVED",
        vendorId: id,
        vendorName: updated.businessName,
      });

      return reply.send({
        success: true,
        message: `ভেন্ডর ${updated.businessName} সফলভাবে অনুমোদন করা হয়েছে।`,
        data: updated,
      });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/admin/orders/:id/reassign — Supervisor reassigns order to a different rider
  fastify.post("/orders/:id/reassign", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { riderId } = (request.body || {}) as { riderId: string };

      if (!riderId) {
        return reply.status(400).send({ success: false, error: "riderId is required" });
      }

      const rider = await prisma.deliveryRider.findUnique({ where: { id: riderId } });
      if (!rider) {
        return reply.status(404).send({ success: false, error: "Rider not found" });
      }

      await prisma.$transaction([
        prisma.deliveryAssignment.upsert({
          where: { orderId: id },
          update: { riderId, status: "ASSIGNED", assignedAt: new Date() },
          create: { orderId: id, riderId, status: "ASSIGNED" },
        }),
        prisma.order.update({
          where: { id },
          data: { status: "OUT_FOR_DELIVERY" },
        }),
        prisma.deliveryRider.update({
          where: { id: riderId },
          data: { status: "BUSY" },
        }),
      ]);

      liveBus.broadcast("TASK_CLAIMED", {
        taskId: id,
        riderId,
        riderName: rider.name,
        reassignedByAdmin: true,
      });

      return reply.send({
        success: true,
        message: `অর্ডারটি সফলভাবে ${rider.name}-কে রি-অ্যাসাইন করা হয়েছে।`,
        assignedRider: { id: rider.id, name: rider.name, phone: rider.phone },
      });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
