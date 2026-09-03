"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Percent,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle,
  X,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";
import { Coupon } from "@/types/vendor";

export default function PromotionsPage() {
  const { language, coupons } = useVendorStore();
  const t = translations[language];

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [newValue, setNewValue] = useState<number>(10);
  const [newMinSpend, setNewMinSpend] = useState<number>(500);

  const bundleDeals = [
    {
      id: "bndl-1",
      title: "Fresh Veggie Trio Bundle (শাকসবজি কম্বো)",
      description: "Buy Red Spinach + Tomatoes + Green Chilli and get 10% flat off!",
      discount: "10% OFF",
      tag: "Produce Bundle",
      validUntil: "Sep 30, 2026",
    },
    {
      id: "bndl-2",
      title: "Protein Pantry Pack (ইলিশ ও গরুর মাংস কম্বো)",
      description: "1kg+ Padma Hilsa + 2kg Deshi Beef with free thermal ice packing.",
      discount: "৳150 Flat OFF",
      tag: "Weekend Feast",
      validUntil: "Sep 15, 2026",
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t.promotionsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.promotionsSub}</p>
        </div>

        <button
          onClick={() => setIsCouponModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
        >
          <Plus size={15} />
          <span>{t.createCouponBtn}</span>
        </button>
      </div>

      {/* Active Coupons Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-emerald-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            {t.activeCoupons}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-slate-600 transition-colors flex items-start justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                    {c.code}
                  </span>
                  <span className="badge-emerald text-[10px] font-bold">
                    {c.discountType === "PERCENT"
                      ? `${c.discountValue}% OFF`
                      : `৳${c.discountValue} FLAT OFF`}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {t.minSpend}: <strong className="font-mono">৳{c.minOrderAmount}</strong>
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>
                    {t.usageStatus}: {c.usedCount} / {c.usageLimit}
                  </span>
                  <span>•</span>
                  <span>
                    {t.expiresOn}: {c.endDate}
                  </span>
                </div>
              </div>

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Fresh Produce Bundles */}
      <div className="space-y-3 pt-4 border-t border-[#20333B]">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            {t.bundleDeals}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundleDeals.map((b) => (
            <div
              key={b.id}
              className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] space-y-2 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="badge-amber text-[10px] font-bold">{b.tag}</span>
                <span className="font-mono font-bold text-xs text-amber-400">
                  {b.discount}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-100">{b.title}</h4>
              <p className="text-xs text-slate-400">{b.description}</p>
              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Valid: {b.validUntil}</span>
                <span className="text-emerald-400 font-semibold">Active in Storefront</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsCouponModalOpen(false)}
          />
          <div className="relative bg-[#111C20] border border-[#20333B] rounded-xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#20333B]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.createCouponBtn}
              </h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsCouponModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {t.couponCode}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GREENVEG15"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Discount Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) =>
                      setNewType(e.target.value as "PERCENT" | "FLAT")
                    }
                    className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Value
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newValue}
                    onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {t.minSpend} (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newMinSpend}
                  onChange={(e) =>
                    setNewMinSpend(parseFloat(e.target.value) || 0)
                  }
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 border-t border-[#20333B] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="py-2 px-3 rounded-lg bg-[#152227] text-slate-300"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
