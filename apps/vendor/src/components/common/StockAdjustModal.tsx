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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#111C20] border border-[#20333B] rounded-xl max-w-md w-full p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <Package className="text-emerald-400" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.adjustStockBtn}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[#152227] border border-[#20333B]">
          <h4 className="text-xs font-bold text-slate-200">
            {language === "bn" ? product.nameBn : product.name}
          </h4>
          <div className="flex items-center justify-between mt-1 text-xs text-slate-400 font-mono">
            <span>SKU: {product.sku}</span>
            <span>
              {t.previousQty}: <strong className="text-slate-200">{product.stockQty} {product.unit}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {t.newQty} ({product.unit})
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                required
                value={newQty}
                onChange={(e) => setNewQty(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0E171B] border border-[#20333B] focus:border-emerald-500 rounded-lg px-3 py-2 text-base font-mono font-bold text-white focus:outline-none"
              />
              <div
                className={`px-3 py-2 rounded-lg font-mono text-xs font-bold shrink-0 border ${
                  delta > 0
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : delta < 0
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {delta > 0 ? `+${delta}` : delta}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {t.reasonCol} *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as StockAdjustmentReason)}
              className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="RESTOCK">{t.reasonRestock}</option>
              <option value="DAMAGED">{t.reasonDamaged}</option>
              <option value="RECOUNT_AUDIT">{t.reasonRecount}</option>
              <option value="CUSTOMER_RETURN">{t.reasonReturn}</option>
              <option value="EXPIRED">{t.reasonExpired}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {language === "bn" ? "অডিট মন্তব্য (ঐচ্ছিক)" : "Audit Notes (Optional)"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Crate count mismatch, batch arrival #12"
              className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-[#20333B] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-300 text-xs font-medium"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950"
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
