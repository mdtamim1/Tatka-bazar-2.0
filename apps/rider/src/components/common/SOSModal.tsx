"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  AlertTriangle,
  X,
  CheckCircle,
  Radio,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";

export default function SOSModal() {
  const { sosActive, cancelSos } = useRiderStore();
  const [countdown, setCountdown] = useState(5);
  const [isTriggered, setIsTriggered] = useState(false);
  const [incidentType, setIncidentType] = useState<string | null>(null);
  const [incidentSent, setIncidentSent] = useState(false);

  useEffect(() => {
    if (!sosActive) {
      setCountdown(5);
      setIsTriggered(false);
      setIncidentSent(false);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTriggered(true);
    }
  }, [sosActive, countdown]);

  if (!sosActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div className="w-full max-w-md bg-[#160B0B] border-2 border-red-500/60 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-900/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-600/30 text-red-400 animate-ping">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 className="font-black text-lg text-red-100">
                EMERGENCY SOS
              </h3>
              <span className="text-xs text-red-300">
                Tatka Bazar Dispatch Priority Hotline
              </span>
            </div>
          </div>
          <button
            onClick={cancelSos}
            className="p-1 rounded-lg text-gray-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Cancellation Countdown banner before dispatch */}
        {!isTriggered ? (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/50 flex flex-col items-center gap-3 text-center">
            <span className="text-xs text-red-200">
              Broadcasting distress signal to Hub Manager & Dhaka Dispatch in:
            </span>
            <div className="text-5xl font-black font-mono text-red-400 animate-pulse">
              0{countdown}
            </div>
            <button
              onClick={cancelSos}
              className="py-2.5 px-6 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-xs"
            >
              Cancel (Accidental Press)
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center gap-2.5">
            <Radio size={18} className="text-red-400 animate-pulse" />
            <div className="flex-1 text-xs">
              <span className="font-bold text-red-200 block">
                Distress Signal Active & Broadcasting
              </span>
              <span className="text-gray-400 font-mono text-[10px]">
                Live GPS: 23.7465° N, 90.3753° E (Dhanmondi, Dhaka)
              </span>
            </div>
          </div>
        )}

        {/* Quick Emergency Phone Hotlines */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href="tel:999"
            className="p-3 rounded-xl bg-red-600 hover:bg-red-700 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <PhoneCall size={16} />
            <span>Call 999 Police</span>
          </a>

          <a
            href="tel:+8801700000000"
            className="p-3 rounded-xl bg-amber-600 hover:bg-amber-700 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg"
          >
            <PhoneCall size={16} />
            <span>Hub Dispatch</span>
          </a>
        </div>

        {/* Quick Incident Reporting */}
        <div className="flex flex-col gap-2 pt-1 border-t border-red-900/40">
          <span className="text-xs font-semibold text-gray-300">
            Select Situation / Incident:
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              "Road Accident / Crash",
              "Bike Breakdown in Flood",
              "Snatching / Security Threat",
              "Customer Physical Conflict",
            ].map((type) => (
              <button
                key={type}
                onClick={() => setIncidentType(type)}
                className={`p-2 rounded-lg text-left text-[11px] font-semibold border transition-all ${
                  incidentType === type
                    ? "bg-red-600/30 border-red-500 text-white"
                    : "bg-gray-900/60 border-gray-800 text-gray-300 hover:bg-gray-800"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {incidentType && !incidentSent && (
            <button
              onClick={() => setIncidentSent(true)}
              className="mt-1 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-xs font-bold text-white transition-colors"
            >
              Confirm & Alert Fleet Safety Team
            </button>
          )}

          {incidentSent && (
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle size={15} />
              <span>Fleet Safety Manager dispatched to your GPS location.</span>
            </div>
          )}
        </div>

        {/* Dismiss SOS */}
        <button
          onClick={cancelSos}
          className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-colors"
        >
          Close SOS Panel (Signal Remains Active)
        </button>

      </div>
    </div>
  );
}
