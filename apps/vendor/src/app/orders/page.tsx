"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Scale,
  CheckSquare,
  Sparkles,
  Bike,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  MessageCircle,
  ShieldCheck,
  RotateCcw,
  Zap,
  Navigation,
  History,
  AlertTriangle,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Order, OrderStatus } from "@/types/vendor";
import { translations } from "@/utils/translations";
import WeightReconciliationModal from "@/components/common/WeightReconciliationModal";
import PackingChecklistModal from "@/components/common/PackingChecklistModal";

export default function OrdersPage() {
  const {
    language,
    orders,
    updateOrderStatus,
    reconcileItemWeight,
    acceptOrder,
    declineOrder,
    setChatOrder,
    setTrackingOrder,
    resetShiftQueue,
    shiftStartedAt,
    simulateAreaDispatchOrder,
    simulateRemoteClaim,
    syncRiderDispatch,
  } = useVendorStore();

  const t = translations[language];

  // ─── Real-time dispatch sync with Rider Portal ───
  React.useEffect(() => {
    let isMounted = true;
    async function syncDispatch() {
      const endpoints = [
        "/api/dispatch?all=true",
        "https://tatka-bazar-2-0-rider-seven.vercel.app/api/dispatch?all=true",
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
          if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              if (isMounted) syncRiderDispatch(data.data);
              break;
            }
          }
        } catch {}
      }
    }

    syncDispatch();
    const interval = setInterval(syncDispatch, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [syncRiderDispatch]);

  // 6 Top Pipeline Status Tabs: ALL (Today), PENDING, PROCESSING, READY_FOR_PICKUP, COMPLETED, RETURNED
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [activeWeightOrderId, setActiveWeightOrderId] = useState<string | null>(null);
  const [activeWeightItemId, setActiveWeightItemId] = useState<string | null>(null);
  const [activeChecklistOrderId, setActiveChecklistOrderId] = useState<string | null>(null);

  const activeWeightOrder = orders.find((o) => o.id === activeWeightOrderId) || null;
  const activeWeightItem = activeWeightOrder?.items.find((i) => i.id === activeWeightItemId) || null;
  const activeChecklistOrder = orders.find((o) => o.id === activeChecklistOrderId) || null;

  // Compute 12-Hour Shift Window
  const shiftDate = new Date(shiftStartedAt || Date.now());
  const elapsedHours = Math.floor((Date.now() - shiftDate.getTime()) / (1000 * 60 * 60));
  const remainingHours = Math.max(0, 12 - elapsedHours);

  // Status mapping helper
  const matchesStatus = (order: Order, tab: string) => {
    if (tab === "ALL") return true;
    if (tab === "PENDING") return order.status === "PENDING" || order.status === "RECEIVED";
    if (tab === "PROCESSING") return order.status === "PROCESSING" || order.status === "PREPARING";
    if (tab === "READY_FOR_PICKUP") return order.status === "READY_FOR_PICKUP";
    if (tab === "COMPLETED") return order.status === "COMPLETED";
    if (tab === "RETURNED") return order.status === "RETURNED";
    return order.status === tab;
  };

  const filteredOrders = orders.filter((order) => {
    if (!matchesStatus(order, activeTab)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.displayId.toLowerCase().includes(q) ||
        (order.deliveryZone && order.deliveryZone.toLowerCase().includes(q)) ||
        order.items.some(
          (it) =>
            it.productName.toLowerCase().includes(q) ||
            it.productNameBn.toLowerCase().includes(q)
        )
      );
    }
    return true;
  });

  // Top 6 Module Counts
  const countToday = orders.length;
  const countPending = orders.filter((o) => o.status === "PENDING" || o.status === "RECEIVED").length;
  const countProcessing = orders.filter((o) => o.status === "PROCESSING" || o.status === "PREPARING").length;
  const countReady = orders.filter((o) => o.status === "READY_FOR_PICKUP").length;
  const countCompleted = orders.filter((o) => o.status === "COMPLETED").length;
  const countReturned = orders.filter((o) => o.status === "RETURNED").length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
      case "RECEIVED":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
            অপেক্ষমাণ (পেন্ডিং)
          </span>
        );
      case "PROCESSING":
      case "PREPARING":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-300">
            প্রস্তুতি চলছে (প্রসেসিং)
          </span>
        );
      case "READY_FOR_PICKUP":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            রেডি ফর পিকআপ (রাইডার অ্যালার্ট)
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
            সম্পন্ন (ডেলিভার্ড)
          </span>
        );
      case "RETURNED":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
            রিটার্নড (ফেরত এসেছে)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto p-4 sm:p-6 text-[#F0F6FF]">
      {/* Top Header & Operational Shift Controller */}
      <div className="bg-[#0F1E32] p-5 rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-[#F0F6FF] tracking-tight font-bn">
              অর্ডার ব্যবস্থাপনা ও অপারেশন কিউ
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00D68F] bg-[rgba(0,214,143,0.12)] px-2.5 py-0.5 rounded-full border border-[rgba(0,214,143,0.3)] font-bn">
              <Clock size={12} className="text-[#00D68F]" />
              <span>১২ ঘণ্টার শিফট: {remainingHours} ঘণ্টা বাকি</span>
            </span>
          </div>
          <p className="text-xs text-[#A8C0D8]/70 mt-1 font-bn">
            গ্রাহকের গোপনীয়তা সুরক্ষিত • ডিজিটাল স্কেল ওজন সমন্বয় • পিকআপ সম্পন্ন হলে রিয়েল-টাইম রাইডার ট্র্যাকিং
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap font-bn">
          <Link
            href="/orders/history"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#122035] hover:bg-[#172540] text-[#A8C0D8] text-xs font-bold border border-[rgba(255,255,255,0.08)] transition-colors"
            title="সকল বিগত অর্ডারের স্থায়ী ইতিহাস ও সার্চ"
          >
            <History size={14} className="text-[#00D68F]" />
            <span>অর্ডার হিস্ট্রি (সকল ইতিহাস)</span>
          </Link>

          <button
            onClick={resetShiftQueue}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#122035] hover:bg-[#172540] text-[#A8C0D8] text-xs font-semibold border border-[rgba(255,255,255,0.08)] transition-colors"
            title="১২ ঘণ্টার শিফট কিউ ম্যানুয়ালি রিসেট করুন"
          >
            <RotateCcw size={13} />
            <span>শিফট রিসেট</span>
          </button>

          <button
            onClick={simulateAreaDispatchOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00D68F] to-[#00B87A] hover:opacity-90 text-white text-xs font-bold shadow-md shadow-[#00D68F]/20 transition-all active:scale-95"
            title="অ্যাডমিন থেকে ৫টি ভেন্ডরের কাছে এলাকাভিত্তিক অর্ডার পাঠানো টেস্ট করুন"
          >
            <Zap size={14} className="text-white" />
            <span>+ এলাকাভিত্তিক টেস্ট অর্ডার</span>
          </button>
        </div>
      </div>

      {/* Top 6 Pipeline Status Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-bn">
        {/* 1. Today Orders */}
        <button
          onClick={() => setActiveTab("ALL")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "ALL"
              ? "bg-[#00D68F] text-[#051322] border-[#00D68F] shadow-lg shadow-[#00D68F]/20 font-bold"
              : "bg-[#0F1E32] text-[#A8C0D8] border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,214,143,0.3)] hover:bg-[#122035]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "ALL" ? "text-[#051322]" : "text-[#A8C0D8]"}`}>
              আজকের অর্ডার
            </span>
            <ShoppingBag size={15} className={activeTab === "ALL" ? "text-[#051322]" : "text-[#5E7A96]"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono">{countToday}</span>
            <span className={`text-[10px] ${activeTab === "ALL" ? "text-[#051322]/80" : "text-[#5E7A96]"}`}>টি</span>
          </div>
        </button>

        {/* 2. Pending */}
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "PENDING"
              ? "bg-[#F59E0B] text-[#051322] border-[#F59E0B] shadow-lg shadow-[#F59E0B]/20 font-bold"
              : "bg-[#0F1E32] text-[#A8C0D8] border-[rgba(255,255,255,0.08)] hover:border-[rgba(245,158,11,0.3)] hover:bg-[#122035]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "PENDING" ? "text-[#051322]" : "text-[#A8C0D8]"}`}>
              পেন্ডিং
            </span>
            <Clock size={15} className={activeTab === "PENDING" ? "text-[#051322]" : "text-[#F59E0B]"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono" style={{ color: activeTab === "PENDING" ? "#051322" : "#F59E0B" }}>
              {countPending}
            </span>
            <span className={`text-[10px] ${activeTab === "PENDING" ? "text-[#051322]/80" : "text-[#5E7A96]"}`}>অপেক্ষমাণ</span>
          </div>
        </button>

        {/* 3. Processing */}
        <button
          onClick={() => setActiveTab("PROCESSING")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "PROCESSING"
              ? "bg-[#3B82F6] text-white border-[#3B82F6] shadow-lg shadow-[#3B82F6]/20 font-bold"
              : "bg-[#0F1E32] text-[#A8C0D8] border-[rgba(255,255,255,0.08)] hover:border-[rgba(59,130,246,0.3)] hover:bg-[#122035]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "PROCESSING" ? "text-white" : "text-[#A8C0D8]"}`}>
              প্রসেসিং
            </span>
            <Scale size={15} className={activeTab === "PROCESSING" ? "text-white" : "text-[#3B82F6]"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono" style={{ color: activeTab === "PROCESSING" ? "white" : "#60A5FA" }}>
              {countProcessing}
            </span>
            <span className={`text-[10px] ${activeTab === "PROCESSING" ? "text-white/80" : "text-[#5E7A96]"}`}>প্যাকিং চলছে</span>
          </div>
        </button>

        {/* 4. Ready for Pickup */}
        <button
          onClick={() => setActiveTab("READY_FOR_PICKUP")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "READY_FOR_PICKUP"
              ? "bg-gradient-to-r from-[#00D68F] to-[#00B87A] text-white border-[#00D68F] shadow-lg shadow-[#00D68F]/25 font-bold"
              : "bg-[#0F1E32] text-[#A8C0D8] border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,214,143,0.3)] hover:bg-[#122035]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "READY_FOR_PICKUP" ? "text-white" : "text-[#A8C0D8]"}`}>
              রেডি ফর পিকআপ
            </span>
            <Bike size={15} className={activeTab === "READY_FOR_PICKUP" ? "text-white" : "text-[#00D68F]"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono" style={{ color: activeTab === "READY_FOR_PICKUP" ? "white" : "#00D68F" }}>
              {countReady}
            </span>
            <span className={`text-[10px] ${activeTab === "READY_FOR_PICKUP" ? "text-white/80" : "text-[#5E7A96]"}`}>রাইডার অ্যালার্ট</span>
          </div>
        </button>

        {/* 5. Completed */}
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "COMPLETED"
              ? "bg-[#172540] text-white border-[#334D65] shadow-sm font-bold"
              : "bg-[#0F1E32] text-[#A8C0D8] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#122035]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "COMPLETED" ? "text-white" : "text-[#A8C0D8]"}`}>
              সম্পন্ন
            </span>
            <CheckCircle size={15} className={activeTab === "COMPLETED" ? "text-emerald-400" : "text-[#5E7A96]"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono" style={{ color: activeTab === "COMPLETED" ? "white" : "#A8C0D8" }}>
              {countCompleted}
            </span>
            <span className={`text-[10px] ${activeTab === "COMPLETED" ? "text-slate-300" : "text-[#5E7A96]"}`}>ডেলিভার্ড</span>
          </div>
        </button>

        {/* 6. Returned */}
        <button
          onClick={() => setActiveTab("RETURNED")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "RETURNED"
              ? "bg-[#EF4444] text-white border-[#EF4444] shadow-lg shadow-[#EF4444]/20 font-bold"
              : "bg-[#0F1E32] text-[#A8C0D8] border-[rgba(255,255,255,0.08)] hover:border-[rgba(239,68,68,0.3)] hover:bg-[#122035]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "RETURNED" ? "text-white" : "text-[#A8C0D8]"}`}>
              রিটার্নড
            </span>
            <RotateCcw size={15} className={activeTab === "RETURNED" ? "text-white" : "text-[#EF4444]"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono" style={{ color: activeTab === "RETURNED" ? "white" : "#EF4444" }}>
              {countReturned}
            </span>
            <span className={`text-[10px] ${activeTab === "RETURNED" ? "text-white/80" : "text-[#5E7A96]"}`}>ফেরত এসেছে</span>
          </div>
        </button>
      </div>

      {/* Search & Area Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 font-bn">
        <div className="relative w-full sm:w-80">
          <Search
            size={15}
            className="absolute inset-y-0 left-0 pl-3.5 my-auto text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="অর্ডার আইডি (যেমন TB-8492), পণ্য বা জোন খুঁজুন..."
            className="w-full bg-[#0F1E32] border border-[rgba(255,255,255,0.08)] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#F0F6FF] placeholder-slate-400 focus:outline-none focus:border-[#00D68F] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#A8C0D8]/70 font-medium">
          <ShieldCheck size={14} className="text-[#00D68F]" />
          <span>গ্রাহকের ঠিকানা ও ফোন গোপনীয়তা প্রোটেকশন চালু রয়েছে</span>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-[#A8C0D8] text-xs bg-[#0F1E32] rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-lg space-y-3 font-bn">
          <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag size={20} />
          </div>
          <p className="font-semibold text-[#F0F6FF]">
            এই সেকশনে বর্তমানে কোনো অর্ডার নেই।
          </p>
          <button
            onClick={simulateAreaDispatchOrder}
            className="px-4 py-2 bg-gradient-to-r from-[#00D68F] to-[#00B87A] hover:opacity-90 text-white rounded-xl font-bold shadow-md transition-all"
          >
            টেস্ট অর্ডার পাঠান (অ্যাডমিন ডিসপ্যাচ)
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const unweighedItem = order.items.find(
              (i) => i.pricingType === "WEIGHT_BASED" && !i.weightActual
            );

            return (
              <div
                key={order.id}
                className="bg-[#0F1E32] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 hover:border-[#00D68F]/40 transition-all shadow-md font-bn"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-base font-bold text-[#00D68F] bg-[rgba(0,214,143,0.12)] px-2.5 py-0.5 rounded-md border border-[rgba(0,214,143,0.3)]">
                        #{order.displayId}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.urgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <Flame size={12} />
                          <span>জরুরি অর্ডার</span>
                        </span>
                      )}
                    </div>

                    {/* Customer Info with Privacy Shield */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#A8C0D8] mt-1">
                      <span className="font-bold text-[#F0F6FF]">
                        {order.customerName}
                      </span>
                      <span className="flex items-center gap-1 text-[#00D68F] bg-[rgba(0,214,143,0.12)] px-2 py-0.5 rounded border border-[rgba(0,214,143,0.3)] font-semibold">
                        <MapPin size={12} className="text-[#00D68F]" />
                        <span>{order.deliveryZone || "ঢাকা জোন"}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                        <ShieldCheck size={13} className="text-[#00D68F]" />
                        <span>🔒 ঠিকানা ও ফোন গোপনীয় (রাইডারের দায়িত্বে)</span>
                      </span>
                    </div>

                    {order.notes && (
                      <div className="text-[11px] text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/25 inline-block font-medium">
                        গ্রাহকের প্যাকেজিং নোট: {order.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-[#F0F6FF]">
                      ৳{order.grossTotal.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#00D68F] font-semibold font-mono">
                      নেট ভেন্ডর আয়: ৳{order.netTotal.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {order.paymentMethod === "CASH_ON_DELIVERY" ? "ক্যাশ অন ডেলিভারি" : "প্রিপেইড (" + order.paymentMethod + ")"}
                    </div>
                  </div>
                </div>

                {/* Assigned Rider Bar & Status Action */}
                {(order.status === "READY_FOR_PICKUP" || order.status === "HANDED_TO_RIDER" || order.status === "COMPLETED" || order.riderName) && (() => {
                  const isHandedOver = order.status === "HANDED_TO_RIDER" || order.status === "COMPLETED";
                  const riderName = order.riderName || "তামীম ইকবাল (রাইডার #১০১)";
                  const riderPhone = order.riderPhone || "01700000001";
                  const riderVehicle = order.riderVehicle || "মোটরসাইকেল (ঢাকা মেট্রো-হ-৪৫-১২৩৪)";

                  return (
                    <div className="mt-3.5 p-3 rounded-xl bg-[rgba(0,214,143,0.08)] border border-[rgba(0,214,143,0.25)] text-xs flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 text-[#F0F6FF]">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D68F] to-[#00B87A] text-[#051322] font-black flex items-center justify-center shrink-0 shadow-sm text-base">
                          🛵
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-[#F0F6FF]">
                              {riderName}
                            </strong>
                            <span className="text-[10px] bg-[rgba(0,214,143,0.18)] text-[#00D68F] px-1.5 py-0.2 rounded font-bold border border-[rgba(0,214,143,0.3)]">
                              {order.status === "COMPLETED"
                                ? "ডেলিভার্ড ✓"
                                : isHandedOver
                                ? "পার্সেল পিকআপ সম্পন্ন (ডেলিভারির পথে)"
                                : "পিকআপের জন্য দোকানে আসার পথে"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#A8C0D8]">
                            {riderVehicle} • {riderPhone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Order Tracking Button */}
                        <button
                          onClick={() => setTrackingOrder(order)}
                          className="px-3 py-1.5 bg-[#00D68F] hover:bg-[#00b87a] text-[#051322] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                          title="অর্ডার ট্র্যাকিং ও স্ট্যাটাস দেখুন"
                        >
                          <Clock size={13} />
                          <span>অর্ডার ট্র্যাকিং</span>
                        </button>

                        {/* Chat with Rider */}
                        {!isHandedOver && (
                          <button
                            onClick={() => setChatOrder(order)}
                            className="px-3 py-1.5 bg-[#122035] hover:bg-[#172540] text-[#00D68F] border border-[rgba(0,214,143,0.35)] rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                            title="পার্সেল পিকআপের পূর্বে রাইডারের সাথে চ্যাট করুন"
                          >
                            <MessageCircle size={13} />
                            <span>রাইডার চ্যাট</span>
                          </button>
                        )}

                        {/* Direct Phone Call Button */}
                        <a
                          href={`tel:${riderPhone}`}
                          className="px-2.5 py-1.5 text-white hover:text-white bg-[#122035] hover:bg-[#172540] rounded-lg border border-[rgba(255,255,255,0.12)] font-bold flex items-center gap-1 text-xs transition-colors shadow-2xs"
                          title="রাইডারকে সরাসরি ফোন কল করুন"
                        >
                          <Phone size={13} className="text-[#00D68F]" />
                          <span>কল দিন</span>
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* Return Reason Banner */}
                {order.status === "RETURNED" && (
                  <div className="mt-3.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-rose-200">রিটার্ন কারণ:</strong>{" "}
                      <span>{order.returnReason || "গ্রাহক দরজায় অনুপস্থিত ছিলেন এবং ফোনে যোগাযোগ করা যায়নি।"}</span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        পার্সেল ফেরত এসেছে। পণ্যসমূহ আনপ্যাক করে পুনরায় ইনভেন্টরি স্টকে যুক্ত করতে পারেন।
                      </p>
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#F0F6FF]">
                    <thead>
                      <tr className="text-[#A8C0D8] border-b border-[rgba(255,255,255,0.06)] pb-2">
                        <th className="py-2.5 font-semibold">পণ্য ও জাত</th>
                        <th className="py-2.5 font-semibold">ধরণ</th>
                        <th className="py-2.5 font-semibold">অর্ডারকৃত পরিমাণ</th>
                        <th className="py-2.5 font-semibold">প্রকৃত স্কেল ওজন</th>
                        <th className="py-2.5 font-semibold">আইটেম মোট</th>
                        <th className="py-2.5 text-right font-semibold">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.06)]">
                      {order.items.map((item) => {
                        const isWeightBased = item.pricingType === "WEIGHT_BASED";

                        return (
                          <tr key={item.id} className="hover:bg-[#172540]/40 transition-colors">
                            <td className="py-3 font-semibold text-[#F0F6FF]">
                              {language === "bn" ? item.productNameBn : item.productName}
                            </td>
                            <td className="py-3 text-[#A8C0D8]">
                              {isWeightBased ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/30">ওজন ভিত্তিক</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-700/40 text-slate-300 border border-slate-600/40">প্যাকেট</span>
                              )}
                            </td>
                            <td className="py-3 text-[#A8C0D8] font-mono">
                              {isWeightBased ? `${item.weightOrdered} ${item.unit}` : `${item.quantity} ${item.unit}`}
                            </td>
                            <td className="py-3 font-mono">
                              {isWeightBased ? (
                                item.weightActual ? (
                                  <span className="text-[#00D68F] font-bold">
                                    ✓ {item.weightActual} {item.unit}
                                  </span>
                                ) : (
                                  <span className="text-[#F59E0B] font-semibold italic">
                                    ওজন বাকি (স্কেল)
                                  </span>
                                )
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-3 font-mono font-bold text-[#F0F6FF]">
                              ৳{item.finalPrice}
                            </td>
                            <td className="py-3 text-right">
                              {isWeightBased && (order.status === "PROCESSING" || order.status === "PREPARING") && (
                                <button
                                  onClick={() => {
                                    setActiveWeightOrderId(order.id);
                                    setActiveWeightItemId(item.id);
                                  }}
                                  className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-[#F59E0B] border border-amber-500/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-all"
                                >
                                  <Scale size={13} />
                                  <span>{item.weightActual ? "পুনরায় ওজন" : "স্কেলে ওজন করুন"}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Controls based on 6 Statuses */}
                <div className="mt-4 pt-3.5 border-t border-[rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {(order.status === "PROCESSING" || order.status === "PREPARING") && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => setActiveChecklistOrderId(order.id)}
                          className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <CheckSquare size={14} />
                          <span>প্যাকিং চেকলিস্ট</span>
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If PENDING: Accept Order or Decline */}
                    {(order.status === "PENDING" || order.status === "RECEIVED") && (
                      <>
                        <button
                          onClick={() => declineOrder(order.id)}
                          className="px-3.5 py-2 bg-[#122035] hover:bg-[#172540] text-[#A8C0D8] rounded-xl font-bold border border-[rgba(255,255,255,0.08)] transition-all"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={() => acceptOrder(order.id)}
                          className="px-4 py-2 bg-gradient-to-r from-[#00D68F] to-[#00B87A] hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                        >
                          অর্ডার গ্রহণ করুন (প্রসেসিং শুরু)
                        </button>
                      </>
                    )}

                    {/* If PROCESSING: Mark Ready for Pickup */}
                    {(order.status === "PROCESSING" || order.status === "PREPARING") && (
                      <button
                        onClick={() => {
                          if (unweighedItem) {
                            reconcileItemWeight(order.id, unweighedItem.id, unweighedItem.weightOrdered || 1.0);
                          }
                          updateOrderStatus(order.id, "READY_FOR_PICKUP");
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-[#00D68F] to-[#00B87A] text-[#051322] rounded-xl font-extrabold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <Sparkles size={14} />
                        <span>প্যাকিং সম্পন্ন - রেডি ফর পিকআপ</span>
                      </button>
                    )}

                    {/* If READY_FOR_PICKUP: Notice that vendor's job is complete & rider is assigned */}
                    {order.status === "READY_FOR_PICKUP" && (
                      <div className="flex items-center gap-2">
                        <span className="text-[#00D68F] font-semibold text-[11px] bg-[rgba(0,214,143,0.12)] px-2.5 py-1.5 rounded-lg border border-[rgba(0,214,143,0.3)]">
                          ✓ ভেন্ডরের কাজ শেষ, রাইডার পার্সেল নিতে আসছেন
                        </span>
                        <button
                          onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                          className="px-3.5 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl font-bold text-xs shadow-md"
                          title="রাইডার পার্সেল নিয়ে গেলে সম্পন্ন মার্ক করুন"
                        >
                          রাইডারকে পার্সেল বুঝিয়ে দিয়েছি
                        </button>
                      </div>
                    )}

                    {/* If COMPLETED: Link to view Receipt / Details */}
                    {order.status === "COMPLETED" && (
                      <span className="text-[#00D68F] text-xs font-semibold bg-[rgba(0,214,143,0.12)] px-3 py-1.5 rounded-lg border border-[rgba(0,214,143,0.3)]">
                        ✓ রাইডার কর্তৃক সফলভাবে ডেলিভার্ড
                      </span>
                    )}

                    {/* If RETURNED: Option to restock */}
                    {order.status === "RETURNED" && (
                      <Link
                        href="/inventory"
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-2xs"
                      >
                        ইনভেন্টরি রিস্টক করুন
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Modals */}
      <WeightReconciliationModal
        isOpen={!!activeWeightOrder && !!activeWeightItem}
        order={activeWeightOrder}
        item={activeWeightItem}
        onClose={() => {
          setActiveWeightOrderId(null);
          setActiveWeightItemId(null);
        }}
      />

      <PackingChecklistModal
        isOpen={!!activeChecklistOrder}
        order={activeChecklistOrder}
        onClose={() => setActiveChecklistOrderId(null)}
        onReadyForPickup={(orderId) =>
          updateOrderStatus(orderId, "READY_FOR_PICKUP")
        }
      />
    </div>
  );
}
