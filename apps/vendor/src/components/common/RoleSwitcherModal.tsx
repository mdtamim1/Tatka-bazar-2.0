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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {t.switchRole}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2.5">
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
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-50/50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        role.id === "OWNER"
                          ? "bg-emerald-100 text-emerald-700"
                          : role.id === "MANAGER"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        {role.title}
                        {isSelected && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                            {language === "bn" ? "সক্রিয়" : "Current"}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600">
                  {role.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
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
