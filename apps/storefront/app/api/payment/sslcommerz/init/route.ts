import { NextRequest, NextResponse } from "next/server";
import { initSSLCommerzSession } from "@tatka-bazar/shared";

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
    const body = await req.json();
    const { amount, orderNumber, customerName, customerPhone, customerEmail, customerAddress } = body;

    if (!amount || !orderNumber) {
      return NextResponse.json(
        { success: false, error: "amount and orderNumber are required" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Determine the base origin of the application
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const returnBaseUrl = `${proto}://${host}`;

    const session = await initSSLCommerzSession({
      amount: Number(amount),
      orderNumber: String(orderNumber),
      customerName: customerName || "Customer",
      customerPhone: customerPhone || "01700000000",
      customerEmail: customerEmail || undefined,
      customerAddress: customerAddress || "Dhaka, Bangladesh",
      returnBaseUrl,
      successPath: "/api/payment/sslcommerz/success",
      failPath: "/api/payment/sslcommerz/fail",
      cancelPath: "/api/payment/sslcommerz/cancel",
      ipnPath: "/api/payment/sslcommerz/ipn",
    });

    return NextResponse.json(session, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[SSLCommerz Init Route Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to initialize SSLCommerz payment" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
