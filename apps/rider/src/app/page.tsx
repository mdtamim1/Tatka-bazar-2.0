"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PackageCheck,
  DollarSign,
  TrendingUp,
  Percent,
  CloudRain,
  Navigation,
  Phone,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Bike,
  AlertCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";
import { translations } from "@/utils/translations";
import ProofOfDeliveryModal from "@/components/common/ProofOfDeliveryModal";
import DigitalCodModal from "@/components/common/DigitalCodModal";

export default function RiderDashboardPage() {
  const {
    rider,
    deliveries,
    dailySummary,
    locale,
    updateOrderStatus,
    triggerSimulatedOrder,
  } = useRiderStore();

  const t = translations[locale];

  // Active delivery is the first non-delivered, non-failed order
  const activeDelivery = deliveries.find(
    (d) =>
      d.status === "ASSIGNED" ||
      d.status === "ACCEPTED" ||
      d.status === "PICKED_UP_FROM_HUB" ||
      d.status === "EN_ROUTE" ||
      d.status === "ARRIVED"
  );

  const [podModalOrder, setPodModalOrder] = useState<typeof activeDelivery | null>(null);
  const [digitalCodOrder, setDigitalCodOrder] = useState<typeof activeDelivery | null>(null);

  const progressPercent = Math.min(
    100,
    Math.round((dailySummary.completedCount / dailySummary.dailyGoalTarget) * 100)
  );

  return (
    <div className="flex flex-col gap-3.5 animate-in fade-in duration-300">
      
      {/* Offline Alert if rider is offline */}
      {!rider.isOnline && (
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <span>You are currently <strong>Offline</strong>. Switch duty ON to receive orders.</span>
          </div>
        </div>
      )}

      {/* Monsoon Advisory Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/70 to-emerald-950/60 border border-blue-500/30 text-xs flex items-start gap-2.5 shadow-md">
        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
          <CloudRain size={18} className="animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-blue-200">{t.monsoonAlert}</h4>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 font-mono font-bold">
              Dhaka Live
            </span>
          </div>
          <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
            {t.monsoonDesc} Wear rain covers on grocery crates.
          </p>
        </div>
      </div>

      {/* Shift Overview 4-Metric Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Completed */}
        <div className="p-3 rounded-xl bg-[#122017] border border-brand-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold">{t.deliveriesDone}</span>
            <PackageCheck size={16} className="text-brand-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">
              {dailySummary.completedCount}
            </span>
            <span className="text-[11px] text-brand-300 font-bold">orders</span>
          </div>
        </div>

        {/* Today Earnings */}
        <div className="p-3 rounded-xl bg-[#122017] border border-brand-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold">{t.earningsToday}</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400">
              ৳{dailySummary.todayEarnings}
            </span>
            <span className="text-[10px] text-gray-400">net</span>
          </div>
        </div>

        {/* COD Cash Collected */}
        <div className="p-3 rounded-xl bg-[#122017] border border-brand-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold">{t.cashCollected}</span>
            <DollarSign size={16} className="text-harvest-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-harvest-400">
              ৳{dailySummary.todayCodCollected}
            </span>
            <span className="text-[10px] text-gray-400">in-hand</span>
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="p-3 rounded-xl bg-[#122017] border border-brand-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-semibold">{t.acceptanceRate}</span>
            <Percent size={16} className="text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">
              {rider.acceptanceRate}%
            </span>
            <span className="text-[10px] text-brand-300 font-bold">Top 5%</span>
          </div>
        </div>
      </div>

      {/* Daily Goal Milestone Bar */}
      <div className="p-3 rounded-xl bg-[#122017] border border-brand-500/20 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-gray-200">
            <Sparkles size={14} className="text-harvest-400" />
            <span>{t.dailyGoal}</span>
          </div>
          <span className="text-[11px] text-harvest-300 font-semibold font-mono">
            {dailySummary.completedCount}/{dailySummary.dailyGoalTarget} (+৳{dailySummary.dailyBonusAmount} bonus)
          </span>
        </div>

        <div className="w-full bg-gray-800/80 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-harvest-400 transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] text-gray-400">
          {dailySummary.dailyGoalTarget - dailySummary.completedCount > 0
            ? `${dailySummary.dailyGoalTarget - dailySummary.completedCount} more deliveries needed today to unlock milestone cash bonus.`
            : "🎉 Daily milestone target achieved! Bonus added to wallet."}
        </span>
      </div>

      {/* Pinned Active Delivery Card */}
      {activeDelivery ? (
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#14261B] to-[#101E15] border-2 border-brand-500/40 shadow-xl flex flex-col gap-3 relative overflow-hidden">
          
          {/* Top Label */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-ping" />
              <span className="text-xs font-black uppercase text-brand-300 tracking-wider">
                {t.activeOrderPinned}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 font-mono text-[11px] font-bold">
              {activeDelivery.orderNumber}
            </span>
          </div>

          {/* Customer & Area */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-base text-white">
                {activeDelivery.customerName}
              </h3>
              <p className="text-xs text-gray-300 mt-0.5 flex items-center gap-1">
                <MapPin size={13} className="text-brand-400 shrink-0" />
                <span>{activeDelivery.deliveryAddress}</span>
              </p>
            </div>

            {/* Fare Tag */}
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-medium">Earnings</span>
              <span className="text-lg font-black text-emerald-400">
                ৳{activeDelivery.earningFare.totalEarnings}
              </span>
            </div>
          </div>

          {/* Stepped Status Flow */}
          <div className="bg-[#0A140E] p-2.5 rounded-xl border border-gray-800 flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Current Status:</span>
            <span className="px-2 py-0.5 rounded bg-brand-500/20 border border-brand-500/40 text-brand-300 font-bold">
              {activeDelivery.status.replace(/_/g, " ")}
            </span>
          </div>

          {/* Grocery items summary */}
          <div className="text-xs text-gray-300 flex items-center justify-between px-1">
            <span>{activeDelivery.items.length} Fresh items ({activeDelivery.items[0]?.nameEn}...)</span>
            <span className="font-mono text-harvest-400 font-bold">
              {activeDelivery.isCod ? `COD: ৳${activeDelivery.codAmountToCollect}` : "Prepaid"}
            </span>
          </div>

          {/* 1-Tap Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Call Customer */}
            <a
              href={`tel:${activeDelivery.customerPhone}`}
              className="py-2.5 px-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone size={14} className="text-brand-400" />
              <span>{t.callCustomer}</span>
            </a>

            {/* Live Navigation */}
            <Link
              href="/map"
              className="py-2.5 px-3 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <Navigation size={14} />
              <span>{t.navigateNow}</span>
            </Link>
          </div>

          {/* Lifecycle State Advancement Button */}
          {activeDelivery.status === "ASSIGNED" || activeDelivery.status === "ACCEPTED" ? (
            <button
              onClick={() => updateOrderStatus(activeDelivery.id, "PICKED_UP_FROM_HUB")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <PackageCheck size={16} />
              <span>{t.markPickedUp}</span>
            </button>
          ) : activeDelivery.status === "PICKED_UP_FROM_HUB" ? (
            <button
              onClick={() => updateOrderStatus(activeDelivery.id, "EN_ROUTE")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Bike size={16} />
              <span>{t.startNavigation}</span>
            </button>
          ) : activeDelivery.status === "EN_ROUTE" ? (
            <button
              onClick={() => updateOrderStatus(activeDelivery.id, "ARRIVED")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <MapPin size={16} />
              <span>{t.markArrived}</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activeDelivery.isCod && (
                <button
                  onClick={() => setDigitalCodOrder(activeDelivery)}
                  className="py-3 rounded-xl bg-harvest-600/90 hover:bg-harvest-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
                >
                  <QrCode size={16} />
                  <span>bKash QR COD</span>
                </button>
              )}
              <button
                onClick={() => setPodModalOrder(activeDelivery)}
                className={`py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg ${
                  !activeDelivery.isCod ? "col-span-2" : ""
                }`}
              >
                <CheckCircle2 size={16} />
                <span>{t.completeDelivery}</span>
              </button>
            </div>
          )}

        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[#122017] border border-brand-500/20 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">All Dispatched Orders Completed</h3>
            <p className="text-xs text-gray-400 mt-1">
              You are online and prioritized for upcoming Dhaka Express drops.
            </p>
          </div>
          <button
            onClick={triggerSimulatedOrder}
            className="px-4 py-2 rounded-xl bg-brand-600/80 hover:bg-brand-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <Sparkles size={14} className="text-harvest-300" />
            <span>Simulate Incoming Order</span>
          </button>
        </div>
      )}

      {/* Quick Task Navigation Footer */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#122017] border border-brand-500/20 text-xs">
        <span className="text-gray-300 font-semibold">
          Total Deliveries in Shift: {deliveries.length}
        </span>
        <Link
          href="/tasks"
          className="text-brand-400 font-bold flex items-center gap-1 hover:text-brand-300"
        >
          <span>View All Tasks</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Modals */}
      {podModalOrder && (
        <ProofOfDeliveryModal
          order={podModalOrder}
          isOpen={!!podModalOrder}
          onClose={() => setPodModalOrder(null)}
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
