"use client";

import React, { useState, useEffect } from "react";
import { Package, X, ArrowRight, Save } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Product, StockAdjustmentReason } from "@/types/vendor";
import { translations } from "@/utils/translations";

interface StockAdjustModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
}

export default function StockAdjustModal({
  isOpen,
  product,
  onClose,
}: StockAdjustModalProps) {
  const { language, adjustStock } = useVendorStore();
  const t = translations[language];

  const [newQty, setNewQty] = useState<number>(0);
  const [reason, setReason] = useState<StockAdjustmentReason>("RESTOCK");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (product) {
      setNewQty(product.stockQty);
      setReason("RESTOCK");
      setNotes("");
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const delta = newQty - product.stockQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(product.id, newQty, reason, notes);
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
              <Package size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.adjustStockBtn}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold text-slate-900">
            {language === "bn" ? product.nameBn : product.name}
          </h4>
          <div className="flex items-center justify-between mt-1 text-xs text-slate-500 font-mono">
            <span>SKU: {product.sku}</span>
            <span>
              {t.previousQty}: <strong className="text-slate-900">{product.stockQty} {product.unit}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.newQty} ({product.unit})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                required
                value={newQty}
                onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2 text-base font-mono font-bold text-slate-900 focus:outline-none transition-colors"
              />
              <div
                className={`px-3 py-2 rounded-xl font-mono text-xs font-bold shrink-0 border ${
                  delta > 0
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : delta < 0
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.reasonCol} *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as StockAdjustmentReason)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            >
              <option value="RESTOCK">{t.reasonRestock}</option>
              <option value="DAMAGED">{t.reasonDamaged}</option>
              <option value="RECOUNT_AUDIT">{t.reasonRecount}</option>
              <option value="CUSTOMER_RETURN">{t.reasonReturn}</option>
              <option value="EXPIRED">{t.reasonExpired}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {language === "bn" ? "অডিট মন্তব্য (ঐচ্ছিক)" : "Audit Notes (Optional)"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Crate count mismatch, batch arrival #12"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            >
            </input>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Save size={15} />
              <span>{t.adjustStockBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
