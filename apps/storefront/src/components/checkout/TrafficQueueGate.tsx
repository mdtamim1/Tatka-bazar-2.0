"use client";

import React, { useState, useEffect } from "react";
import { Clock, ShieldCheck, Sparkles, Zap, Users, Loader2 } from "lucide-react";

interface TrafficQueueGateProps {
  isOpen: boolean;
  onAdmit: () => void;
  campaignTitle?: string;
  estimatedSeconds?: number;
}

export function TrafficQueueGate({
  isOpen,
  onAdmit,
  campaignTitle = "Tatka Bazar Flash Deals & Daily Fresh Offers",
  estimatedSeconds = 4,
}: TrafficQueueGateProps) {
  const [progress, setProgress] = useState(15);
  const [position, setPosition] = useState(18);
  const [timeLeft, setTimeLeft] = useState(estimatedSeconds);

  useEffect(() => {
    if (!isOpen) return;

    setProgress(15);
    setPosition(Math.floor(12 + Math.random() * 15));
    setTimeLeft(estimatedSeconds);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(20 + Math.random() * 15);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onAdmit, 400); // Automatically admit when 100% reached
          return 100;
        }
        return next;
      });

      setPosition((pos) => Math.max(1, pos - Math.floor(3 + Math.random() * 4)));
      setTimeLeft((t) => Math.max(1, t - 1));
    }, 900);

    return () => clearInterval(interval);
  }, [isOpen, estimatedSeconds, onAdmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl text-slate-100 shadow-emerald-500/10">
        
        {/* Glow Effects */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-400">
          <Zap className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-xl font-black text-white tracking-tight mb-1">
          You are in the priority queue
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">
          {campaignTitle} • High volume detected. Your checkout slot is reserved.
        </p>

        {/* Queue Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Your Position
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              #{position}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 p-3.5 rounded-2xl">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Est. Wait Time
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              ~{timeLeft}s
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 mb-3 overflow-hidden p-0.5 border border-slate-700">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-6">
          <span>Verifying order slot...</span>
          <span className="text-emerald-400 font-mono">{progress}%</span>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 border-t border-slate-800 pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Your cart items and promotional discounts are locked</span>
        </div>
      </div>
    </div>
  );
}
