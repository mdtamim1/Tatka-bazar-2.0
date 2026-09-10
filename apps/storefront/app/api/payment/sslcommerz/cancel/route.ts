import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const tranId = String(formData.get("tran_id") || "");

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const origin = `${proto}://${host}`;

    const redirectUrl = new URL(`${origin}/checkout/payment/fail`);
    if (tranId) redirectUrl.searchParams.set("order", tranId);
    redirectUrl.searchParams.set("error", "Payment cancelled by user");

    return NextResponse.redirect(redirectUrl.toString(), 303);
  } catch (err: any) {
    console.error("[SSLCommerz Cancel Handler Error]:", err);
    return NextResponse.redirect(new URL("/checkout/payment/fail", req.url), 303);
  }
}

export async function GET(req: NextRequest) {
  const tranId = req.nextUrl.searchParams.get("order") || "";
  return NextResponse.redirect(new URL(`/checkout/payment/fail?order=${tranId}`, req.url), 307);
}
