"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
  PackageCheck,
  ShoppingBag,
  DollarSign,
  Award,
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
} from "recharts";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";
import { apiFetch } from "@/lib/api";

interface AnalyticsSummary {
  totalRevenue: number;
  totalCommission: number;
  netEarnings: number;
  completedOrdersCount: number;
}

interface AnalyticsData {
  revenueTrend: {
    date: string;
    dateRaw: string;
    revenue: number;
    orders: number;
    commission: number;
    net: number;
  }[];
  hourlyRush: {
    hour: string;
    count: number;
  }[];
  categoryShare: {
    name: string;
    value: number;
    count: number;
    color: string;
  }[];
  topProducts: {
    name: string;
    qty: number;
    revenue: number;
  }[];
  summary: AnalyticsSummary;
}

export default function AnalyticsPage() {
  const { language, orders } = useVendorStore();
  const t = translations[language];

  const [dateRange, setDateRange] = useState<"7D" | "30D" | "90D">("7D");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<AnalyticsData>(
        `/api/vendor-portal/analytics?range=${dateRange}`
      );
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.error || "অ্যানালিটিক্স লোড ব্যর্থ হয়েছে।");
      }
    } catch {
      setError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।");
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Fallbacks if data is empty / loading
  const revenueTrendData = data?.revenueTrend && data.revenueTrend.length > 0
    ? data.revenueTrend
    : Array.from({ length: dateRange === "7D" ? 7 : 30 }).map((_, i) => ({
        date: `Day ${i + 1}`,
        dateRaw: "",
        revenue: 0,
        orders: 0,
        commission: 0,
        net: 0,
      }));

  const totalPeriodRevenue = data?.summary?.totalRevenue ?? 0;
  const netEarnings = data?.summary?.netEarnings ?? 0;
  const completedOrdersCount = data?.summary?.completedOrdersCount ?? 0;
  const avgOrderVal = completedOrdersCount > 0
    ? Math.round(totalPeriodRevenue / completedOrdersCount)
    : 0;

  const hourlyRushData = data?.hourlyRush || [];
  const categoryShareData = data?.categoryShare && data.categoryShare.length > 0
    ? data.categoryShare
    : [
        { name: "শাকসবজি ও ফলমূল", value: 45, count: 0, color: "#10B981" },
        { name: "মাছ ও মাংস", value: 35, count: 0, color: "#0284C7" },
        { name: "মুদি ও নিত্যপণ্য", value: 20, count: 0, color: "#F59E0B" },
      ];

  const topProducts = data?.topProducts || [];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            📊 {t.analyticsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.analyticsSub}</p>
        </div>

        <div className="flex items-center gap-3">
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
            <button
              onClick={() => setDateRange("90D")}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                dateRange === "90D"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              90 Days
            </button>
          </div>

          <button
            onClick={loadAnalytics}
            className="p-2 rounded-lg bg-[#111C20] border border-[#20333B] text-slate-300 hover:text-white transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-400 flex items-center gap-2.5">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">গ্রস বিক্রয় (Gross Sales)</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            ৳{totalPeriodRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">নির্বাচিত সময়ের মোট বিক্রয়</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">নিট আয় (Net Earnings)</span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            ৳{netEarnings.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">প্ল্যাটফর্ম কমিশন বাদে নিট লাভ</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">{t.avgOrderValue}</span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            ৳{avgOrderVal.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">প্রতি অর্ডারের গড় বাস্কেট সাইজ</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">সম্পন্ন অর্ডার</span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {completedOrdersCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">সফলভাবে ডেলিভারকৃত অর্ডার</p>
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
              দৈনিক বিক্রয় ও আয়ের ধারাবাহিক গতিপ্রকৃতি (PostgreSQL DB Analysis)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            মোট: ৳{totalPeriodRevenue.toLocaleString()}
          </span>
        </div>

        <div className="h-64 w-full">
          {loading && !data ? (
            <div className="h-full flex items-center justify-center text-slate-400 gap-2 text-xs">
              <Loader2 size={18} className="animate-spin text-emerald-500" /> লোড হচ্ছে...
            </div>
          ) : (
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
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickFormatter={(val) => `৳${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0E171B",
                    borderColor: "#20333B",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(val: number) => [`৳${val.toLocaleString()}`, "বিক্রয়"]}
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
          )}
        </div>
      </div>

      {/* Two Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Peak Times Bar Chart */}
        <div className="p-5 rounded-xl bg-[#111C20] border border-[#20333B] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {t.rushHours} (পিক টাইম)
              </h3>
              <p className="text-[11px] text-slate-400">
                কোন সময়ে সবচেয়ে বেশি অর্ডার আসে তার বিশ্লেষণ
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
                  formatter={(val: number) => [`${val} টি অর্ডার`, "অর্ডার"]}
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
              ক্যাটাগরি অনুযায়ী আয়ের শতকরা অনুপাত
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

      {/* Top Products Table if available */}
      {topProducts.length > 0 && (
        <div className="p-5 rounded-xl bg-[#111C20] border border-[#20333B] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#20333B]">
            <Award size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              শীর্ষ বিক্রিত পণ্যসমূহ (Top Selling Products)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-[#20333B]/60 pb-2">
                <tr>
                  <th className="py-2">পণ্যের নাম</th>
                  <th className="py-2 text-right">মোট বিক্রয় সংখ্যা</th>
                  <th className="py-2 text-right">মোট রাজস্ব</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#20333B]/40">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#152227]/40">
                    <td className="py-2.5 font-medium text-slate-200">{p.name}</td>
                    <td className="py-2.5 font-mono text-right text-slate-300">{p.qty}</td>
                    <td className="py-2.5 font-mono font-bold text-right text-emerald-400">
                      ৳{p.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
