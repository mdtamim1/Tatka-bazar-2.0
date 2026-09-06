import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";

const inMemoryTasks: any[] = [];

export async function dispatchRoutes(fastify: FastifyInstance) {
  // GET /api/dispatch/tasks — Get pending available tasks
  fastify.get("/tasks", async (_request, reply) => {
    try {
      // 1. Fetch from Prisma if available
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
          take: 20,
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
        // DB not reachable or table empty
      }

      // Merge with in-memory tasks (avoid duplicate IDs)
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

  // POST /api/dispatch/ready-for-pickup — Push ready order from Vendor
  fastify.post("/ready-for-pickup", async (request, reply) => {
    try {
      const body = request.body as any;
      const taskData = body.task || body;

      if (!taskData.id) {
        return reply.status(400).send({ success: false, error: "Order id is required" });
      }

      const newTask = {
        id: taskData.id,
        orderNumber: taskData.orderNumber || taskData.displayId || `TB-${taskData.id.replace(/\D/g, "") || "9000"}`,
        customerName: taskData.customerName || "সম্মানিত গ্রাহক",
        customerPhone: taskData.customerPhone || "01729-458921",
        deliveryAddress: taskData.deliveryAddress || `${taskData.deliveryZone || "ঢাকা জোন"}, ঢাকা`,
        vendorName: taskData.vendorName || "Tatka Vendor Partner",
        itemCount: taskData.itemCount || (Array.isArray(taskData.items) ? taskData.items.length : 2),
        subtotal: Number(taskData.subtotal) || Number(taskData.grossTotal) || 1200,
        deliveryFee: Number(taskData.deliveryFee) || 60,
        total: Number(taskData.total) || Number(taskData.grossTotal) || 1260,
        earnings: Number(taskData.earnings) || 50,
        paymentStatus: taskData.paymentStatus || "COD",
        paymentMethod: taskData.paymentMethod || "CASH_ON_DELIVERY",
        items: Array.isArray(taskData.items) ? taskData.items : [],
        createdAt: taskData.createdAt || new Date().toISOString(),
        status: "READY_FOR_PICKUP",
        claimed: false,
        claimedBy: null,
      };

      // Try updating in DB if exists
      try {
        await prisma.order.update({
          where: { id: taskData.id },
          data: { status: "READY_FOR_PICKUP" },
        });
      } catch {}

      const idx = inMemoryTasks.findIndex((t) => t.id === newTask.id);
      if (idx >= 0) {
        inMemoryTasks[idx] = newTask;
      } else {
        inMemoryTasks.unshift(newTask);
      }

      return reply.send({
        success: true,
        message: `অর্ডার #${newTask.orderNumber} সফলভাবে রাইডার ডিসপ্যাচ লাইনে যুক্ত হয়েছে!`,
        task: newTask,
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/dispatch/tasks/:id/claim — Rider accepts the order
  fastify.post("/tasks/:id/claim", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = (request.body || {}) as any;
      const riderId = body.riderId || "rider-demo-01";
      const riderName = body.riderName || "রাইডার";

      // DB update if exists
      try {
        await prisma.$transaction([
          prisma.order.update({ where: { id }, data: { status: "OUT_FOR_DELIVERY" } }),
          prisma.deliveryAssignment.create({ data: { orderId: id, riderId, status: "ASSIGNED" } }),
        ]);
      } catch {}

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
}
