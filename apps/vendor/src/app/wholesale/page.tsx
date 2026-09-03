"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Layers,
  Plus,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

export default function WholesalePage() {
  const { language, products, wholesaleBuyers } = useVendorStore();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<"CATALOG" | "BUYERS">("CATALOG");

  const wholesaleProducts = products.filter((p) => p.isWholesaleEligible);

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          {t.wholesaleTitle}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">{t.wholesaleSub}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#20333B] pb-2 text-xs">
        <button
          onClick={() => setActiveTab("CATALOG")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "CATALOG"
              ? "bg-emerald-600 text-white"
              : "bg-[#111C20] text-slate-400 hover:text-white border border-[#20333B]"
          }`}
        >
          <Layers size={14} />
          <span>{t.wholesaleCatalogTab} ({wholesaleProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("BUYERS")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "BUYERS"
              ? "bg-emerald-600 text-white"
              : "bg-[#111C20] text-slate-400 hover:text-white border border-[#20333B]"
          }`}
        >
          <Users size={14} />
          <span>{t.approvedBuyersTab} ({wholesaleBuyers.length})</span>
        </button>
      </div>

      {activeTab === "CATALOG" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wholesaleProducts.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl bg-[#111C20] border border-[#20333B] hover:border-slate-600 transition-colors space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-12 h-12 rounded-lg object-cover bg-[#152227] border border-[#20333B] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-100 truncate">
                    {language === "bn" ? p.nameBn : p.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="badge-emerald text-[10px] font-bold">
                      MOQ: {p.wholesaleMinQty} {p.unit}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Stock: {p.stockQty} {p.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Volume Discount Tier Box */}
              <div className="p-2.5 rounded-lg bg-[#0E171B] border border-[#20333B] space-y-1.5 text-xs">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {t.tierPricingLabel}
                </span>

                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Retail Price:</span>
                  <span className="font-mono text-slate-400">৳{p.pricePerUnit}/{p.unit}</span>
                </div>

                {p.wholesaleTiers && p.wholesaleTiers.length > 0 ? (
                  p.wholesaleTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-[11px] text-emerald-400 font-medium font-mono"
                    >
                      <span>
                        {tier.minQty}+ {p.unit} ({tier.discountPercent}% OFF):
                      </span>
                      <span>৳{tier.unitPrice}/{p.unit}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-medium font-mono">
                    <span>{p.wholesaleMinQty}+ {p.unit} (5% Bulk Flat):</span>
                    <span>৳{Math.round(p.pricePerUnit * 0.95)}/{p.unit}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Approved B2B Buyers */
        <div className="space-y-4">
          <div className="bg-[#111C20] border border-[#20333B] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0E171B] border-b border-[#20333B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Business / Restaurant</th>
                    <th className="py-3 px-3">Contact Person</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3 font-mono">{t.creditLimitLabel}</th>
                    <th className="py-3 px-3 font-mono">Outstanding</th>
                    <th className="py-3 px-3">{t.paymentTermsLabel}</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20333B]/50">
                  {wholesaleBuyers.map((b) => (
                    <tr key={b.id} className="hover:bg-[#152227]/40">
                      <td className="py-3 px-4 font-semibold text-slate-100">
                        {b.businessName}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {b.contactPerson}
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono">
                        {b.phone}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        ৳{b.creditLimit.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-400 font-semibold">
                        ৳{b.outstandingBalance.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="badge-sky text-[10px] font-semibold">
                          {b.paymentTerms === "NET_15"
                            ? t.net15
                            : b.paymentTerms === "NET_30"
                            ? t.net30
                            : t.immediatePayment}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="badge-emerald text-[10px] font-bold">
                          {language === "bn" ? "অনুমোদিত খরিদ্দার" : "Active Partner"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
