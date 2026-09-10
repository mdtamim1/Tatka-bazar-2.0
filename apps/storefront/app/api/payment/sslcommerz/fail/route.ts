import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = String(formData.get("tran_id") || "");
    const errorMsg = String(formData.get("error") || formData.get("failedreason") || "Payment Failed");

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;

    if (tranId) {
      try {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ orderNumber: tranId }, { id: tranId }],
          },
        });
        if (order && order.paymentStatus !== "PAID") {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "FAILED" },
          });
        }
      } catch (dbErr) {
        console.warn("[SSLCommerz Fail DB Update Warning]:", dbErr);
      }
    }

    const redirectUrl = new URL(`${origin}/checkout/payment/fail`);
    if (tranId) redirectUrl.searchParams.set("order", tranId);
    redirectUrl.searchParams.set("error", encodeURIComponent(errorMsg));

    return NextResponse.redirect(redirectUrl.toString(), 303);
  } catch (err: any) {
    console.error("[SSLCommerz Fail Handler Error]:", err);
    return NextResponse.redirect(new URL("/checkout/payment/fail", req.url), 303);
  }
}

export async function GET(req: NextRequest) {
  const tranId = req.nextUrl.searchParams.get("order") || "";
  return NextResponse.redirect(new URL(`/checkout/payment/fail?order=${tranId}`, req.url), 307);
}
