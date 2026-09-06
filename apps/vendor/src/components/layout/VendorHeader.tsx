"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Volume2,
  VolumeX,
  Zap,
  HelpCircle,
  Store,
  ChevronDown,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface VendorHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenRoleModal?: () => void;
  onOpenShortcuts: () => void;
}

export default function VendorHeader({
  onToggleMobileSidebar,
  onOpenNotifications,
  onOpenShortcuts,
}: VendorHeaderProps) {
  const {
    language,
    soundEnabled,
    toggleSound,
    simulateIncomingOrder,
    notifications,
    orders,
    dutyStatus,
    setDutyStatus,
  } = useVendorStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDutyMenuOpen, setIsDutyMenuOpen] = useState(false);

  const t = translations[language];

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const todayGrossSales = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.grossTotal, 0);

  const pendingPrepCount = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;

  const getDutyColor = () => {
    switch (dutyStatus) {
      case "STORE_OPEN":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "BUSY":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "STORE_CLOSED":
        return "bg-rose-50 text-rose-800 border-rose-300";
    }
  };

  const getDutyDot = () => {
    switch (dutyStatus) {
      case "STORE_OPEN":
        return "bg-emerald-500 shadow-sm shadow-emerald-500/50";
      case "BUSY":
        return "bg-amber-500 shadow-sm shadow-amber-500/50";
      case "STORE_CLOSED":
        return "bg-rose-500 shadow-sm shadow-rose-500/50";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 select-none z-10 shadow-sm">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl lg:hidden transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Operational Search Bar */}
        <div className="relative w-full max-w-sm hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={15} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#F8FAF8] border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-sans"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-400 shadow-xs">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Center: Live Operational Ticker (Desktop only) */}
      <div className="hidden xl:flex items-center gap-6 text-xs px-4 py-2 bg-[#F8FAF8] rounded-xl border border-emerald-100/80">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">{t.todaySales}:</span>
          <span className="font-bold text-emerald-700 tabular-nums">
            ৳{todayGrossSales.toLocaleString()}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-300" />
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">{t.pendingOrders}:</span>
          <span className="font-bold text-amber-600 tabular-nums">
            {pendingPrepCount}
          </span>
        </div>
      </div>

      {/* Right: Operational Controls & Store Duty Status */}
      <div className="flex items-center gap-2 sm:gap-2.5 relative">
        {/* Store Duty Status Dropdown (Like Rider Online/Offline) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDutyMenuOpen(!isDutyMenuOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${getDutyColor()}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${getDutyDot()}`} />
            <span>
              {dutyStatus === "STORE_OPEN"
                ? "দোকান খোলা"
                : dutyStatus === "BUSY"
                ? "ব্যস্ত"
                : "দোকান বন্ধ"}
            </span>
            <ChevronDown size={13} className="opacity-70" />
          </button>

          {isDutyMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 text-xs font-semibold animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setDutyStatus("STORE_OPEN");
                  setIsDutyMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-800 flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>দোকান খোলা (অর্ডার গ্রহণ)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDutyStatus("BUSY");
                  setIsDutyMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-800 flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>ব্যস্ত (সাময়িক পজ)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDutyStatus("STORE_CLOSED");
                  setIsDutyMenuOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-800 flex items-center gap-2"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>দোকান বন্ধ (অফলাইন)</span>
              </button>
            </div>
          )}
        </div>

        {/* Simulate Incoming Order Button */}
        <button
          onClick={simulateIncomingOrder}
          title={t.simulateOrderBtn}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Zap size={14} className="text-amber-300 fill-amber-300" />
          <span className="hidden md:inline">
            {language === "bn" ? "+নতুন অর্ডার টেস্ট" : "+Test Order"}
          </span>
        </button>

        {/* Audio Alert Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? t.soundEnabled : t.soundDisabled}
          className={`p-2 rounded-xl border transition-all ${
            soundEnabled
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              : "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100"
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-all shadow-xs"
          aria-label="View notifications"
        >
          <Bell size={16} />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* Keyboard Shortcuts Help */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors hidden sm:block"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={16} />
        </button>
      </div>
    </header>
  );
}
