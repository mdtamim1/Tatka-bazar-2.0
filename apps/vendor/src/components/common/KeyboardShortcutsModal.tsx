"use client";

import React from "react";
import { X, Command } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const { language } = useVendorStore();
  const t = translations[language];

  if (!isOpen) return null;

  const shortcuts = [
    { key: "/", descEn: "Focus global search bar", descBn: "সার্চ বারে কার্সর ফোকাস করুন" },
    { key: "?", descEn: "Toggle shortcuts guide", descBn: "কিবোর্ড শর্টকাট গাইড খুলুন" },
    { key: "Esc", descEn: "Close any modal or dialog", descBn: "যেকোনো মডাল বা ডায়ালগ বন্ধ করুন" },
    { key: "O", descEn: "Go to Orders Queue", descBn: "অর্ডার কিউতে যান" },
    { key: "P", descEn: "Go to Product Catalog", descBn: "পণ্য ক্যাটালগে যান" },
    { key: "I", descEn: "Go to Inventory & Stock", descBn: "ইনভেন্টরি ও স্টকে যান" },
    { key: "S", descEn: "Go to Settlements Ledger", descBn: "সেটেলমেন্ট ও লেজারে যান" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#111C20] border border-[#20333B] rounded-xl max-w-md w-full p-6 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <Command className="text-emerald-400" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {language === "bn" ? "কিবোর্ড শর্টকাট" : "Keyboard Shortcuts"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#152227] border border-[#20333B] text-xs"
            >
              <span className="text-slate-300">
                {language === "bn" ? sc.descBn : sc.descEn}
              </span>
              <kbd className="px-2 py-1 font-mono text-[11px] bg-[#0B1215] border border-[#20333B] rounded text-emerald-400 font-bold">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
