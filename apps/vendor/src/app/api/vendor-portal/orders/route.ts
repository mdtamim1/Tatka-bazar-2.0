import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "লগইন প্রয়োজন।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const payload = verifyVendorToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Query real PostgreSQL database for orders belonging to this vendor or general queue
    const dbOrders = await prisma.order.findMany({
      where: {
        OR: [
          { items: { some: { vendorId: payload.sub } } },
          { items: { some: { vendorId: null } } },
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        address: true,
        deliveryAssignment: {
          include: {
            rider: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    const mappedOrders = dbOrders.map((ord) => {
      // Map OrderStatus
      let mappedStatus: "PENDING" | "PROCESSING" | "READY_FOR_PICKUP" | "HANDED_TO_RIDER" | "COMPLETED" | "RETURNED" = "PENDING";
      switch (ord.status) {
        case "PENDING":
          mappedStatus = "PENDING";
          break;
        case "CONFIRMED":
        case "PREPARING":
          mappedStatus = "PROCESSING";
          break;
        case "READY_FOR_PICKUP":
          mappedStatus = "READY_FOR_PICKUP";
          break;
        case "OUT_FOR_DELIVERY":
          mappedStatus = "HANDED_TO_RIDER";
          break;
        case "DELIVERED":
          mappedStatus = "COMPLETED";
          break;
        case "REFUNDED":
          mappedStatus = "RETURNED";
          break;
        default:
          mappedStatus = "PENDING";
      }

      const items = ord.items.map((it) => {
        const isWeight = it.name.includes("কেজি") || it.name.includes("kg") || it.name.includes("মাছ") || it.name.includes("মাংস");
        return {
          id: it.id,
          productId: it.productId,
          productName: it.name,
          productNameBn: it.name,
          category: "GROCERY" as any,
          pricingType: isWeight ? ("WEIGHT_BASED" as const) : ("FIXED" as const),
          unit: isWeight ? ("KG" as const) : ("PACK" as const),
          unitPrice: Number(it.price),
          quantity: it.quantity,
          weightOrdered: isWeight ? it.quantity * 1.0 : undefined,
          weightActual: isWeight ? it.quantity * 1.0 : undefined,
          finalPrice: Number(it.total),
          packed: mappedStatus !== "PENDING",
        };
      });

      const gross = Number(ord.total);
      const net = Math.round(gross * 0.9); // 10% platform commission

      return {
        id: ord.id,
        displayId: ord.orderNumber,
        customerName: ord.user.name || "গ্রাহক",
        customerPhone: ord.user.phone || "01700000000",
        customerAddress: ord.address ? `${ord.address.line1}, ${ord.address.area}, ${ord.address.city}` : "ঢাকা, বাংলাদেশ",
        deliveryZone: ord.address?.area || ord.address?.city || "ঢাকা জোন",
        createdAt: ord.createdAt.toISOString(),
        status: mappedStatus,
        items,
        grossTotal: gross,
        netTotal: net,
        paymentMethod: ord.paymentMethod,
        urgent: false,
        notes: ord.note || undefined,
        riderName: ord.deliveryAssignment?.rider.name || undefined,
        riderPhone: ord.deliveryAssignment?.rider.phone || undefined,
        riderVehicle: ord.deliveryAssignment?.rider.vehicleType || undefined,
      };
    });

    return NextResponse.json(
      { success: true, data: mappedOrders },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Vendor Portal Orders Error]:", err);
    return NextResponse.json(
      { success: false, error: "অর্ডার তালিকা লোড করা সম্ভব হয়নি।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const payload = verifyVendorToken(token);

    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const { orderId, status, itemId, actualWeight } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "অর্ডার আইডি অনুপস্থিত।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Map vendor status back to Prisma OrderStatus
    let dbStatus: "PENDING" | "CONFIRMED" | "PREPARING" | "READY_FOR_PICKUP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "REFUNDED" | undefined;
    if (status === "PROCESSING" || status === "PREPARING") dbStatus = "PREPARING";
    else if (status === "READY_FOR_PICKUP") dbStatus = "READY_FOR_PICKUP";
    else if (status === "COMPLETED") dbStatus = "DELIVERED";
    else if (status === "RETURNED") dbStatus = "REFUNDED";

    if (dbStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: dbStatus },
      });
    }

    // If actual weight provided, update order item
    if (itemId && actualWeight) {
      const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
      if (item) {
        const newTotal = Number(item.price) * Number(actualWeight);
        await prisma.orderItem.update({
          where: { id: itemId },
          data: { total: newTotal },
        });
      }
    }

    return NextResponse.json(
      { success: true, message: "অর্ডার স্ট্যাটাস ডাটাবেজে হালনাগাদ করা হয়েছে।" },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Vendor Update Order Error]:", err);
    return NextResponse.json(
      { success: false, error: "অর্ডার হালনাগাদ ব্যর্থ হয়েছে।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
