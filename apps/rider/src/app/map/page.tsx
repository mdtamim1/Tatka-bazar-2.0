"use client";

import React, { useState } from "react";
import {
  Navigation,
  MapPin,
  ExternalLink,
  Compass,
  CloudRain,
  Phone,
  CheckCircle2,
  Bike,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";
import { translations } from "@/utils/translations";

export default function RiderMapPage() {
  const { deliveries, updateOrderStatus, locale } = useRiderStore();
  const t = translations[locale];

  const activeOrder = deliveries.find(
    (d) =>
      d.status === "ASSIGNED" ||
      d.status === "ACCEPTED" ||
      d.status === "PICKED_UP_FROM_HUB" ||
      d.status === "EN_ROUTE" ||
      d.status === "ARRIVED"
  ) || deliveries[0];

  const [trafficMode, setTrafficMode] = useState<"NORMAL" | "MONSOON">("MONSOON");

  // Google Maps Deep Link
  const googleMapsUrl = activeOrder
    ? `https://www.google.com/maps/dir/?api=1&destination=${activeOrder.coordinates.lat},${activeOrder.coordinates.lng}&travelmode=two_wheeler`
    : "https://www.google.com/maps";

  return (
    <div className="flex flex-col gap-3 pb-4 animate-in fade-in">
      
      {/* Top Navigation Control Bar */}
      <div className="p-3 rounded-2xl bg-[#122017] border border-brand-500/25 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
            <Compass size={18} className="animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">
              Dhaka GPS Navigation
            </h3>
            <span className="text-[11px] text-gray-400 font-mono">
              Sector: Dhanmondi & Kalabagan
            </span>
          </div>
        </div>

        {/* Traffic Mode Toggle */}
        <button
          onClick={() => setTrafficMode(trafficMode === "MONSOON" ? "NORMAL" : "MONSOON")}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
            trafficMode === "MONSOON"
              ? "bg-blue-500/20 border-blue-400 text-blue-300"
              : "bg-gray-800 border-gray-700 text-gray-400"
          }`}
        >
          <CloudRain size={12} />
          <span>{trafficMode === "MONSOON" ? "Monsoon Buffer On" : "Normal ETA"}</span>
        </button>
      </div>

      {/* Interactive Dhaka Map Simulation Frame */}
      <div className="relative w-full h-80 rounded-2xl bg-[#08120B] border-2 border-brand-500/30 overflow-hidden shadow-2xl flex flex-col justify-between p-3">
        
        {/* Custom Dhaka Vector Map Graphic Canvas */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 400 320">
            {/* Dhanmondi Lake water feature */}
            <path
              d="M 120,40 Q 150,120 130,200 Q 110,260 140,310"
              stroke="#0E5230"
              strokeWidth="28"
              fill="none"
              strokeLinecap="round"
            />
            {/* Roads & intersections */}
            <line x1="40" y1="90" x2="360" y2="90" stroke="#1F3625" strokeWidth="6" />
            <line x1="40" y1="180" x2="360" y2="180" stroke="#1F3625" strokeWidth="8" />
            <line x1="40" y1="260" x2="360" y2="260" stroke="#1F3625" strokeWidth="6" />
            <line x1="180" y1="20" x2="180" y2="300" stroke="#2A4833" strokeWidth="8" />
            <line x1="280" y1="20" x2="280" y2="300" stroke="#1F3625" strokeWidth="6" />

            {/* Satmasjid Road Main Arterial */}
            <line x1="80" y1="20" x2="80" y2="300" stroke="#335A3E" strokeWidth="10" />

            {/* Active Delivery Polyline Route from Hub to Customer */}
            <path
              d="M 180,240 L 180,180 L 120,180 L 120,110 L 80,110"
              stroke="#F47920"
              strokeWidth="5"
              strokeDasharray="8 4"
              fill="none"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </svg>
        </div>

        {/* Live Rider Marker on Map */}
        <div className="absolute top-[165px] left-[165px] z-20 flex flex-col items-center">
          <div className="p-2 rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/50 border-2 border-white animate-bounce">
            <Bike size={16} />
          </div>
          <span className="px-2 py-0.5 rounded bg-black/80 text-[9px] font-bold text-emerald-300 font-mono mt-1 whitespace-nowrap">
            Karim (You)
          </span>
        </div>

        {/* Hub Marker */}
        <div className="absolute bottom-8 right-16 z-10 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-md">
            H
          </div>
          <span className="text-[9px] font-bold text-gray-300 bg-black/70 px-1 rounded mt-0.5">
            Dhanmondi Hub
          </span>
        </div>

        {/* Customer Drop Marker */}
        <div className="absolute top-14 left-10 z-10 flex flex-col items-center">
          <div className="w-6 h-6 rounded-full bg-harvest-500 text-white flex items-center justify-center font-bold text-[10px] shadow-md animate-pulse">
            D
          </div>
          <span className="text-[9px] font-bold text-harvest-300 bg-black/70 px-1 rounded mt-0.5">
            Drop: Road 7/A
          </span>
        </div>

        {/* Weather Buffer Floating Tag */}
        <div className="z-10 self-end">
          <div className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-brand-500/30 text-xs flex items-center gap-1.5 text-gray-200">
            <CloudRain size={13} className="text-blue-400" />
            <span className="text-[11px] font-semibold font-mono">
              Satmasjid Rd Traffic: <strong>Slow (Rain)</strong>
            </span>
          </div>
        </div>

        {/* Bottom Floating Google Maps Launcher Bar */}
        <div className="z-10 flex items-center justify-between bg-black/85 backdrop-blur-md p-2.5 rounded-xl border border-brand-500/30">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-harvest-400" />
            <div className="text-xs">
              <span className="font-bold text-white block">
                {activeOrder ? activeOrder.customerName.split(" ")[0] : "Dhanmondi Delivery"}
              </span>
              <span className="text-[10px] text-gray-400">
                {activeOrder ? `${activeOrder.distanceKm} km • ${activeOrder.estimatedMinutes + (trafficMode === "MONSOON" ? 10 : 0)} mins` : "Ready"}
              </span>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <span>Open in Maps</span>
            <ExternalLink size={12} />
          </a>
        </div>

      </div>

      {/* Turn-by-Turn Guidance Steps */}
      <div className="p-4 rounded-2xl bg-[#122017] border border-brand-500/20 flex flex-col gap-3">
        <h4 className="font-bold text-xs uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
          <Navigation size={14} />
          <span>Turn-by-Turn Route Guidance</span>
        </h4>

        <div className="flex flex-col gap-2.5 text-xs text-gray-200">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-[10px] mt-0.5">
              1
            </div>
            <div className="flex-1">
              <p className="font-bold">Head North on Road 4 towards Satmasjid Road</p>
              <span className="text-[10px] text-gray-400">Proceed for 450 meters</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-[10px] mt-0.5">
              2
            </div>
            <div className="flex-1">
              <p className="font-bold">Turn Right onto Road 7/A (near Abahani Field)</p>
              <span className="text-[10px] text-gray-400">Watch for waterlogged curb</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-harvest-500/20 text-harvest-400 flex items-center justify-center font-bold text-[10px] mt-0.5">
              3
            </div>
            <div className="flex-1">
              <p className="font-bold">Arrive at House 28 (Right side, 4th Floor Flat 4B)</p>
              <span className="text-[10px] text-emerald-400 font-semibold">Geofenced auto-check ready</span>
            </div>
          </div>
        </div>

        {/* Geofence Arrived Prompt Button */}
        {activeOrder && activeOrder.status === "EN_ROUTE" && (
          <button
            onClick={() => updateOrderStatus(activeOrder.id, "ARRIVED")}
            className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg"
          >
            <CheckCircle2 size={16} />
            <span>Mark: "I Have Arrived at Gate"</span>
          </button>
        )}
      </div>

    </div>
  );
}
