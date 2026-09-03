"use client";

import React from "react";
import { X, ShieldCheck, UserCheck, Package, Check } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { VendorRole } from "@/types/vendor";
import { translations } from "@/utils/translations";

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleSwitcherModal({
  isOpen,
  onClose,
}: RoleSwitcherModalProps) {
  const { language, currentRole, setRole } = useVendorStore();
  const t = translations[language];

  if (!isOpen) return null;

  const roles: {
    id: VendorRole;
    title: string;
    description: string;
    icon: typeof ShieldCheck;
    color: string;
    features: string[];
  }[] = [
    {
      id: "OWNER",
      title: t.roleOwner,
      description: t.roleOwnerDesc,
      icon: ShieldCheck,
      color: "emerald",
      features:
        language === "bn"
          ? [
              "সব ব্যাংক ও বিকাশ পেমেন্ট উত্তোলন",
              "কমিশন খতিয়ান ও স্টেটমেন্ট দেখা",
              "কর্মী (Manager / Staff) তৈরি ও বাতিল",
              "সম্পূর্ণ পণ্য ক্যাটালগ ও স্টক নিয়ন্ত্রণ",
            ]
          : [
              "Full bank & bKash payout withdrawals",
              "Itemized commission ledger & statements",
              "Staff sub-account creation & revocation",
              "Complete catalog & inventory management",
            ],
    },
    {
      id: "MANAGER",
      title: t.roleManager,
      description: t.roleManagerDesc,
      icon: UserCheck,
      color: "sky",
      features:
        language === "bn"
          ? [
              "ক্যাটালগ ও নতুন পণ্য এডিট",
              "সব অর্ডার ব্যবস্থাপনা ও ডিসপ্যাচ",
              "বিক্রয় অ্যানালিটিক্স ও ট্রেন্ড দেখা",
              "⛔ টাকা তোলার সুযোগ নেই (পেমেন্ট লক)",
            ]
          : [
              "Catalog editing & new product creation",
              "Order dispatch & customer reviews",
              "Sales trends & analytics overview",
              "⛔ No payout or bank detail access",
            ],
    },
    {
      id: "STAFF",
      title: t.roleStaff,
      description: t.roleStaffDesc,
      icon: Package,
      color: "amber",
      features:
        language === "bn"
          ? [
              "জরুরি অর্ডার প্যাকিং ও ডিজিটাল স্কেল ওজন",
              "প্যাকিং চেকলিস্ট যাচাই",
              "দৈনন্দিন স্টক পরিবর্তন লগ",
              "⛔ ফাইন্যান্স, স্টাফ ও সেটিংস লুকানো",
            ]
          : [
              "Packing orders & scale weight entry",
              "Interactive packing checklist verification",
              "Daily stock count logging",
              "⛔ Finance, staff, & settings locked",
            ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#111C20] border border-[#20333B] rounded-xl max-w-lg w-full p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <UserCheck className="text-emerald-400" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {t.switchRole}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-2">
          {language === "bn"
            ? "সিস্টেমের ভূমিকা পরিবর্তন করে বিভিন্ন কর্মচারীর পারমিশন প্রিভিউ ও টেস্ট করুন।"
            : "Switch roles to preview and test permission-gated operational workflows."}
        </p>

        <div className="mt-4 space-y-3">
          {roles.map((role) => {
            const isSelected = currentRole === role.id;
            const IconComponent = role.icon;

            return (
              <div
                key={role.id}
                onClick={() => {
                  setRole(role.id);
                  onClose();
                }}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#152227] border-emerald-500 shadow-md ring-1 ring-emerald-500/50"
                    : "bg-[#0E171B] border-[#20333B] hover:border-slate-600 hover:bg-[#152227]/60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        role.id === "OWNER"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : role.id === "MANAGER"
                          ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {role.title}
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            {language === "bn" ? "সক্রিয়" : "Current"}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#20333B]/50 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-400">
                  {role.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
