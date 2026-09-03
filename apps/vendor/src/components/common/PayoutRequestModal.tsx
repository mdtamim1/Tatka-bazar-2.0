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

  const [amount, setAmount] = useState<number>(availableBalance > 0 ? availableBalance : 5000);
  const [method, setMethod] = useState<PayoutMethod>(profile.payoutMethod || "BKASH");
  const [account, setAccount] = useState<string>(profile.payoutAccount || "+8801711223344 (Merchant)");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }
    if (amount > availableBalance && availableBalance > 0) {
      setError("Requested amount exceeds withdrawable balance.");
      return;
    }
    requestPayout(amount, method, account);
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
            <Wallet className="text-emerald-400" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.requestPayoutTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-[#152227] border border-[#20333B] flex items-center justify-between">
          <span className="text-xs text-slate-400">{t.availableBalance}:</span>
          <span className="text-base font-mono font-bold text-emerald-400">
            ৳{availableBalance.toLocaleString()}
          </span>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {t.payoutMethodLabel}
            </label>
            <select
              value={method}
              onChange={(e) => {
                const m = e.target.value as PayoutMethod;
                setMethod(m);
                if (m === "BKASH") setAccount("+8801711223344 (Merchant bKash)");
                else if (m === "NAGAD") setAccount("+8801819000111 (Merchant Nagad)");
                else setAccount("BRAC Bank A/C #15012039120");
              }}
              className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="BKASH">bKash Merchant Account (তাৎক্ষণিক)</option>
              <option value="NAGAD">Nagad Merchant Account (তাৎক্ষণিক)</option>
              <option value="BANK_TRANSFER">Direct Commercial Bank Transfer (বিইএফটিএন)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {t.payoutAmountLabel} *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
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
                className="w-full bg-[#0E171B] border border-[#20333B] focus:border-emerald-500 rounded-lg pl-8 pr-3 py-2 text-base font-mono font-bold text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {t.payoutAccountLabel} *
            </label>
            <input
              type="text"
              required
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full bg-[#0E171B] border border-[#20333B] focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none font-mono"
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
              <Send size={14} />
              <span>{t.submitPayoutBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
