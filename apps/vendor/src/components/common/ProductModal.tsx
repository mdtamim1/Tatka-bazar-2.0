"use client";

import React, { useState, useEffect } from "react";
import { X, PackagePlus, Save } from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { Product, ProductCategory, PricingType, WeightUnit } from "@/types/vendor";
import { translations } from "@/utils/translations";

interface ProductModalProps {
  isOpen: boolean;
  productToEdit?: Product | null;
  onClose: () => void;
}

export default function ProductModal({
  isOpen,
  productToEdit,
  onClose,
}: ProductModalProps) {
  const { language, addProduct, updateProduct, profile } = useVendorStore();
  const t = translations[language];

  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [category, setCategory] = useState<ProductCategory>("VEGETABLES");
  const [pricingType, setPricingType] = useState<PricingType>("WEIGHT_BASED");
  const [unit, setUnit] = useState<WeightUnit>("KG");
  const [pricePerUnit, setPricePerUnit] = useState<number>(100);
  const [comparePrice, setComparePrice] = useState<number | undefined>(undefined);
  const [sku, setSku] = useState("");
  const [stockQty, setStockQty] = useState<number>(20);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [isWholesaleEligible, setIsWholesaleEligible] = useState(false);
  const [wholesaleMinQty, setWholesaleMinQty] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setNameBn(productToEdit.nameBn);
      setCategory(productToEdit.category);
      setPricingType(productToEdit.pricingType);
      setUnit(productToEdit.unit);
      setPricePerUnit(productToEdit.pricePerUnit);
      setComparePrice(productToEdit.comparePrice);
      setSku(productToEdit.sku);
      setStockQty(productToEdit.stockQty);
      setLowStockThreshold(productToEdit.lowStockThreshold);
      setIsWholesaleEligible(productToEdit.isWholesaleEligible);
      setWholesaleMinQty(productToEdit.wholesaleMinQty || 10);
      setImageUrl(productToEdit.imageUrl);
      setDescription(productToEdit.description);
      setDescriptionBn(productToEdit.descriptionBn);
    } else {
      setName("");
      setNameBn("");
      setCategory("VEGETABLES");
      setPricingType("WEIGHT_BASED");
      setUnit("KG");
      setPricePerUnit(120);
      setComparePrice(140);
      setSku(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
      setStockQty(30);
      setLowStockThreshold(10);
      setIsWholesaleEligible(false);
      setWholesaleMinQty(15);
      setImageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&fit=crop");
      setDescription("");
      setDescriptionBn("");
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name,
        nameBn,
        category,
        pricingType,
        unit,
        pricePerUnit,
        comparePrice,
        sku,
        stockQty,
        lowStockThreshold,
        isWholesaleEligible,
        wholesaleMinQty,
        imageUrl,
        description,
        descriptionBn,
      });
    } else {
      addProduct({
        vendorId: profile.id,
        name,
        nameBn,
        category,
        pricingType,
        unit,
        pricePerUnit,
        comparePrice,
        sku,
        stockQty,
        lowStockThreshold,
        isPublished: true,
        isWholesaleEligible,
        wholesaleMinQty,
        imageUrl,
        description,
        descriptionBn,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#111C20] border border-[#20333B] rounded-xl max-w-2xl w-full p-6 shadow-2xl z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-[#20333B]">
          <div className="flex items-center gap-2">
            <PackagePlus className="text-emerald-400" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {productToEdit ? t.modalEditProductTitle : t.modalAddProductTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productNameEn} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Red Spinach"
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productNameBn} *
              </label>
              <input
                type="text"
                required
                value={nameBn}
                onChange={(e) => setNameBn(e.target.value)}
                placeholder="যেমন: তাজা লাল শাক"
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bengali"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="VEGETABLES">Vegetables (শাকসবজি)</option>
                <option value="FRUITS">Fruits (ফলমূল)</option>
                <option value="FISH">Fish (তাজা মাছ)</option>
                <option value="MEAT">Meat (মাংস)</option>
                <option value="GROCERY">Grocery (মুদিপণ্য)</option>
                <option value="DAIRY">Dairy & Eggs (দুগ্ধ ও ডিম)</option>
                <option value="SPICES">Spices (মসলাপাতি)</option>
                <option value="ORGANIC">Organic (অর্গানিক)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.pricingTypeCol}
              </label>
              <select
                value={pricingType}
                onChange={(e) => {
                  const val = e.target.value as PricingType;
                  setPricingType(val);
                  if (val === "WEIGHT_BASED") setUnit("KG");
                  else setUnit("PACK");
                }}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="WEIGHT_BASED">Weight-Based (স্কেল ওজন)</option>
                <option value="FIXED">Fixed Unit Price (নির্দিষ্ট দর)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productUnit}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as WeightUnit)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="KG">Kilogram (কেজি)</option>
                <option value="GRAM_100">100 Grams (১০০ গ্রাম)</option>
                <option value="PACK">Packet / Bundle (প্যাকেট/আঁটি)</option>
                <option value="PIECE">Piece (পিস/টি)</option>
                <option value="LITRE">Litre (লিটার)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productPrice} *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.5"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productComparePrice}
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={comparePrice || ""}
                onChange={(e) =>
                  setComparePrice(e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productStock} *
              </label>
              <input
                type="number"
                required
                min="0"
                value={stockQty}
                onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productThreshold} *
              </label>
              <input
                type="number"
                required
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 5)}
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {t.productSku}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. VEG-019"
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#0E171B] border border-[#20333B] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Wholesale B2B Section */}
          <div className="p-3.5 rounded-lg bg-[#0E171B] border border-[#20333B]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">
                  {t.wholesaleEligibleToggle}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Allow bulk restaurants and grocery buyers to purchase in bulk lots
                </p>
              </div>
              <input
                type="checkbox"
                checked={isWholesaleEligible}
                onChange={(e) => setIsWholesaleEligible(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </div>

            {isWholesaleEligible && (
              <div className="mt-3 pt-3 border-t border-[#20333B] flex items-center gap-3 text-xs">
                <label className="text-slate-300">{t.wholesaleMinQtyLabel}:</label>
                <input
                  type="number"
                  min="5"
                  value={wholesaleMinQty}
                  onChange={(e) => setWholesaleMinQty(parseInt(e.target.value) || 10)}
                  className="w-24 bg-[#152227] border border-[#20333B] rounded px-2 py-1 text-xs font-mono text-emerald-400 font-bold"
                />
                <span className="text-slate-400">{unit}s</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#20333B] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 rounded-lg bg-[#152227] hover:bg-[#1c2c33] border border-[#20333B] text-slate-300 text-xs font-medium"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950"
            >
              <Save size={15} />
              <span>{t.saveProductBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
