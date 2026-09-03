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
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Order, OrderItem, OrderStatus } from "@/types/vendor";
import { translations } from "@/utils/translations";
import WeightReconciliationModal from "@/components/common/WeightReconciliationModal";
import PackingChecklistModal from "@/components/common/PackingChecklistModal";

export default function OrdersPage() {
  const { language, orders, updateOrderStatus } = useVendorStore();
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
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {t.tabReceived}
          </span>
        );
      case "PREPARING":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
            {t.tabPreparing}
          </span>
        );
      case "READY_FOR_PICKUP":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {t.tabReady}
          </span>
        );
      case "HANDED_TO_RIDER":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            {language === "bn" ? "রাইডারের সাথে" : "With Rider"}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {t.tabCompleted}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            {t.tabCancelled}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t.ordersTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.ordersSub}</p>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[#20333B]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full text-xs">
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
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-[#111C20] text-slate-400 hover:text-white border border-[#20333B]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id
                    ? "bg-black/30 text-white"
                    : "bg-[#152227] text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search
            size={14}
            className="absolute inset-y-0 left-0 pl-2.5 my-auto text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "bn" ? "অর্ডার আইডি, গ্রাহক খুঁজুন..." : "Filter orders..."}
            className="w-full bg-[#111C20] border border-[#20333B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs bg-[#111C20] rounded-xl border border-[#20333B]">
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
                className="bg-[#111C20] border border-[#20333B] rounded-xl p-5 hover:border-slate-600 transition-colors shadow-sm"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#20333B]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-emerald-400">
                        #{order.displayId}
                      </span>
                      {getStatusBadge(order.status)}
                      {order.urgent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {t.urgentBadge}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">
                        {order.customerName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={13} className="text-slate-500" />
                        {order.customerPhone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-slate-500" />
                        {order.customerAddress}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-white">
                      ৳{order.grossTotal.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-semibold font-mono">
                      {t.netPayableCol}: ৳{order.netTotal.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {order.paymentMethod} • {order.paymentStatus}
                    </div>
                  </div>
                </div>

                {/* Assigned Rider Info (if ready or dispatched) */}
                {order.riderName && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Bike size={16} className="text-emerald-400" />
                      <span>
                        <strong>{language === "bn" ? "বরাদ্দকৃত রাইডার:" : "Assigned Rider:"}</strong> {order.riderName} ({order.riderPhone})
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Rider Portal Dispatched
                    </span>
                  </div>
                )}

                {/* Items Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-[#20333B]/70 pb-2">
                        <th className="py-2 font-medium">{t.productCol}</th>
                        <th className="py-2 font-medium">{t.pricingTypeCol}</th>
                        <th className="py-2 font-medium">{language === "bn" ? "অর্ডারকৃত" : "Ordered"}</th>
                        <th className="py-2 font-medium">{language === "bn" ? "প্রকৃত স্কেল ওজন" : "Actual Scale"}</th>
                        <th className="py-2 font-medium">{language === "bn" ? "চূড়ান্ত দর" : "Item Total"}</th>
                        <th className="py-2 text-right font-medium">{t.actionsCol}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#20333B]/40">
                      {order.items.map((item) => {
                        const isWeightBased = item.pricingType === "WEIGHT_BASED";

                        return (
                          <tr key={item.id} className="hover:bg-[#152227]/50">
                            <td className="py-2.5 font-medium text-slate-200">
                              {language === "bn" ? item.productNameBn : item.productName}
                            </td>
                            <td className="py-2.5 text-slate-400">
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
                            <td className="py-2.5 text-slate-300 font-mono">
                              {isWeightBased ? `${item.weightOrdered} ${item.unit}` : `${item.quantity} ${item.unit}`}
                            </td>
                            <td className="py-2.5 font-mono">
                              {isWeightBased ? (
                                item.weightActual ? (
                                  <span className="text-emerald-400 font-bold">
                                    {item.weightActual} {item.unit}
                                  </span>
                                ) : (
                                  <span className="text-amber-400 font-medium italic">
                                    {language === "bn" ? "ওজন বাকি" : "Pending scale"}
                                  </span>
                                )
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-2.5 font-mono font-bold text-white">
                              ৳{item.finalPrice}
                            </td>
                            <td className="py-2.5 text-right">
                              {isWeightBased && (
                                  <button
                                    onClick={() => {
                                      setActiveWeightOrderId(order.id);
                                      setActiveWeightItemId(item.id);
                                    }}
                                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold inline-flex items-center gap-1"
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
                  <div className="mt-4 pt-3 border-t border-[#20333B] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-500" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <button
                        onClick={() => setActiveChecklistOrderId(order.id)}
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <CheckSquare size={13} />
                        <span>{t.packingChecklistBtn}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === "RECEIVED" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "PREPARING")
                          }
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold transition-colors"
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
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
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
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
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
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
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
