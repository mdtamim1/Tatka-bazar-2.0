"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Volume2,
  VolumeX,
  Languages,
  UserCheck,
  Zap,
  HelpCircle,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface VendorHeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenRoleModal: () => void;
  onOpenShortcuts: () => void;
}

export default function VendorHeader({
  onToggleMobileSidebar,
  onOpenNotifications,
  onOpenRoleModal,
  onOpenShortcuts,
}: VendorHeaderProps) {
  const {
    language,
    setLanguage,
    currentRole,
    soundEnabled,
    toggleSound,
    simulateIncomingOrder,
    notifications,
    orders,
  } = useVendorStore();

  const [searchQuery, setSearchQuery] = useState("");

  const t = translations[language];

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const todayGrossSales = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.grossTotal, 0);

  const pendingPrepCount = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;

  const getRoleLabel = () => {
    switch (currentRole) {
      case "OWNER":
        return t.roleOwner;
      case "MANAGER":
        return t.roleManager;
      case "STAFF":
        return t.roleStaff;
    }
  };

  const getRoleBadgeColor = () => {
    switch (currentRole) {
      case "OWNER":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "MANAGER":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "STAFF":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <header className="h-16 bg-[#111C20] border-b border-[#20333B] flex items-center justify-between px-4 sm:px-6 lg:px-8 select-none z-10">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg lg:hidden"
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
            className="w-full bg-[#152227] border border-[#20333B] rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-sans"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#0B1215] border border-[#20333B] rounded text-slate-400">
              /
            </kbd>
          </div>
        </div>
      </div>

      {/* Center: Live Operational Ticker (Desktop only) */}
      <div className="hidden xl:flex items-center gap-6 text-xs px-4 py-1.5 bg-[#152227] rounded-lg border border-[#20333B]">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{t.todaySales}:</span>
          <span className="font-semibold text-emerald-400 tabular-nums">
            ৳{todayGrossSales.toLocaleString()}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{t.pendingOrders}:</span>
          <span className="font-semibold text-amber-400 tabular-nums">
            {pendingPrepCount}
          </span>
        </div>
      </div>

      {/* Right: Quick Operational Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Simulate incoming order button */}
        <button
          onClick={simulateIncomingOrder}
          title={t.simulateOrderBtn}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-medium transition-colors"
        >
          <Zap size={14} className="animate-bounce text-emerald-400" />
          <span className="hidden md:inline">
            {language === "bn" ? "+অর্ডার সিমুলেট" : "+Simulate Order"}
          </span>
        </button>

        {/* Audio Alert Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? t.soundEnabled : t.soundDisabled}
          className={`p-2 rounded-lg border transition-colors ${
            soundEnabled
              ? "bg-[#152227] border-[#20333B] text-emerald-400 hover:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:text-rose-300"
          }`}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === "en" ? "bn" : "en")}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#152227] border border-[#20333B] text-slate-300 hover:text-white text-xs font-medium transition-colors"
          title="Switch Language"
        >
          <Languages size={14} className="text-emerald-400" />
          <span>{language === "en" ? "বাংলা" : "English"}</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg bg-[#152227] border border-[#20333B] text-slate-300 hover:text-white transition-colors"
          title={t.notifications}
        >
          <Bell size={16} />
          {unreadNotifs > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* Active Role Switcher Pill */}
        <button
          onClick={onOpenRoleModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${getRoleBadgeColor()}`}
          title={`${t.currentRole}: ${getRoleLabel()} (Click to switch)`}
        >
          <UserCheck size={14} />
          <span className="hidden sm:inline font-semibold">{getRoleLabel()}</span>
        </button>

        {/* Help / Shortcuts */}
        <button
          onClick={onOpenShortcuts}
          className="hidden md:flex p-2 rounded-lg bg-[#152227] border border-[#20333B] text-slate-400 hover:text-slate-200 transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={15} />
        </button>
      </div>
    </header>
  );
}
