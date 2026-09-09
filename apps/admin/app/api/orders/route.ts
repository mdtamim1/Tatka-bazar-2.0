import { NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (status && status !== "all" && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

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
        take: 100,
      }),
      prisma.order.count({ where }),
    ]);

    const formatted = orders.map((o: any) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      storeName: "Tatka Bazar",
      customerName: o.user?.name || "Customer",
      customerPhone: o.user?.phone || "",
      customerAddress: o.address ? `${o.address.line1}, ${o.address.area}, ${o.address.city}` : "",
      deliveryArea: o.address?.area || "Dhaka",
      deliverySlot: o.note?.includes("Slot:") ? o.note.split("Slot:")[1]?.split("|")[0]?.trim() : "Standard Delivery",
      totalAmount: Number(o.total),
      subtotalAmount: Number(o.subtotal),
      deliveryCharge: Number(o.deliveryFee),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status === "PENDING" ? "PENDING" : o.status === "PROCESSING" ? "PROCESSING" : o.status,
      createdAt: o.createdAt.toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      }),
      assignedModerator: "Super Admin (Default)",
      assignedRiderId: o.deliveryAssignment?.riderId || undefined,
      assignedRiderName: o.deliveryAssignment?.rider ? `${o.deliveryAssignment.rider.name} (${o.deliveryAssignment.rider.vehicleType})` : undefined,
      source: "STOREFRONT",
      items: o.items.map((it: any) => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity,
        price: Number(it.price),
        sku: it.product?.sku || "TB-GEN-01",
        size: "Standard",
      })),
      subOrders: [],
      orderHistory: [
        {
          id: `hist-init-${o.id}`,
          timestamp: o.createdAt.toLocaleDateString("en-GB", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
          }),
          actorName: o.user?.name || "Customer",
          actorRole: "CUSTOMER",
          action: "ORDER_PLACED",
          details: `Order #${o.orderNumber} placed from storefront checkout.`,
        },
      ],
    }));

    return NextResponse.json({ success: true, data: formatted, total });
  } catch (err: any) {
    console.error("Admin API orders error:", err);
    return NextResponse.json({ success: false, error: err.message, data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      deliveryArea,
      deliverySlot,
      paymentMethod,
      items,
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
        line1: customerAddress || "Address Provided at Checkout",
        area: deliveryArea || "Dhaka",
        city: "Dhaka",
        isDefault: true,
      },
    });

    // 3. Compute totals
    const subtotal = items && items.length > 0
      ? items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0)
      : Number(body.totalAmount) || 0;

    const deliveryFee = body.deliveryFee !== undefined ? Number(body.deliveryFee) : 60;
    const discount = body.discount ? Number(body.discount) : 0;
    const total = Math.max(0, subtotal + deliveryFee - discount);
    const orderNumber = "TB-" + Math.floor(100000 + Math.random() * 900000);

    // 3b. Resolve product IDs with catalog fallback
    const defaultProd = await prisma.product.findFirst({ select: { id: true } });
    const resolvedItems = items && items.length > 0
      ? await Promise.all(items.map(async (it: any) => {
          let pId = it.productId;
          if (pId) {
            try {
              const matched = await prisma.product.findUnique({
                where: { id: pId },
                select: { id: true, vendorId: true },
              });
              if (matched) pId = matched.id;
              else pId = defaultProd?.id;
            } catch {
              pId = defaultProd?.id;
            }
          } else {
            try {
              const matched = await prisma.product.findFirst({
                where: { name: { contains: it.name, mode: "insensitive" } },
                select: { id: true, vendorId: true },
              });
              pId = matched?.id || defaultProd?.id;
            } catch {
              pId = defaultProd?.id;
            }
          }
          return {
            productId: pId || user.id,
            name: it.name,
            price: Number(it.price),
            quantity: Number(it.quantity) || 1,
            total: Number(it.price) * (Number(it.quantity) || 1),
            vendorId: it.vendorId || null,
          };
        }))
      : [];

    // 4. Create Order in PostgreSQL Database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        addressId: address.id,
        status: "PENDING",
        paymentMethod: paymentMethod === "CASH_ON_DELIVERY" ? "COD" : paymentMethod || "COD",
        paymentStatus: body.paymentStatus || (paymentMethod === "COD" ? "PENDING" : "PAID"),
        subtotal,
        deliveryFee,
        discount,
        total,
        note: `Slot: ${deliverySlot || "Standard Delivery"} | ${body.internalNotes || ""}`.trim(),
      },
    });

    // 5. Create Order Items
    if (resolvedItems.length > 0) {
      await prisma.orderItem.createMany({
        data: resolvedItems.map((it: any) => ({
          orderId: order.id,
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          total: it.total,
          vendorId: it.vendorId,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
      },
    });
  } catch (err: any) {
    console.error("Create order error in admin Next.js API:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
