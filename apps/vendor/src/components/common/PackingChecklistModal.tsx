"use client";

import React from "react";
import { CheckSquare, Square, X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Order } from "@/types/vendor";
import { translations } from "@/utils/translations";

interface PackingChecklistModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onReadyForPickup: (orderId: string) => void;
}

export default function PackingChecklistModal({
  isOpen,
  order,
  onClose,
  onReadyForPickup,
}: PackingChecklistModalProps) {
  const { language, toggleItemPacked, markAllItemsPacked } = useVendorStore();
  const t = translations[language];

  if (!isOpen || !order) return null;

  const allPacked = order.items.every((it) => it.packed);

  const handleConfirmReady = () => {
    onReadyForPickup(order.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#111C20] border border-[#20333B] rounded-xl max-w-lg w-full p-6 shadow-2xl z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <CheckSquare className="text-emerald-400" size={20} />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.checklistTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                Order #{order.displayId} • {order.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {order.notes && (
          <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong className="font-semibold">{language === "bn" ? "বিশেষ নির্দেশনা:" : "Customer Note:"}</strong>{" "}
              {order.notes}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <span>{t.itemCheckInstruction}</span>
          <button
            onClick={() => markAllItemsPacked(order.id)}
            className="text-emerald-400 hover:text-emerald-300 font-medium underline text-[11px]"
          >
            {language === "bn" ? "সবগুলো চিহ্নিত করুন" : "Check all"}
          </button>
        </div>

        {/* Checklist items */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
          {order.items.map((item) => {
            const isWeightBased = item.pricingType === "WEIGHT_BASED";

            return (
              <div
                key={item.id}
                onClick={() => toggleItemPacked(order.id, item.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  item.packed
                    ? "bg-[#152227] border-emerald-500/40 text-slate-100"
                    : "bg-[#0E171B] border-[#20333B] hover:border-slate-600 text-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-emerald-400 shrink-0">
                    {item.packed ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} className="text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h5 className={`text-xs font-semibold ${item.packed ? "text-emerald-300" : "text-white"}`}>
                      {language === "bn" ? item.productNameBn : item.productName}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                      {isWeightBased ? (
                        <span>
                          {language === "bn" ? "ওজন:" : "Weight:"}{" "}
                          <strong className="text-slate-200">
                            {item.weightActual ? `${item.weightActual} ${item.unit} (Weighed)` : `${item.weightOrdered} ${item.unit} (Est)`}
                          </strong>
                        </span>
                      ) : (
                        <span>
                          {language === "bn" ? "পরিমাণ:" : "Qty:"}{" "}
                          <strong className="text-slate-200">{item.quantity} {item.unit}</strong>
                        </span>
                      )}
                      <span>•</span>
                      <span>৳{item.finalPrice}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    item.packed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {item.packed
                    ? language === "bn" ? "প্যাকড" : "Packed"
                    : language === "bn" ? "অপেক্ষমাণ" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-4 border-t border-[#20333B] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="py-2 px-3.5 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-300 text-xs font-medium"
          >
            {t.cancelBtn}
          </button>

          <button
            onClick={handleConfirmReady}
            disabled={!allPacked}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              allPacked
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950 ring-1 ring-emerald-400/30 cursor-pointer"
                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
            }`}
          >
            <Sparkles size={15} />
            <span>{t.markReadyBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
