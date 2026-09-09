"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Download,
  Users,
  ShoppingBag,
  Percent,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

export default function AnalyticsPage() {
  const { language, orders, products } = useVendorStore();
  const t = translations[language];

  const [dateRange, setDateRange] = useState<"7D" | "30D">("7D");

  // Dynamic revenue trend based on real orders
  const daysCount = dateRange === "7D" ? 7 : 30;
  const revenueTrendData = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const isoDateStr = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => (o.createdAt || "").slice(0, 10) === isoDateStr);
    const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.grossTotal || 0), 0);
    return {
      date: dateStr,
      revenue: dayRevenue,
      orders: dayOrders.length,
    };
  });

  const totalPeriodRevenue = revenueTrendData.reduce((s, r) => s + r.revenue, 0);

  // Hourly peak rush hours data derived from orders
  const hours = [
    { label: "7 AM", h: 7 },
    { label: "8 AM", h: 8 },
    { label: "9 AM", h: 9 },
    { label: "10 AM", h: 10 },
    { label: "11 AM", h: 11 },
    { label: "12 PM", h: 12 },
    { label: "1 PM", h: 13 },
    { label: "4 PM", h: 16 },
    { label: "5 PM", h: 17 },
    { label: "6 PM", h: 18 },
    { label: "7 PM", h: 19 },
    { label: "8 PM", h: 20 },
  ];
  const hourlyRushData = hours.map(({ label, h }) => {
    const count = orders.filter((o) => {
      if (!o.createdAt) return false;
      const orderHour = new Date(o.createdAt).getHours();
      return orderHour === h;
    }).length;
    return { hour: label, count };
  });

  // Category revenue distribution computed from products and orders
  const categoryMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items?.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const cat = prod?.category || "অন্যান্য";
      categoryMap[cat] = (categoryMap[cat] || 0) + (it.finalPrice || it.unitPrice * (it.weightActual || it.weightOrdered || it.quantity || 1));
    });
  });

  const catColors = ["#10B981", "#0284C7", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];
  const totalCatRevenue = Object.values(categoryMap).reduce((a, b) => a + b, 0);

  const categoryShareData = Object.keys(categoryMap).length > 0
    ? Object.entries(categoryMap).map(([name, val], idx) => ({
        name,
        value: totalCatRevenue > 0 ? Math.round((val / totalCatRevenue) * 100) : 0,
        color: catColors[idx % catColors.length],
      }))
    : [
        { name: "শাকসবজি ও ফলমূল", value: 0, color: "#10B981" },
        { name: "মাছ ও মাংস", value: 0, color: "#0284C7" },
        { name: "মুদি ও নিত্যপণ্য", value: 0, color: "#F59E0B" },
      ];

  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const totalCompletedGross = completedOrders.reduce((s, o) => s + (o.grossTotal || 0), 0);
  const avgOrderVal = completedOrders.length > 0 ? Math.round(totalCompletedGross / completedOrders.length) : 0;
  const fulfillmentPct = orders.length > 0 ? Math.round((completedOrders.length / orders.length) * 100) : 100;
  const avgPrepTimeStr = completedOrders.length > 0 ? "8-10 মিনিট" : "--";

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t.analyticsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.analyticsSub}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-[#111C20] border border-[#20333B] text-xs">
            <button
              onClick={() => setDateRange("7D")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                dateRange === "7D"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange("30D")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                dateRange === "30D"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.avgOrderValue}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            ৳{avgOrderVal.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === "bn" ? "গড় প্রতি অর্ডারের মূল্য" : "Basket size per checkout"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.fulfillmentRate}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-sky-400">
            {fulfillmentPct}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === "bn" ? "সঠিক ও সময়মতো ডেলিভারি" : "Fulfillment success rate"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.prepTimeAvg}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {avgPrepTimeStr}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === "bn" ? "অর্ডার গ্রহণ থেকে রাইডার পিকআপ" : "Speedy kitchen fulfillment"}
          </p>
        </div>
      </div>

      {/* Revenue Trend Area Chart */}
      <div className="p-5 rounded-xl bg-[#111C20] border border-[#20333B] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.revenueTrend}
            </h3>
            <p className="text-[11px] text-slate-400">
              Gross sales trajectory across morning & evening batches
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            Total: ৳{totalPeriodRevenue.toLocaleString()}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#20333B" />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `৳${val/1000}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0E171B",
                  borderColor: "#20333B",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val: number) => [`৳${val.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#emeraldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Peak Times Bar Chart */}
        <div className="p-5 rounded-xl bg-[#111C20] border border-[#20333B] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {t.rushHours}
              </h3>
              <p className="text-[11px] text-slate-400">
                Staff packing schedule optimization
              </p>
            </div>
            <Clock size={16} className="text-amber-400" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyRushData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#20333B" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={10} />
                <YAxis stroke="#64748B" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0E171B",
                    borderColor: "#20333B",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [`${val} orders`, "Orders"]}
                />
                <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut / List */}
        <div className="p-5 rounded-xl bg-[#111C20] border border-[#20333B] space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.categoryShare}
            </h3>
            <p className="text-[11px] text-slate-400">
              Contribution to store revenue
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {categoryShareData.map((cat, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                  <span className="font-mono font-bold text-white">{cat.value}%</span>
                </div>
                <div className="w-full bg-[#152227] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.value}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
