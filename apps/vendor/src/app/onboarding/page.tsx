"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building,
  FileCheck,
  CreditCard,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Store,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

export default function OnboardingPage() {
  const { language, profile, updateProfile } = useVendorStore();
  const t = translations[language];

  const [step, setStep] = useState<number>(1);
  const [storeName, setStoreName] = useState(profile.storeName);
  const [tradeLicense, setTradeLicense] = useState(profile.tradeLicense);
  const [tinBin, setTinBin] = useState(profile.tinBin);
  const [nidNumber, setNidNumber] = useState(profile.nidNumber);
  const [payoutMethod, setPayoutMethod] = useState(profile.payoutMethod);
  const [payoutAccount, setPayoutAccount] = useState(profile.payoutAccount);
  const [agreed, setAgreed] = useState(true);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 5) {
      setStep((prev) => prev + 1);
    } else {
      updateProfile({
        storeName,
        tradeLicense,
        tinBin,
        nidNumber,
        payoutMethod,
        payoutAccount,
        status: "PENDING",
      });
      setStep(6); // Pending verification view
    }
  };

  const handleSimulateAdminApproval = () => {
    updateProfile({ status: "APPROVED" });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 select-none space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 mb-2">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t.onboardingTitle}
        </h1>
        <p className="text-xs text-slate-400">{t.onboardingSub}</p>
      </div>

      {/* 5 Step Progress Indicator */}
      {step <= 5 && (
        <div className="grid grid-cols-5 gap-1.5 pt-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="space-y-1 text-center">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  s <= step ? "bg-emerald-500" : "bg-slate-800"
                }`}
              />
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Step {s}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KYC Status Review Simulator (Step 6 or if profile status is PENDING) */}
      {step === 6 || profile.status === "PENDING" ? (
        <div className="p-8 rounded-2xl bg-[#111C20] border border-amber-500/40 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Clock size={28} />
          </div>

          <h3 className="text-base font-bold text-white">
            {t.kycPendingNotice}
          </h3>

          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {t.kycPendingDesc}
          </p>

          <div className="p-4 rounded-xl bg-[#0E171B] border border-[#20333B] text-xs text-slate-400 max-w-sm mx-auto space-y-1.5 text-left font-mono">
            <div>Trade License: {tradeLicense}</div>
            <div>TIN / BIN: {tinBin}</div>
            <div>National ID: {nidNumber}</div>
            <div>Payout: {payoutMethod} ({payoutAccount})</div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleSimulateAdminApproval}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles size={15} />
              <span>{t.simulateApprovalBtn}</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#152227] hover:bg-[#1c2c33] text-slate-300 text-xs font-semibold border border-[#20333B]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : profile.status === "APPROVED" && step === 6 ? (
        <div className="p-8 rounded-2xl bg-[#111C20] border border-emerald-500/40 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="text-base font-bold text-white">
            {language === "bn" ? "ভেন্ডর অ্যাকাউন্ট অনুমোদিত!" : "Vendor Account Approved!"}
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            You are fully verified to sell fresh produce and receive payouts on Tatka Bazar.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950"
          >
            Go to Operations Dashboard →
          </Link>
        </div>
      ) : (
        /* Multi-step Form */
        <form
          onSubmit={handleNext}
          className="bg-[#111C20] border border-[#20333B] rounded-2xl p-6 space-y-5 shadow-xl"
        >
          {/* Step 1: Business Info */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs pb-2 border-b border-[#20333B]">
                <Building size={16} />
                <span>{t.step1}</span>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Business Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Primary Market Category
                </label>
                <select className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500">
                  <option>Fresh Produce, Meat & Fish</option>
                  <option>Grocery & Packaged Goods</option>
                  <option>Organic & Dairy Products</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Legal Documents */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs pb-2 border-b border-[#20333B]">
                <FileCheck size={16} />
                <span>{t.step2}</span>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Trade License Number *
                </label>
                <input
                  type="text"
                  required
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  TIN / BIN Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={tinBin}
                  onChange={(e) => setTinBin(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Owner National ID (NID) *
                </label>
                <input
                  type="text"
                  required
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Payout Details */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs pb-2 border-b border-[#20333B]">
                <CreditCard size={16} />
                <span>{t.step3}</span>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Payout Method
                </label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="BKASH">bKash Merchant Account</option>
                  <option value="NAGAD">Nagad Merchant Account</option>
                  <option value="BANK_TRANSFER">Bank Account (BEFTN)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Account Number / Details *
                </label>
                <input
                  type="text"
                  required
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Delivery Zones */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs pb-2 border-b border-[#20333B]">
                <MapPin size={16} />
                <span>{t.step4}</span>
              </div>
              <p className="text-slate-400">
                Select the Dhaka metro fulfillment zones within 30-min express radius of your counter:
              </p>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                {["Dhanmondi", "Kalabagan", "Mohammadpur", "Panthapath", "Lalmatia", "Mirpur 1", "Gulshan 1", "Banani"].map(
                  (zone, idx) => (
                    <label
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#0E171B] border border-[#20333B] flex items-center gap-2 cursor-pointer hover:border-emerald-500/40"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={idx < 5}
                        className="rounded text-emerald-500 accent-emerald-500"
                      />
                      <span>{zone}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          )}

          {/* Step 5: Terms & Commission */}
          {step === 5 && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs pb-2 border-b border-[#20333B]">
                <CheckCircle2 size={16} />
                <span>{t.step5}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0E171B] border border-[#20333B] space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <p>
                  <strong>1. Platform Commission:</strong> Tatka Bazar deducts a standard 10% marketplace facilitation fee from gross order totals.
                </p>
                <p>
                  <strong>2. Quality Guarantee:</strong> Perishable produce and meat must be fresh, weighed accurately on certified scales, and packed in sanitary bags before handing to riders.
                </p>
                <p>
                  <strong>3. Weekly Settlements:</strong> All completed orders are cleared into withdrawable balances and disbursed via bKash/Nagad/Bank transfers.
                </p>
              </div>
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                />
                <span>I accept Tatka Bazar vendor terms & commercial policies</span>
              </label>
            </div>
          )}

          {/* Bottom Nav Buttons */}
          <div className="pt-4 border-t border-[#20333B] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                className="px-4 py-2 rounded-lg bg-[#152227] hover:bg-[#1c2c33] text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950"
            >
              <span>{step === 5 ? "Submit Application" : "Next Step"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
