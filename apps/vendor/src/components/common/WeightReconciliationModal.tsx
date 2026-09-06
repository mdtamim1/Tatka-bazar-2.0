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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t.weightModalTitle}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                অর্ডার #{order.displayId} • {order.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold text-emerald-700">
            {language === "bn" ? item.productNameBn : item.productName}
          </h4>
          <div className="flex items-center justify-between mt-1.5 text-xs text-slate-600">
            <span>
              {t.unitPriceLabel}: <strong className="text-slate-900">৳{item.unitPrice}/{item.unit}</strong>
            </span>
            <span>
              {t.orderedWeightLabel}: <strong className="text-slate-900">{item.weightOrdered} {item.unit}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-emerald-700 focus:outline-none transition-all shadow-2xs"
                placeholder={t.actualWeightPlaceholder}
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                {item.unit}
              </div>
            </div>
          </div>

          {/* Price Reconciliation Summary Card */}
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{t.originalPriceLabel} ({item.weightOrdered} {item.unit}):</span>
              <span className="font-mono font-medium text-slate-800">৳{originalPrice.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>{t.adjustedPriceLabel} ({numScaleWeight} {item.unit}):</span>
              <span className="font-mono text-emerald-700 text-sm">৳{recalculatedPrice.toFixed(2)}</span>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">{t.priceDifference}:</span>
              <span
                className={`font-mono font-bold ${
                  priceDiff > 0
                    ? "text-amber-700"
                    : priceDiff < 0
                    ? "text-emerald-700"
                    : "text-slate-500"
                }`}
              >
                {priceDiff > 0 ? `+৳${priceDiff.toFixed(2)}` : priceDiff < 0 ? `-৳${Math.abs(priceDiff).toFixed(2)}` : "৳0.00"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <CheckCircle2 size={16} />
              <span>{t.reconcileConfirmBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
