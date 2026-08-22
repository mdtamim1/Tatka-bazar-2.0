import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { catalogCache } from "../../services/cache/memory-cache.js";

export async function orderRoutes(fastify: FastifyInstance) {
  // GET /api/orders — list orders with status, rider, search filters
  fastify.get("/", async (request, reply) => {
    try {
      const query = request.query as {
        status?: string;
        paymentStatus?: string;
        riderId?: string;
        search?: string;
        limit?: string;
        page?: string;
      };

      const where: any = {};

      if (query.status && query.status !== "all") {
        where.status = query.status;
      }
      if (query.paymentStatus) {
        where.paymentStatus = query.paymentStatus;
      }
      if (query.riderId) {
        where.deliveryAssignment = { riderId: query.riderId };
      }
      if (query.search) {
        where.OR = [
          { orderNumber: { contains: query.search, mode: "insensitive" } },
          { user: { name: { contains: query.search, mode: "insensitive" } } },
          { user: { phone: { contains: query.search, mode: "insensitive" } } },
        ];
      }

      const take = query.limit ? Math.min(Number(query.limit), 100) : 50;
      const skip = query.page ? (Number(query.page) - 1) * take : 0;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } },
            address: true,
            items: {
              include: {
                product: { select: { id: true, name: true, sku: true } },
                vendor: { select: { id: true, businessName: true } },
              },
            },
            deliveryAssignment: {
              include: {
                rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take,
          skip,
        }),
        prisma.order.count({ where }),
      ]);

      // Transform into unified format for Frontend Admin / Storefront
      const formatted = orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.user?.name || "Customer",
        customerPhone: o.user?.phone || "",
        customerAddress: o.address ? `${o.address.line1}, ${o.address.area}, ${o.address.city}` : "",
        deliveryArea: o.address?.area || "Dhaka",
        deliverySlot: o.note?.includes("Slot:") ? o.note.split("Slot:")[1]?.split("|")[0]?.trim() : "Standard Delivery",
        totalAmount: Number(o.total),
        subtotal: Number(o.subtotal),
        deliveryFee: Number(o.deliveryFee),
        discount: Number(o.discount),
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        status: o.status,
        createdAt: o.createdAt.toLocaleDateString("en-GB", {
          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        }),
        assignedRiderId: o.deliveryAssignment?.riderId || undefined,
        assignedRiderName: o.deliveryAssignment?.rider ? `${o.deliveryAssignment.rider.name} (${o.deliveryAssignment.rider.vehicleType})` : undefined,
        internalNotes: o.note || undefined,
        items: o.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          name: it.name,
          price: Number(it.price),
          quantity: it.quantity,
          total: Number(it.total),
          vendorName: it.vendor?.businessName || "Tatka Bazar Direct",
        })),
        subOrders: o.items.reduce((acc: any[], it) => {
          const vName = it.vendor?.businessName || "Tatka Bazar Direct";
          const existing = acc.find(s => s.vendorName === vName);
          if (existing) {
            existing.itemsCount += it.quantity;
            existing.subtotal += Number(it.total);
          } else {
            acc.push({
              id: `sub-${it.id.slice(0, 6)}`,
              vendorId: it.vendorId || "tatka-direct",
              vendorName: vName,
              itemsCount: it.quantity,
              subtotal: Number(it.total),
              status: o.status,
            });
          }
          return acc;
        }, []),
      }));

      return reply.send({
        success: true,
        data: formatted,
        meta: { total, page: Number(query.page) || 1, limit: take },
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/orders/:id — get single order
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const o = await prisma.order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }] },
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          address: true,
          items: {
            include: {
              product: true,
              vendor: { select: { id: true, businessName: true } },
            },
          },
          deliveryAssignment: {
            include: {
              rider: { select: { id: true, name: true, phone: true, vehicleType: true } },
            },
          },
        },
      });

      if (!o) {
        return reply.status(404).send({ success: false, error: "Order not found" });
      }

      return reply.send({ success: true, data: o });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/orders — create new order (from storefront checkout or admin)
  fastify.post("/", async (request, reply) => {
    try {
      const body = request.body as {
        customerName: string;
        customerPhone: string;
        customerEmail?: string;
        customerAddress: string;
        deliveryArea: string;
        deliverySlot?: string;
        paymentMethod: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD";
        paymentStatus?: "PENDING" | "PAID" | "UNPAID";
        items: {
          productId?: string;
          name: string;
          price: number;
          quantity: number;
          unit?: string;
          vendorId?: string;
        }[];
        totalAmount?: number;
        deliveryFee?: number;
        discount?: number;
        internalNotes?: string;
      };

      const {
        customerName, customerPhone, customerEmail,
        customerAddress, deliveryArea, deliverySlot,
        paymentMethod, items,
      } = body;

      // 1. Find or create guest user
      const user = await prisma.user.upsert({
        where: { phone: customerPhone },
        update: { name: customerName },
        create: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail || `customer_${customerPhone.replace(/[^0-9]/g, "")}@tatkabazar.com`,
          passwordHash: "GUEST_CHECKOUT_ACCOUNT",
          isVerified: true,
        },
      });

      // 2. Create address
      const address = await prisma.address.create({
        data: {
          userId: user.id,
          label: "Delivery Address",
          line1: customerAddress,
          area: deliveryArea || "Dhaka",
          city: "Dhaka",
          isDefault: true,
        },
      });

      // 3. Compute totals
      const subtotal = items && items.length > 0
        ? items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
        : Number(body.totalAmount) || 0;
      const deliveryFee = Number(body.deliveryFee) || (subtotal > 1000 ? 0 : 50);
      const discount = Number(body.discount) || 0;
      const total = subtotal + deliveryFee - discount;

      const orderNumber = `TB-${Math.floor(100000 + Math.random() * 900000)}`;

      // 3.5 Resolve real product IDs for foreign key integrity
      const defaultProd = await prisma.product.findFirst();
      const resolvedItems = items && items.length > 0
        ? await Promise.all(items.map(async (it) => {
            let pId = it.productId;
            if (!pId || pId.startsWith("prod-")) {
              const matched = await prisma.product.findFirst({
                where: { OR: [{ name: { contains: it.name, mode: "insensitive" } }, { slug: { contains: it.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), mode: "insensitive" } }] },
                select: { id: true, vendorId: true },
              });
              pId = matched?.id || defaultProd?.id || user.id;
            }
            return {
              productId: pId,
              name: it.name,
              price: Number(it.price),
              quantity: Number(it.quantity) || 1,
              total: Number(it.price) * (Number(it.quantity) || 1),
              vendorId: it.vendorId || null,
            };
          }))
        : [];

      // 4. Create Order & Atomically Decrement Inventory in Transaction
      const order = await prisma.$transaction(async (tx) => {
        // Atomic stock decrement for each ordered product
        for (const item of resolvedItems) {
          if (item.productId && item.quantity > 0) {
            const decrementResult = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: { gte: item.quantity }, // Guarantees stock is sufficient
              },
              data: {
                stock: { decrement: item.quantity }, // Atomic decrement in PostgreSQL
              },
            });

            // If count === 0, another concurrent customer bought the last unit
            if (decrementResult.count === 0) {
              const currentProd = await tx.product.findUnique({ where: { id: item.productId } });
              const availableStock = currentProd?.stock || 0;
              throw new Error(
                `স্টক শেষ: "${item.name}" পর্যাপ্ত পরিমাণে নেই। (বর্তমান স্টক: ${availableStock} টি)`
              );
            }
          }
        }

        // Create Order and line items
        return tx.order.create({
          data: {
            orderNumber,
            userId: user.id,
            addressId: address.id,
            status: "PENDING",
            paymentStatus: body.paymentStatus === "PAID" ? "PAID" : "PENDING",
            paymentMethod: paymentMethod || "COD",
            subtotal,
            deliveryFee,
            discount,
            total,
            note: `Slot: ${deliverySlot || "Standard"} | Notes: ${body.internalNotes || "None"}`,
            items: resolvedItems.length > 0 ? {
              create: resolvedItems,
            } : undefined,
          },
          include: {
            user: { select: { id: true, name: true, phone: true } },
            address: true,
            items: true,
          },
        });
      });

      // Invalidate catalog cache so updated stocks reflect immediately
      catalogCache.invalidate("products");

      return reply.status(201).send({
        success: true,
        data: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: Number(order.total),
          status: order.status,
          customerName: order.user.name,
          customerPhone: order.user.phone,
        },
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/orders/:id — update status, rider assignment, notes
  fastify.patch("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as {
        status?: any;
        paymentStatus?: any;
        assignedRiderId?: string;
        customerAddress?: string;
        deliverySlot?: string;
        internalNotes?: string;
      };

      // 1. If assignedRiderId is provided, upsert DeliveryAssignment
      if (body.assignedRiderId) {
        await prisma.deliveryAssignment.upsert({
          where: { orderId: id },
          update: { riderId: body.assignedRiderId, status: "ASSIGNED" },
          create: { orderId: id, riderId: body.assignedRiderId, status: "ASSIGNED" },
        });
      }

      // 2. Update order details
      const updateData: any = {};
      if (body.status) updateData.status = body.status;
      if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
      if (body.internalNotes || body.deliverySlot) {
        updateData.note = `Slot: ${body.deliverySlot || "Standard"} | Notes: ${body.internalNotes || ""}`;
      }

      const updated = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          user: true,
          address: true,
          deliveryAssignment: { include: { rider: true } },
        },
      });

      return reply.send({ success: true, data: updated });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
