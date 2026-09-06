"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bike,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  PackageCheck,
  AlertCircle,
} from "lucide-react";
import { Order } from "@/types/vendor";

interface VendorOrderTrackModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onOpenChat?: (order: Order) => void;
}

export default function VendorOrderTrackModal({
  isOpen,
  order,
  onClose,
  onOpenChat,
}: VendorOrderTrackModalProps) {
  const [liveMinutes, setLiveMinutes] = useState(12);
  const [riderProgress, setRiderProgress] = useState(45); // percent on route

  useEffect(() => {
    if (!isOpen || !order) return;

    const interval = setInterval(() => {
      setLiveMinutes((m) => (m > 2 ? m - 1 : 2));
      setRiderProgress((p) => (p < 90 ? p + 4 : 92));
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const riderName = order.riderName || "তানভীর আহমেদ (রাইডার #১০১)";
  const riderPhone = order.riderPhone || "01712-334455";
  const vehicle = order.riderVehicle || "হোন্ডা ড্রিম ১১০ (বাইক)";
  const zone = order.deliveryZone || "ধানমন্ডি জোন";
  const locationName = order.riderCurrentLocationName || `${zone}, মেইন রোড`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
              <Bike size={20} className="text-emerald-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
                  #{order.displayId}
                </span>
                <span className="text-xs font-semibold text-emerald-100">
                  লাইভ রাইডার ট্র্যাকিং
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                পার্সেল রাইডারের সাথে চলমান
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto bg-[#FBFBF9] text-xs">
          {/* Live Map Representation Box */}
          <div className="relative w-full h-44 rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden shadow-inner flex flex-col justify-between p-4">
            {/* Map Grid Graphic Overlay */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

            {/* Simulated Route Line */}
            <div className="relative z-10 flex items-center justify-between text-white text-[11px] font-semibold">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>লাইভ GPS সংযোগ সক্রিয়</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-600/30 text-emerald-300 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-400/30 font-mono font-bold">
                <Clock size={13} />
                <span>আনুমানিক সময়: {liveMinutes} মি.</span>
              </div>
            </div>

            {/* Moving Rider on Path Graphic */}
            <div className="relative z-10 my-auto py-2">
              <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 transition-all duration-1000 ease-out"
                  style={{ width: `${riderProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-3 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <span className="font-semibold text-white">আপনার দোকান (পিকআপ)</span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Bike size={15} className="animate-bounce" />
                  <span>রাইডার পথে আছে ({riderProgress}%)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-400" />
                  <span className="font-semibold text-slate-400">{zone}</span>
                </div>
              </div>
            </div>

            {/* Current Rider Locality */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-white/10">
              <span>বর্তমান অবস্থান: <strong className="text-white">{locationName}</strong></span>
              <span className="text-emerald-400 font-mono">দূরত্ব: {(liveMinutes * 0.15).toFixed(1)} কিমি বাকি</span>
            </div>
          </div>

          {/* Rider Profile Card & Direct Action Buttons */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Bike size={24} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">{riderName}</h4>
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                    যাচাইকৃত রাইডার
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  যানবাহন: <span className="text-slate-700 font-medium">{vehicle}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  মোবাইল: <span className="font-mono text-slate-800 font-semibold">{riderPhone}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <a
                href={`tel:${riderPhone}`}
                className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Phone size={13} className="text-emerald-600" />
                <span>কল দিন</span>
              </a>

              {onOpenChat && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat(order);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                >
                  <MessageCircle size={13} />
                  <span>চ্যাট করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Privacy Notice Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">গ্রাহকের নিরাপত্তা ও গোপনীয়তা নীতি:</strong>
              <p className="text-[11px] text-slate-600 mt-0.5">
                গ্রাহকের বাসার ফ্ল্যাট ও ব্যক্তিগত ফোন নম্বর শুধুমাত্র দায়িত্বপ্রাপ্ত রাইডারের জন্য সংরক্ষিত। ভেন্ডর হিসেবে আপনি রাইডারের রিয়েল-টাইম অবস্থান ও ডেলিভারি আপডেট দেখতে পাচ্ছেন।
              </p>
            </div>
          </div>

          {/* Order Items Snapshot */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800">
                পার্সেলের পণ্যসমূহ ({order.items.length}টি আইটেম)
              </span>
              <span className="text-[11px] text-slate-500 font-mono font-bold">
                মোট বিল: ৳{order.grossTotal.toLocaleString()}
              </span>
            </div>
            <div className="divide-y divide-slate-100 text-[11px]">
              {order.items.map((it) => (
                <div key={it.id} className="py-2 flex items-center justify-between">
                  <span className="text-slate-700 font-medium">
                    {it.productNameBn || it.productName}
                  </span>
                  <span className="text-slate-500 font-mono">
                    {it.pricingType === "WEIGHT_BASED"
                      ? `${it.weightActual || it.weightOrdered} ${it.unit}`
                      : `${it.quantity} ${it.unit}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
