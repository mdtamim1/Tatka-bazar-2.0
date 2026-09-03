"use client";

import React from "react";
import {
  Volume2,
  VolumeX,
  Languages,
  ShieldAlert,
  CloudRain,
  Bike,
  Sparkles,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";
import { translations } from "@/utils/translations";

export default function RiderHeader() {
  const {
    rider,
    locale,
    soundMuted,
    toggleDuty,
    toggleSoundMuted,
    setLocale,
    triggerSos,
    triggerSimulatedOrder,
  } = useRiderStore();

  const t = translations[locale];

  return (
    <header className="sticky top-0 z-30 bg-[#0C140E]/95 backdrop-blur-md border-b border-brand-500/20 px-3 py-2.5 flex flex-col gap-2">
      {/* Top Status & Controls Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Rider Profile Mini & Tier */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-emerald-900 border border-brand-400/40 flex items-center justify-center text-white font-bold text-sm shadow-md">
              KM
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0C140E] ${
                rider.isOnline ? "bg-emerald-400 animate-pulse" : "bg-gray-500"
              }`}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-gray-100 truncate max-w-[130px]">
                {rider.name.split(" ")[0]} {rider.name.split(" ")[1]}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-bold tracking-wider">
                {rider.tier}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 truncate max-w-[150px]">
              {rider.assignedHubName.split("(")[0]}
            </span>
          </div>
        </div>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-1.5">
          {/* Test Order Trigger for instant preview */}
          <button
            onClick={triggerSimulatedOrder}
            title="Simulate Dispatch Offer"
            className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300 hover:bg-brand-500/20 text-xs flex items-center gap-1 transition-all active:scale-95"
          >
            <Sparkles size={13} className="text-harvest-400" />
            <span className="text-[10px] font-semibold hidden xs:inline">Demo Ping</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSoundMuted}
            title={soundMuted ? "Unmute Sound" : "Mute Sound"}
            className="p-2 rounded-lg bg-gray-800/60 hover:bg-gray-800 text-gray-300 transition-colors"
          >
            {soundMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} className="text-brand-400" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLocale(locale === "en" ? "bn" : "en")}
            className="px-2 py-1 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-200 text-xs font-bold hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            <Languages size={13} className="text-brand-400" />
            <span>{locale === "en" ? "বাং" : "EN"}</span>
          </button>

          {/* SOS Button */}
          <button
            onClick={triggerSos}
            title="Emergency SOS"
            className="px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-black text-xs shadow-md flex items-center gap-1 active:scale-95 transition-all animate-pulse"
          >
            <ShieldAlert size={14} />
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* Online/Offline Toggle Bar & Monsoon Advisory */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Toggle Button */}
        <button
          onClick={toggleDuty}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-between transition-all duration-300 ${
            rider.isOnline
              ? "bg-gradient-to-r from-brand-600 to-emerald-700 text-white shadow-glow-brand"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                rider.isOnline ? "bg-emerald-300 animate-ping" : "bg-gray-500"
              }`}
            />
            <span>{rider.isOnline ? t.onDuty : t.offDuty}</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">
            {rider.isOnline ? t.goOffline : t.goOnline}
          </span>
        </button>

        {/* Monsoon Weather Advisory Pill */}
        <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 text-[10px]">
          <CloudRain size={12} className="text-blue-400 animate-bounce" />
          <span className="font-semibold">+15m Monsoon Buffer</span>
        </div>
      </div>
    </header>
  );
}
