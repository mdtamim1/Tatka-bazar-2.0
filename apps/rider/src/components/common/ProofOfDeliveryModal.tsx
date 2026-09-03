"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  PenTool,
  RotateCcw,
  CheckCircle2,
  Camera,
  KeyRound,
  DollarSign,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { DeliveryOrder } from "@/types/rider";
import { useRiderStore } from "@/store/riderStore";
import { translations } from "@/utils/translations";

interface ProofOfDeliveryModalProps {
  order: DeliveryOrder;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProofOfDeliveryModal({
  order,
  isOpen,
  onClose,
}: ProofOfDeliveryModalProps) {
  const { completeDelivery, locale } = useRiderStore();
  const t = translations[locale];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [otp, setOtp] = useState("");
  const [photoTaken, setPhotoTaken] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Setup canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleComplete = () => {
    // Check at least signature OR otp
    if (!hasSignature && otp.length < 4) {
      setErrorMsg("Please obtain customer signature or 4-digit OTP.");
      return;
    }

    // Success confetti burst
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    const signatureData = canvasRef.current ? canvasRef.current.toDataURL() : undefined;
    completeDelivery(order.id, signatureData, otp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-md bg-[#122017] border border-brand-500/30 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 text-gray-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {t.proofOfDelivery}
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                {order.orderNumber} • {order.customerName.split(" ")[0]}
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

        {/* COD Collection Confirmation Card */}
        {order.isCod && (
          <div className="p-3 rounded-xl bg-harvest-500/15 border border-harvest-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-harvest-400" />
              <div>
                <span className="text-[11px] text-harvest-200 font-bold block">
                  {t.codPending}
                </span>
                <span className="text-lg font-black text-white">
                  ৳{order.codAmountToCollect}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-harvest-500/30 text-harvest-300 text-xs font-bold">
              Collect in Cash
            </span>
          </div>
        )}

        {/* Customer Signature Canvas */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-gray-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <PenTool size={14} className="text-brand-400" />
              <span>{t.signatureRequired}</span>
            </div>
            {hasSignature && (
              <button
                onClick={clearCanvas}
                className="text-[11px] text-gray-400 hover:text-red-400 flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>{t.clearSignature}</span>
              </button>
            )}
          </div>

          <div className="relative w-full h-36 bg-[#08100B] rounded-xl border border-gray-700/80 overflow-hidden flex items-center justify-center">
            {!hasSignature && (
              <span className="absolute pointer-events-none text-xs text-gray-500 font-medium">
                Customer signs with finger here
              </span>
            )}
            <canvas
              ref={canvasRef}
              width={380}
              height={144}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        </div>

        {/* Alternative: Customer OTP */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold">
            <KeyRound size={14} className="text-amber-400" />
            <span>{t.confirmOtp}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              maxLength={4}
              placeholder="e.g. 4921"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full bg-[#08100B] border border-gray-700 rounded-xl px-3 py-2 text-center text-lg font-mono font-bold tracking-widest text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={() => setOtp(order.podOtp || "4921")}
              className="px-3 py-2 rounded-xl bg-gray-800 text-[11px] text-gray-300 hover:bg-gray-700 font-semibold whitespace-nowrap"
            >
              Autofill (Demo)
            </button>
          </div>
        </div>

        {/* Photo Proof Simulation */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A140E] border border-gray-800">
          <div className="flex items-center gap-2 text-xs">
            <Camera size={16} className="text-brand-400" />
            <span className="text-gray-300">Parcel Doorstep Photo</span>
          </div>
          <button
            onClick={() => setPhotoTaken(!photoTaken)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              photoTaken
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {photoTaken ? "✓ Photo Attached" : "+ Take Photo"}
          </button>
        </div>

        {errorMsg && (
          <span className="text-xs text-red-400 text-center font-medium">
            {errorMsg}
          </span>
        )}

        {/* Submit */}
        <button
          onClick={handleComplete}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-950 transition-all"
        >
          <CheckCircle2 size={18} />
          <span>{t.completeDelivery} (+৳{order.earningFare.totalEarnings})</span>
        </button>

      </div>
    </div>
  );
}
