"use client";

import React, { useState, useEffect } from "react";
import { Wifi, BatteryMedium, SignalHigh } from "lucide-react";
import RiderHeader from "@/components/layout/RiderHeader";
import RiderBottomNav from "@/components/layout/RiderBottomNav";
import IncomingOrderModal from "@/components/common/IncomingOrderModal";
import SOSModal from "@/components/common/SOSModal";

export default function RiderShell({ children }: { children: React.ReactNode }) {
  const [currentTime, setCurrentTime] = useState("09:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-md min-h-screen bg-[#0C140E] text-gray-100 flex flex-col relative shadow-2xl border-x border-brand-500/10 pb-20 selection:bg-brand-500 selection:text-white">
      {/* Device Status Bar Simulation */}
      <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[11px] font-semibold text-gray-400 select-none bg-[#0C140E]">
        <span className="font-mono text-gray-200">{currentTime}</span>
        <div className="flex items-center gap-1.5 text-gray-400">
          <SignalHigh size={12} className="text-brand-400" />
          <span className="text-[10px] font-mono">4G</span>
          <Wifi size={12} className="text-gray-300" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-mono">92%</span>
            <BatteryMedium size={13} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Rider Header */}
      <RiderHeader />

      {/* Main Page Content */}
      <main className="flex-1 px-3 py-3 overflow-y-auto">
        {children}
      </main>

      {/* Global Overlays */}
      <IncomingOrderModal />
      <SOSModal />

      {/* Persistent Bottom Nav */}
      <RiderBottomNav />
    </div>
  );
}
