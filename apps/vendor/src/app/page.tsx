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
    orders,
    products,
    commissionLedger,
    updateOrderStatus,
    simulateIncomingOrder,
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
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
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
    <div className="space-y-6 select-none">
      {/* Top Banner / Store Status Bar */}
      {profile.vacationMode && (
        <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <AlertTriangle size={18} className="text-amber-400 shrink-0" />
            <span>{t.vacationActive}</span>
          </div>
          <Link
            href="/settings"
            className="text-xs underline font-bold hover:text-amber-200"
          >
            {language === "bn" ? "সেটিংস দেখুন" : "View Settings"}
          </Link>
        </div>
      )}

      {/* Operational Greeting & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {language === "bn" ? profile.storeNameBn : profile.storeName}
            </h1>
            <span className="badge-emerald text-[11px]">
              ⭐ {profile.rating} • {language === "bn" ? "বিশ্বস্ত" : "Trusted"}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === "bn"
              ? "দৈনন্দিন বাজার অপারেশন, দ্রুত অর্ডার প্যাকিং ও স্কেল ওজন সমন্বয়"
              : "Daily marketplace console: order fulfillment, scale weight reconciliation & payouts"}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={simulateIncomingOrder}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition-colors"
          >
            <Zap size={15} />
            <span>{t.simulateOrderBtn}</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {t.todaySales}
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              ৳{todayGrossSales.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">+14.2%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{completedOrders.length} {language === "bn" ? "অর্ডার সম্পন্ন" : "delivered"}</span>
            <Link href="/settlements" className="text-slate-400 hover:text-emerald-400 underline">
              {language === "bn" ? "খতিয়ান →" : "Ledger →"}
            </Link>
          </div>
        </div>

        {/* Card 2: Orders Pending Prep */}
        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {t.pendingOrders}
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {pendingOrders.length}
            </span>
            <span className="text-[11px] text-amber-400 font-medium">
              {language === "bn" ? "জরুরি তাজা পণ্য" : "Priority Fresh"}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{orders.filter((o) => o.status === "READY_FOR_PICKUP").length} {language === "bn" ? "পিকআপের অপেক্ষায়" : "ready for rider"}</span>
            <Link href="/orders" className="text-slate-400 hover:text-amber-400 underline">
              {language === "bn" ? "কিউ দেখুন →" : "Queue →"}
            </Link>
          </div>
        </div>

        {/* Card 3: Low-Stock Alerts */}
        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {t.lowStockAlerts}
            </span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <PackageCheck size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {lowStockItems.length}
            </span>
            <span className="text-[11px] text-rose-400 font-medium">
              {language === "bn" ? "দ্রুত রিস্টক প্রয়োজন" : "Restock needed"}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{products.length} {language === "bn" ? "সর্বমোট পণ্য" : "total SKUs"}</span>
            <Link href="/inventory" className="text-slate-400 hover:text-rose-400 underline">
              {language === "bn" ? "স্টক নিরীক্ষা →" : "Audit →"}
            </Link>
          </div>
        </div>

        {/* Card 4: Wallet & Payout */}
        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {t.availableForPayout}
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Wallet size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
              ৳{availableSettlementBalance.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-[11px] flex items-center justify-between">
            <span className="text-slate-500">
              {language === "bn" ? "১০% ফি কর্তনকৃত" : "10% Tatka fee deducted"}
            </span>
            {currentRole === "OWNER" ? (
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 underline font-semibold"
              >
                {t.requestPayoutBtn}
              </button>
            ) : (
              <span className="text-slate-500 italic text-[10px]">
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
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                {t.liveQueueTitle}
              </h2>
              <p className="text-xs text-slate-400">{t.liveQueueSub}</p>
            </div>
            <Link
              href="/orders"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>{t.viewAllOrders}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#111C20] border border-[#20333B] text-center text-slate-400 text-xs">
              <p>{language === "bn" ? "বর্তমানে কোনো জরুরি অপেক্ষমাণ অর্ডার নেই।" : "No pending orders waiting for preparation."}</p>
              <button
                onClick={simulateIncomingOrder}
                className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
              >
                {t.simulateOrderBtn}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => {
                const unweighedItem = order.items.find(
                  (i) => i.pricingType === "WEIGHT_BASED" && !i.weightActual
                );
                const allPacked = order.items.every((i) => i.packed);

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-emerald-500/40 transition-colors shadow-sm"
                  >
                    {/* Order Row Header */}
                    <div className="flex items-start justify-between pb-3 border-b border-[#20333B]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-emerald-400">
                            #{order.displayId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              order.status === "RECEIVED"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            }`}
                          >
                            {order.status === "RECEIVED"
                              ? t.tabReceived
                              : t.tabPreparing}
                          </span>
                          {order.urgent && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              {t.urgentBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          <strong>{order.customerName}</strong> • {order.customerAddress}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-white">
                          ৳{order.grossTotal.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {order.paymentMethod} • {order.items.length} {t.itemsCount}
                        </div>
                      </div>
                    </div>

                    {/* Order Line Items preview */}
                    <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#152227] border border-[#20333B]/60"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-200 truncate">
                              {language === "bn" ? item.productNameBn : item.productName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {item.pricingType === "WEIGHT_BASED" ? (
                                item.weightActual ? (
                                  <span className="text-emerald-400 font-semibold">
                                    Weighed: {item.weightActual} {item.unit}
                                  </span>
                                ) : (
                                  <span className="text-amber-400 font-semibold">
                                    Est: {item.weightOrdered} {item.unit} (Needs scale!)
                                  </span>
                                )
                              ) : (
                                <span>
                                  {item.quantity} {item.unit}
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
                              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-bold flex items-center gap-1 shrink-0 ml-2"
                            >
                              <Scale size={13} />
                              <span>{language === "bn" ? "ওজন করুন" : "Weigh"}</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Actions */}
                    <div className="pt-3 border-t border-[#20333B] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <Clock size={14} className="text-slate-500" />
                        <span>{language === "bn" ? "বরাদ্দ:" : "Assigned:"} {new Date(order.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Open packing checklist */}
                        <button
                          onClick={() => setActiveChecklistOrderId(order.id)}
                          className="px-3 py-1.5 bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <CheckSquare size={14} className="text-emerald-400" />
                          <span>{t.packingChecklistBtn}</span>
                        </button>

                        {/* If received, advance to preparing */}
                        {order.status === "RECEIVED" && (
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "PREPARING")
                            }
                            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors"
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
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
                          >
                            <Sparkles size={14} />
                            <span>{t.markReadyBtn}</span>
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
          <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#20333B]">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t.settlementSnapshotTitle}
                </h3>
              </div>
              <Link
                href="/settlements"
                className="text-[11px] text-emerald-400 hover:underline"
              >
                {language === "bn" ? "বিস্তারিত" : "Details"}
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>{t.availableForPayout}:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  ৳{availableSettlementBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{t.settledThisMonth}:</span>
                <span className="font-mono text-slate-200">
                  ৳{settledThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{t.platformCommission}:</span>
                <span className="font-mono text-slate-300">10%</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>{t.nextPayoutCycle}:</span>
                <span className="text-slate-300">Sunday Weekly</span>
              </div>
            </div>

            {currentRole === "OWNER" && (
              <button
                onClick={() => setIsPayoutModalOpen(true)}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
              >
                <Wallet size={14} />
                <span>{t.requestPayoutBtn}</span>
              </button>
            )}
          </div>

          {/* Critical Low Stock Items */}
          <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-[#20333B]">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t.lowStockAlerts}
                </h3>
              </div>
              <Link
                href="/inventory"
                className="text-[11px] text-rose-400 hover:underline"
              >
                {t.viewInventory}
              </Link>
            </div>

            <div className="space-y-2">
              {lowStockItems.slice(0, 4).map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 rounded-lg bg-[#152227] border border-[#20333B] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="font-semibold text-slate-200 truncate">
                      {language === "bn" ? prod.nameBn : prod.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Threshold: {prod.lowStockThreshold} {prod.unit}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        prod.stockQty === 0
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
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
