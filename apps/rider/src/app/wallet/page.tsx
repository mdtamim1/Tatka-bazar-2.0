"use client";

import React, { useState } from "react";
import {
  Wallet,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  FileDown,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  X,
  CreditCard,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";
import { translations } from "@/utils/translations";

export default function RiderWalletPage() {
  const {
    walletBalance,
    dailySummary,
    transactions,
    rider,
    withdrawFunds,
    depositCashToHub,
    locale,
  } = useRiderStore();

  const t = translations[locale];

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("1000");
  const [withdrawProvider, setWithdrawProvider] = useState<"BKASH" | "NAGAD">("BKASH");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "EARNINGS" | "WITHDRAWALS">("ALL");

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "EARNINGS") return tx.type === "DELIVERY_EARNING" || tx.type === "BONUS";
    if (filterType === "WITHDRAWALS") return tx.type === "WITHDRAWAL" || tx.type === "COD_DEPOSIT";
    return true;
  });

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > walletBalance) return;

    const ok = withdrawFunds(amount, withdrawProvider, rider.payoutNumber);
    if (ok) {
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setWithdrawModalOpen(false);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col gap-3.5 pb-4 animate-in fade-in">
      
      {/* Wallet Balance Hero Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1B8A4C] to-[#0E5230] text-white shadow-xl shadow-brand-950 flex flex-col gap-3">
        <div className="flex items-center justify-between text-emerald-100">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <Wallet size={16} />
            <span>{t.walletBalance}</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 font-mono font-bold">
            Live Net Balance
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black font-mono">
              ৳{walletBalance}
            </span>
            <span className="text-xs text-emerald-200 font-bold">BDT</span>
          </div>

          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-harvest-500 hover:bg-harvest-600 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
          >
            <ArrowDownRight size={15} />
            <span>{t.instantWithdraw}</span>
          </button>
        </div>

        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
          <span>Connected Payout: <strong>{rider.payoutProvider}</strong> ({rider.payoutNumber})</span>
          <span className="text-[11px] opacity-80">Instant Transfer (0s)</span>
        </div>
      </div>

      {/* Cash-in-Hand (COD Held) Reconciliation Card */}
      <div className="p-4 rounded-2xl bg-[#142217] border border-harvest-500/30 flex flex-col gap-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-harvest-500/20 text-harvest-400">
              <DollarSign size={18} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">
                {t.cashInHand}
              </h4>
              <span className="text-[11px] text-gray-400">
                Total physical cash held from deliveries
              </span>
            </div>
          </div>
          <span className="text-xl font-black text-harvest-400 font-mono">
            ৳{dailySummary.codInHandToDeposit}
          </span>
        </div>

        <button
          onClick={depositCashToHub}
          disabled={dailySummary.codInHandToDeposit <= 0}
          className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-harvest-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-harvest-500/30"
        >
          <Landmark size={14} />
          <span>{t.depositToHub}</span>
        </button>
      </div>

      {/* Per-Delivery Fare Breakdown Reference */}
      <div className="p-4 rounded-2xl bg-[#122017] border border-brand-500/20 flex flex-col gap-2.5">
        <h4 className="font-bold text-xs text-gray-300 uppercase tracking-wider">
          Standard Fare Rate Sheet (Dhaka Fleet)
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#09110B] border border-gray-800 flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase font-semibold">Base Fare (0-2 km)</span>
            <span className="text-base font-bold text-emerald-400 font-mono">৳60 - ৳65</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09110B] border border-gray-800 flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase font-semibold">Distance Rate</span>
            <span className="text-base font-bold text-gray-200 font-mono">+৳15 / km</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09110B] border border-gray-800 flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase font-semibold">Monsoon Rain Buffer</span>
            <span className="text-base font-bold text-blue-400 font-mono">+৳25 / trip</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#09110B] border border-gray-800 flex flex-col">
            <span className="text-gray-400 text-[10px] uppercase font-semibold">Customer Tips</span>
            <span className="text-base font-bold text-harvest-400 font-mono">100% Retained</span>
          </div>
        </div>
      </div>

      {/* Transaction History & Filter */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-gray-200">
            {t.recentTransactions}
          </h4>

          {/* Filter Pills */}
          <div className="flex p-0.5 rounded-lg bg-gray-900 border border-gray-800 text-[10px]">
            {(["ALL", "EARNINGS", "WITHDRAWALS"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-2 py-1 rounded-md font-bold transition-all ${
                  filterType === filter
                    ? "bg-brand-500/20 text-brand-300"
                    : "text-gray-400"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Items */}
        <div className="flex flex-col gap-2">
          {filteredTransactions.map((tx) => {
            const isCredit = tx.type === "DELIVERY_EARNING" || tx.type === "BONUS";

            return (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-[#122017] border border-brand-500/20 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCredit
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-harvest-500/20 text-harvest-400"
                    }`}
                  >
                    {isCredit ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <span className="font-bold text-gray-100 block">
                      {tx.note}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {tx.timestamp} • Ref: {tx.referenceId}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-black text-sm block ${
                      isCredit ? "text-emerald-400" : "text-harvest-400"
                    }`}
                  >
                    {isCredit ? `+৳${tx.amount}` : `-৳${tx.amount}`}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-bold uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instant Withdraw Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-sm bg-[#122017] border border-brand-500/40 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 text-gray-100">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <CreditCard size={18} className="text-harvest-400" />
                <span>Instant Wallet Payout</span>
              </h3>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 font-semibold">
                  Available to Withdraw: <strong className="text-emerald-400">৳{walletBalance}</strong>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-mono font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="100"
                    max={walletBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-[#09110B] border border-gray-700 rounded-xl text-white font-mono font-bold text-lg focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawProvider("BKASH")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    withdrawProvider === "BKASH"
                      ? "bg-[#D12053]/20 border-[#D12053] text-pink-300"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  bKash ({rider.payoutNumber})
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawProvider("NAGAD")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    withdrawProvider === "NAGAD"
                      ? "bg-[#F7931E]/20 border-[#F7931E] text-amber-300"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  Nagad ({rider.payoutNumber})
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-200">
                Dispatched directly via Tatka Bazar automated merchant API with 0% fee.
              </div>

              <button
                type="submit"
                disabled={withdrawSuccess || parseFloat(withdrawAmount) > walletBalance}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-harvest-500 to-amber-600 hover:from-harvest-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {withdrawSuccess ? (
                  <>
                    <CheckCircle2 size={18} className="text-white animate-bounce" />
                    <span>Payout Dispatched to {withdrawProvider}!</span>
                  </>
                ) : (
                  <span>Confirm Withdraw ৳{withdrawAmount}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
