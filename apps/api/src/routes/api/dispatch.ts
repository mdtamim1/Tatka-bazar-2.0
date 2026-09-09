import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";

// In-memory fallback for tasks not yet in DB (backward compat)
const inMemoryTasks: any[] = [];

export async function dispatchRoutes(fastify: FastifyInstance) {
  // GET /api/dispatch/tasks — Get pending available tasks (for Hub dispatch view)
  fastify.get("/tasks", async (_request, reply) => {
    try {
      let dbTasks: any[] = [];
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
          orderBy: { createdAt: "desc" },
          take: 50,
        });

        dbTasks = orders.map((o) => {
          const deliveryFee = Number(o.deliveryFee) || 60;
          const earnings = deliveryFee > 0 ? Math.round(deliveryFee * 0.5) : 50;
          return {
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.user.name,
            customerPhone: o.user.phone,
            deliveryAddress: `${o.address?.line1 || ""}, ${o.address?.area || ""}, ${o.address?.city || "ঢাকা"}`,
            vendorName: o.items[0]?.vendor?.businessName ?? "Tatka Bazar",
            itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
            subtotal: Number(o.subtotal),
            deliveryFee,
            total: Number(o.total),
            earnings,
            paymentStatus: o.paymentStatus,
            paymentMethod: o.paymentMethod,
            items: o.items.map((i) => ({ name: i.name, qty: i.quantity, price: Number(i.price), total: Number(i.total) })),
            createdAt: o.createdAt.toISOString(),
            status: "READY_FOR_PICKUP",
            claimed: false,
          };
        });
      } catch {
        // DB not reachable
      }

      const allTasks = [...inMemoryTasks.filter((t) => !t.claimed && t.status === "READY_FOR_PICKUP")];
      for (const d of dbTasks) {
        if (!allTasks.some((t) => t.id === d.id || t.orderNumber === d.orderNumber)) {
          allTasks.push(d);
        }
      }

      return reply.send({ success: true, data: allTasks, total: allTasks.length });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/dispatch/ready-for-pickup — Vendor marks order ready
  // Smart rider dispatch: pushes to riders assigned to vendor, prioritized by load
  fastify.post("/ready-for-pickup", async (request, reply) => {
    try {
      const body = request.body as any;
      const taskData = body.task || body;

      if (!taskData.id) {
        return reply.status(400).send({ success: false, error: "Order id is required" });
      }

      // Update order status in DB
      try {
        await prisma.order.update({
          where: { id: taskData.id },
          data: { status: "READY_FOR_PICKUP" },
        });
      } catch { /* order may not be in DB yet */ }

      // Find the vendor for this order
      let vendorIds: string[] = [];
      try {
        const order = await prisma.order.findUnique({
          where: { id: taskData.id },
          include: { items: { select: { vendorId: true } } },
        });
        if (order) {
          vendorIds = [...new Set(order.items.map(i => i.vendorId).filter(Boolean))] as string[];
        }
      } catch { /* ignore */ }

      // Get all riders assigned to those vendors, sorted by priority (least busy first)
      let eligibleRiders: any[] = [];
      if (vendorIds.length > 0) {
        try {
          const assignments = await prisma.vendorRiderAssignment.findMany({
            where: { vendorId: { in: vendorIds } },
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

          // De-duplicate by rider ID and only include KYC-approved, active riders
          const riderMap = new Map<string, any>();
          for (const a of assignments) {
            if (!riderMap.has(a.rider.id) && a.rider.kycStatus === "APPROVED" && a.rider.isActive) {
              riderMap.set(a.rider.id, a.rider);
            }
          }

          // Sort by priority: fewer active deliveries first
          eligibleRiders = [...riderMap.values()]
            .map(r => ({
              id: r.id,
              name: r.name,
              phone: r.phone,
              activeDeliveries: r.assignments.length,
            }))
            .sort((a, b) => a.activeDeliveries - b.activeDeliveries);
        } catch { /* ignore */ }
      }

      const newTask = {
        id: taskData.id,
        orderNumber: taskData.orderNumber || taskData.displayId || `TB-${taskData.id.replace(/\D/g, "") || "9000"}`,
        customerName: taskData.customerName || "সম্মানিত গ্রাহক",
        customerPhone: taskData.customerPhone || "",
        deliveryAddress: taskData.deliveryAddress || "",
        vendorName: taskData.vendorName || "Tatka Vendor Partner",
        itemCount: taskData.itemCount || (Array.isArray(taskData.items) ? taskData.items.length : 1),
        subtotal: Number(taskData.subtotal) || Number(taskData.grossTotal) || 0,
        deliveryFee: Number(taskData.deliveryFee) || 60,
        total: Number(taskData.total) || Number(taskData.grossTotal) || 0,
        earnings: Number(taskData.earnings) || 50,
        paymentStatus: taskData.paymentStatus || "COD",
        paymentMethod: taskData.paymentMethod || "CASH_ON_DELIVERY",
        items: Array.isArray(taskData.items) ? taskData.items : [],
        createdAt: taskData.createdAt || new Date().toISOString(),
        status: "READY_FOR_PICKUP",
        claimed: false,
        claimedBy: null,
        // Eligible riders sorted by priority for this order
        eligibleRiders,
      };

      const idx = inMemoryTasks.findIndex((t) => t.id === newTask.id);
      if (idx >= 0) {
        inMemoryTasks[idx] = newTask;
      } else {
        inMemoryTasks.unshift(newTask);
      }

      return reply.send({
        success: true,
        message: `অর্ডার #${newTask.orderNumber} সফলভাবে রাইডার ডিসপ্যাচ লাইনে যুক্ত হয়েছে!`,
        task: newTask,
        eligibleRidersCount: eligibleRiders.length,
        topRider: eligibleRiders[0] || null,
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/dispatch/tasks/:id/claim — Rider accepts the order (atomic lock)
  fastify.post("/tasks/:id/claim", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = (request.body || {}) as any;
      const riderId = body.riderId || "rider-demo-01";
      const riderName = body.riderName || "রাইডার";

      // Check if already claimed (atomic check in DB)
      try {
        const order = await prisma.order.findUnique({
          where: { id },
          include: { deliveryAssignment: true },
        });

        if (order?.deliveryAssignment) {
          return reply.status(409).send({
            success: false,
            error: "অর্ডারটি ইতিমধ্যে অন্য রাইডার গ্রহণ করেছেন।",
            alreadyAccepted: true,
          });
        }

        await prisma.$transaction([
          prisma.order.update({ where: { id }, data: { status: "OUT_FOR_DELIVERY" } }),
          prisma.deliveryAssignment.create({ data: { orderId: id, riderId, status: "ASSIGNED" } }),
          prisma.deliveryRider.update({ where: { id: riderId }, data: { status: "BUSY" } }),
        ]);
      } catch (txErr: any) {
        // If constraint violation, another rider took it
        if (txErr?.code === "P2002") {
          return reply.status(409).send({
            success: false,
            error: "অর্ডারটি ইতিমধ্যে অন্য রাইডার গ্রহণ করেছেন।",
            alreadyAccepted: true,
          });
        }
      }

      // Mark in-memory task as claimed
      const idx = inMemoryTasks.findIndex((t) => t.id === id || t.orderNumber === id);
      if (idx !== -1) {
        inMemoryTasks[idx].claimed = true;
        inMemoryTasks[idx].claimedBy = { riderId, riderName, claimedAt: new Date().toISOString() };
        inMemoryTasks[idx].status = "ASSIGNED";
        return reply.send({ success: true, task: inMemoryTasks[idx] });
      }

      return reply.send({ success: true, message: "Order claimed", riderId });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/dispatch/tasks/batch-claim — Rider collects multiple orders at once
  // Max 5 orders per batch to ensure fair distribution
  fastify.post("/tasks/batch-claim", async (request, reply) => {
    try {
      const body = (request.body || {}) as { riderId: string; riderName?: string; orderIds: string[] };
      const { riderId, riderName = "রাইডার", orderIds } = body;

      if (!riderId || !orderIds || orderIds.length === 0) {
        return reply.status(400).send({ success: false, error: "riderId and orderIds are required" });
      }

      const MAX_BATCH = 5;
      if (orderIds.length > MAX_BATCH) {
        return reply.status(400).send({
          success: false,
          error: `একসাথে সর্বোচ্চ ${MAX_BATCH}টি অর্ডার নেওয়া যাবে।`,
        });
      }

      // Check how many orders this rider already has active
      const currentActive = await prisma.deliveryAssignment.count({
        where: { riderId, status: { in: ["ASSIGNED", "PICKED_UP"] } },
      });

      if (currentActive + orderIds.length > MAX_BATCH) {
        return reply.status(400).send({
          success: false,
          error: `আপনার কাছে ইতিমধ্যে ${currentActive}টি সক্রিয় ডেলিভারি আছে। আরও ${MAX_BATCH - currentActive}টি নিতে পারবেন।`,
          currentActive,
          canTakeMore: MAX_BATCH - currentActive,
        });
      }

      const results: { orderId: string; success: boolean; error?: string }[] = [];

      for (const orderId of orderIds) {
        try {
          // Check if order is still available
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { deliveryAssignment: true },
          });

          if (!order || order.status !== "READY_FOR_PICKUP" || order.deliveryAssignment) {
            results.push({ orderId, success: false, error: "Already taken or not available" });
            continue;
          }

          await prisma.$transaction([
            prisma.order.update({ where: { id: orderId }, data: { status: "OUT_FOR_DELIVERY" } }),
            prisma.deliveryAssignment.create({ data: { orderId, riderId, status: "ASSIGNED" } }),
          ]);

          // Mark in-memory task
          const idx = inMemoryTasks.findIndex(t => t.id === orderId);
          if (idx !== -1) {
            inMemoryTasks[idx].claimed = true;
            inMemoryTasks[idx].claimedBy = { riderId, riderName, claimedAt: new Date().toISOString() };
            inMemoryTasks[idx].status = "ASSIGNED";
          }

          results.push({ orderId, success: true });
        } catch {
          results.push({ orderId, success: false, error: "Conflict or DB error" });
        }
      }

      // Update rider status to BUSY if any was claimed
      const claimed = results.filter(r => r.success);
      if (claimed.length > 0) {
        try {
          await prisma.deliveryRider.update({ where: { id: riderId }, data: { status: "BUSY" } });
        } catch { /* ignore */ }
      }

      return reply.send({
        success: true,
        claimedCount: claimed.length,
        results,
        message: `${claimed.length}টি অর্ডার সফলভাবে গ্রহণ করা হয়েছে।`,
      });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
