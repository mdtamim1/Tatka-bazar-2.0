"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Layers,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Scale,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Product, ProductCategory } from "@/types/vendor";
import { translations } from "@/utils/translations";
import ProductModal from "@/components/common/ProductModal";
import BulkActionsBar from "@/components/common/BulkActionsBar";

export default function ProductsPage() {
  const {
    language,
    currentRole,
    products,
    updateProduct,
    deleteProduct,
  } = useVendorStore();

  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [showCsvNotice, setShowCsvNotice] = useState(false);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "ALL" && p.category !== selectedCategory) {
      return false;
    }
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    const headers = "ID,Name,Category,PricingType,Unit,Price,Stock,SKU\n";
    const rows = products
      .map(
        (p) =>
          `"${p.id}","${p.name}","${p.category}","${p.pricingType}","${p.unit}",${p.pricePerUnit},${p.stockQty},"${p.sku}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tatka-bazar-catalog-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            {t.catalogTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">{t.catalogSub}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-lg bg-[#111C20] hover:bg-[#152227] border border-[#20333B] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} className="text-emerald-400" />
            <span>{t.bulkExportBtn}</span>
          </button>

          <button
            onClick={() => setShowCsvNotice(true)}
            className="px-3 py-2 rounded-lg bg-[#111C20] hover:bg-[#152227] border border-[#20333B] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Upload size={14} className="text-sky-400" />
            <span>{t.bulkImportBtn}</span>
          </button>

          <button
            onClick={() => {
              setProductToEdit(null);
              setIsProductModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
          >
            <Plus size={15} />
            <span>{t.addProductBtn}</span>
          </button>
        </div>
      </div>

      {/* CSV Import Simulator Alert */}
      {showCsvNotice && (
        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-sky-400 shrink-0" />
            <span>
              {language === "bn"
                ? "সিএসভি আপলোড প্রস্তুত: যেকোনো প্রমিত ক্যাটালগ স্প্রেডশিট থেকে আমদানি সমর্থিত।"
                : "CSV bulk import engine ready. Supports UTF-8 encoded Bengali & English grocery files."}
            </span>
          </div>
          <button
            onClick={() => setShowCsvNotice(false)}
            className="text-sky-400 hover:text-sky-200 font-bold underline"
          >
            {language === "bn" ? "বন্ধ করুন" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-[#20333B]">
        <div className="relative w-full sm:w-80">
          <Search
            size={14}
            className="absolute inset-y-0 left-0 pl-2.5 my-auto text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === "bn" ? "পণ্য বা এসকেইউ খুঁজুন..." : "Search catalog..."}
            className="w-full bg-[#111C20] border border-[#20333B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs pb-1 sm:pb-0">
          {[
            { id: "ALL", label: language === "bn" ? "সব ক্যাটাগরি" : "All" },
            { id: "VEGETABLES", label: language === "bn" ? "শাকসবজি" : "Vegetables" },
            { id: "FISH", label: language === "bn" ? "মাছ" : "Fish" },
            { id: "MEAT", label: language === "bn" ? "মাংস" : "Meat" },
            { id: "GROCERY", label: language === "bn" ? "মুদি" : "Grocery" },
            { id: "DAIRY", label: language === "bn" ? "ডিম ও দুধ" : "Dairy" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? "bg-[#152227] text-emerald-400 border border-emerald-500/40 font-semibold"
                  : "bg-[#111C20] text-slate-400 hover:text-white border border-[#20333B]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-[#111C20] border border-[#20333B] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E171B] border-b border-[#20333B] text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">{t.productCol}</th>
                <th className="py-3 px-3">{t.categoryCol}</th>
                <th className="py-3 px-3">{t.pricingTypeCol}</th>
                <th className="py-3 px-3">{t.rateCol}</th>
                <th className="py-3 px-3">{t.stockCol}</th>
                <th className="py-3 px-3">{t.wholesaleCol}</th>
                <th className="py-3 px-3">{t.statusCol}</th>
                <th className="py-3 px-4 text-right">{t.actionsCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20333B]/50">
              {filteredProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                const isLowStock = p.stockQty <= p.lowStockThreshold;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-[#152227]/50 transition-colors ${
                      isSelected ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(p.id)}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-[#152227] border border-[#20333B] shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-slate-100">
                            {language === "bn" ? p.nameBn : p.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {p.sku}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      <span className="badge-slate text-[10px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {p.pricingType === "WEIGHT_BASED" ? (
                        <span className="badge-sky text-[10px] inline-flex items-center gap-1">
                          <Scale size={11} />
                          <span>{t.weightBased}</span>
                        </span>
                      ) : (
                        <span className="badge-slate text-[10px]">
                          {t.fixedPrice}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-white">
                      ৳{p.pricePerUnit}/{p.unit}
                      {p.comparePrice && (
                        <span className="block text-[10px] text-slate-500 line-through">
                          ৳{p.comparePrice}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                          p.stockQty === 0
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : isLowStock
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {p.stockQty} {p.unit}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {p.isWholesaleEligible ? (
                        <span className="badge-emerald text-[10px]">
                          MOQ: {p.wholesaleMinQty}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <button
                        onClick={() =>
                          updateProduct(p.id, { isPublished: !p.isPublished })
                        }
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                          p.isPublished
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {p.isPublished ? (
                          <>
                            <Eye size={11} />
                            <span>{t.activeStatus}</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={11} />
                            <span>{t.hiddenStatus}</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setProductToEdit(p);
                          setIsProductModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 rounded hover:bg-[#152227] transition-colors"
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              language === "bn"
                                ? "আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?"
                                : "Are you sure you want to delete this product?"
                            )
                          ) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-[#152227] transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      <BulkActionsBar
        selectedIds={selectedProductIds}
        onClear={() => setSelectedProductIds([])}
      />

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        productToEdit={productToEdit}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
      />
    </div>
  );
}
