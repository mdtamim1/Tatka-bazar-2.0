"use client";

import React, { useState, useEffect } from "react";
import { Scale, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Order, OrderItem } from "@/types/vendor";
import { translations } from "@/utils/translations";

interface WeightReconciliationModalProps {
  isOpen: boolean;
  order: Order | null;
  item: OrderItem | null;
  onClose: () => void;
}

export default function WeightReconciliationModal({
  isOpen,
  order,
  item,
  onClose,
}: WeightReconciliationModalProps) {
  const { language, reconcileItemWeight } = useVendorStore();
  const t = translations[language];

  const [scaleWeight, setScaleWeight] = useState<string>("");

  useEffect(() => {
    if (item) {
      setScaleWeight(
        item.weightActual
          ? item.weightActual.toString()
          : item.weightOrdered
          ? item.weightOrdered.toString()
          : "1.0"
      );
    }
  }, [item]);

  if (!isOpen || !order || !item) return null;

  const numScaleWeight = parseFloat(scaleWeight) || 0;
  const originalPrice = (item.weightOrdered || 1) * item.unitPrice;
  const recalculatedPrice = Math.round(numScaleWeight * item.unitPrice * 100) / 100;
  const priceDiff = Math.round((recalculatedPrice - originalPrice) * 100) / 100;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (numScaleWeight <= 0) return;
    reconcileItemWeight(order.id, item.id, numScaleWeight);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#111C20] border border-[#20333B] rounded-xl max-w-md w-full p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <Scale className="text-emerald-400" size={20} />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.weightModalTitle}
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

        <div className="mt-4 p-3 rounded-lg bg-[#152227] border border-[#20333B]">
          <h4 className="text-xs font-bold text-emerald-400">
            {language === "bn" ? item.productNameBn : item.productName}
          </h4>
          <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
            <span>
              {t.unitPriceLabel}: <strong className="text-slate-200">৳{item.unitPrice}/{item.unit}</strong>
            </span>
            <span>
              {t.orderedWeightLabel}: <strong className="text-slate-200">{item.weightOrdered} {item.unit}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              {t.actualWeightLabel}
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.05"
                max="100"
                value={scaleWeight}
                onChange={(e) => setScaleWeight(e.target.value)}
                required
                className="w-full bg-[#0E171B] border border-[#20333B] focus:border-emerald-500 rounded-lg px-3 py-2.5 text-base font-mono font-bold text-emerald-400 focus:outline-none transition-colors"
                placeholder={t.actualWeightPlaceholder}
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                {item.unit}
              </div>
            </div>
          </div>

          {/* Price Reconciliation Summary Card */}
          <div className="p-3.5 rounded-lg bg-[#0E171B] border border-[#20333B] space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>{t.originalPriceLabel} ({item.weightOrdered} {item.unit}):</span>
              <span className="font-mono text-slate-300">৳{originalPrice.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between font-semibold text-slate-100">
              <span>{t.adjustedPriceLabel} ({numScaleWeight} {item.unit}):</span>
              <span className="font-mono text-emerald-400 text-sm">৳{recalculatedPrice.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-[#20333B] flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{t.priceDifference}:</span>
              <span
                className={`font-mono font-bold ${
                  priceDiff > 0
                    ? "text-amber-400"
                    : priceDiff < 0
                    ? "text-sky-400"
                    : "text-slate-400"
                }`}
              >
                {priceDiff > 0 ? `+৳${priceDiff.toFixed(2)}` : priceDiff < 0 ? `-৳${Math.abs(priceDiff).toFixed(2)}` : "৳0.00"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-300 text-xs font-medium transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
            >
              <CheckCircle2 size={15} />
              <span>{t.reconcileConfirmBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
