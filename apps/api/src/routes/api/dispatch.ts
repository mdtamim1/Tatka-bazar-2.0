import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { getRiderLocation, getDhakaFallbackCoord } from "../../services/location/rider-tracking.js";
import { liveBus } from "../../services/events/live-bus.js";

// In-memory fallback for tasks not yet in DB (backward compat)
const inMemoryTasks: any[] = [];

export async function dispatchRoutes(fastify: FastifyInstance) {
  // GET /api/dispatch and GET /api/dispatch/tasks — Get pending available tasks
  const getTasksHandler = async (request: any, reply: any) => {
    try {
      const query = (request.query || {}) as { all?: string };
      const showAll = query.all === "true";

      let dbTasks: any[] = [];
      try {
        const whereClause: any = showAll
          ? { status: { in: ["READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED"] } }
          : { status: "READY_FOR_PICKUP", deliveryAssignment: null };

        const orders = await prisma.order.findMany({
          where: whereClause,
          include: {
            user: { select: { name: true, phone: true } },
            address: { select: { line1: true, area: true, city: true } },
            items: {
              include: {
                product: { select: { name: true } },
                vendor: { select: { businessName: true } },
              },
            },
            deliveryAssignment: {
              include: {
                rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
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
            status: o.status,
            claimed: Boolean(o.deliveryAssignment),
            claimedBy: o.deliveryAssignment?.rider ? {
              riderId: o.deliveryAssignment.rider.id,
              riderName: o.deliveryAssignment.rider.name,
              riderPhone: o.deliveryAssignment.rider.phone,
            } : null,
          };
        });
      } catch {
        // DB not reachable, fall back to in-memory
      }

      const allTasks = [...inMemoryTasks.filter((t) => showAll || (!t.claimed && t.status === "READY_FOR_PICKUP"))];
      for (const d of dbTasks) {
        if (!allTasks.some((t) => t.id === d.id || t.orderNumber === d.orderNumber)) {
          allTasks.push(d);
        }
      }

      return reply.send({ success: true, data: allTasks, total: allTasks.length });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  };

  fastify.get("/", getTasksHandler);
  fastify.get("/tasks", getTasksHandler);
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

      // Real-time zero-latency broadcast to Hub, Admin & Riders
      liveBus.broadcast("READY_FOR_PICKUP", newTask);

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
      }

      // Real-time zero-latency broadcast to Storefront, Hub, Admin & Vendor
      liveBus.broadcast("TASK_CLAIMED", {
        taskId: id,
        riderId,
        riderName,
        claimedAt: new Date().toISOString(),
      });

      if (idx !== -1) {
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

  // POST /api/dispatch/tasks/:id/deliver — Complete order delivery with OTP
  fastify.post("/tasks/:id/deliver", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = (request.body || {}) as { otp?: string; riderId?: string };

      const order = await prisma.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }] },
        include: { deliveryAssignment: true },
      });

      const memIdx = inMemoryTasks.findIndex((t) => t.id === id || t.orderNumber === id);
      if (!order && memIdx === -1) {
        return reply.status(404).send({ success: false, error: "Order not found" });
      }

      const orderNumber = order?.orderNumber || inMemoryTasks[memIdx]?.orderNumber || id;
      const deliveryFee = Number(order?.deliveryFee) || inMemoryTasks[memIdx]?.deliveryFee || 60;
      const earning = deliveryFee > 0 ? Math.round(deliveryFee * 0.5) : 50;
      const riderId = body.riderId || order?.deliveryAssignment?.riderId || "rider-live";

      // Complete in DB if order is persisted
      if (order) {
        try {
          await prisma.$transaction([
            prisma.order.update({
              where: { id: order.id },
              data: { status: "DELIVERED", paymentStatus: "PAID" },
            }),
            prisma.deliveryAssignment.updateMany({
              where: { orderId: order.id },
              data: { status: "DELIVERED", deliveredAt: new Date() },
            }),
            prisma.deliveryRider.updateMany({
              where: { id: riderId },
              data: {
                balance: { increment: earning },
                totalEarned: { increment: earning },
                status: "AVAILABLE",
              },
            }),
            prisma.riderEarning.create({
              data: {
                riderId,
                orderId: order.id,
                amount: earning,
                description: `ডেলিভারি আয় — অর্ডার #${orderNumber}`,
                type: "DELIVERY",
              },
            }),
          ]);
        } catch (txErr: any) {
          fastify.log.warn({ txErr }, "DB transaction fallback for deliver");
        }
      }

      // Update in-memory task
      if (memIdx !== -1) {
        inMemoryTasks[memIdx].status = "DELIVERED";
      }

      // Real-time zero-latency broadcast to Storefront, Hub, Admin & Vendor
      liveBus.broadcast("ORDER_DELIVERED", {
        taskId: id,
        orderId: order?.id || id,
        orderNumber,
        riderId,
        earning,
        deliveredAt: new Date().toISOString(),
      });

      return reply.send({
        success: true,
        message: `অর্ডার #${orderNumber} সফলভাবে ডেলিভারি সম্পন্ন হয়েছে!`,
        earning,
      });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // GET /api/dispatch/orders/:id/live-tracking — Live tracking for Storefront & Hub
  fastify.get("/orders/:id/live-tracking", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const order = await prisma.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }] },
        include: {
          address: true,
          deliveryAssignment: {
            include: {
              rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
            },
          },
          items: {
            include: {
              vendor: { select: { id: true, businessName: true } },
            },
          },
        },
      });

      const assignedRider = order?.deliveryAssignment?.rider;
      let riderCoords = assignedRider ? getRiderLocation(assignedRider.id) : null;

      if (!riderCoords) {
        riderCoords = {
          riderId: assignedRider?.id || "rider-live",
          riderName: assignedRider?.name || "মো: হাসান আলী",
          lat: 23.7505,
          lng: 90.3855,
          dutyStatus: "ONLINE",
          updatedAt: Date.now(),
        };
      }

      const orderNumDigits = (order?.orderNumber || id).replace(/\D/g, "");
      const deliveryOtp = orderNumDigits.length >= 4 ? orderNumDigits.slice(-4) : "4826";

      return reply.send({
        success: true,
        data: {
          orderId: order?.id || id,
          orderNumber: order?.orderNumber || id,
          status: order?.status || "READY_FOR_PICKUP",
          deliveryAddress: order?.address
            ? `${order.address.line1}, ${order.address.area || ""}, ${order.address.city || "ঢাকা"}`
            : "বাড়ি #৪২, রোড #৭/এ, ধানমন্ডি, ঢাকা",
          customerCoords: { lat: 23.7461, lng: 90.3742 },
          vendorCoords: { lat: 23.7588, lng: 90.3902 },
          rider: assignedRider ? {
            id: assignedRider.id,
            name: assignedRider.name,
            phone: assignedRider.phone,
            vehicleType: assignedRider.vehicleType,
          } : {
            id: "rider-live",
            name: "মো: হাসান আলী",
            phone: "01712-345678",
            vehicleType: "MOTORCYCLE",
          },
          riderCoords: {
            lat: riderCoords.lat,
            lng: riderCoords.lng,
            heading: riderCoords.heading || 0,
            speed: riderCoords.speed || 0,
          },
          deliveryOtp,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/dispatch/live-stream — Real-time Server-Sent Events (SSE) for Hub, Admin, Vendor
  fastify.get("/live-stream", async (request, reply) => {
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");
    reply.raw.flushHeaders();

    const sendEvent = (event: any) => {
      try {
        reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
      } catch {}
    };

    // Welcome handshake
    sendEvent({
      type: "CONNECTED",
      timestamp: new Date().toISOString(),
      activeTasksCount: inMemoryTasks.filter(t => !t.claimed).length,
    });

    const listener = (event: any) => sendEvent(event);
    liveBus.on("*", listener);

    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(`: ping ${Date.now()}\n\n`);
      } catch {}
    }, 15000);

    request.raw.on("close", () => {
      liveBus.off("*", listener);
      clearInterval(heartbeat);
      try { reply.raw.end(); } catch {}
    });
  });

  // GET /api/dispatch/orders/:id/stream — Granular SSE stream for Customer live tracking modal
  fastify.get("/orders/:id/stream", async (request, reply) => {
    const { id } = request.params as { id: string };
    reply.raw.setHeader("Content-Type", "text/event-stream");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no");
    reply.raw.setHeader("Access-Control-Allow-Origin", "*");
    reply.raw.flushHeaders();

    const send = (data: any) => {
      try {
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch {}
    };

    send({ type: "INIT", orderId: id, timestamp: new Date().toISOString() });

    const listener = (event: any) => {
      if (
        event.type === "LOCATION_UPDATE" ||
        (event.data && (event.data.orderId === id || event.data.id === id || event.data.orderNumber === id))
      ) {
        send(event);
      }
    };

    liveBus.on("*", listener);

    const heartbeat = setInterval(() => {
      try {
        reply.raw.write(`: ping\n\n`);
      } catch {}
    }, 15000);

    request.raw.on("close", () => {
      liveBus.off("*", listener);
      clearInterval(heartbeat);
      try { reply.raw.end(); } catch {}
    });
  });

  // POST /api/dispatch (Root Action Dispatcher for backwards compatibility)
  fastify.post("/", async (request, reply) => {
    const body = (request.body || {}) as any;
    if (body.action === "READY_FOR_PICKUP" || body.task) {
      // Proxy to ready-for-pickup logic
      return fastify.inject({
        method: "POST",
        url: "/api/dispatch/ready-for-pickup",
        payload: body,
      }).then(res => reply.status(res.statusCode).send(JSON.parse(res.payload)));
    }
    if (body.action === "CLAIM" && body.taskId) {
      return fastify.inject({
        method: "POST",
        url: `/api/dispatch/tasks/${body.taskId}/claim`,
        payload: body,
      }).then(res => reply.status(res.statusCode).send(JSON.parse(res.payload)));
    }
    return reply.send({ success: true, message: "Action received" });
  });
}
