"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Lock,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";
import PayoutRequestModal from "@/components/common/PayoutRequestModal";

export default function SettlementsPage() {
  const { language, currentRole, commissionLedger, payouts, profile } =
    useVendorStore();
  const t = translations[language];

  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // If accessed by non-owner, display permission notice
  if (currentRole !== "OWNER") {
    return (
      <div className="p-12 text-center max-w-md mx-auto my-12 bg-[#111C20] border border-[#20333B] rounded-2xl shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <Lock size={24} />
        </div>
        <h2 className="text-base font-bold text-white uppercase tracking-wider">
          {t.accessRestricted}
        </h2>
        <p className="text-xs text-slate-400">{t.accessRestrictedDesc}</p>
        <p className="text-[11px] text-slate-500">
          {language === "bn"
            ? "টাকা উত্তোলন ও ব্যাংক স্টেটমেন্ট শুধুমাত্র স্টোর ওনার (দোকানের মালিক) দেখতে পারবেন।"
            : "Payout requests and bank statements are restricted to the Primary Store Owner role."}
        </p>
      </div>
    );
  }

  const pendingEntries = commissionLedger.filter(
    (c) => c.settlementStatus === "PENDING"
  );

  const availableBalance = pendingEntries.reduce(
    (sum, c) => sum + c.netPayable,
    0
  );

  const lifetimeSettled = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const inProcessing = payouts
    .filter((p) => p.status === "PROCESSING" || p.status === "REQUESTED")
    .reduce((sum, p) => sum + p.amount, 0);

  const handleDownloadStatement = () => {
    const headers = "OrderDisplayID,Date,GrossAmount,CommissionRate,CommissionFee,NetVendorPayable,Status\n";
    const rows = commissionLedger
      .map(
        (c) =>
          `"${c.displayId}","${c.date}",${c.grossAmount},${c.commissionRate}%,${c.commissionAmount},${c.netPayable},"${c.settlementStatus}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tatka-bazar-commission-statement-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t.settlementsTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.settlementsSub}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadStatement}
            className="px-3 py-2 rounded-lg bg-[#111C20] hover:bg-[#152227] border border-[#20333B] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} className="text-emerald-400" />
            <span>{t.downloadStatementBtn}</span>
          </button>

          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
          >
            <Wallet size={15} />
            <span>{t.requestPayoutBtn}</span>
          </button>
        </div>
      </div>

      {/* 3 Wallet Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.availableBalance}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ৳{availableBalance.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === "bn" ? "তাৎক্ষণিক উত্তোলনের জন্য তৈরি" : "Cleared from completed orders"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.inProcessingBalance}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tabular-nums">
            ৳{inProcessing.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === "bn" ? "ব্যাংক বা বিকাশ ডিসপ্যাচ প্রক্রিয়াধীন" : "In queue with accounts dept"}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.lifetimePaid}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-sky-400 tabular-nums">
            ৳{lifetimeSettled.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {language === "bn" ? "সফলভাবে অ্যাকাউন্টে স্থানান্তরিত" : "Disbursed to merchant account"}
          </p>
        </div>
      </div>

      {/* Payout Requests History */}
      <div className="bg-[#111C20] border border-[#20333B] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.payoutHistoryTitle}
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Destination: {profile.payoutAccount}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-[#20333B]/60 pb-2">
              <tr>
                <th className="py-2">Request ID</th>
                <th className="py-2">Date</th>
                <th className="py-2">{t.methodCol}</th>
                <th className="py-2">Account</th>
                <th className="py-2 font-mono">Amount</th>
                <th className="py-2">{t.orderStatusCol}</th>
                <th className="py-2 font-mono">Txn Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20333B]/40">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-[#152227]/40">
                  <td className="py-2.5 font-mono text-slate-300 font-semibold">
                    #{p.id}
                  </td>
                  <td className="py-2.5 text-slate-400">
                    {new Date(p.requestedAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 text-slate-200 font-medium">
                    {p.method}
                  </td>
                  <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                    {p.accountDetails}
                  </td>
                  <td className="py-2.5 font-mono font-bold text-white">
                    ৳{p.amount.toLocaleString()}
                  </td>
                  <td className="py-2.5">
                    {p.status === "COMPLETED" ? (
                      <span className="badge-emerald text-[10px] font-bold">
                        {language === "bn" ? "পরিশোধিত" : "Paid"}
                      </span>
                    ) : (
                      <span className="badge-amber text-[10px] font-bold">
                        {language === "bn" ? "অনুমোদন অপেক্ষমাণ" : "Processing"}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                    {p.referenceTxn || "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Itemized Commission Ledger Table */}
      <div className="bg-[#111C20] border border-[#20333B] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.commissionLedgerTitle}
            </h3>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            Platform Fee: 10% Flat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-[#20333B]/60 pb-2">
              <tr>
                <th className="py-2">{t.orderId}</th>
                <th className="py-2">Date</th>
                <th className="py-2 font-mono">{t.grossCol}</th>
                <th className="py-2 font-mono">{t.feeCol}</th>
                <th className="py-2 font-mono font-bold text-emerald-400">
                  {t.netCol}
                </th>
                <th className="py-2">{t.orderStatusCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20333B]/40">
              {commissionLedger.map((c) => (
                <tr key={c.id} className="hover:bg-[#152227]/40">
                  <td className="py-2.5 font-mono text-slate-200 font-semibold">
                    #{c.displayId}
                  </td>
                  <td className="py-2.5 text-slate-400">{c.date}</td>
                  <td className="py-2.5 font-mono text-slate-300">
                    ৳{c.grossAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">
                    -৳{c.commissionAmount.toFixed(2)} ({c.commissionRate}%)
                  </td>
                  <td className="py-2.5 font-mono font-bold text-emerald-400">
                    ৳{c.netPayable.toLocaleString()}
                  </td>
                  <td className="py-2.5">
                    {c.settlementStatus === "SETTLED" ? (
                      <span className="badge-slate text-[10px]">
                        Settled ({c.settlementBatchId})
                      </span>
                    ) : (
                      <span className="badge-emerald text-[10px]">
                        Available to Withdraw
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Modal */}
      <PayoutRequestModal
        isOpen={isPayoutModalOpen}
        availableBalance={availableBalance}
        onClose={() => setIsPayoutModalOpen(false)}
      />
    </div>
  );
}
