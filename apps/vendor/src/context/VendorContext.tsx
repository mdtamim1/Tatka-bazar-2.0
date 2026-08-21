"use client";

import React, { createContext, useContext, useState } from "react";
import {
  VendorProfile,
  VendorProduct,
  VendorSubOrder,
  VendorPayoutRecord,
  VendorReview,
  FulfillmentStatus,
} from "@/types";

// Pre-seeded Partner Vendors
export const AVAILABLE_VENDORS: VendorProfile[] = [
  {
    id: "vendor-green-grocer",
    slug: "green-grocer-bd",
    nameBn: "গ্রিন গ্রোসার বিডি",
    nameEn: "Green Grocer BD",
    contactName: "রফিকুল ইসলাম",
    phone: "01711-889900",
    email: "greengrocer@tatkabazar.com",
    tradeLicense: "TRAD/SAVAR/445566",
    location: "সাভার, ঢাকা",
    commissionRate: 10,
    rating: 4.9,
    reviewsCount: 184,
    banner: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80",
    taglineBn: "উন্নত জৈব ও পুষ্টিকর সবজির নির্ভরযোগ্য ঠিকানা",
    taglineEn: "Your trusted farm-to-table organic produce partner",
    descriptionBn: "সাভার ও মানিকগঞ্জের সার্টিফাইড কৃষকদের থেকে সরাসরি ভোরে তোলা ১০০% বিষমুক্ত শাকসবজি সরবরাহ করি।",
    descriptionEn: "Supplying 100% pesticide-free farm greens harvested at sunrise directly to your kitchen.",
    verified: true,
    status: "APPROVED",
  },
  {
    id: "vendor-padma-fish",
    slug: "padma-fish-house",
    nameBn: "পদ্মা রিভার ফিশ সাপ্লাই",
    nameEn: "Padma River Fish Supply",
    contactName: "চাঁদ মিয়া বেপারী",
    phone: "01722-112233",
    email: "padmafish@tatkabazar.com",
    tradeLicense: "TRAD/CHAND/998877",
    location: "চাঁদপুর ঘাট, চাঁদপুর",
    commissionRate: 8,
    rating: 4.8,
    reviewsCount: 312,
    banner: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=200&auto=format&fit=crop&q=80",
    taglineBn: "চাঁদপুর ও গোয়ালন্দ ঘাট থেকে প্রতিদিনের তাজা নদী মাছ",
    taglineEn: "Daily fresh catch from Chandpur & Padma riverbanks",
    descriptionBn: "পদ্মা ও মেঘনা মোহনার খাঁটি রূপালি ইলিশ ও মিষ্টি পানির জীবন্ত মাছ প্রতিদিন সকালে ঢাকায় সরবরাহ করি।",
    descriptionEn: "Premium whole silver Hilsa and live sweet-water catch dispatched on morning ice.",
    verified: true,
    status: "APPROVED",
  },
];

