"use client";

import React, { useState } from "react";
import {
  UserCheck,
  Award,
  Flame,
  Star,
  ShieldCheck,
  Clock,
  Languages,
  LogOut,
  ChevronRight,
  Bike,
  Crown,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useRiderStore } from "@/store/riderStore";
import { translations } from "@/utils/translations";

export default function RiderProfilePage() {
  const {
    rider,
    badges,
    leaderboard,
    locale,
    setLocale,
    setKycStatus,
  } = useRiderStore();

  const t = translations[locale];

  return (
    <div className="flex flex-col gap-3.5 pb-6 animate-in fade-in">
      
      {/* Profile Hero Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#15251B] to-[#0E1A12] border border-brand-500/30 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-700 border-2 border-brand-400 text-white font-black text-xl flex items-center justify-center shadow-lg">
              KM
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-white">
                  {rider.name}
                </h3>
                <span className="p-1 rounded bg-amber-500/20 text-amber-300">
                  <Crown size={14} />
                </span>
              </div>
              <span className="text-xs text-gray-300 font-mono">
                {rider.phone}
              </span>
              <p className="text-[11px] text-brand-300 font-medium mt-0.5">
                {rider.assignedHubName}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              {rider.tier}
            </span>
            <div className="flex items-center gap-1 mt-1 text-amber-400 text-xs font-bold">
              <Star size={13} fill="currentColor" />
              <span>{rider.rating} ★</span>
            </div>
          </div>
        </div>

        {/* Vehicle & KYC Status */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#09110B] border border-gray-800">
            <Bike size={16} className="text-brand-400" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 uppercase font-semibold">Vehicle</span>
              <span className="font-bold text-gray-200">{rider.vehicleType}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#09110B] border border-gray-800">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">KYC Status</span>
                <span className="font-bold text-emerald-400 text-[11px]">
                  {rider.kycStatus === "APPROVED" ? t.kycVerified : t.kycPending}
                </span>
              </div>
            </div>

            {/* Simulated KYC Toggle for demo */}
            <button
              onClick={() => setKycStatus(rider.kycStatus === "APPROVED" ? "PENDING_REVIEW" : "APPROVED")}
              title="Toggle Verification"
              className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 hover:text-white"
            >
              Demo
            </button>
          </div>
        </div>
      </div>

      {/* Tier Perks & Progression */}
      <div className="p-4 rounded-2xl bg-[#122017] border border-brand-500/20 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
            <Award size={16} className="text-harvest-400" />
            <span>Tier Perks: Gold Rider</span>
          </div>
          <span className="text-[10px] text-brand-300 font-semibold">
            Next: Platinum (46 to go)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-[#09110B] border border-gray-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold">Commission</span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5">+10% Base</span>
          </div>

          <div className="p-2 rounded-xl bg-[#09110B] border border-gray-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold">Priority</span>
            <span className="font-bold text-amber-400 text-sm mt-0.5">Peak Drops</span>
          </div>

          <div className="p-2 rounded-xl bg-[#09110B] border border-gray-800 flex flex-col">
            <span className="text-[10px] text-gray-400 font-semibold">Payouts</span>
            <span className="font-bold text-blue-400 text-sm mt-0.5">Instant (0s)</span>
          </div>
        </div>
      </div>

      {/* Streaks & Badges */}
      <div className="p-4 rounded-2xl bg-[#122017] border border-brand-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
            <Flame size={16} className="text-harvest-500" />
            <span>{t.streakActive.replace("{days}", rider.streakDays.toString())}</span>
          </div>
          <span className="text-[11px] font-bold text-harvest-400">🔥 +৳150 Streak Bonus</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                b.isUnlocked
                  ? "bg-[#15271D] border-brand-500/40 text-gray-100"
                  : "bg-gray-900/60 border-gray-800 text-gray-500 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">
                  {locale === "en" ? b.titleEn : b.titleBn}
                </span>
                {b.isUnlocked && <CheckCircle2 size={13} className="text-emerald-400" />}
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">
                {locale === "en" ? b.descriptionEn : b.descriptionBn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Dhaka Fleet Weekly Leaderboard */}
      <div className="p-4 rounded-2xl bg-[#122017] border border-brand-500/20 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
            <Trophy size={16} className="text-amber-400" />
            <span>{t.leaderboardTitle}</span>
          </div>
          <span className="text-[10px] text-gray-400">This Week</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {leaderboard.map((item) => (
            <div
              key={item.rank}
              className={`px-3 py-2 rounded-xl flex items-center justify-between text-xs border ${
                item.isCurrentRider
                  ? "bg-brand-500/20 border-brand-500/50 font-bold text-white shadow-sm"
                  : "bg-[#09110B] border-gray-800/80 text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    item.rank === 1
                      ? "bg-amber-400 text-gray-900"
                      : item.rank === 2
                      ? "bg-gray-300 text-gray-900"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {item.rank}
                </span>
                <span>{item.riderName}</span>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="text-emerald-400 font-bold">{item.completedThisWeek} drops</span>
                <span className="text-amber-400 text-[11px]">{item.rating}★</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language & Settings */}
      <div className="p-4 rounded-2xl bg-[#122017] border border-brand-500/20 flex flex-col gap-3">
        <h4 className="font-bold text-xs uppercase text-gray-400">
          Preferences & Language
        </h4>

        {/* Language selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-200 font-semibold">
            <Languages size={16} className="text-brand-400" />
            <span>{t.language}</span>
          </div>
          <div className="flex p-0.5 rounded-lg bg-gray-900 border border-gray-800 text-xs">
            <button
              onClick={() => setLocale("en")}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                locale === "en"
                  ? "bg-brand-500/30 text-brand-300"
                  : "text-gray-400"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLocale("bn")}
              className={`px-3 py-1 rounded-md font-bold transition-all ${
                locale === "bn"
                  ? "bg-brand-500/30 text-brand-300"
                  : "text-gray-400"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Payout bKash/Nagad */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
          <span className="text-gray-300">Registered Mobile Payout:</span>
          <span className="font-mono font-bold text-emerald-400">
            {rider.payoutProvider} ({rider.payoutNumber})
          </span>
        </div>

        {/* NID */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-300">NID Document:</span>
          <span className="font-mono text-gray-400 font-medium">
            {rider.nid.slice(0, 4)}••••••{rider.nid.slice(-4)}
          </span>
        </div>
      </div>

    </div>
  );
}
