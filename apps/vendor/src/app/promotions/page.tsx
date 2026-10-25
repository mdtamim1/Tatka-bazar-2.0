"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Tag,
  Plus,
  Percent,
  Sparkles,
  Calendar,
  CheckCircle,
  X,
  Trash2,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";
import { apiFetch } from "@/lib/api";

interface DBCoupon {
  id: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minimumOrderValue: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function PromotionsPage() {
  const { language } = useVendorStore();
  const t = translations[language];

  const [coupons, setCoupons] = useState<DBCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENT" | "FLAT">("PERCENT");
  const [newValue, setNewValue] = useState<number>(10);
  const [newMinSpend, setNewMinSpend] = useState<number>(500);
  const [newMaxUses, setNewMaxUses] = useState<number>(50);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<DBCoupon[]>("/api/vendor-portal/coupons");
      if (res.success && Array.isArray(res.data)) {
        setCoupons(res.data);
      } else {
        setError(res.error || "কুপন লোড করতে ব্যর্থ হয়েছে।");
      }
    } catch {
      setError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      setModalError("কুপন কোড লিখুন।");
      return;
    }
    setSubmitting(true);
    setModalError(null);

    try {
      const res = await apiFetch("/api/vendor-portal/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discountType: newType,
          discountValue: newValue,
          minimumOrderValue: newMinSpend,
          maxUses: newMaxUses || null,
        }),
      });

      if (!res.success) {
        setModalError(res.error || "কুপন তৈরি করতে ব্যর্থ হয়েছে।");
        return;
      }

      setIsCouponModalOpen(false);
      setNewCode("");
      loadCoupons();
    } catch {
      setModalError("নেটওয়ার্ক সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("আপনি কি এই কুপনটি নিষ্ক্রিয় করতে চান?")) return;
    try {
      const res = await apiFetch("/api/vendor-portal/coupons", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert(res.error || "কুপন নিষ্ক্রিয় করতে ব্যর্থ হয়েছে।");
      }
    } catch {
      alert("নেটওয়ার্ক সমস্যা হয়েছে।");
    }
  };

  const bundleDeals = [
    {
      id: "bndl-1",
      title: "Fresh Veggie Trio Bundle (শাকসবজি কম্বো)",
      description: "লাল শাক + পাকা টমেটো + কাঁচা মরিচ একসাথে কিনলে ১০% ছাড়!",
      discount: "10% OFF",
      tag: "Produce Bundle",
      validUntil: "ডিসেম্বর ৩১, ২০২৬",
    },
    {
      id: "bndl-2",
      title: "Protein Pantry Pack (ইলিশ ও দেশি গরুর মাংস কম্বো)",
      description: "১ কেজি পদ্মার ইলিশ + ২ কেজি দেশি গরুর মাংস ফ্রি থার্মাল আইস প্যাকসহ।",
      discount: "৳১৫০ Flat OFF",
      tag: "Weekend Feast",
      validUntil: "ডিসেম্বর ৩১, ২০২৬",
    },
  ];

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            🏷️ {t.promotionsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.promotionsSub}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCoupons}
            className="p-2 rounded-lg bg-[#111C20] border border-[#20333B] text-slate-300 hover:text-white transition-colors"
            title="রিফ্রেশ"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => {
              setModalError(null);
              setIsCouponModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
          >
            <Plus size={15} />
            <span>{t.createCouponBtn}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-400 flex items-center gap-2.5">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Coupons Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-emerald-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            {t.activeCoupons} ({coupons.length})
          </h2>
        </div>

        {loading && coupons.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2 bg-[#111C20] border border-[#20333B] rounded-xl">
            <Loader2 size={20} className="animate-spin text-emerald-500" />
            <span>ডাটাবেজ থেকে কুপন তালিকা লোড হচ্ছে...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center bg-[#111C20] border border-[#20333B] rounded-xl space-y-2">
            <div className="text-2xl">🏷️</div>
            <div className="text-sm font-bold text-slate-200">কোনো সক্রিয় কুপন নেই</div>
            <p className="text-xs text-slate-400">
              গ্রাহকদের আকৃষ্ট করতে নতুন ডিসকাউন্ট কুপন তৈরি করুন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-slate-600 transition-colors flex items-start justify-between"
              >
                <div className="space-y-1.5 flex-1">
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
                    {t.minSpend}: <strong className="font-mono">৳{c.minimumOrderValue}</strong>
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-3">
                    <span>
                      {t.usageStatus}: {c.usedCount} / {c.maxUses || "∞"}
                    </span>
                    <span>•</span>
                    <span>
                      তৈরি: {new Date(c.createdAt).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="কুপন মুছে ফেলুন"
                  >
                    <Trash2 size={15} />
                  </button>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
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
                <span className="font-mono font-bold text-xs text-amber-400">{b.discount}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100">{b.title}</h4>
              <p className="text-xs text-slate-400">{b.description}</p>
              <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>মেয়াদ: {b.validUntil}</span>
                <span className="text-emerald-400 font-semibold">স্টোরফ্রন্টে সক্রিয়</span>
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

            {modalError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-2.5 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle size={14} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  {t.couponCode} *
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
                    ছাড়ের ধরন (Discount Type)
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "PERCENT" | "FLAT")}
                    className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PERCENT">শতাংশ (%)</option>
                    <option value="FLAT">নির্ধারিত টাকা (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ছাড়ের পরিমাণ *
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {t.minSpend} (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newMinSpend}
                    onChange={(e) => setNewMinSpend(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    সর্বোচ্চ ব্যবহার সীমা
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(parseInt(e.target.value) || 50)}
                    className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#20333B] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="py-2 px-3 rounded-lg bg-[#152227] text-slate-300"
                  disabled={submitting}
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle size={13} />
                  )}
                  <span>{submitting ? "সেভ হচ্ছে..." : "কুপন সেভ করুন"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
