"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  PackageCheck,
  Wallet,
  AlertTriangle,
  ArrowRight,
  Scale,
  CheckSquare,
  Sparkles,
  Zap,
  Clock,
  MessageCircle,
  Bike,
  Phone,
  Store,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";
import { Order, OrderItem } from "@/types/vendor";
import WeightReconciliationModal from "@/components/common/WeightReconciliationModal";
import PackingChecklistModal from "@/components/common/PackingChecklistModal";
import PayoutRequestModal from "@/components/common/PayoutRequestModal";

export default function VendorDashboardPage() {
  const {
    language,
    currentRole,
    profile,
    dutyStatus,
    setDutyStatus,
    orders,
    products,
    commissionLedger,
    updateOrderStatus,
    simulateIncomingOrder,
    setChatOrder,
    setTrackingOrder,
  } = useVendorStore();

  const t = translations[language];

  // Live derived modals state from Zustand store
  const [activeWeightOrderId, setActiveWeightOrderId] = useState<string | null>(null);
  const [activeWeightItemId, setActiveWeightItemId] = useState<string | null>(null);
  const [activeChecklistOrderId, setActiveChecklistOrderId] = useState<string | null>(null);

  const activeWeightOrder = orders.find((o) => o.id === activeWeightOrderId) || null;
  const activeWeightItem = activeWeightOrder?.items.find((i) => i.id === activeWeightItemId) || null;
  const activeChecklistOrder = orders.find((o) => o.id === activeChecklistOrderId) || null;

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Metrics computation
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const todayGrossSales = completedOrders.reduce((sum, o) => sum + o.grossTotal, 0);

  const pendingOrders = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING" || o.status === "READY_FOR_PICKUP"
  );

  const lowStockItems = products.filter(
    (p) => p.stockQty <= p.lowStockThreshold
  );

  const pendingCommissionLedger = commissionLedger.filter(
    (c) => c.settlementStatus === "PENDING"
  );

  const availableSettlementBalance = pendingCommissionLedger.reduce(
    (sum, c) => sum + c.netPayable,
    0
  );

  const settledThisMonth = commissionLedger
    .filter((c) => c.settlementStatus === "SETTLED")
    .reduce((sum, c) => sum + c.netPayable, 0);

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Vacation / Alert Banner */}
      {profile.vacationMode && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
            <span>{t.vacationActive}</span>
          </div>
          <Link
            href="/settings"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 underline"
          >
            {language === "bn" ? "সেটিংস দেখুন" : "View Settings"}
          </Link>
        </div>
      )}

      {/* Operational Greeting & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {language === "bn" ? profile.storeNameBn : profile.storeName}
            </h1>
            <span className="badge-emerald text-[11px]">
              ⭐ {profile.rating} • {language === "bn" ? "যাচাইকৃত বিক্রেতা" : "Verified Vendor"}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              dutyStatus === "STORE_OPEN" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                : dutyStatus === "BUSY" 
                ? "bg-amber-50 text-amber-700 border border-amber-200" 
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                dutyStatus === "STORE_OPEN" ? "bg-emerald-500 animate-pulse" : dutyStatus === "BUSY" ? "bg-amber-500" : "bg-slate-400"
              }`} />
              {dutyStatus === "STORE_OPEN" ? "দোকান খোলা (অর্ডার গ্রহণ সক্রিয়)" : dutyStatus === "BUSY" ? "ব্যস্ত মোড" : "দোকান বন্ধ"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === "bn"
              ? "দৈনন্দিন তাজা বাজার পরিচালনা, ডিজিটাল ওজন সমন্বয় ও তাৎক্ষণিক রাইডার হ্যান্ডওভার"
              : "Daily fresh market operations: digital scale weight sync, live rider coordination & payouts"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={simulateIncomingOrder}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95"
            title="রাইডার পোর্টালের মতো তাৎক্ষণিক ইনকামিং অর্ডার টেস্ট করুন"
          >
            <Zap size={15} className="text-emerald-200" />
            <span>{language === "bn" ? "নতুন অর্ডার টেস্ট (৪৫ সে.)" : "Simulate Alert (45s)"}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards - Off-White & Emerald Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t.todaySales}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              ৳{todayGrossSales.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">+14.2%</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{completedOrders.length} {language === "bn" ? "অর্ডার ডেলিভার্ড" : "delivered"}</span>
            <Link href="/settlements" className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-0.5">
              <span>{language === "bn" ? "খতিয়ান" : "Ledger"}</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Card 2: Orders Pending Prep */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t.pendingOrders}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {pendingOrders.length}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
              {language === "bn" ? "জরুরি তাজা পণ্য" : "Priority Fresh"}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{orders.filter((o) => o.status === "READY_FOR_PICKUP").length} {language === "bn" ? "পিকআপের অপেক্ষায়" : "ready for rider"}</span>
            <Link href="/orders" className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-0.5">
              <span>{language === "bn" ? "কিউ দেখুন" : "Queue"}</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Card 3: Low-Stock Alerts */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t.lowStockAlerts}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <PackageCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {lowStockItems.length}
            </span>
            <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
              {language === "bn" ? "রিস্টক প্রয়োজন" : "Restock needed"}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{products.length} {language === "bn" ? "সর্বমোট আইটেম" : "total SKUs"}</span>
            <Link href="/inventory" className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-0.5">
              <span>{language === "bn" ? "নিরীক্ষা" : "Audit"}</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Card 4: Wallet & Payout */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t.availableForPayout}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              ৳{availableSettlementBalance.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] flex items-center justify-between">
            <span className="text-slate-400">
              {language === "bn" ? "১০% ফি কর্তনকৃত" : "10% fee deducted"}
            </span>
            {currentRole === "OWNER" ? (
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="text-emerald-700 hover:text-emerald-800 font-bold underline"
              >
                {t.requestPayoutBtn}
              </button>
            ) : (
              <span className="text-slate-400 italic text-[10px]">
                {language === "bn" ? "মালিকের অনুমতি" : "Owner only"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Urgent Dispatch & Packing Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                {t.liveQueueTitle}
              </h2>
              <p className="text-xs text-slate-500">{t.liveQueueSub}</p>
            </div>
            <Link
              href="/orders"
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
            >
              <span>{t.viewAllOrders}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center text-slate-500 text-xs shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={24} />
              </div>
              <p className="font-semibold text-slate-700">
                {language === "bn" ? "বর্তমানে কোনো অপেক্ষমাণ অর্ডার নেই।" : "No pending orders waiting for preparation."}
              </p>
              <p className="text-slate-400 mt-1 text-[11px]">
                {language === "bn" ? "নতুন অর্ডার আসলে স্বয়ংক্রিয় সাউন্ড সহ স্ক্রিনে প্রদর্শিত হবে।" : "New orders will trigger a sound alert and pop up here."}
              </p>
              <button
                onClick={simulateIncomingOrder}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xs"
              >
                {language === "bn" ? "টেস্ট অর্ডার ট্রাই করুন" : "Simulate an Order"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => {
                const unweighedItem = order.items.find(
                  (i) => i.pricingType === "WEIGHT_BASED" && !i.weightActual
                );

                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 transition-all shadow-xs hover:shadow-md"
                  >
                    {/* Order Row Header */}
                    <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            #{order.displayId}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              order.status === "RECEIVED"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : order.status === "PREPARING"
                                ? "bg-sky-50 text-sky-700 border border-sky-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {order.status === "RECEIVED"
                              ? t.tabReceived
                              : order.status === "PREPARING"
                              ? t.tabPreparing
                              : t.tabReady}
                          </span>
                          {order.urgent && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {t.urgentBadge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 font-medium mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <strong className="text-slate-900">{order.customerName}</strong>
                          <span className="text-slate-400">•</span>
                          <span>📍 {order.deliveryZone || "মিরপুর জোন"}</span>
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            🔒 ঠিকানা সুরক্ষিত
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold font-mono text-slate-900">
                          ৳{order.grossTotal.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {order.paymentMethod} • {order.items.length} {t.itemsCount}
                        </div>
                      </div>
                    </div>

                    {/* Order Line Items preview */}
                    <div className="py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 truncate">
                              {language === "bn" ? item.productNameBn : item.productName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {item.pricingType === "WEIGHT_BASED" ? (
                                item.weightActual ? (
                                  <span className="text-emerald-700 font-bold">
                                    ✓ স্কেল ওজন: {item.weightActual} {item.unit}
                                  </span>
                                ) : (
                                  <span className="text-amber-700 font-semibold">
                                    আনুমানিক: {item.weightOrdered} {item.unit} (স্কেল বাকি)
                                  </span>
                                )
                              ) : (
                                <span>
                                  {item.quantity} {item.unit} (প্যাকেট)
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Quick weigh button if item needs weighing */}
                          {item.pricingType === "WEIGHT_BASED" && !item.weightActual && (
                            <button
                              onClick={() => {
                                setActiveWeightOrderId(order.id);
                                setActiveWeightItemId(item.id);
                              }}
                              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300/80 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 ml-2 shadow-2xs transition-all"
                            >
                              <Scale size={13} />
                              <span>{language === "bn" ? "ওজন করুন" : "Weigh"}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Assigned Rider Info & Real-Time Chat Trigger */}
                    {order.riderName && (
                      <div className="mb-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                        <div className="flex items-center gap-2 text-emerald-900">
                          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Bike size={15} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">
                              {order.riderName}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-1.5">
                              ({order.riderPhone})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${order.riderPhone}`}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 transition-colors"
                            title="কল করুন"
                          >
                            <Phone size={14} />
                          </a>

                          <button
                            onClick={() => setChatOrder(order)}
                            className="px-3 py-1.5 bg-white hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                          >
                            <MessageCircle size={14} />
                            <span>{language === "bn" ? "রাইডার চ্যাট" : "Rider Chat"}</span>
                          </button>

                          <button
                            onClick={() => setTrackingOrder(order)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
                          >
                            <Bike size={14} />
                            <span>{language === "bn" ? "লাইভ ট্র্যাক" : "Live Track"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Order Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <Clock size={14} className="text-slate-400" />
                        <span>{language === "bn" ? "বরাদ্দ:" : "Assigned:"} {new Date(order.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Open packing checklist */}
                        <button
                          onClick={() => setActiveChecklistOrderId(order.id)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <CheckSquare size={14} className="text-emerald-600" />
                          <span>{t.packingChecklistBtn}</span>
                        </button>

                        {/* If received, advance to preparing */}
                        {order.status === "RECEIVED" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "PREPARING")
                            }
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                          >
                            {language === "bn" ? "প্রস্তুতি শুরু করুন" : "Start Packing"}
                          </button>
                        )}

                        {/* If preparing and all items ready/weighed, ready for pickup */}
                        {order.status === "PREPARING" && (
                          <button
                            onClick={() => {
                              if (unweighedItem) {
                                setActiveWeightOrderId(order.id);
                                setActiveWeightItemId(unweighedItem.id);
                              } else {
                                updateOrderStatus(order.id, "READY_FOR_PICKUP");
                              }
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                          >
                            <Sparkles size={14} />
                            <span>{t.markReadyBtn}</span>
                          </button>
                        )}

                        {/* If ready for pickup, hand to rider */}
                        {order.status === "READY_FOR_PICKUP" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "HANDED_TO_RIDER")
                            }
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                          >
                            <Bike size={14} />
                            <span>{language === "bn" ? "রাইডারকে বুঝিয়ে দিন" : "Hand to Rider"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Settlement Snapshot & Low-Stock Alerts */}
        <div className="space-y-6">
          {/* Settlement Snapshot Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet size={16} />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t.settlementSnapshotTitle}
                </h3>
              </div>
              <Link
                href="/settlements"
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
              >
                {language === "bn" ? "বিস্তারিত" : "Details"}
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>{t.availableForPayout}:</span>
                <span className="font-mono font-bold text-emerald-700 text-base">
                  ৳{availableSettlementBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{t.settledThisMonth}:</span>
                <span className="font-mono font-semibold text-slate-800">
                  ৳{settledThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{t.platformCommission}:</span>
                <span className="font-mono text-slate-700 font-semibold">10%</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{t.nextPayoutCycle}:</span>
                <span className="text-slate-800 font-medium">প্রতি রবিবার (সাপ্তাহিক)</span>
              </div>
            </div>

            {currentRole === "OWNER" && (
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="w-full mt-3 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
              >
                <Wallet size={14} />
                <span>{t.requestPayoutBtn}</span>
              </button>
            )}
          </div>

          {/* Critical Low Stock Items */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {t.lowStockAlerts}
                </h3>
              </div>
              <Link
                href="/inventory"
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold hover:underline"
              >
                {t.viewInventory}
              </Link>
            </div>

            <div className="space-y-2">
              {lowStockItems.slice(0, 4).map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="font-semibold text-slate-800 truncate">
                      {language === "bn" ? prod.nameBn : prod.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      সতর্কতা সীমা: {prod.lowStockThreshold} {prod.unit}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        prod.stockQty === 0
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {prod.stockQty} {prod.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Action Modals */}
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

      <PayoutRequestModal
        isOpen={isPayoutModalOpen}
        availableBalance={availableSettlementBalance}
        onClose={() => setIsPayoutModalOpen(false)}
      />
    </div>
  );
}
