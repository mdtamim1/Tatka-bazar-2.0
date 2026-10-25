import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { verifyVendorToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_STOREFRONT_URL || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getVerifiedVendor(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  return verifyVendorToken(token);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const payload = getVerifiedVendor(req);
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: "লগইন প্রয়োজন।" }, { status: 401, headers: CORS_HEADERS });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30D";
    const days = range === "7D" ? 7 : range === "90D" ? 90 : 30;

    const since = new Date();
    since.setDate(since.getDate() - days);

    // schema: OrderItem has price, quantity, total (no finalPrice)
    const [orderItems, commissions, allProducts] = await Promise.all([
      prisma.orderItem.findMany({
        where: {
          vendorId: payload.sub,
          order: { createdAt: { gte: since } },
        },
        include: {
          order: { select: { createdAt: true, status: true, orderNumber: true } },
          product: { select: { name: true, category: { select: { name: true } } } },
        },
        orderBy: { order: { createdAt: "asc" } },
      }),
      prisma.commission.findMany({
        where: { vendorId: payload.sub, createdAt: { gte: since } },
      }),
      prisma.product.findMany({
        where: { vendorId: payload.sub },
        select: { id: true, name: true, stock: true, price: true },
      }),
    ]);

    // ── Daily Revenue Trend ──
    const dayMap: Record<string, { revenue: number; orders: Set<string>; commission: number }> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      dayMap[d.toISOString().slice(0, 10)] = { revenue: 0, orders: new Set(), commission: 0 };
    }

    for (const item of orderItems) {
      const dateKey = item.order.createdAt.toISOString().slice(0, 10);
      if (!dayMap[dateKey]) continue;
      // Use item.total (price * quantity snapshot) directly
      dayMap[dateKey].revenue += Number(item.total);
      dayMap[dateKey].orders.add(item.orderId);
    }

    for (const c of commissions) {
      const dateKey = c.createdAt.toISOString().slice(0, 10);
      if (dayMap[dateKey]) dayMap[dateKey].commission += Number(c.amount);
    }

    const revenueTrend = Object.entries(dayMap).map(([date, v]) => ({
      date: new Date(date).toLocaleDateString("bn-BD", { month: "short", day: "numeric" }),
      dateRaw: date,
      revenue: Math.round(v.revenue),
      orders: v.orders.size,
      commission: Math.round(v.commission),
      net: Math.round(v.revenue - v.commission),
    }));

    // ── Hourly Rush Data ──
    const hourMap: Record<number, number> = {};
    for (const item of orderItems) {
      const h = item.order.createdAt.getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;
    }
    const hourlyRush = Array.from({ length: 17 }, (_, i) => i + 6).map(h => ({
      hour: `${h === 12 ? 12 : h > 12 ? h - 12 : h}${h < 12 ? " AM" : " PM"}`,
      count: hourMap[h] || 0,
    }));

    // ── Top Products ──
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const item of orderItems) {
      const pid = item.productId;
      if (!productSales[pid]) productSales[pid] = { name: item.product?.name || item.name, qty: 0, revenue: 0 };
      productSales[pid].qty += item.quantity;
      productSales[pid].revenue += Number(item.total);
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)
      .map(p => ({ ...p, revenue: Math.round(p.revenue) }));

    // ── Category Revenue ──
    const catMap: Record<string, number> = {};
    for (const item of orderItems) {
      const cat = item.product?.category?.name || "অন্যান্য";
      catMap[cat] = (catMap[cat] || 0) + Number(item.total);
    }
    const categoryRevenue = Object.entries(catMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    // ── Summary KPIs ──
    const totalRevenue = orderItems.reduce((s, i) => s + Number(i.total), 0);
    const totalCommission = commissions.reduce((s, c) => s + Number(c.amount), 0);
    const uniqueOrders = new Set(orderItems.map(i => i.orderId)).size;
    const avgOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;
    const totalItemsSold = orderItems.reduce((s, i) => s + i.quantity, 0);

    // ── Low Stock Alert ──
    const lowStockProducts = allProducts
      .filter(p => p.stock <= 10)
      .map(p => ({ id: p.id, name: p.name, stock: p.stock, price: Number(p.price) }));

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          totalRevenue: Math.round(totalRevenue),
          netRevenue: Math.round(totalRevenue - totalCommission),
          totalCommission: Math.round(totalCommission),
          totalOrders: uniqueOrders,
          totalItemsSold,
          avgOrderValue: Math.round(avgOrderValue),
        },
        revenueTrend,
        hourlyRush,
        topProducts,
        categoryRevenue,
        lowStockProducts,
      },
    }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[Analytics Error]:", err);
    return NextResponse.json({ success: false, error: "অ্যানালিটিক্স ডেটা লোড ব্যর্থ।" }, { status: 500, headers: CORS_HEADERS });
  }
}
