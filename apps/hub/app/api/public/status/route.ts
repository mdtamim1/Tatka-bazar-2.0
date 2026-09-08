import { NextRequest, NextResponse } from "next/server";
import { getDbRiders, getDbVendors } from "@/lib/hubDb";

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// GET /api/public/status?type=rider|vendor&id=<id>
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "rider" | "vendor"
  const id = searchParams.get("id");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-cache, no-store, must-revalidate",
  };

  if (!type || !id) {
    return NextResponse.json(
      { success: false, error: "type and id are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (type === "rider") {
    const riders = await getDbRiders();
    const rider = riders.find((r) => r.id === id || r.phone === id || r.email === id);
    if (!rider) {
      return NextResponse.json(
        { success: false, error: "Rider not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      {
        success: true,
        data: {
          id: rider.id,
          name: rider.name,
          status: rider.status,
          isActive: rider.status === "ACTIVE",
          isSuspended: rider.status === "SUSPENDED",
          suspendReason: rider.suspendReason || null,
          suspendedAt: rider.suspendedAt || null,
          kycStatus: rider.kycStatus,
          balance: rider.balance,
        },
      },
      { headers: corsHeaders }
    );
  }

  if (type === "vendor") {
    const vendors = await getDbVendors();
    const vendor = vendors.find((v) => v.id === id || v.phone === id || v.email === id);
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: "Vendor not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      {
        success: true,
        data: {
          id: vendor.id,
          storeName: vendor.storeName,
          status: vendor.status,
          isActive: vendor.status === "ACTIVE",
          isSuspended: vendor.status === "SUSPENDED",
          suspendReason: vendor.suspendReason || null,
          suspendedAt: vendor.suspendedAt || null,
          vacationMode: vendor.vacationMode,
        },
      },
      { headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { success: false, error: "Invalid type. Must be 'rider' or 'vendor'" },
    { status: 400, headers: corsHeaders }
  );
}
