"use client";

import React from "react";
import { PlusCircle, MinusCircle, Eye, EyeOff, X } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClear: () => void;
}

export default function BulkActionsBar({
  selectedIds,
  onClear,
}: BulkActionsBarProps) {
  const { language, bulkAdjustStock, bulkTogglePublish } = useVendorStore();
  const t = translations[language];

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-[#111C20] border border-emerald-500/50 shadow-2xl rounded-xl px-4 py-2.5 flex items-center gap-3 animate-fade-in text-xs max-w-[95vw] overflow-x-auto select-none">
      <div className="flex items-center gap-2 pr-3 border-r border-[#20333B] shrink-0 font-semibold text-emerald-400">
        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-xs">
          {selectedIds.length}
        </span>
        <span>{t.bulkSelected}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => bulkAdjustStock(selectedIds, 10)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-200 hover:text-emerald-400 transition-colors font-medium"
        >
          <PlusCircle size={14} className="text-emerald-400" />
          <span>{t.bulkStockAdd}</span>
        </button>

        <button
          onClick={() => bulkAdjustStock(selectedIds, -5)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-200 hover:text-rose-400 transition-colors font-medium"
        >
          <MinusCircle size={14} className="text-rose-400" />
          <span>{t.bulkStockMinus}</span>
        </button>

        <button
          onClick={() => bulkTogglePublish(selectedIds, true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-200 hover:text-white transition-colors font-medium"
        >
          <Eye size={14} className="text-sky-400" />
          <span>{t.bulkActivate}</span>
        </button>

        <button
          onClick={() => bulkTogglePublish(selectedIds, false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-200 hover:text-slate-400 transition-colors font-medium"
        >
          <EyeOff size={14} className="text-slate-400" />
          <span>{t.bulkHide}</span>
        </button>
      </div>

      <button
        onClick={onClear}
        className="p-1 rounded text-slate-400 hover:text-white ml-2"
        title="Clear selection"
      >
        <X size={16} />
      </button>
    </div>
  );
}