const INITIAL_VENDOR_PRODUCTS: VendorProduct[] = [
  {
    id: "vprod-1",
    vendorId: "vendor-green-grocer",
    slug: "organic-red-tomatoes",
    nameBn: "পাকা লাল দেশি টমেটো (১০০% অর্গানিক)",
    nameEn: "Organic Red Farm Tomatoes",
    sku: "VEG-TOMATO-002",
    categorySlug: "vegetables",
    categoryName: "শাকসবজি (Vegetables)",
    basePrice: 65,
    comparePrice: 80,
    baseUnit: "kg",
    pricingType: "variableWeight",
    tieredPricing: [
      { minQty: 3, pricePerUnit: 60 },
      { minQty: 10, pricePerUnit: 52 },
    ],
    stock: 150,
    lowStockAlert: 20,
    images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80"],
    isOrganic: true,
    status: "APPROVED",
    rating: 4.8,
  },
  {
    id: "vprod-2",
    vendorId: "vendor-green-grocer",
    slug: "fresh-lal-shak-organic",
    nameBn: "তাজা কচি দেশি লাল শাক",
    nameEn: "Fresh Desi Red Spinach (Lal Shak)",
    sku: "VEG-LALSHAK-006",
    categorySlug: "vegetables",
    categoryName: "শাকসবজি (Vegetables)",
    basePrice: 35,
    comparePrice: 45,
    baseUnit: "kg",
    pricingType: "variableWeight",
    stock: 90,
    lowStockAlert: 15,
    images: ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"],
    isOrganic: true,
    status: "APPROVED",
    rating: 4.9,
  },
  {
    id: "vprod-3",
    vendorId: "vendor-padma-fish",
    slug: "padma-fresh-ilish-fish",
    nameBn: "পদ্মার তাজা রূপালি ইলিশ (১ কেজি+)",
    nameEn: "Fresh Padma River Hilsa Fish",
    sku: "FISH-ILISH-001",
    categorySlug: "fish-and-meat",
    categoryName: "মাছ ও মাংস (Fish & Meat)",
    basePrice: 1450,
    comparePrice: 1650,
    baseUnit: "kg",
    pricingType: "variableWeight",
    tieredPricing: [
      { minQty: 2, pricePerUnit: 1400 },
      { minQty: 5, pricePerUnit: 1320 },
    ],
    stock: 28,
    lowStockAlert: 10,
    images: ["https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=600&auto=format&fit=crop&q=80"],
    isOrganic: false,
    status: "APPROVED",
    rating: 4.9,
  },
];

const INITIAL_VENDOR_ORDERS: VendorSubOrder[] = [
  {
    id: "sub-ord-101",
    vendorId: "vendor-green-grocer",
    masterOrderNumber: "TB-928410",
    customerName: "রাফিক আহমেদ (Rafiq Ahmed)",
    customerPhone: "01700000002",
    deliveryArea: "ধানমন্ডি (Dhanmondi)",
    deliverySlot: "তাজা সকাল (০৭:০০ - ০৯:০০)",
    items: [
      { productId: "vprod-1", nameBn: "পাকা লাল দেশি টমেটো", nameEn: "Organic Tomatoes", weight: 1, unit: "kg", unitPrice: 65, quantity: 1, totalPrice: 65 },
      { productId: "vprod-2", nameBn: "তাজা কচি দেশি লাল শাক", nameEn: "Red Spinach", weight: 0.5, unit: "kg", unitPrice: 35, quantity: 1, totalPrice: 35 },
    ],
    subtotal: 100,
    commissionDeducted: 10,
    netEarnings: 90,
    status: "PREPARING",
    createdAt: "21 Aug 2026, 07:15 AM",
    assignedRiderName: "করিম মোল্লা (বাইক রাইডার)",
    assignedRiderPhone: "০১৭০১-৯৯৮৮৭৭",
  },
  {
    id: "sub-ord-102",
    vendorId: "vendor-padma-fish",
    masterOrderNumber: "TB-928410",
    customerName: "রাফিক আহমেদ (Rafiq Ahmed)",
    customerPhone: "01700000002",
    deliveryArea: "ধানমন্ডি (Dhanmondi)",
    deliverySlot: "তাজা সকাল (০৭:০০ - ০৯:০০)",
    items: [
      { productId: "vprod-3", nameBn: "পদ্মার তাজা রূপালি ইলিশ (১ কেজি)", nameEn: "Padma Hilsa", weight: 1, unit: "kg", unitPrice: 1450, quantity: 1, totalPrice: 1450 },
    ],
    subtotal: 1450,
    commissionDeducted: 116,
    netEarnings: 1334,
    status: "READY_FOR_PICKUP",
    createdAt: "21 Aug 2026, 07:15 AM",
    assignedRiderName: "করিম মোল্লা (বাইক রাইডার)",
    assignedRiderPhone: "০১৭০১-৯৯৮৮৭৭",
    specialNotes: "আইসবক্স ড্রাম প্যাকেজিং সম্পন্ন হয়েছে।",
  },
];

