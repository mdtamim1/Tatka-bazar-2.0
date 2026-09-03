"use client";

import React, { useEffect } from "react";
import {
  BellRing,
  MapPin,
  Clock,
  DollarSign,
  Package,
  CheckCircle2,
  XCircle,
  Navigation,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";
import { translations } from "@/utils/translations";

export default function IncomingOrderModal() {
  const {
    offeredOrder,
    offerCountdown,
    acceptOfferedOrder,
    rejectOfferedOrder,
    decrementOfferCountdown,
    locale,
  } = useRiderStore();

  const t = translations[locale];

  // Run 1-second countdown ticker
  useEffect(() => {
    if (!offeredOrder) return;
    const interval = setInterval(() => {
      decrementOfferCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [offeredOrder, decrementOfferCountdown]);

  if (!offeredOrder) return null;

  const countdownPercent = (offerCountdown / 40) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#122017] border-2 border-brand-400/60 rounded-2xl p-4 shadow-2xl shadow-brand-950 flex flex-col gap-4 text-gray-100 animate-in slide-in-from-bottom duration-300">
        
        {/* Countdown Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 animate-bounce">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {t.incomingOrder}
              </h3>
              <span className="text-xs text-brand-300 font-mono">
                {offeredOrder.orderNumber}
              </span>
            </div>
          </div>

          {/* Circular or pill countdown */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-harvest-500/20 border border-harvest-500/50 text-harvest-300 text-xs font-mono font-bold">
            <Clock size={13} className="animate-spin" />
            <span>{offerCountdown}s</span>
          </div>
        </div>

        {/* Countdown Progress Bar */}
        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-harvest-500 to-brand-400 transition-all duration-1000"
            style={{ width: `${countdownPercent}%` }}
          />
        </div>

        {/* Fare & Distance Highlight Banner */}
        <div className="grid grid-cols-3 gap-2 bg-[#17281D] p-3 rounded-xl border border-brand-500/20 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">
              {t.estimatedEarning}
            </span>
            <span className="text-lg font-black text-emerald-400">
              ৳{offeredOrder.earningFare.totalEarnings}
            </span>
          </div>

          <div className="flex flex-col border-x border-gray-700/50">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">
              Distance
            </span>
            <span className="text-lg font-bold text-gray-100">
              {offeredOrder.distanceKm} km
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-semibold">
              Est. Time
            </span>
            <span className="text-lg font-bold text-gray-100">
              {offeredOrder.estimatedMinutes + offeredOrder.monsoonBufferMinutes}m
            </span>
          </div>
        </div>

        {/* Route Steps */}
        <div className="flex flex-col gap-2 bg-[#0C150F] p-3 rounded-xl border border-gray-800 text-xs">
          {/* Pickup */}
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mt-0.5 font-bold text-[9px]">
              P
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 font-semibold">{t.hubPickup}</span>
              <p className="font-bold text-gray-200">{offeredOrder.hubName}</p>
            </div>
          </div>

          <div className="w-0.5 h-3 bg-gray-700 ml-2" />

          {/* Drop */}
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mt-0.5 font-bold text-[9px]">
              D
            </div>
            <div className="flex-1">
              <span className="text-[10px] text-gray-400 font-semibold">{t.customerDrop}</span>
              <p className="font-bold text-gray-200">{offeredOrder.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Items Brief */}
        <div className="flex items-center justify-between text-xs px-1 text-gray-300">
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-brand-400" />
            <span>{offeredOrder.items.length} Fresh Grocery Items</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-mono">
            {offeredOrder.isCod ? `COD: ৳${offeredOrder.codAmountToCollect}` : "Prepaid (Online)"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={rejectOfferedOrder}
            className="py-3 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 text-gray-300 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <XCircle size={16} />
            <span>{t.rejectOrder}</span>
          </button>

          <button
            onClick={acceptOfferedOrder}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-900 transition-all"
          >
            <CheckCircle2 size={18} />
            <span>{t.acceptOrder}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
