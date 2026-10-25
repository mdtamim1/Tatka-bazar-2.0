import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_STOREFRONT_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** Shared helper: extract & verify vendor from Authorization header */
function getVerifiedVendor(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return verifyVendorToken(token);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * 🔒 Slug helper — works correctly with Bangla names.
 * Bengali characters are preserved as their Unicode codepoints (or transliterated).
 * Falls back to a timestamp to guarantee uniqueness.
 */
function buildSlug(name: string): string {
  // Convert name to a URL-safe form: keep alphanumeric + Bengali Unicode range, replace spaces with -
  const safe = name
    .trim()
    .toLowerCase()
    // Keep: a-z, 0-9, Bengali Unicode block (\u0980-\u09FF), hyphens, spaces
    .replace(/[^\w\s\u0980-\u09FF-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80); // max 80 chars
  return `${safe || "product"}-${Date.now()}`;
}

export async function GET(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "লগইন প্রয়োজন অথবা সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    let products = await prisma.product.findMany({
      where: { vendorId: payload.sub },
      include: { category: true, images: true },
      orderBy: { createdAt: "desc" },
    });

    if (products.length === 0) {
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

    return NextResponse.json({ success: true, data: formatted }, { headers: CORS_HEADERS });
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
    const payload = getVerifiedVendor(req);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const { name, price, stock, description, comparePrice, imageUrl, sku } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: "পণ্যের নাম ও মূল্য প্রদান করুন।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const defaultCat = await prisma.category.findFirst();
    if (!defaultCat) {
      return NextResponse.json(
        { success: false, error: "ক্যাটাগরি ডাটাবেজে পাওয়া যায়নি।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 🔒 Fixed slug — now supports Bangla names correctly
    const slug = buildSlug(name);

    const newProd = await prisma.product.create({
      data: {
        name,
        slug,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        stock: Number(stock ?? 50),
        description: description || "",
        categoryId: defaultCat.id,
        vendorId: payload.sub,
        isPublished: true,
        ...(sku ? { sku } : {}),
        ...(imageUrl ? {
          images: {
            create: [{ url: imageUrl }],
          },
        } : {}),
      },
    });

    return NextResponse.json({ success: true, data: newProd }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[Create Product Error]:", err);
    return NextResponse.json(
      { success: false, error: "পণ্য তৈরি ব্যর্থ হয়েছে।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * PATCH /api/vendor-portal/products — update an existing product
 * Body: { productId, name?, price?, stock?, description?, comparePrice?, isPublished?, imageUrl? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = await req.json();
    const { productId, name, price, stock, description, comparePrice, isPublished, imageUrl } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId প্রদান করুন।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 🔒 Ownership check — only this vendor's products
    const existing = await prisma.product.findFirst({
      where: { id: productId, vendorId: payload.sub },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "পণ্যটি আপনার অ্যাকাউন্টের সাথে সম্পর্কিত নয় অথবা পাওয়া যায়নি।" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name !== undefined ? { name, slug: buildSlug(name) } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(stock !== undefined ? { stock: Number(stock) } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(comparePrice !== undefined ? { comparePrice: comparePrice ? Number(comparePrice) : null } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
      },
    });

    // Update image separately if provided
    if (imageUrl !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId } });
      if (imageUrl) {
        await prisma.productImage.create({
          data: { productId, url: imageUrl },
        });
      }
    }

    return NextResponse.json(
      { success: true, data: updated, message: "পণ্য সফলভাবে আপডেট হয়েছে।" },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Update Product Error]:", err);
    return NextResponse.json(
      { success: false, error: "পণ্য আপডেট ব্যর্থ হয়েছে।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * DELETE /api/vendor-portal/products?productId=xxx — delete a product
 */
export async function DELETE(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { success: false, error: "সেশনের মেয়াদ শেষ হয়েছে।" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "productId query parameter প্রদান করুন।" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 🔒 Ownership check
    const existing = await prisma.product.findFirst({
      where: { id: productId, vendorId: payload.sub },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "পণ্যটি আপনার অ্যাকাউন্টের সাথে সম্পর্কিত নয়।" },
        { status: 403, headers: CORS_HEADERS }
      );
    }

    // Soft-delete: unpublish instead of hard-delete (preserves order history)
    await prisma.product.update({
      where: { id: productId },
      data: { isPublished: false },
    });

    return NextResponse.json(
      { success: true, message: "পণ্যটি সফলভাবে মুছে ফেলা হয়েছে।" },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Delete Product Error]:", err);
    return NextResponse.json(
      { success: false, error: "পণ্য মুছে ফেলা ব্যর্থ হয়েছে।" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
