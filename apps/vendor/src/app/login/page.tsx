"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Key, Phone, ShieldCheck, UserCheck, ArrowRight, Lock } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { VendorRole } from "@/types/vendor";
import { translations } from "@/utils/translations";

export default function LoginPage() {
  const router = useRouter();
  const { language, setRole } = useVendorStore();
  const t = translations[language];

  const [loginType, setLoginType] = useState<"OWNER" | "STAFF">("OWNER");
  const [phone, setPhone] = useState("+8801711223344");
  const [password, setPassword] = useState("••••••••");
  const [staffPin, setStaffPin] = useState("4421");
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === "OWNER") {
      setRole("OWNER");
    } else {
      setRole("STAFF");
    }
    router.push("/");
  };

  const handleQuickDemoLogin = (role: VendorRole) => {
    setRole(role);
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 select-none space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
          <Store size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {t.appName}
        </h1>
        <p className="text-xs text-slate-400">{t.portalTitle}</p>
      </div>

      {/* Login Card */}
      <div className="bg-[#111C20] border border-[#20333B] rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Toggle Login Type: Owner OTP vs Staff PIN */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0E171B] border border-[#20333B] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLoginType("OWNER")}
            className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              loginType === "OWNER"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck size={14} />
            <span>{language === "bn" ? "স্টোর ওনার" : "Store Owner"}</span>
          </button>

          <button
            type="button"
            onClick={() => setLoginType("STAFF")}
            className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              loginType === "STAFF"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserCheck size={14} />
            <span>{language === "bn" ? "কর্মী সাব-লগইন" : "Staff PIN Login"}</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === "bn" ? "রেজিস্টার্ড মোবাইল নম্বর" : "Mobile Phone Number"}
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute inset-y-0 left-0 pl-3 my-auto text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {loginType === "OWNER" ? (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Password / OTP
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute inset-y-0 left-0 pl-3 my-auto text-slate-500 pointer-events-none"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg pl-9 pr-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                4-Digit Staff PIN (Issued by Owner)
              </label>
              <div className="relative">
                <Key
                  size={14}
                  className="absolute inset-y-0 left-0 pl-3 my-auto text-slate-500 pointer-events-none"
                />
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg pl-9 pr-3 py-2 text-white font-mono tracking-widest text-base focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-emerald-500 accent-emerald-500"
              />
              <span>Keep me signed in</span>
            </label>

            <span className="text-emerald-400 hover:underline cursor-pointer">
              Forgot login?
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-colors"
          >
            <span>{language === "bn" ? "লগইন করুন" : "Sign In"}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* 1-Click Demo Logins */}
        <div className="pt-4 border-t border-[#20333B] space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-center">
            ⚡ Quick Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin("OWNER")}
              className="py-1.5 px-2 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 text-center"
            >
              Owner
            </button>
            <button
              onClick={() => handleQuickDemoLogin("MANAGER")}
              className="py-1.5 px-2 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-sky-500/30 text-[11px] font-semibold text-sky-400 text-center"
            >
              Manager
            </button>
            <button
              onClick={() => handleQuickDemoLogin("STAFF")}
              className="py-1.5 px-2 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-amber-500/30 text-[11px] font-semibold text-amber-400 text-center"
            >
              Staff
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        New merchant?{" "}
        <Link href="/onboarding" className="text-emerald-400 hover:underline font-semibold">
          Apply for KYC Onboarding →
        </Link>
      </div>
    </div>
  );
}
