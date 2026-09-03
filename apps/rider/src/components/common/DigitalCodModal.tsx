"use client";

import React, { useState } from "react";
import { QrCode, CheckCircle, Copy, Check, X, ShieldCheck } from "lucide-react";
import { DeliveryOrder } from "@/types/rider";
import { useRiderStore } from "@/store/riderStore";

interface DigitalCodModalProps {
  order: DeliveryOrder;
  isOpen: boolean;
  onClose: () => void;
}

export default function DigitalCodModal({
  order,
  isOpen,
  onClose,
}: DigitalCodModalProps) {
  const { collectDigitalCod } = useRiderStore();
  const [provider, setProvider] = useState<"BKASH" | "NAGAD">("BKASH");
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard?.writeText("01701998877");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDigitalPayment = () => {
    collectDigitalCod(order.id, `${provider} App QR`);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-md bg-[#122017] border border-brand-500/40 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 text-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-harvest-500/20 text-harvest-400">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Contactless Digital COD
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Order {order.orderNumber}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Amount Pill */}
        <div className="p-3 rounded-xl bg-[#09110B] border border-brand-500/20 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">Payable COD Amount:</span>
          <span className="text-xl font-black text-emerald-400">
            ৳{order.codAmountToCollect}
          </span>
        </div>

        {/* Provider Switcher */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setProvider("BKASH")}
            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
              provider === "BKASH"
                ? "bg-[#D12053]/20 border-[#D12053] text-[#F06292]"
                : "bg-gray-800/60 border-gray-700 text-gray-400"
            }`}
          >
            bKash Merchant QR
          </button>
          <button
            onClick={() => setProvider("NAGAD")}
            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
              provider === "NAGAD"
                ? "bg-[#F7931E]/20 border-[#F7931E] text-[#FFB74D]"
                : "bg-gray-800/60 border-gray-700 text-gray-400"
            }`}
          >
            Nagad Merchant QR
          </button>
        </div>

        {/* Simulated QR Code Canvas */}
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white text-gray-900 gap-2">
          {/* Authentic SVG QR Code Graphic */}
          <div className="w-44 h-44 bg-white p-2 rounded-lg flex items-center justify-center border-2 border-gray-200 shadow-inner">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Corner squares */}
              <rect x="5" y="5" width="25" height="25" fill="#111827" />
              <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
              <rect x="13" y="13" width="9" height="9" fill="#111827" />

              <rect x="70" y="5" width="25" height="25" fill="#111827" />
              <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
              <rect x="78" y="13" width="9" height="9" fill="#111827" />

              <rect x="5" y="70" width="25" height="25" fill="#111827" />
              <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
              <rect x="13" y="78" width="9" height="9" fill="#111827" />

              {/* Data matrix dots */}
              <rect x="35" y="10" width="5" height="15" fill="#111827" />
              <rect x="45" y="5" width="15" height="5" fill="#111827" />
              <rect x="45" y="15" width="10" height="10" fill="#111827" />
              <rect x="10" y="35" width="20" height="5" fill="#111827" />
              <rect x="15" y="45" width="15" height="15" fill="#111827" />
              <rect x="35" y="35" width="30" height="30" rx="3" fill="#1B8A4C" />
              <text x="50" y="53" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                TB
              </text>
              <rect x="70" y="35" width="10" height="20" fill="#111827" />
              <rect x="85" y="40" width="10" height="15" fill="#111827" />
              <rect x="35" y="70" width="15" height="10" fill="#111827" />
              <rect x="55" y="75" width="20" height="5" fill="#111827" />
              <rect x="70" y="85" width="25" height="10" fill="#111827" />
            </svg>
          </div>

          <span className="text-[11px] font-bold text-gray-700">
            Scan with {provider === "BKASH" ? "bKash" : "Nagad"} App to Pay ৳{order.codAmountToCollect}
          </span>
        </div>

        {/* Merchant Number Copy */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#09110B] border border-gray-800 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400">Tatka Bazar Merchant:</span>
            <span className="font-mono font-bold text-gray-200">01701-998877</span>
          </div>
          <button
            onClick={handleCopyNumber}
            className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white flex items-center gap-1 text-[11px]"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Action */}
        <button
          onClick={handleConfirmDigitalPayment}
          disabled={isSuccess}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
        >
          {isSuccess ? (
            <>
              <CheckCircle size={18} className="text-white animate-bounce" />
              <span>Payment Verified & Reconciled!</span>
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              <span>Customer Completed Digital Payment</span>
            </>
          )}
        </button>

      </div>
    </div>
  );
}
