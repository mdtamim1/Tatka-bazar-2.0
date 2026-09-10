import { NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

const globalScope = globalThis as unknown as {
  _tatka_admin_orders?: any[];
  _tatka_dispatch_tasks?: any[];
};

if (!globalScope._tatka_admin_orders) {
  globalScope._tatka_admin_orders = [];
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

function buildTrackingTimeline(order: any) {
  const status = (order.status || "PENDING").toUpperCase();
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString("bn-BD") : "অর্ডার প্লেস করা হয়েছে";
  const confirmedAt = order.confirmedAt ? new Date(order.confirmedAt).toLocaleString("bn-BD") : undefined;
  const vendorHandoverAt = order.vendorHandoverAt || undefined;
  const riderPhone = order.assignedRiderPhone || order.riderPhone || "";
  const riderName = order.assignedRiderName || "রাইডার";

  const isConfirmed = ["CONFIRMED", "PROCESSING", "VENDOR_ASSIGNED", "PREPARING", "READY_FOR_PICKUP", "ASSIGNED", "OUT_FOR_DELIVERY", "ON_THE_WAY", "DELIVERED"].includes(status);
  const isVendor = ["VENDOR_ASSIGNED", "PREPARING", "READY_FOR_PICKUP", "ASSIGNED", "OUT_FOR_DELIVERY", "ON_THE_WAY", "DELIVERED"].includes(status);
  const isRider = ["ASSIGNED", "OUT_FOR_DELIVERY", "ON_THE_WAY", "DELIVERED"].includes(status) || !!order.assignedRiderId;
  const isWay = ["OUT_FOR_DELIVERY", "ON_THE_WAY", "DELIVERED"].includes(status);
  const isDelivered = status === "DELIVERED";

  return [
    {
      key: "PLACED",
      title: "অর্ডার গ্রহণ করা হয়েছে (Order Placed)",
      subtitle: "কাস্টমার কর্তৃক অর্ডার সফলভাবে সাবমিট হয়েছে",
      time: createdAt,
      done: true,
      active: status === "PENDING",
      icon: "shopping-bag",
    },
    {
      key: "PROCESSING",
      title: "অ্যাডমিন প্যানেলে প্রসেসিং সম্পন্ন (Processing)",
      subtitle: isConfirmed ? "অ্যাডমিন অর্ডারটি যাচাই ও অনুমোদন করেছে" : "অ্যাডমিন যাচাইকরণের অপেক্ষায়",
      time: confirmedAt || (isConfirmed ? "অনুমোদিত" : "অপেক্ষমান"),
      done: isConfirmed,
      active: status === "PROCESSING" || status === "CONFIRMED",
      icon: "check-circle",
    },
    {
      key: "VENDOR_ASSIGNED",
      title: "ভেন্ডরের কাছে পাঠানো হয়েছে (Sent to Vendor)",
      subtitle: isVendor
        ? `ভেন্ডর (${order.assignedVendorName || "সবুজ খামার গ্রোসারি"}) পণ্য প্রস্তুত করছে`
        : "নিকটস্থ ভেন্ডরে প্রেরণের অপেক্ষায়",
      time: vendorHandoverAt || (isVendor ? "প্রস্তুত হচ্ছে" : "অপেক্ষমান"),
      done: isVendor,
      active: status === "VENDOR_ASSIGNED" || status === "PREPARING" || status === "READY_FOR_PICKUP",
      icon: "store",
    },
    {
      key: "RIDER_ASSIGNED",
      title: "রাইডার অ্যাসাইন করা হয়েছে (Rider Assigned)",
      subtitle: isRider
        ? `রাইডার ${riderName} ${riderPhone ? `(${riderPhone})` : ""} পার্সেল পিকআপের দায়িত্ব নিয়েছেন`
        : "রাইডার পিকআপের অপেক্ষায়",
      time: isRider ? "অ্যাসাইন সম্পন্ন" : "অপেক্ষমান",
      done: isRider,
      active: status === "ASSIGNED",
      icon: "bike",
    },
    {
      key: "ON_THE_WAY",
      title: "ডেলিভারির পথে (On The Way)",
      subtitle: isWay
        ? `রাইডার ${riderName} আপনার ঠিকানার দিকে রওনা হয়েছেন`
        : "রাইডার ডেলিভারির উদ্দেশ্যে রওনা দেওয়ার অপেক্ষায়",
      time: isWay ? "পথে আছে" : "অপেক্ষমান",
      done: isWay,
      active: status === "OUT_FOR_DELIVERY" || status === "ON_THE_WAY",
      icon: "truck",
    },
    {
      key: "DELIVERED",
      title: "অর্ডার সম্পন্ন (Delivered)",
      subtitle: isDelivered ? "পণ্য সফলভাবে কাস্টমারের কাছে পৌঁছে দেওয়া হয়েছে" : "ডেলিভারি সম্পন্ন হওয়ার অপেক্ষায়",
      time: isDelivered ? "ডেলিভারি সম্পন্ন" : "অপেক্ষমান",
      done: isDelivered,
      active: isDelivered,
      icon: "package-check",
    },
  ];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id;
    const cleanId = decodeURIComponent(rawId).trim();
    const memoryOrders = globalScope._tatka_admin_orders || [];

    let matchedOrder = memoryOrders.find(
      (o: any) =>
        o.id === cleanId ||
        o.orderNumber?.toLowerCase() === cleanId.toLowerCase() ||
        o.orderNumber?.replace(/[^0-9]/g, "") === cleanId.replace(/[^0-9]/g, "")
    );

    if (!matchedOrder) {
      try {
        const dbOrder = await prisma.order.findFirst({
          where: {
            OR: [
              { id: cleanId },
              { orderNumber: { equals: cleanId, mode: "insensitive" } },
            ],
          },
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
        });

        if (dbOrder) {
          matchedOrder = {
            id: dbOrder.id,
            orderNumber: dbOrder.orderNumber,
            storeName: "Tatka Bazar",
            customerName: dbOrder.user?.name || "Customer",
            customerPhone: dbOrder.user?.phone || "",
            customerAddress: dbOrder.address ? `${dbOrder.address.line1}, ${dbOrder.address.area}, ${dbOrder.address.city}` : "",
            deliveryArea: dbOrder.address?.area || "Dhaka",
            totalAmount: Number(dbOrder.total),
            subtotalAmount: Number(dbOrder.subtotal),
            deliveryCharge: Number(dbOrder.deliveryFee),
            paymentMethod: dbOrder.paymentMethod,
            paymentStatus: dbOrder.paymentStatus,
            status: dbOrder.status,
            createdAt: dbOrder.createdAt.toISOString(),
            assignedRiderId: dbOrder.deliveryAssignment?.riderId || undefined,
            assignedRiderName: dbOrder.deliveryAssignment?.rider?.name || undefined,
            riderPhone: dbOrder.deliveryAssignment?.rider?.phone || undefined,
            items: dbOrder.items.map((it: any) => ({
              id: it.id,
              name: it.name,
              quantity: it.quantity,
              price: Number(it.price),
              sku: it.product?.sku || "TB-GEN-01",
            })),
          };
        }
      } catch (dbErr) {
        console.warn("DB lookup in admin [id] failed:", dbErr);
      }
    }

    if (!matchedOrder) {
      return NextResponse.json(
        { success: false, error: "অর্ডারটি পাওয়া যায়নি" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // Check dispatch tasks for any rider notes attached
    const dispatchTasks = globalScope._tatka_dispatch_tasks || [];
    const dt = dispatchTasks.find((t: any) => t.id === matchedOrder.id || t.orderNumber === matchedOrder.orderNumber);
    if (dt && dt.notes && dt.notes.length > 0) {
      matchedOrder.riderNotes = dt.notes;
      matchedOrder.riderNote = dt.lastNote || dt.riderNote;
    }

    const timeline = buildTrackingTimeline(matchedOrder);

    return NextResponse.json(
      {
        success: true,
        order: {
          ...matchedOrder,
          timeline,
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("Admin order GET [id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to get order" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawId = params.id;
    const cleanId = decodeURIComponent(rawId).trim();
    const body = await request.json();

    const memoryOrders = globalScope._tatka_admin_orders || [];
    const idx = memoryOrders.findIndex(
      (o: any) =>
        o.id === cleanId ||
        o.orderNumber?.toLowerCase() === cleanId.toLowerCase()
    );

    let updatedOrder: any = null;

    if (idx !== -1) {
      const current = memoryOrders[idx];
      const newStatus = body.status || current.status;
      const riderNotes = current.riderNotes || [];

      if (body.note || body.riderNote) {
        const noteText = body.note || body.riderNote;
        riderNotes.push({
          id: `note-${Date.now()}`,
          note: noteText,
          riderName: body.riderName || "রাইডার",
          createdAt: new Date().toISOString(),
        });
      }

      updatedOrder = {
        ...current,
        ...body,
        status: newStatus,
        riderNotes,
        riderNote: body.note || body.riderNote || current.riderNote,
      };

      memoryOrders[idx] = updatedOrder;
      globalScope._tatka_admin_orders = memoryOrders;
    }

    // Attempt DB update if available
    try {
      const updateData: any = {};
      if (body.status) updateData.status = body.status;
      if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus;
      if (body.note) updateData.note = body.note;

      await prisma.order.updateMany({
        where: {
          OR: [
            { id: cleanId },
            { orderNumber: { equals: cleanId, mode: "insensitive" } },
          ],
        },
        data: updateData,
      });
    } catch (dbErr) {
      console.warn("DB update in admin [id] failed:", dbErr);
    }

    // Sync to dispatch queue if available
    const dispatchTasks = globalScope._tatka_dispatch_tasks || [];
    const dtIdx = dispatchTasks.findIndex((t: any) => t.id === cleanId || t.orderNumber === cleanId);
    if (dtIdx !== -1) {
      if (body.status) dispatchTasks[dtIdx].status = body.status;
      if (body.note || body.riderNote) {
        if (!dispatchTasks[dtIdx].notes) dispatchTasks[dtIdx].notes = [];
        dispatchTasks[dtIdx].notes.push({
          id: `note-${Date.now()}`,
          note: body.note || body.riderNote,
          riderName: body.riderName || "রাইডার",
          createdAt: new Date().toISOString(),
        });
        dispatchTasks[dtIdx].lastNote = body.note || body.riderNote;
      }
      globalScope._tatka_dispatch_tasks = dispatchTasks;
    }

    return NextResponse.json(
      {
        success: true,
        message: "অর্ডার আপডেট সম্পন্ন হয়েছে",
        order: updatedOrder || body,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("Admin order PATCH [id] error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update order" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
