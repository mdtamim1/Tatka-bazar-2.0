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

  // Mock trend data for daily revenue
  const revenueTrendData = [
    { date: "Aug 28", revenue: 8400, orders: 8 },
    { date: "Aug 29", revenue: 10200, orders: 11 },
    { date: "Aug 30", revenue: 13500, orders: 14 },
    { date: "Aug 31", revenue: 11800, orders: 12 },
    { date: "Sep 01", revenue: 16400, orders: 18 },
    { date: "Sep 02", revenue: 14200, orders: 15 },
    { date: "Sep 03", revenue: 12450, orders: 13 },
  ];

  // Hourly peak rush hours data
  const hourlyRushData = [
    { hour: "7 AM", count: 4 },
    { hour: "8 AM", count: 9 },
    { hour: "9 AM", count: 18 }, // Morning grocery rush!
    { hour: "10 AM", count: 15 },
    { hour: "11 AM", count: 11 },
    { hour: "12 PM", count: 6 },
    { hour: "1 PM", count: 5 },
    { hour: "4 PM", count: 8 },
    { hour: "5 PM", count: 14 },
    { hour: "6 PM", count: 20 }, // Evening dinner rush!
    { hour: "7 PM", count: 16 },
    { hour: "8 PM", count: 7 },
  ];

  // Category revenue distribution
  const categoryShareData = [
    { name: "Meat (গরুর মাংস)", value: 42, color: "#10B981" },
    { name: "Fish (মাছ)", value: 28, color: "#0284C7" },
    { name: "Grocery (তেল/চাল)", value: 16, color: "#F59E0B" },
    { name: "Vegetables (শাকসবজি)", value: 14, color: "#8B5CF6" },
  ];

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
            ৳1,245.00
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
            99.2%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === "bn" ? "সঠিক ও সময়মতো ডেলিভারি" : "0.8% cancellation rate"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.prepTimeAvg}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            8.4 mins
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
            Total: ৳86,950
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
