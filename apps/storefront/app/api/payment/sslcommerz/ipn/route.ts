import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { validateSSLCommerzPayment } from "@tatka-bazar/shared";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    let tranId = "";
    let valId = "";
    let status = "";
    let paidAmount = 0;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      tranId = String(formData.get("tran_id") || "");
      valId = String(formData.get("val_id") || "");
      status = String(formData.get("status") || "");
      paidAmount = Number(formData.get("amount") || 0);
    } else {
      const body = await req.json().catch(() => ({}));
      tranId = String(body.tran_id || "");
      valId = String(body.val_id || "");
      status = String(body.status || "");
      paidAmount = Number(body.amount || 0);
    }

    if (!tranId) {
      return NextResponse.json({ success: false, error: "Missing tran_id" }, { status: 400, headers: CORS_HEADERS });
    }

    // 1. Validate with SSLCommerz server
    let isValid = status === "VALID" || status === "VALIDATED";
    if (valId) {
      const validation = await validateSSLCommerzPayment(valId);
      if (validation.success) {
        isValid = true;
        if (validation.amount) paidAmount = validation.amount;
      }
    }

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid payment status" }, { status: 400, headers: CORS_HEADERS });
    }

    // 2. Lookup Order in Supabase PostgreSQL
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: tranId }, { id: tranId }],
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404, headers: CORS_HEADERS });
    }

    // 3. Security: Prevent amount tampering
    if (paidAmount > 0 && paidAmount < Number(order.total)) {
      console.warn(`[SSLCommerz IPN Security Alert] Amount mismatch for ${tranId}: paid ${paidAmount}, expected ${order.total}`);
      return NextResponse.json({ success: false, error: "Amount mismatch" }, { status: 400, headers: CORS_HEADERS });
    }

    // 4. Update order to PAID
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        paymentMethod: "SSLCOMMERZ",
        status: "CONFIRMED",
        paidAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, message: "Order payment verified and captured via IPN" }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[SSLCommerz IPN Handler Error]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
