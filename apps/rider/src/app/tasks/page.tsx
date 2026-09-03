"use client";

import React, { useState } from "react";
import {
  PackageCheck,
  CheckCircle2,
  Clock,
  Phone,
  Navigation,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Layers,
  DollarSign,
  QrCode,
  XCircle,
  FileText,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";
import { DeliveryStatus, DeliveryOrder } from "@/types/rider";
import { translations } from "@/utils/translations";
import ProofOfDeliveryModal from "@/components/common/ProofOfDeliveryModal";
import DigitalCodModal from "@/components/common/DigitalCodModal";

export default function RiderTasksPage() {
  const {
    deliveries,
    updateOrderStatus,
    failDelivery,
    locale,
  } = useRiderStore();

  const t = translations[locale];

  const [activeTab, setActiveTab] = useState<"ACTIVE" | "COMPLETED" | "FAILED">("ACTIVE");
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [podOrder, setPodOrder] = useState<DeliveryOrder | null>(null);
  const [digitalCodOrder, setDigitalCodOrder] = useState<DeliveryOrder | null>(null);
  const [failModalOrder, setFailModalOrder] = useState<DeliveryOrder | null>(null);
  const [failReason, setFailReason] = useState("");

  const activeDeliveries = deliveries.filter(
    (d) =>
      d.status === "ASSIGNED" ||
      d.status === "ACCEPTED" ||
      d.status === "PICKED_UP_FROM_HUB" ||
      d.status === "EN_ROUTE" ||
      d.status === "ARRIVED"
  );

  const completedDeliveries = deliveries.filter((d) => d.status === "DELIVERED");
  const failedDeliveries = deliveries.filter((d) => d.status === "FAILED");

  const displayedList =
    activeTab === "ACTIVE"
      ? activeDeliveries
      : activeTab === "COMPLETED"
      ? completedDeliveries
      : failedDeliveries;

  const handleFailSubmit = () => {
    if (!failModalOrder || !failReason) return;
    failDelivery(failModalOrder.id, failReason);
    setFailModalOrder(null);
    setFailReason("");
  };

  return (
    <div className="flex flex-col gap-3.5 pb-4 animate-in fade-in">
      
      {/* Tab Navigation */}
      <div className="flex p-1 rounded-xl bg-gray-900/80 border border-gray-800 text-xs">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "ACTIVE"
              ? "bg-[#122017] text-brand-400 shadow-md border border-brand-500/30"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>{t.activeTasks}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-brand-500/20 text-[10px]">
            {activeDeliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "COMPLETED"
              ? "bg-[#122017] text-emerald-400 shadow-md border border-emerald-500/30"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>{t.completedTasks}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px]">
            {completedDeliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("FAILED")}
          className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "FAILED"
              ? "bg-[#122017] text-red-400 shadow-md border border-red-500/30"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <span>{t.failedTasks}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-[10px]">
            {failedDeliveries.length}
          </span>
        </button>
      </div>

      {/* Batch Deliveries Indicator if any active orders share batchId */}
      {activeTab === "ACTIVE" && activeDeliveries.some((d) => d.batchId) && (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs flex items-center gap-2 text-purple-200">
          <Layers size={16} className="text-purple-400" />
          <span>
            <strong>Smart Batch Route:</strong> 2 parcels bundled for Kalabagan/Dhanmondi sector.
          </span>
        </div>
      )}

      {/* Delivery Cards */}
      <div className="flex flex-col gap-3">
        {displayedList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#122017] border border-brand-500/20 text-center flex flex-col items-center gap-2">
            <CheckCircle2 size={32} className="text-brand-400" />
            <h4 className="font-bold text-sm text-gray-200">
              No {activeTab.toLowerCase()} orders right now
            </h4>
            <p className="text-xs text-gray-400">
              Tasks in this state will appear here automatically.
            </p>
          </div>
        ) : (
          displayedList.map((order) => {
            const isExpanded = selectedOrder?.id === order.id;

            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-[#122017] border border-brand-500/25 flex flex-col gap-3 transition-all shadow-md"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-brand-300">
                      {order.orderNumber}
                    </span>
                    {order.batchId && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-bold">
                        BATCH TRIP
                      </span>
                    )}
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-bold">
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Customer Details */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {order.customerName}
                    </h4>
                    <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
                      <MapPin size={12} className="text-brand-400 shrink-0" />
                      <span>{order.deliveryAddress}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-xs font-black text-emerald-400 block">
                      +৳{order.earningFare.totalEarnings}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {order.distanceKm} km
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="bg-[#0A140E] p-2.5 rounded-xl border border-gray-800/80 text-xs flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">
                    Grocery Items ({order.items.length}):
                  </span>
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-gray-300 text-[11px]">
                      <span>• {it.nameEn} ({it.nameBn})</span>
                      <span className="font-mono text-gray-400">{it.weight}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Tag */}
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-gray-400">
                    Slot: <strong className="text-gray-200">{order.deliverySlot}</strong>
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded ${
                      order.isCod
                        ? "bg-harvest-500/20 text-harvest-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {order.isCod ? `COD: ৳${order.codAmountToCollect}` : "Prepaid Online"}
                  </span>
                </div>

                {/* Actions for Active Orders */}
                {activeTab === "ACTIVE" && (
                  <div className="flex flex-col gap-2 pt-1 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Phone size={13} className="text-brand-400" />
                        <span>Call Customer</span>
                      </a>

                      <button
                        onClick={() => setFailModalOrder(order)}
                        className="py-2 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <XCircle size={13} />
                        <span>Report Issue</span>
                      </button>
                    </div>

                    {/* Step Advancement */}
                    {order.status === "ASSIGNED" || order.status === "ACCEPTED" ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, "PICKED_UP_FROM_HUB")}
                        className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
                      >
                        <PackageCheck size={14} />
                        <span>Confirm Pickup from Hub</span>
                      </button>
                    ) : order.status === "PICKED_UP_FROM_HUB" ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, "EN_ROUTE")}
                        className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Navigation size={14} />
                        <span>Start Trip to Customer</span>
                      </button>
                    ) : order.status === "EN_ROUTE" ? (
                      <button
                        onClick={() => updateOrderStatus(order.id, "ARRIVED")}
                        className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5"
                      >
                        <MapPin size={14} />
                        <span>I Have Arrived at Gate</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {order.isCod && (
                          <button
                            onClick={() => setDigitalCodOrder(order)}
                            className="py-2.5 rounded-xl bg-harvest-600 hover:bg-harvest-500 text-white font-bold text-xs flex items-center justify-center gap-1"
                          >
                            <QrCode size={14} />
                            <span>bKash QR</span>
                          </button>
                        )}
                        <button
                          onClick={() => setPodOrder(order)}
                          className={`py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs flex items-center justify-center gap-1 ${
                            !order.isCod ? "col-span-2" : ""
                          }`}
                        >
                          <CheckCircle2 size={14} />
                          <span>Complete (POD)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Completed Details */}
                {activeTab === "COMPLETED" && (
                  <div className="p-2 rounded-lg bg-[#08110B] text-xs text-gray-300 flex items-center justify-between">
                    <span>Delivered at: {order.deliveredAt || "Today"}</span>
                    {order.podOtp && <span className="font-mono text-emerald-400">OTP: {order.podOtp}</span>}
                  </div>
                )}

                {/* Failed Details */}
                {activeTab === "FAILED" && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-200">
                    Reason: <strong>{order.failureReason || "Customer unreachable"}</strong>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Failure Report Modal */}
      {failModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#151010] border border-red-500/40 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 text-gray-100">
            <h3 className="font-bold text-base text-red-300 flex items-center gap-2">
              <AlertTriangle size={18} />
              <span>Report Delivery Failure</span>
            </h3>
            <p className="text-xs text-gray-300">
              Select reason for <strong>{failModalOrder.orderNumber}</strong>:
            </p>

            <div className="flex flex-col gap-1.5 text-xs">
              {[
                "Customer Phone Unreachable (3 Attempts)",
                "Incorrect / Incomplete Delivery Address",
                "Customer Refused Delivery / Cancelled",
                "Severe Waterlogging / Road Inaccessible",
                "Damaged Fresh Parcel in Transit",
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setFailReason(reason)}
                  className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                    failReason === reason
                      ? "bg-red-600/30 border-red-500 text-white"
                      : "bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setFailModalOrder(null)}
                className="py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleFailSubmit}
                disabled={!failReason}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs"
              >
                Submit Failure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {podOrder && (
        <ProofOfDeliveryModal
          order={podOrder}
          isOpen={!!podOrder}
          onClose={() => setPodOrder(null)}
        />
      )}

      {digitalCodOrder && (
        <DigitalCodModal
          order={digitalCodOrder}
          isOpen={!!digitalCodOrder}
          onClose={() => setDigitalCodOrder(null)}
        />
      )}

    </div>
  );
}
