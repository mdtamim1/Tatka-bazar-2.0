"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  Bike,
  FileText,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  UploadCloud,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";

export default function OnboardingPage() {
  const { rider, setKycStatus } = useRiderStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  // Form states
  const [name, setName] = useState(rider.name);
  const [phone, setPhone] = useState(rider.phone);
  const [emergencyPhone, setEmergencyPhone] = useState("+880 1712-345678");
  const [vehicleType, setVehicleType] = useState(rider.vehicleType);
  const [regNumber, setRegNumber] = useState(rider.vehicleRegNumber);
  const [nidNumber, setNidNumber] = useState(rider.nid);
  const [payoutProvider, setPayoutProvider] = useState(rider.payoutProvider);
  const [payoutNumber, setPayoutNumber] = useState(rider.payoutNumber);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((s) => s + 1);
    } else {
      setSubmitted(true);
      setKycStatus("PENDING_REVIEW");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 rounded-2xl bg-[#122017] border border-brand-500/30 text-center flex flex-col items-center gap-4 animate-in zoom-in-95 my-auto">
        <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center animate-bounce">
          <ShieldCheck size={36} />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">
            Application Submitted for Verification
          </h2>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">
            Your documents and NID have been sent to Tatka Bazar fleet compliance. We typically review and approve within 2–4 hours.
          </p>
        </div>

        <div className="w-full p-3 rounded-xl bg-[#09110B] border border-gray-800 text-xs text-left flex flex-col gap-1.5 font-mono">
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="text-amber-400 font-bold">UNDER REVIEW</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rider ID:</span>
            <span className="text-gray-200">{rider.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Target Hub:</span>
            <span className="text-gray-200">Dhanmondi Express Hub</span>
          </div>
        </div>

        <Link
          href="/"
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6 animate-in fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/profile" className="p-2 text-gray-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <h2 className="font-black text-sm text-white uppercase tracking-wider">
          Rider Onboarding & KYC Wizard
        </h2>
        <span className="text-xs font-mono font-bold text-brand-400">
          Step {currentStep} of 5
        </span>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-5 gap-1.5">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step <= currentStep
                ? "bg-gradient-to-r from-brand-500 to-emerald-400"
                : "bg-gray-800"
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="p-4 rounded-2xl bg-[#122017] border border-brand-500/25 flex flex-col gap-3.5 shadow-xl">
        
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <UserCheck size={16} className="text-brand-400" />
              <span>Personal Information</span>
            </h3>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-400 font-semibold">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#09110B] border border-gray-700 rounded-xl text-white font-semibold focus:border-brand-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-400 font-semibold">Registered Phone (OTP Login)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#09110B] border border-gray-700 rounded-xl text-white font-mono focus:border-brand-500 outline-none"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-400 font-semibold">Emergency Family Contact</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#09110B] border border-gray-700 rounded-xl text-white font-mono focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Info */}
        {currentStep === 2 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <Bike size={16} className="text-brand-400" />
              <span>Vehicle Details</span>
            </h3>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-400 font-semibold">Select Delivery Vehicle</label>
              <div className="grid grid-cols-3 gap-2">
                {(["MOTORCYCLE", "BICYCLE", "VAN"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setVehicleType(type)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      vehicleType === type
                        ? "bg-brand-500/20 border-brand-500 text-brand-300"
                        : "bg-[#09110B] border-gray-800 text-gray-400"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-400 font-semibold">Vehicle Registration Number (BRTA)</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. DHAKA METRO-HA 48-9120"
                className="w-full px-3 py-2 bg-[#09110B] border border-gray-700 rounded-xl text-white font-mono font-bold focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Document Uploads */}
        {currentStep === 3 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <FileText size={16} className="text-brand-400" />
              <span>Document Verification</span>
            </h3>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-400 font-semibold">National ID (NID) Number</label>
              <input
                type="text"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#09110B] border border-gray-700 rounded-xl text-white font-mono focus:border-brand-500 outline-none"
              />
            </div>

            {/* Document upload box */}
            <div className="p-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-brand-500 text-center flex flex-col items-center gap-2 bg-[#09110B] cursor-pointer">
              <UploadCloud size={24} className="text-brand-400" />
              <span className="text-xs text-gray-300 font-semibold">
                NID Front & Back Photos Attached
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                ✓ nid_front.jpg (1.8 MB) • ✓ nid_back.jpg (2.1 MB)
              </span>
            </div>
          </div>
        )}

        {/* Step 4: Payout Details */}
        {currentStep === 4 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <CreditCard size={16} className="text-harvest-400" />
              <span>Payout Method (Instant Withdrawals)</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayoutProvider("BKASH")}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  payoutProvider === "BKASH"
                    ? "bg-[#D12053]/20 border-[#D12053] text-pink-300"
                    : "bg-[#09110B] border-gray-800 text-gray-400"
                }`}
              >
                bKash Wallet
              </button>
              <button
                type="button"
                onClick={() => setPayoutProvider("NAGAD")}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  payoutProvider === "NAGAD"
                    ? "bg-[#F7931E]/20 border-[#F7931E] text-amber-300"
                    : "bg-[#09110B] border-gray-800 text-gray-400"
                }`}
              >
                Nagad Wallet
              </button>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="text-gray-400 font-semibold">{payoutProvider} Personal Account Number</label>
              <input
                type="text"
                value={payoutNumber}
                onChange={(e) => setPayoutNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#09110B] border border-gray-700 rounded-xl text-white font-mono focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 5: Terms & Agreement */}
        {currentStep === 5 && (
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Tatka Bazar Delivery Agreement</span>
            </h3>

            <div className="p-3 rounded-xl bg-[#09110B] border border-gray-800 text-[11px] text-gray-300 max-h-40 overflow-y-auto leading-relaxed flex flex-col gap-2">
              <p>
                1. <strong>Fresh Grocery Standard:</strong> All perishables (Hilsa fish, organic vegetables, dairy) must be maintained in temperature-insulated bags provided by Tatka Bazar.
              </p>
              <p>
                2. <strong>COD Discipline:</strong> Cash collected from customers must be reconciled and deposited at assigned Hub dispatch at end-of-shift.
              </p>
              <p>
                3. <strong>Fleet Safety:</strong> Helmet wearing and road traffic compliance in Dhaka is mandatory. SOS hotline is monitored 24/7.
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 accent-brand-500 rounded"
              />
              <span>I accept the Tatka Bazar Delivery Partner Terms & Code of Conduct.</span>
            </label>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          {currentStep > 1 ? (
            <button
              onClick={handlePrev}
              className="py-2 px-4 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="py-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md"
          >
            <span>{currentStep === 5 ? "Submit Application" : "Next Step"}</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
}
