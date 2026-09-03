"use client";

import React, { useState } from "react";
import {
  PackageCheck,
  AlertTriangle,
  History,
  Search,
  Plus,
  RefreshCw,
  Sliders,
  CheckCircle,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Product } from "@/types/vendor";
import { translations } from "@/utils/translations";
import StockAdjustModal from "@/components/common/StockAdjustModal";

export default function InventoryPage() {
  const { language, products, stockLogs, profile, updateProfile } =
    useVendorStore();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const inStockCount = products.filter(
    (p) => p.stockQty > p.lowStockThreshold
  ).length;

  const lowStockCount = products.filter(
    (p) => p.stockQty <= p.lowStockThreshold && p.stockQty > 0
  ).length;

  const outOfStockCount = products.filter((p) => p.stockQty === 0).length;

  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.nameBn.includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t.inventoryTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.inventorySub}</p>
        </div>

        {/* Auto-Hide Zero Stock Toggle */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111C20] border border-[#20333B] text-xs">
          <input
            type="checkbox"
            id="autoHide"
            checked={profile.autoHideZeroStock}
            onChange={(e) =>
              updateProfile({ autoHideZeroStock: e.target.checked })
            }
            className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
          />
          <label
            htmlFor="autoHide"
            className="text-slate-300 font-medium cursor-pointer"
          >
            {t.autoHideStockDesc}
          </label>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.inStockCount}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {inStockCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Healthy stock buffers</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.lowStockCount}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {lowStockCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Approaching threshold</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111C20] border border-[#20333B]">
          <span className="text-xs text-slate-400 font-medium">
            {t.outOfStockCount}
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            {outOfStockCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires immediate restocking</p>
        </div>
      </div>

      {/* Product Stock Table */}
      <div className="bg-[#111C20] border border-[#20333B] rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#20333B] flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search
              size={14}
              className="absolute inset-y-0 left-0 pl-2.5 my-auto text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "bn" ? "পণ্য বা এসকেইউ খুঁজুন..." : "Filter inventory..."}
              className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E171B] border-b border-[#20333B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{t.productCol}</th>
                <th className="py-3 px-3">{t.categoryCol}</th>
                <th className="py-3 px-3">{t.stockCol}</th>
                <th className="py-3 px-3">{t.productThreshold}</th>
                <th className="py-3 px-3">{language === "bn" ? "স্টকের অবস্থা" : "Health"}</th>
                <th className="py-3 px-4 text-right">{t.actionsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20333B]/50">
              {filteredProducts.map((p) => {
                const isZero = p.stockQty === 0;
                const isLow = p.stockQty <= p.lowStockThreshold && !isZero;

                return (
                  <tr key={p.id} className="hover:bg-[#152227]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-slate-100">
                          {language === "bn" ? p.nameBn : p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.sku}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="badge-slate text-[10px]">{p.category}</span>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-sm text-white">
                      {p.stockQty} {p.unit}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-400">
                      {p.lowStockThreshold} {p.unit}
                    </td>

                    <td className="py-3 px-3">
                      {isZero ? (
                        <span className="badge-rose text-[10px] font-bold">
                          {t.outOfStockStatus}
                        </span>
                      ) : isLow ? (
                        <span className="badge-amber text-[10px] font-bold">
                          {language === "bn" ? "কম স্টক সতর্কবার্তা" : "Low Stock Alert"}
                        </span>
                      ) : (
                        <span className="badge-emerald text-[10px]">
                          {language === "bn" ? "পর্যাপ্ত স্টক" : "Optimal"}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Sliders size={13} />
                        <span>{t.adjustStockBtn}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Audit Log Section */}
      <div className="bg-[#111C20] border border-[#20333B] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#20333B]">
          <History size={16} className="text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {t.auditHistoryTitle}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-[#20333B]/60 pb-2">
              <tr>
                <th className="py-2">{t.timestampCol}</th>
                <th className="py-2">{t.productCol}</th>
                <th className="py-2">{t.previousQty}</th>
                <th className="py-2">{t.newQty}</th>
                <th className="py-2">{t.deltaQty}</th>
                <th className="py-2">{t.reasonCol}</th>
                <th className="py-2">{t.adjustedByCol}</th>
                <th className="py-2">{language === "bn" ? "মন্তব্য" : "Notes"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20333B]/40">
              {stockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#152227]/40">
                  <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-2.5 font-medium text-slate-200">
                    {language === "bn" ? log.productNameBn : log.productName}
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">{log.previousQty}</td>
                  <td className="py-2.5 font-mono font-semibold text-slate-200">
                    {log.newQty}
                  </td>
                  <td className="py-2.5 font-mono font-bold">
                    <span
                      className={
                        log.delta > 0
                          ? "text-emerald-400"
                          : log.delta < 0
                          ? "text-rose-400"
                          : "text-slate-400"
                      }
                    >
                      {log.delta > 0 ? `+${log.delta}` : log.delta}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="badge-amber text-[10px] font-semibold">
                      {log.reason}
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-300">
                    {log.adjustedBy}{" "}
                    <span className="text-[10px] text-slate-500">
                      ({log.adjustedByRole})
                    </span>
                  </td>
                  <td className="py-2.5 text-slate-400 italic text-[11px]">
                    {log.notes || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <StockAdjustModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
