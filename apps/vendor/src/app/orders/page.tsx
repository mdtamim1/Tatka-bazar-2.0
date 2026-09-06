"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Scale,
  CheckSquare,
  Sparkles,
  Bike,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  FileText,
  MessageCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Order, OrderItem, OrderStatus } from "@/types/vendor";
import { translations } from "@/utils/translations";
import WeightReconciliationModal from "@/components/common/WeightReconciliationModal";
import PackingChecklistModal from "@/components/common/PackingChecklistModal";

export default function OrdersPage() {
  const { language, orders, updateOrderStatus, setChatOrder } = useVendorStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Live derived modals state from Zustand store
  const [activeWeightOrderId, setActiveWeightOrderId] = useState<string | null>(null);
  const [activeWeightItemId, setActiveWeightItemId] = useState<string | null>(null);
  const [activeChecklistOrderId, setActiveChecklistOrderId] = useState<string | null>(null);

  const activeWeightOrder = orders.find((o) => o.id === activeWeightOrderId) || null;
  const activeWeightItem = activeWeightOrder?.items.find((i) => i.id === activeWeightItemId) || null;
  const activeChecklistOrder = orders.find((o) => o.id === activeChecklistOrderId) || null;

  const filteredOrders = orders.filter((order) => {
    if (activeTab !== "ALL" && order.status !== activeTab) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        order.displayId.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        order.customerAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "RECEIVED":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            {t.tabReceived}
          </span>
        );
      case "PREPARING":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            {t.tabPreparing}
          </span>
        );
      case "READY_FOR_PICKUP":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {t.tabReady}
          </span>
        );
      case "HANDED_TO_RIDER":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            {language === "bn" ? "রাইডারের সাথে" : "With Rider"}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {t.tabCompleted}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            {t.tabCancelled}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.ordersTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{t.ordersSub}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Clock size={14} className="text-emerald-600" />
          <span>মোট সক্রিয় অর্ডার: {orders.filter(o => o.status !== "COMPLETED" && o.status !== "CANCELLED").length} টি</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
          {[
            { id: "ALL", label: t.tabAll, count: orders.length },
            {
              id: "RECEIVED",
              label: t.tabReceived,
              count: orders.filter((o) => o.status === "RECEIVED").length,
            },
            {
              id: "PREPARING",
              label: t.tabPreparing,
              count: orders.filter((o) => o.status === "PREPARING").length,
            },
            {
              id: "READY_FOR_PICKUP",
              label: t.tabReady,
              count: orders.filter((o) => o.status === "READY_FOR_PICKUP").length,
            },
            {
              id: "COMPLETED",
              label: t.tabCompleted,
              count: orders.filter((o) => o.status === "COMPLETED").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as OrderStatus | "ALL")}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50 border border-slate-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id
                    ? "bg-black/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search
            size={15}
            className="absolute inset-y-0 left-0 pl-3 my-auto text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "bn" ? "অর্ডার আইডি, গ্রাহক বা ফোন খুঁজুন..." : "Filter by ID, customer..."}
            className="w-full bg-white border border-slate-200/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          {language === "bn" ? "কোনো অর্ডার পাওয়া যায়নি।" : "No orders match this filter."}
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
                      <span className="font-mono text-base font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        #{order.displayId}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.urgent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {t.urgentBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1">
                      <span className="font-semibold text-slate-900">
                        {order.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={13} className="text-slate-400" />
                        {order.customerPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {order.customerAddress}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-slate-900">
                      ৳{order.grossTotal.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-700 font-semibold font-mono">
                      {t.netPayableCol}: ৳{order.netTotal.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {order.paymentMethod} • {order.paymentStatus}
                    </div>
                  </div>
                </div>

                {/* Assigned Rider Info (if assigned) */}
                {order.riderName && (
                  <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Bike size={16} />
                      </div>
                      <div>
                        <strong>{language === "bn" ? "বরাদ্দকৃত রাইডার:" : "Assigned Rider:"}</strong>{" "}
                        <span className="text-slate-900 font-bold">{order.riderName}</span>{" "}
                        <span className="text-slate-500">({order.riderPhone})</span>
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
                    </div>
                  </div>
                )}

                {/* Items Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-100 pb-2">
                        <th className="py-2.5 font-semibold">{t.productCol}</th>
                        <th className="py-2.5 font-semibold">{t.pricingTypeCol}</th>
                        <th className="py-2.5 font-semibold">{language === "bn" ? "অর্ডারকৃত" : "Ordered"}</th>
                        <th className="py-2.5 font-semibold">{language === "bn" ? "প্রকৃত স্কেল ওজন" : "Actual Scale"}</th>
                        <th className="py-2.5 font-semibold">{language === "bn" ? "চূড়ান্ত দর" : "Item Total"}</th>
                        <th className="py-2.5 text-right font-semibold">{t.actionsCol}</th>
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
                                <span className="badge-sky text-[10px]">
                                  {language === "bn" ? "ওজন ভিত্তিক" : "Weight-Based"}
                                </span>
                              ) : (
                                <span className="badge-slate text-[10px]">
                                  {language === "bn" ? "প্যাকেট" : "Fixed Pack"}
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-700 font-mono">
                              {isWeightBased ? `${item.weightOrdered} ${item.unit}` : `${item.quantity} ${item.unit}`}
                            </td>
                            <td className="py-3 font-mono">
                              {isWeightBased ? (
                                item.weightActual ? (
                                  <span className="text-emerald-700 font-bold">
                                    ✓ {item.weightActual} {item.unit}
                                  </span>
                                ) : (
                                  <span className="text-amber-700 font-semibold italic">
                                    {language === "bn" ? "ওজন বাকি" : "Pending scale"}
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
                              {isWeightBased && (
                                <button
                                  onClick={() => {
                                    setActiveWeightOrderId(order.id);
                                    setActiveWeightItemId(item.id);
                                  }}
                                  className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold inline-flex items-center gap-1 shadow-2xs transition-all"
                                >
                                  <Scale size={13} />
                                  <span>{item.weightActual ? (language === "bn" ? "পুনরায় ওজন" : "Re-weigh") : t.reconcileWeightBtn}</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-slate-400" />
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>•</span>
                    <button
                      onClick={() => setActiveChecklistOrderId(order.id)}
                      className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <CheckSquare size={14} />
                      <span>{t.packingChecklistBtn}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "RECEIVED" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "PREPARING")
                        }
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold transition-all shadow-xs"
                      >
                        {language === "bn" ? "প্যাকিং শুরু করুন" : "Start Packing"}
                      </button>
                    )}

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
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Sparkles size={14} />
                        <span>{t.markReadyBtn}</span>
                      </button>
                    )}

                    {order.status === "READY_FOR_PICKUP" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "HANDED_TO_RIDER")
                        }
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Bike size={14} />
                        <span>{t.markHandedBtn}</span>
                      </button>
                    )}

                    {order.status === "HANDED_TO_RIDER" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "COMPLETED")
                        }
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <CheckCircle size={14} />
                        <span>{language === "bn" ? "ডেলিভারি সম্পন্ন মার্ক করুন" : "Mark Delivered"}</span>
                      </button>
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
