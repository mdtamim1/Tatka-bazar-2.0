"use client";

import React, { useState } from "react";
import { Wallet, X, Send, AlertCircle } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { PayoutMethod } from "@/types/vendor";
import { translations } from "@/utils/translations";

interface PayoutRequestModalProps {
  isOpen: boolean;
  availableBalance: number;
  onClose: () => void;
}

export default function PayoutRequestModal({
  isOpen,
  availableBalance,
  onClose,
}: PayoutRequestModalProps) {
  const { language, requestPayout, profile } = useVendorStore();
  const t = translations[language];

  const [amount, setAmount] = useState<number>(availableBalance > 0 ? availableBalance : 0);
  const [method, setMethod] = useState<PayoutMethod>(profile.payoutMethod || "BKASH");
  const [account, setAccount] = useState<string>(profile.payoutAccount || "");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("অনুগ্রহ করে শূন্যের চেয়ে বেশি পরিমাণ লিখুন।");
      return;
    }
    if (amount > availableBalance && availableBalance > 0) {
      setError("উত্তোলনের পরিমাণ উপলব্ধ ব্যালেন্সের চেয়ে বেশি হতে পারবে না।");
      return;
    }
    requestPayout(amount, method, account);
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
              <Wallet size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.requestPayoutTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">{t.availableBalance}:</span>
          <span className="text-base font-mono font-bold text-emerald-700">
            ৳{availableBalance.toLocaleString()}
          </span>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.payoutMethodLabel}
            </label>
            <select
              value={method}
              onChange={(e) => {
                const m = e.target.value as PayoutMethod;
                setMethod(m);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            >
              <option value="BKASH">bKash Merchant Account (তাৎক্ষণিক)</option>
              <option value="NAGAD">Nagad Merchant Account (তাৎক্ষণিক)</option>
              <option value="BANK_TRANSFER">Direct Commercial Bank Transfer (বিইএফটিএন)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.payoutAmountLabel} *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">
                ৳
              </span>
              <input
                type="number"
                min="500"
                step="100"
                required
                value={amount}
                onChange={(e) => {
                  setError(null);
                  setAmount(parseFloat(e.target.value) || 0);
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl pl-8 pr-3 py-2 text-base font-mono font-bold text-slate-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.payoutAccountLabel} *
            </label>
            <input
              type="text"
              required
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none font-mono transition-colors"
            />
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
              <Send size={14} />
              <span>{t.submitPayoutBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
