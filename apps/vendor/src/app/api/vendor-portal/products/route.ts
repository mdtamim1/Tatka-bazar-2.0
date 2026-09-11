import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    // Query products belonging to this vendor, or fallback to general inventory if none added yet
    let products = await prisma.product.findMany({
      where: { vendorId: payload.sub },
      include: { category: true, images: true },
      orderBy: { createdAt: "desc" },
    });

    if (products.length === 0) {
      // Include catalog reference products
      products = await prisma.product.findMany({
        where: { isPublished: true },
        include: { category: true, images: true },
        take: 20,
      });
    }

    const formatted = products.map((p) => ({
      id: p.id,
      vendorId: p.vendorId || payload.sub,
      name: p.name,
      nameBn: p.name,
      category: "GROCERY" as any,
      pricingType: "FIXED" as const,
      pricePerUnit: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
      unit: "KG" as any,
      sku: p.sku || `TB-${p.slug}`,
      stockQty: p.stock,
      lowStockThreshold: 10,
      isPublished: p.isPublished,
      isWholesaleEligible: false,
      imageUrl: p.images[0]?.url || "/placeholder-product.png",
      description: p.description || "",
      descriptionBn: p.description || "",
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, data: formatted },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Vendor Products Error]:", err);
    return NextResponse.json(
      { success: false, error: "পণ্য তালিকা লোড করা সম্ভব হয়নি।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
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
    const { name, price, stock, description } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: "পণ্যের নাম ও মূল্য প্রদান করুন।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // Find or fallback to grocery category
    const defaultCat = await prisma.category.findFirst();
    if (!defaultCat) {
      return NextResponse.json(
        { success: false, error: "ক্যাটাগরি ডাটাবেজে পাওয়া যায়নি।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const slug = `${name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-")}-${Date.now()}`;

    const newProd = await prisma.product.create({
      data: {
        name,
        slug,
        price: Number(price),
        stock: Number(stock || 50),
        description: description || "",
        categoryId: defaultCat.id,
        vendorId: payload.sub,
        isPublished: true,
      },
    });

    return NextResponse.json(
      { success: true, data: newProd },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Create Product Error]:", err);
    return NextResponse.json(
      { success: false, error: "পণ্য তৈরি ব্যর্থ হয়েছে।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
