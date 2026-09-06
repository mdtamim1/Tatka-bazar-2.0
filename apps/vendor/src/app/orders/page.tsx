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
    acceptOrder,
    declineOrder,
    setChatOrder,
    setTrackingOrder,
    resetShiftQueue,
    shiftStartedAt,
    simulateAreaDispatchOrder,
    simulateRemoteClaim,
  } = useVendorStore();

  const t = translations[language];

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
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Top Header & Operational Shift Controller */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              অর্ডার ব্যবস্থাপনা ও অপারেশন কিউ
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Clock size={12} className="text-emerald-600" />
              <span>১২ ঘণ্টার শিফট: {remainingHours} ঘণ্টা বাকি</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            গ্রাহকের গোপনীয়তা সুরক্ষিত • ডিজিটাল স্কেল ওজন সমন্বয় • পিকআপ সম্পন্ন হলে রিয়েল-টাইম রাইডার ট্র্যাকিং
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/orders/history"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors"
            title="সকল বিগত অর্ডারের স্থায়ী ইতিহাস ও সার্চ"
          >
            <History size={14} className="text-emerald-600" />
            <span>অর্ডার হিস্ট্রি (সকল ইতিহাস)</span>
          </Link>

          <button
            onClick={resetShiftQueue}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200 transition-colors"
            title="১২ ঘণ্টার শিফট কিউ ম্যানুয়ালি রিসেট করুন"
          >
            <RotateCcw size={13} />
            <span>শিফট রিসেট</span>
          </button>

          <button
            onClick={simulateAreaDispatchOrder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            title="অ্যাডমিন থেকে ৫টি ভেন্ডরের কাছে এলাকাভিত্তিক অর্ডার পাঠানো টেস্ট করুন"
          >
            <Zap size={14} className="text-emerald-200" />
            <span>+ এলাকাভিত্তিক টেস্ট অর্ডার</span>
          </button>
        </div>
      </div>

      {/* Top 6 Pipeline Status Modules */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Today Orders */}
        <button
          onClick={() => setActiveTab("ALL")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "ALL"
              ? "bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500/30"
              : "bg-white text-slate-700 border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "ALL" ? "text-emerald-100" : "text-slate-500"}`}>
              আজকের অর্ডার
            </span>
            <ShoppingBag size={15} className={activeTab === "ALL" ? "text-emerald-200" : "text-slate-400"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono">{countToday}</span>
            <span className={`text-[10px] ${activeTab === "ALL" ? "text-emerald-200" : "text-slate-400"}`}>টি</span>
          </div>
        </button>

        {/* 2. Pending */}
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "PENDING"
              ? "bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/30"
              : "bg-white text-slate-700 border-slate-200/80 hover:border-amber-300 hover:bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "PENDING" ? "text-amber-100" : "text-slate-500"}`}>
              পেন্ডিং
            </span>
            <Clock size={15} className={activeTab === "PENDING" ? "text-amber-200" : "text-amber-500"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-amber-500 group-hover:text-white" style={{ color: activeTab === "PENDING" ? "white" : undefined }}>
              {countPending}
            </span>
            <span className={`text-[10px] ${activeTab === "PENDING" ? "text-amber-100" : "text-slate-400"}`}>অপেক্ষমাণ</span>
          </div>
        </button>

        {/* 3. Processing */}
        <button
          onClick={() => setActiveTab("PROCESSING")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "PROCESSING"
              ? "bg-sky-600 text-white border-sky-600 shadow-sm ring-2 ring-sky-400/30"
              : "bg-white text-slate-700 border-slate-200/80 hover:border-sky-300 hover:bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "PROCESSING" ? "text-sky-100" : "text-slate-500"}`}>
              প্রসেসিং
            </span>
            <Scale size={15} className={activeTab === "PROCESSING" ? "text-sky-200" : "text-sky-500"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono" style={{ color: activeTab === "PROCESSING" ? "white" : undefined }}>
              {countProcessing}
            </span>
            <span className={`text-[10px] ${activeTab === "PROCESSING" ? "text-sky-100" : "text-slate-400"}`}>প্যাকিং চলছে</span>
          </div>
        </button>

        {/* 4. Ready for Pickup */}
        <button
          onClick={() => setActiveTab("READY_FOR_PICKUP")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "READY_FOR_PICKUP"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/30"
              : "bg-white text-slate-700 border-slate-200/80 hover:border-emerald-300 hover:bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "READY_FOR_PICKUP" ? "text-emerald-100" : "text-slate-500"}`}>
              রেডি ফর পিকআপ
            </span>
            <Bike size={15} className={activeTab === "READY_FOR_PICKUP" ? "text-emerald-200" : "text-emerald-600"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono" style={{ color: activeTab === "READY_FOR_PICKUP" ? "white" : undefined }}>
              {countReady}
            </span>
            <span className={`text-[10px] ${activeTab === "READY_FOR_PICKUP" ? "text-emerald-100" : "text-slate-400"}`}>রাইডার অ্যালার্ট</span>
          </div>
        </button>

        {/* 5. Completed */}
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "COMPLETED"
              ? "bg-slate-800 text-white border-slate-800 shadow-sm ring-2 ring-slate-400/30"
              : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "COMPLETED" ? "text-slate-200" : "text-slate-500"}`}>
              সম্পন্ন
            </span>
            <CheckCircle size={15} className={activeTab === "COMPLETED" ? "text-slate-300" : "text-slate-500"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono" style={{ color: activeTab === "COMPLETED" ? "white" : undefined }}>
              {countCompleted}
            </span>
            <span className={`text-[10px] ${activeTab === "COMPLETED" ? "text-slate-300" : "text-slate-400"}`}>ডেলিভার্ড</span>
          </div>
        </button>

        {/* 6. Returned */}
        <button
          onClick={() => setActiveTab("RETURNED")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeTab === "RETURNED"
              ? "bg-rose-600 text-white border-rose-600 shadow-sm ring-2 ring-rose-400/30"
              : "bg-white text-slate-700 border-slate-200/80 hover:border-rose-300 hover:bg-slate-50/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold ${activeTab === "RETURNED" ? "text-rose-100" : "text-slate-500"}`}>
              রিটার্নড
            </span>
            <RotateCcw size={15} className={activeTab === "RETURNED" ? "text-rose-200" : "text-rose-500"} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-black font-mono text-rose-600" style={{ color: activeTab === "RETURNED" ? "white" : undefined }}>
              {countReturned}
            </span>
            <span className={`text-[10px] ${activeTab === "RETURNED" ? "text-rose-100" : "text-slate-400"}`}>ফেরত এসেছে</span>
          </div>
        </button>
      </div>

      {/* Search & Area Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
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
            className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>গ্রাহকের ঠিকানা ও ফোন গোপনীয়তা প্রোটেকশন চালু রয়েছে</span>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag size={20} />
          </div>
          <p className="font-semibold text-slate-700">
            এই সেকশনে বর্তমানে কোনো অর্ডার নেই।
          </p>
          <button
            onClick={simulateAreaDispatchOrder}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-all"
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
                className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-base font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        #{order.displayId}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.urgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <Flame size={12} />
                          <span>জরুরি অর্ডার</span>
                        </span>
                      )}
                    </div>

                    {/* Customer Info with Privacy Shield (Strictly No Street Address / Phone) */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                      <span className="font-bold text-slate-900">
                        {order.customerName}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50/70 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        <MapPin size={12} className="text-emerald-600" />
                        <span>{order.deliveryZone || "ঢাকা জোন"}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <span>🔒 ঠিকানা ও ফোন গোপনীয় (রাইডারের দায়িত্বে)</span>
                      </span>
                    </div>

                    {order.notes && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block font-medium">
                        গ্রাহকের প্যাকেজিং নোট: {order.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-slate-900">
                      ৳{order.grossTotal.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-700 font-semibold font-mono">
                      নেট ভেন্ডর আয়: ৳{order.netTotal.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {order.paymentMethod === "CASH_ON_DELIVERY" ? "ক্যাশ অন ডেলিভারি" : "প্রিপেইড (" + order.paymentMethod + ")"}
                    </div>
                  </div>
                </div>

                {/* Assigned Rider Bar & Live Tracking Action */}
                {(order.status === "READY_FOR_PICKUP" || order.status === "COMPLETED" || order.riderName) && (
                  <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Bike size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900">
                            {order.riderName || "তানভীর আহমেদ (রাইডার #১০১)"}
                          </strong>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            {order.status === "READY_FOR_PICKUP" ? "পিকআপের পথে" : "ডেলিভার্ড"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {order.riderVehicle || "হোন্ডা ড্রিম বাইক"} • {order.riderPhone || "01712-334455"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Live Tracking Button for Vendor */}
                      <button
                        onClick={() => setTrackingOrder(order)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                        title="রাইডারের রিয়েল-টাইম লাইভ লোকেশন ও ম্যাপ ট্র্যাক করুন"
                      >
                        <Navigation size={13} className="animate-spin" />
                        <span>লাইভ ট্র্যাক</span>
                      </button>

                      {/* Chat with Rider */}
                      <button
                        onClick={() => setChatOrder(order)}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <MessageCircle size={13} />
                        <span>রাইডার চ্যাট</span>
                      </button>

                      {/* Call Rider */}
                      <a
                        href={`tel:${order.riderPhone || "01712334455"}`}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors"
                        title="রাইডারকে কল দিন"
                      >
                        <Phone size={13} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Return Reason Banner (If status is RETURNED) */}
                {order.status === "RETURNED" && (
                  <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">রিটার্ন কারণ:</strong>{" "}
                      <span>{order.returnReason || "গ্রাহক দরজায় অনুপস্থিত ছিলেন এবং ফোনে যোগাযোগ করা যায়নি।"}</span>
                      <p className="text-[11px] text-slate-500 mt-1">
                        পার্সেল ফেরত এসেছে। পণ্যসমূহ আনপ্যাক করে পুনরায় ইনভেন্টরি স্টকে যুক্ত করতে পারেন।
                      </p>
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-100 pb-2">
                        <th className="py-2.5 font-semibold">পণ্য ও জাত</th>
                        <th className="py-2.5 font-semibold">ধরণ</th>
                        <th className="py-2.5 font-semibold">অর্ডারকৃত পরিমাণ</th>
                        <th className="py-2.5 font-semibold">প্রকৃত স্কেল ওজন</th>
                        <th className="py-2.5 font-semibold">আইটেম মোট</th>
                        <th className="py-2.5 text-right font-semibold">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item) => {
                        const isWeightBased = item.pricingType === "WEIGHT_BASED";

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 font-semibold text-slate-900">
                              {language === "bn" ? item.productNameBn : item.productName}
                            </td>
                            <td className="py-3 text-slate-600">
                              {isWeightBased ? (
                                <span className="badge-sky text-[10px]">ওজন ভিত্তিক</span>
                              ) : (
                                <span className="badge-slate text-[10px]">প্যাকেট</span>
                              )}
                            </td>
                            <td className="py-3 text-slate-700 font-mono">
                              {isWeightBased ? `${item.weightOrdered} ${item.unit}` : `${item.quantity} ${item.unit}`}
                            </td>
                            <td className="py-3 font-mono">
                              {isWeightBased ? (
                                item.weightActual ? (
                                  <span className="text-emerald-800 font-bold">
                                    ✓ {item.weightActual} {item.unit}
                                  </span>
                                ) : (
                                  <span className="text-amber-700 font-semibold italic">
                                    ওজন বাকি (স্কেল)
                                  </span>
                                )
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-3 font-mono font-bold text-slate-900">
                              ৳{item.finalPrice}
                            </td>
                            <td className="py-3 text-right">
                              {isWeightBased && (order.status === "PROCESSING" || order.status === "PREPARING") && (
                                <button
                                  onClick={() => {
                                    setActiveWeightOrderId(order.id);
                                    setActiveWeightItemId(item.id);
                                  }}
                                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-all"
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
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
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
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                        >
                          বাতিল
                        </button>
                        <button
                          onClick={() => acceptOrder(order.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs active:scale-95"
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
                            setActiveWeightOrderId(order.id);
                            setActiveWeightItemId(unweighedItem.id);
                          } else {
                            updateOrderStatus(order.id, "READY_FOR_PICKUP");
                          }
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <Sparkles size={14} />
                        <span>প্যাকিং সম্পন্ন - রেডি ফর পিকআপ</span>
                      </button>
                    )}

                    {/* If READY_FOR_PICKUP: Notice that vendor's job is complete & rider is assigned */}
                    {order.status === "READY_FOR_PICKUP" && (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-800 font-semibold text-[11px] bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                          ✓ ভেন্ডরের কাজ শেষ, রাইডার পার্সেল নিতে আসছেন
                        </span>
                        <button
                          onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-2xs"
                          title="রাইডার পার্সেল নিয়ে গেলে সম্পন্ন মার্ক করুন"
                        >
                          রাইডারকে পার্সেল বুঝিয়ে দিয়েছি
                        </button>
                      </div>
                    )}

                    {/* If COMPLETED: Link to view Receipt / Details */}
                    {order.status === "COMPLETED" && (
                      <span className="text-slate-600 text-xs font-semibold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
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
