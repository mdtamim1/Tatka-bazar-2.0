"use client";

import React, { useEffect, useState } from "react";
import { Order } from "@/types/vendor";
import { audioAlert } from "@/utils/audioAlert";
import {
  BellRing,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Users,
} from "lucide-react";

interface IncomingOrderModalProps {
  order: Order | null;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
  isClaimedByOther?: boolean;
  claimedByStoreName?: string;
}

const TOTAL_COUNTDOWN = 45;

export default function IncomingOrderModal({
  order,
  onAccept,
  onDecline,
  isClaimedByOther = false,
  claimedByStoreName,
}: IncomingOrderModalProps) {
  const [countdown, setCountdown] = useState(TOTAL_COUNTDOWN);

  useEffect(() => {
    if (!order) return;
    if (isClaimedByOther) return;

    // Reset countdown and play chime
    setCountdown(TOTAL_COUNTDOWN);
    audioAlert.playNewOrderChime();

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDecline(order.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order, onDecline, isClaimedByOther]);

  // Auto-close if claimed by another vendor
  useEffect(() => {
    if (isClaimedByOther && order) {
      const timer = setTimeout(() => {
        onDecline(order.id);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isClaimedByOther, order, onDecline]);

  if (!order) return null;

  // Calculate SVG circle stroke dashoffset
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (countdown / TOTAL_COUNTDOWN) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-white border border-emerald-200 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div
          className={`p-6 relative overflow-hidden transition-colors ${
            isClaimedByOther
              ? "bg-gradient-to-r from-amber-600 via-rose-600 to-red-700 text-white"
              : "bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white"
          }`}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
                {isClaimedByOther ? (
                  <AlertTriangle size={22} className="text-amber-200" />
                ) : (
                  <BellRing size={22} className="text-emerald-200 animate-bounce" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/90 bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 flex items-center gap-1">
                    <Users size={12} />
                    <span>{isClaimedByOther ? "অর্ডারটি লকড" : "এলাকাভিত্তিক অর্ডার প্রতিযোগিতা"}</span>
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  #{order.displayId}
                </h3>
              </div>
            </div>

            {/* Circular Countdown Progress (Only if not already claimed) */}
            {!isClaimedByOther ? (
              <div className="relative flex items-center justify-center w-16 h-16">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    stroke={countdown <= 10 ? "#EF4444" : "#34D399"}
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute text-center">
                  <span
                    className={`text-base font-black ${
                      countdown <= 10 ? "text-rose-300" : "text-white"
                    }`}
                  >
                    {countdown}
                  </span>
                  <span className="block text-[8px] font-semibold uppercase text-emerald-100 opacity-80 leading-none">
                    সেক
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl bg-black/20 border border-white/20 text-xs font-bold text-white">
                হস্তান্তরিত
              </div>
            )}
          </div>
        </div>

        {/* Claimed by Another Vendor Lockout Banner */}
        {isClaimedByOther ? (
          <div className="p-8 text-center bg-rose-50/60 space-y-3">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={28} />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">
              অর্ডারটি ইতিমধ্যে অন্য ভেন্ডর গ্রহণ করেছেন!
            </h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              আপনার এলাকার অন্য একজন ভেন্ডর ({claimedByStoreName || "স্থানীয় বিক্রেতা"}) আগে অর্ডারটি রিসিভ করেছেন। পরবর্তী নতুন অর্ডারের জন্য অপেক্ষা করুন।
            </p>
            <button
              onClick={() => onDecline(order.id)}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              ঠিক আছে, বন্ধ করুন
            </button>
          </div>
        ) : (
          /* Normal Incoming Order View */
          <>
            <div className="p-6 space-y-4 bg-[#FBFBF9] text-xs">
              {/* Privacy Shield Notice: Area Only, Street Address Hidden */}
              <div className="p-3.5 bg-white border border-emerald-200/80 rounded-2xl shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <MapPin size={15} className="text-emerald-600 shrink-0" />
                    <span>ডেলিভারি এলাকা: {order.deliveryZone || "মিরপুর-১০ জোন"}</span>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                    {order.paymentMethod === "CASH_ON_DELIVERY" ? "ক্যাশ অন ডেলিভারি" : "প্রিপেইড (পেইড)"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>🔒 গ্রাহকের ঠিকানা ও ফোন গোপনীয় (ডেলিভারি রাইডারের জন্য সংরক্ষিত)</span>
                </div>
              </div>

              {/* Items Preview List */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-emerald-600" />
                    <span>অর্ডারকৃত পণ্যসমূহ ({order.items.length}টি)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">পরিমাণ ও দর</span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {item.productNameBn || item.productName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.pricingType === "WEIGHT_BASED"
                            ? `আনুমানিক: ${item.weightOrdered || 1} ${item.unit} (স্কেলে মাপতে হবে)`
                            : `পরিমাণ: ${item.quantity} ${item.unit}`}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-900 font-mono">
                        ৳{item.finalPrice}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bill Summary Banner */}
              <div className="flex items-center justify-between p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                    ভেন্ডর বিক্রয় মূল্য (গ্রস)
                  </span>
                  <span className="text-[10px] text-emerald-600">
                    ১০% টাটকা ফি বাদে অবশিষ্ট সরাসরি ওয়ালেটে যোগ হবে
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    ৳{order.grossTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-6 bg-white border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onDecline(order.id)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <XCircle size={16} className="text-slate-400" />
                <span>বাতিল করুন</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioAlert.playSuccessSound();
                  onAccept(order.id);
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <CheckCircle2 size={16} />
                <span>অর্ডার গ্রহণ করুন</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