const INITIAL_PAYOUTS: VendorPayoutRecord[] = [
  {
    id: "pay-1",
    vendorId: "vendor-green-grocer",
    date: "18 Aug 2026",
    amount: 35000,
    method: "Bank Transfer",
    accountDetails: "City Bank AC: 1102938475",
    status: "COMPLETED",
    referenceNo: "TXN-77881199",
  },
  {
    id: "pay-2",
    vendorId: "vendor-padma-fish",
    date: "18 Aug 2026",
    amount: 68000,
    method: "bKash",
    accountDetails: "Merchant: 01722112233",
    status: "COMPLETED",
    referenceNo: "BKASH-99220011",
  },
];

interface VendorContextType {
  currentVendor: VendorProfile;
  switchVendor: (vendorId: string) => void;
  
  // Products
  products: VendorProduct[];
  addProduct: (product: Omit<VendorProduct, "id" | "vendorId" | "status">) => void;
  updateProductStock: (id: string, newStock: number) => void;
  
  // Orders
  orders: VendorSubOrder[];
  updateFulfillmentStatus: (subOrderId: string, status: FulfillmentStatus) => void;
  
  // Payouts
  payouts: VendorPayoutRecord[];
  requestWithdrawal: (amount: number, method: "bKash" | "Bank Transfer") => void;
  
  // Profile Customizer
  updateShopProfile: (updates: Partial<VendorProfile>) => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [currentVendor, setCurrentVendor] = useState<VendorProfile>(AVAILABLE_VENDORS[0]!);
  const [allProducts, setAllProducts] = useState<VendorProduct[]>(INITIAL_VENDOR_PRODUCTS);
  const [allOrders, setAllOrders] = useState<VendorSubOrder[]>(INITIAL_VENDOR_ORDERS);
  const [allPayouts, setAllPayouts] = useState<VendorPayoutRecord[]>(INITIAL_PAYOUTS);

  const switchVendor = (vendorId: string) => {
    const v = AVAILABLE_VENDORS.find((ven) => ven.id === vendorId);
    if (v) setCurrentVendor(v);
  };

  // Filter products for currently active vendor ONLY (Strict Isolation)
  const vendorProducts = allProducts.filter((p) => p.vendorId === currentVendor.id);

  // Filter orders for currently active vendor ONLY (Strict Isolation)
  const vendorOrders = allOrders.filter((o) => o.vendorId === currentVendor.id);

  // Filter payouts for currently active vendor ONLY
  const vendorPayouts = allPayouts.filter((p) => p.vendorId === currentVendor.id);

  const addProduct = (prodData: Omit<VendorProduct, "id" | "vendorId" | "status">) => {
    const newP: VendorProduct = {
      ...prodData,
      id: `vprod-${Date.now()}`,
      vendorId: currentVendor.id,
      status: "PENDING_APPROVAL", // Enters admin approval queue before going live!
    };
    setAllProducts((prev) => [newP, ...prev]);
  };

  const updateProductStock = (id: string, newStock: number) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
  };

  const updateFulfillmentStatus = (subOrderId: string, status: FulfillmentStatus) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === subOrderId ? { ...o, status } : o))
    );
  };

  const requestWithdrawal = (amount: number, method: "bKash" | "Bank Transfer") => {
    const newPayout: VendorPayoutRecord = {
      id: `pay-${Date.now()}`,
      vendorId: currentVendor.id,
      date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      amount,
      method,
      accountDetails: currentVendor.phone,
      status: "PROCESSING",
      referenceNo: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setAllPayouts((prev) => [newPayout, ...prev]);
  };

  const updateShopProfile = (updates: Partial<VendorProfile>) => {
    setCurrentVendor((prev) => ({ ...prev, ...updates }));
  };

  return (
    <VendorContext.Provider
      value={{
        currentVendor,
        switchVendor,
        products: vendorProducts,
        addProduct,
        updateProductStock,
        orders: vendorOrders,
        updateFulfillmentStatus,
        payouts: vendorPayouts,
        requestWithdrawal,
        updateShopProfile,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error("useVendor must be used within a VendorProvider");
  }
  return context;
}
