import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { validateSSLCommerzPayment } from "@tatka-bazar/shared";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = String(formData.get("tran_id") || "");
    const valId = String(formData.get("val_id") || "");
    const status = String(formData.get("status") || "");
    const amount = Number(formData.get("amount") || 0);
    const cardType = String(formData.get("card_type") || "");

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;

    // 1. Verify with SSLCommerz server-to-server validation
    let isPaymentValid = status === "VALID" || status === "VALIDATED";
    if (valId) {
      const validation = await validateSSLCommerzPayment(valId);
      if (validation.success) {
        isPaymentValid = true;
      }
    }

    // 2. If valid, update Order in Supabase PostgreSQL
    if (isPaymentValid && tranId) {
      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              { orderNumber: tranId },
              { id: tranId },
            ],
          },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              paymentMethod: "SSLCOMMERZ",
              status: "CONFIRMED",
              paidAt: new Date(),
            },
          });
        }
      } catch (dbErr) {
        console.warn("[SSLCommerz Success DB Update Warning]:", dbErr);
      }
    }

    const redirectUrl = new URL(`${origin}/checkout/payment/success`);
    if (tranId) redirectUrl.searchParams.set("order", tranId);
    if (valId) redirectUrl.searchParams.set("val_id", valId);
    if (cardType) redirectUrl.searchParams.set("channel", cardType);

    // HTTP 303 forces GET request redirect from the incoming POST request
    return NextResponse.redirect(redirectUrl.toString(), 303);
  } catch (err: any) {
    console.error("[SSLCommerz Success Handler Error]:", err);
    return NextResponse.redirect(new URL("/checkout/payment/success?order=TB-LIVE", req.url), 303);
  }
}

export async function GET(req: NextRequest) {
  const tranId = req.nextUrl.searchParams.get("order") || "";
  return NextResponse.redirect(new URL(`/checkout/payment/success?order=${tranId}`, req.url), 307);
}
