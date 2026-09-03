"use client";

import React, { useState } from "react";
import {
  Settings,
  Store,
  Clock,
  MapPin,
  Palmtree,
  ShieldCheck,
  Save,
  CheckCircle,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

export default function SettingsPage() {
  const { language, profile, updateProfile } = useVendorStore();
  const t = translations[language];

  const [storeName, setStoreName] = useState(profile.storeName);
  const [storeNameBn, setStoreNameBn] = useState(profile.storeNameBn);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [address, setAddress] = useState(profile.address);
  const [openTime, setOpenTime] = useState(profile.operatingHours.open);
  const [closeTime, setCloseTime] = useState(profile.operatingHours.close);
  const [vacationMode, setVacationMode] = useState(profile.vacationMode);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      storeName,
      storeNameBn,
      phone,
      email,
      address,
      vacationMode,
      operatingHours: { open: openTime, close: closeTime },
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6 select-none max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t.settingsTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.settingsSub}</p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>
            {language === "bn"
              ? "স্টোর সেটিংস সফলভাবে সংরক্ষিত হয়েছে!"
              : "Store profile settings updated successfully!"}
          </span>
        </div>
      )}

      {/* Vendor Tier & Trust Score Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-[#111C20] to-[#111C20] border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge-emerald text-xs font-bold">
              {t.trustedTier}
            </span>
            <span className="text-xs font-bold text-white">⭐ {profile.rating} / 5.0</span>
          </div>
          <p className="text-xs text-slate-300">
            {language === "bn"
              ? "উচ্চমানের দ্রুত প্যাকিং ও কম বিরোধের জন্য আপনি টাটকা বাজারের 'বিশ্বস্ত মার্চেন্ট' ব্যাজ অর্জন করেছেন।"
              : "Your 99.2% fulfillment rate qualifies you for top catalog placement & 10% platform commission."}
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">{t.platformCommission}</span>
          <span className="text-base font-mono font-bold text-emerald-400">
            10% Standard Rate
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Store Information */}
        <div className="bg-[#111C20] border border-[#20333B] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#20333B]">
            <Store size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === "bn" ? "স্টোর ব্র্যান্ডিং ও পরিচয়" : "Store Branding & Identification"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.storeNameLabel} *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.storeNameBnLabel} *
              </label>
              <input
                type="text"
                required
                value={storeNameBn}
                onChange={(e) => setStoreNameBn(e.target.value)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bengali"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.storePhoneLabel} *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.storeEmailLabel} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                {t.storeAddressLabel} *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Operating Hours & Vacation Mode */}
        <div className="bg-[#111C20] border border-[#20333B] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#20333B]">
            <Clock size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.operatingHoursTitle}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.openTime}
              </label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {t.closeTime}
              </label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Vacation Mode Toggle Box */}
          <div className="mt-3 p-4 rounded-lg bg-[#152227] border border-[#20333B] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Palmtree size={16} className={vacationMode ? "text-amber-400" : "text-slate-400"} />
                <h4 className="text-xs font-bold text-white">{t.vacationModeTitle}</h4>
              </div>
              <p className="text-[11px] text-slate-400 max-w-lg">
                {t.vacationModeDesc}
              </p>
            </div>

            <input
              type="checkbox"
              checked={vacationMode}
              onChange={(e) => setVacationMode(e.target.checked)}
              className="w-5 h-5 rounded text-amber-500 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Section 3: Covered Delivery Hubs */}
        <div className="bg-[#111C20] border border-[#20333B] rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#20333B]">
            <MapPin size={16} className="text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.deliveryZonesTitle}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.deliveryZones.map((zone, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-[#152227] border border-[#20333B] text-xs text-slate-300 font-medium"
              >
                📍 {zone}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition-colors"
          >
            <Save size={15} />
            <span>{t.saveSettingsBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
