"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Bike,
  Phone,
  MessageCircle,
  PackageCheck,
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
  const [liveTask, setLiveTask] = useState<any>(null);

  // Poll status from cloud dispatch bus
  useEffect(() => {
    if (!isOpen || !order) return;

    let isMounted = true;
    async function fetchTaskStatus() {
      const endpoints = [
        `/api/dispatch?orderId=${order?.id || ""}`,
        `https://tatka-bazar-2-0-rider-seven.vercel.app/api/dispatch?orderId=${order?.id || ""}`,
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.task && isMounted) {
              setLiveTask(data.task);
              break;
            }
          }
        } catch {}
      }
    }

    fetchTaskStatus();
    const interval = setInterval(fetchTaskStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  // Derive latest data from cloud task or local store order
  const currentStatus = liveTask?.status || order.status;
  const isCompleted = currentStatus === "COMPLETED" || currentStatus === "DELIVERED";
  const isReturned = currentStatus === "RETURNED";
  const isHandedOver =
    isCompleted ||
    isReturned ||
    currentStatus === "HANDED_TO_RIDER" ||
    currentStatus === "ON_THE_WAY" ||
    liveTask?.pickedUpFromStore;

  const riderName =
    liveTask?.riderName ||
    order.riderName ||
    "তামীম ইকবাল (রাইডার #১০১)";
  const riderPhone =
    liveTask?.riderPhone ||
    order.riderPhone ||
    "01700000001";
  const vehicle =
    liveTask?.riderVehicle ||
    order.riderVehicle ||
    "মোটরসাইকেল (ঢাকা মেট্রো-হ-৪৫-১২৩৪)";
  const zone = order.deliveryZone || "ধানমন্ডি জোন";

  const steps = [
    {
      num: 1,
      title: "অর্ডার প্রস্তুতি",
      desc: "প্যাকিং সম্পন্ন ও প্রস্তুত",
      done: true,
    },
    {
      num: 2,
      title: "রাইডার নির্ধারিত",
      desc: riderName,
      done: true,
    },
    {
      num: 3,
      title: "দোকান থেকে পিকআপ",
      desc: isHandedOver
        ? "পার্সেল রাইডারের নিকট হস্তান্তর সম্পন্ন ✓"
        : "রাইডার পার্সেল সংগ্রহ করতে দোকানে আসছে",
      done: isHandedOver,
      active: !isHandedOver && !isCompleted && !isReturned,
    },
    {
      num: 4,
      title: "ডেলিভারির পথে",
      desc: isCompleted
        ? "গন্তব্যে পৌঁছে দেওয়া হয়েছে ✓"
        : isHandedOver
        ? "গ্রাহকের ঠিকানায় ডেলিভারি চলমান"
        : "পিকআপের পর শুরু হবে",
      done: isCompleted,
      active: isHandedOver && !isCompleted && !isReturned,
    },
    {
      num: 5,
      title: isReturned ? "পার্সেল রিটার্ন" : "ডেলিভারি সম্পন্ন",
      desc: isCompleted
        ? "কাস্টমার ওটিপি যাচাইকৃত ডেলিভারি সম্পন্ন"
        : isReturned
        ? "পার্সেল সেলারকে ফেরত দেওয়া হয়েছে"
        : "গ্রাহক পণ্য বুঝে নেওয়ার অপেক্ষায়",
      done: isCompleted || isReturned,
      active: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner">
              <PackageCheck size={20} className="text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  #{order.displayId}
                </span>
                <span className="text-xs font-semibold text-emerald-100">
                  অর্ডার স্ট্যাটাস ট্র্যাকিং
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                {isCompleted
                  ? "পার্সেল সফলভাবে ডেলিভার্ড"
                  : isReturned
                  ? "পার্সেল সেলারকে ফেরত দেওয়া হয়েছে"
                  : isHandedOver
                  ? "পার্সেল রাইডারের সাথে চলমান (ডেলিভারির পথে)"
                  : "রাইডার দোকান থেকে পার্সেল সংগ্রহের পথে"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto bg-[#FBFBF9] text-xs">
          {/* Status Pipeline Tracker (Clean, reliable, no GPS required) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-800 text-sm">
                  ডেলিভারি পাইপলাইন টাইমলাইন
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {isCompleted
                  ? "ডেলিভারি সম্পন্ন ✓"
                  : isReturned
                  ? "রিটার্ন সম্পন্ন"
                  : isHandedOver
                  ? "রাইডারের সাথে চলমান"
                  : "পিকআপের অপেক্ষায়"}
              </span>
            </div>

            {/* Stepper Steps */}
            <div className="space-y-3.5 relative">
              {steps.map((st, idx) => {
                const isCurrent = st.active;
                const isPassed = st.done && !isCurrent;

                return (
                  <div key={st.num} className="flex items-start gap-3 relative">
                    {/* Vertical Connecting Line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute left-[13px] top-[26px] bottom-[-14px] w-0.5 ${
                          st.done ? "bg-emerald-500" : "bg-slate-200"
                        }`}
                      />
                    )}

                    {/* Step Icon / Dot */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 ${
                        isPassed
                          ? "bg-emerald-600 text-white shadow-xs"
                          : isCurrent
                          ? "bg-emerald-500 text-white ring-4 ring-emerald-100 animate-pulse"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPassed ? "✓" : st.num}
                    </div>

                    {/* Step Content */}
                    <div className="pt-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-xs ${
                            isCurrent
                              ? "text-emerald-700"
                              : isPassed
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {st.title}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded font-bold">
                            চলমান ধাপ
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isCurrent
                            ? "text-slate-700 font-medium"
                            : isPassed
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        {st.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rider Profile Card & Direct Communication */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-2xs">
                <Bike size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{riderName}</h4>
                  <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                    যাচাইকৃত রাইডার
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  যানবাহন: <span className="text-slate-900 font-semibold">{vehicle}</span>
                </p>
                <p className="text-[11px] text-slate-600">
                  মোবাইল: <span className="font-mono text-slate-900 font-bold">{riderPhone}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons: Chat & Phone Call */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              {/* Direct Phone Call Button (Always Active) */}
              <a
                href={`tel:${riderPhone}`}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 text-xs"
                title="রাইডারকে সরাসরি ফোন কল করুন"
              >
                <Phone size={14} />
                <span>সরাসরি কল দিন</span>
              </a>

              {/* Chat Button: Active ONLY BEFORE parcel pickup from store */}
              {!isHandedOver && onOpenChat ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat(order);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1.5 transition-all shadow-2xs text-xs cursor-pointer"
                  title="পার্সেল পিকআপের পূর্বে রাইডারের সাথে চ্যাট করুন"
                >
                  <MessageCircle size={14} />
                  <span>রাইডার চ্যাট</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Conditional Communication Policy Banner */}
          {isHandedOver ? (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-2.5">
              <Phone size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900">
                  পার্সেল দোকান থেকে সংগ্রহ সম্পন্ন (চ্যাট বন্ধ):
                </strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  রাইডার আপনার দোকান থেকে পার্সেল বুঝে নিয়েছেন। পার্সেল ডেলিভারি চলাকালে চ্যাট বন্ধ থাকবে — প্রয়োজনে সরাসরি রাইডারের নম্বরে ({riderPhone}) ফোন কল করুন।
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
              <MessageCircle size={16} className="text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-emerald-900">
                  পিকআপ সমন্বয় (চ্যাট সক্রিয়):
                </strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  রাইডার দোকানে পৌঁছানোর আগ পর্যন্ত আপনি ও রাইডার ইন-অ্যাপ চ্যাটে কথা বলতে পারবেন। পার্সেল হস্তান্তর হয়ে গেলে চ্যাট স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে।
                </p>
              </div>
            </div>
          )}

          {/* Order Items Snapshot */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-slate-800">
                পার্সেলের পণ্যসমূহ ({order.items.length}টি আইটেম)
              </span>
              <span className="text-[11px] text-slate-600 font-mono font-bold">
                মোট মূল্য: ৳{order.grossTotal.toLocaleString()}
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
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            ডেলিভারি এলাকা: <strong className="text-slate-700">{zone}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
