import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const orderNumber = body.orderNumber || ("TB-" + Math.floor(100000 + Math.random() * 900000));
    const orderId = body.id || `ord-${Date.now()}`;

    // Target sync endpoints across the Tatka Bazar ecosystem
    const endpoints = [
      "https://tatka-bazar-2-0-admin.vercel.app/api/orders",
      process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/orders` : null,
      "http://localhost:4000/api/orders",
      "http://localhost:3001/api/orders",
    ].filter(Boolean) as string[];

    let remoteOrderData: any = null;

    // 1. Post to Admin API (server-side, avoiding browser CORS)
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, orderNumber, id: orderId }),
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            remoteOrderData = json.data;
            break;
          }
        }
      } catch {
        // Try next endpoint
      }
    }

    // 2. Also notify Vendor & Rider dispatch queues
    const dispatchPayload = {
      action: "READY_FOR_PICKUP",
      task: {
        id: remoteOrderData?.id || orderId,
        orderNumber: remoteOrderData?.orderNumber || orderNumber,
        customerName: body.customerName || "Customer",
        customerPhone: body.customerPhone || "01700000000",
        deliveryAddress: body.customerAddress || body.deliveryArea || "Dhaka",
        deliveryZone: body.deliveryArea || "Dhaka",
        vendorName: "Tatka Bazar Storefront",
        itemCount: Array.isArray(body.items) ? body.items.length : 1,
        total: Number(body.totalAmount || 0),
        subtotal: Number(body.totalAmount || 0),
        deliveryFee: Number(body.deliveryFee || 60),
        status: "READY_FOR_PICKUP",
        createdAt: new Date().toISOString(),
        items: body.items || [],
      },
    };

    const dispatchUrls = [
      "https://tatka-bazar-2-0-vendor.vercel.app/api/dispatch",
      "https://tatka-bazar-2-0-rider-seven.vercel.app/api/dispatch",
      "https://tatka-bazar-2-0-admin.vercel.app/api/dispatch",
    ];

    dispatchUrls.forEach((url) => {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dispatchPayload),
        signal: AbortSignal.timeout(3000),
      }).catch(() => {});
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: remoteOrderData?.id || orderId,
          orderNumber: remoteOrderData?.orderNumber || orderNumber,
          status: "PENDING",
          total: Number(body.totalAmount || 0),
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("Storefront API orders error:", err);
    return NextResponse.json(
      {
        success: true,
        data: {
          id: `ord-${Date.now()}`,
          orderNumber: "TB-" + Math.floor(100000 + Math.random() * 900000),
          status: "PENDING",
        },
      },
      { headers: CORS_HEADERS }
    );
  }
}
