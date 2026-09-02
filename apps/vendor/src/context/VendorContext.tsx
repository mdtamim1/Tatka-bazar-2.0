"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import {
  VendorProfile,
  VendorProduct,
  VendorSubOrder,
  VendorPayoutRecord,
  VendorReview,
  FulfillmentStatus,
} from "@/types";
import { audioAlert } from "../utils/audioAlert";

// Pre-seeded Partner Vendors
export const AVAILABLE_VENDORS: VendorProfile[] = [
  {
    id: "vendor-green-grocer",
    slug: "green-grocer-bd",
    nameBn: "Green Grocer BD",
    nameEn: "Green Grocer BD",
    contactName: "Rafiqul Islam",
    phone: "01711-889900",
    email: "greengrocer@tatkabazar.com",
    tradeLicense: "TRAD/SAVAR/445566",
    location: "Savar, Dhaka",
    commissionRate: 10,
    rating: 4.9,
    reviewsCount: 184,
    banner: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80",
    taglineBn: "Your trusted farm-to-table organic produce partner",
    taglineEn: "Your trusted farm-to-table organic produce partner",
    descriptionBn: "Supplying 100% pesticide-free farm greens harvested at sunrise directly to your kitchen.",
    descriptionEn: "Supplying 100% pesticide-free farm greens harvested at sunrise directly to your kitchen.",
    verified: true,
    status: "APPROVED",
  },
  {
    id: "vendor-padma-fish",
    slug: "padma-fish-house",
    nameBn: "Padma River Fish Supply",
    nameEn: "Padma River Fish Supply",
    contactName: "Chand Miah Bepari",
    phone: "01722-112233",
    email: "padmafish@tatkabazar.com",
    tradeLicense: "TRAD/CHAND/998877",
    location: "Chandpur Ghat, Chandpur",
    commissionRate: 8,
    rating: 4.8,
    reviewsCount: 312,
    banner: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=200&auto=format&fit=crop&q=80",
    taglineBn: "Daily fresh catch from Chandpur & Padma riverbanks",
    taglineEn: "Daily fresh catch from Chandpur & Padma riverbanks",
    descriptionBn: "Premium whole silver Hilsa and live sweet-water catch dispatched on morning ice.",
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
    nameBn: "Organic Red Farm Tomatoes",
    nameEn: "Organic Red Farm Tomatoes",
    sku: "VEG-TOMATO-002",
    categorySlug: "vegetables",
    categoryName: "Vegetables",
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
    nameBn: "Fresh Desi Red Spinach (Lal Shak)",
    nameEn: "Fresh Desi Red Spinach (Lal Shak)",
    sku: "VEG-LALSHAK-006",
    categorySlug: "vegetables",
    categoryName: "Vegetables",
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
    nameBn: "Fresh Padma River Hilsa Fish",
    nameEn: "Fresh Padma River Hilsa Fish",
    sku: "FISH-ILISH-001",
    categorySlug: "fish-and-meat",
    categoryName: "Fish & Meat",
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
    customerName: "Rafiq Ahmed",
    customerPhone: "01700000002",
    deliveryArea: "Dhanmondi",
    deliverySlot: "Morning (07:00 - 09:00 AM)",
    items: [
      { productId: "vprod-1", nameBn: "Organic Tomatoes", nameEn: "Organic Tomatoes", weight: 1, unit: "kg", unitPrice: 65, quantity: 1, totalPrice: 65 },
      { productId: "vprod-2", nameBn: "Red Spinach", nameEn: "Red Spinach", weight: 0.5, unit: "kg", unitPrice: 35, quantity: 1, totalPrice: 35 },
    ],
    subtotal: 100,
    commissionDeducted: 10,
    netEarnings: 90,
    status: "PREPARING",
    createdAt: "21 Aug 2026, 07:15 AM",
    assignedRiderName: "Karim Molla (Bike Rider)",
    assignedRiderPhone: "01701-998877",
  },
  {
    id: "sub-ord-102",
    vendorId: "vendor-padma-fish",
    masterOrderNumber: "TB-928410",
    customerName: "Rafiq Ahmed",
    customerPhone: "01700000002",
    deliveryArea: "Dhanmondi",
    deliverySlot: "Morning (07:00 - 09:00 AM)",
    items: [
      { productId: "vprod-3", nameBn: "Padma Hilsa", nameEn: "Padma Hilsa", weight: 1, unit: "kg", unitPrice: 1450, quantity: 1, totalPrice: 1450 },
    ],
    subtotal: 1450,
    commissionDeducted: 116,
    netEarnings: 1334,
    status: "READY_FOR_PICKUP",
    createdAt: "21 Aug 2026, 07:15 AM",
    assignedRiderName: "Karim Molla (Bike Rider)",
    assignedRiderPhone: "01701-998877",
    specialNotes: "Chilled insulated packaging verified.",
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

  newOrderAlert: { orderNumber: string; customerName: string; subtotal: number } | null;
  dismissAlert: () => void;
  playTestSound: () => void;
}

const VendorContext = createContext<VendorContextType | undefined>(undefined);

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [currentVendor, setCurrentVendor] = useState<VendorProfile>(AVAILABLE_VENDORS[0]!);
  const [allProducts, setAllProducts] = useState<VendorProduct[]>(INITIAL_VENDOR_PRODUCTS);
  const [allOrders, setAllOrders] = useState<VendorSubOrder[]>(INITIAL_VENDOR_ORDERS);
  const [allPayouts, setAllPayouts] = useState<VendorPayoutRecord[]>(INITIAL_PAYOUTS);
  const [knownOrderIds, setKnownOrderIds] = useState<Set<string>>(new Set(INITIAL_VENDOR_ORDERS.map(o => o.id)));
  const [newOrderAlert, setNewOrderAlert] = useState<{ orderNumber: string; customerName: string; subtotal: number } | null>(null);

  // Sync with API with periodic polling for sound alert
  useEffect(() => {
    let isMounted = true;

    async function loadVendorData() {
      try {
        const [prodRes, ordRes] = await Promise.allSettled([
          fetch(`${API_BASE}/api/products`).then(r => r.json()),
          fetch(`${API_BASE}/api/orders`).then(r => r.json()),
        ]);

        if (prodRes.status === "fulfilled" && prodRes.value.success && prodRes.value.data?.length > 0 && isMounted) {
          const apiProds: VendorProduct[] = prodRes.value.data.map((p: any) => ({
            id: p.id,
            vendorId: p.vendorId || currentVendor.id,
            slug: p.slug,
            nameBn: p.name,
            nameEn: p.name,
            sku: p.sku || `VPROD-${p.id.slice(0, 4)}`,
            categorySlug: p.category?.slug || "vegetables",
            categoryName: p.category?.name || "Vegetables",
            basePrice: Number(p.price),
            comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
            baseUnit: "kg",
            pricingType: "variableWeight",
            stock: Number(p.stock) || 0,
            lowStockAlert: 10,
            images: p.images?.length > 0 ? p.images.map((img: any) => img.url) : ["https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"],
            isOrganic: true,
            status: "APPROVED",
            rating: 4.9,
          }));
          setAllProducts(prev => [...apiProds, ...prev.filter(p => !apiProds.some(ap => ap.id === p.id))]);
        }

        if (ordRes.status === "fulfilled" && ordRes.value.success && Array.isArray(ordRes.value.data) && isMounted) {
          const rawOrders = ordRes.value.data;
          const freshSubOrders: VendorSubOrder[] = [];

          rawOrders.forEach((o: any) => {
            if (o.items && o.items.length > 0) {
              const vendorItems = o.items.filter((it: any) => it.vendorId === currentVendor.id || !it.vendorId);
              if (vendorItems.length > 0) {
                const subtotal = vendorItems.reduce((sum: number, it: any) => sum + Number(it.total), 0);
                freshSubOrders.push({
                  id: `sub-${o.id}`,
                  vendorId: currentVendor.id,
                  masterOrderNumber: o.orderNumber,
                  customerName: o.customerName,
                  customerPhone: o.customerPhone,
                  deliveryArea: o.deliveryArea,
                  deliverySlot: o.deliverySlot,
                  items: vendorItems.map((it: any) => ({
                    productId: it.productId,
                    nameBn: it.name,
                    nameEn: it.name,
                    weight: it.quantity,
                    unit: "kg",
                    unitPrice: Number(it.price),
                    quantity: it.quantity,
                    totalPrice: Number(it.total),
                  })),
                  subtotal,
                  commissionDeducted: Math.round(subtotal * 0.1),
                  netEarnings: Math.round(subtotal * 0.9),
                  status: o.status === "PENDING" ? "PENDING_ACCEPTANCE" : "PREPARING",
                  createdAt: o.createdAt,
                  assignedRiderName: o.assignedRiderName,
                });
              }
            }
          });

          if (freshSubOrders.length > 0) {
            setKnownOrderIds((prevKnown) => {
              const newlyArrived = freshSubOrders.filter(so => !prevKnown.has(so.id));
              if (newlyArrived.length > 0 && newlyArrived[0]) {
                const latest = newlyArrived[0];
                audioAlert.playOrderAssignedSound();
                setNewOrderAlert({
                  orderNumber: latest.masterOrderNumber,
                  customerName: latest.customerName,
                  subtotal: latest.subtotal,
                });
              }
              return new Set([...prevKnown, ...freshSubOrders.map(so => so.id)]);
            });

            setAllOrders(prev => [...freshSubOrders, ...prev.filter(p => !freshSubOrders.some(f => f.id === p.id))]);
          }
        }
      } catch (err) {
        console.warn("Vendor API sync fallback:", err);
      }
    }

    loadVendorData();
    const interval = setInterval(loadVendorData, 6000); // 6s live polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentVendor.id]);

  const dismissAlert = () => setNewOrderAlert(null);
  const playTestSound = () => audioAlert.playOrderAssignedSound();

  const switchVendor = (vendorId: string) => {
    const v = AVAILABLE_VENDORS.find((ven) => ven.id === vendorId);
    if (v) setCurrentVendor(v);
  };

  // Filter products for currently active vendor ONLY (Strict Isolation)
  const vendorProducts = allProducts.filter((p) => p.vendorId === currentVendor.id || !p.vendorId);

  // Filter orders for currently active vendor ONLY (Strict Isolation)
  const vendorOrders = allOrders.filter((o) => o.vendorId === currentVendor.id);

  // Filter payouts for currently active vendor ONLY
  const vendorPayouts = allPayouts.filter((p) => p.vendorId === currentVendor.id);

  const addProduct = (prodData: Omit<VendorProduct, "id" | "vendorId" | "status">) => {
    const newP: VendorProduct = {
      ...prodData,
      id: `vprod-${Date.now()}`,
      vendorId: currentVendor.id,
      status: "PENDING_APPROVAL",
    };
    setAllProducts((prev) => [newP, ...prev]);

    // Sync to API
    fetch(`${API_BASE}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: prodData.nameEn || prodData.nameBn,
        slug: prodData.slug,
        price: prodData.basePrice,
        comparePrice: prodData.comparePrice,
        sku: prodData.sku,
        stock: prodData.stock,
        vendorId: currentVendor.id,
        images: prodData.images,
      }),
    }).catch(err => console.warn("API product create error:", err));
  };

  const updateProductStock = (id: string, newStock: number) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
    fetch(`${API_BASE}/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock }),
    }).catch(err => console.warn("API stock update error:", err));
  };

  const updateFulfillmentStatus = (subOrderId: string, status: FulfillmentStatus) => {
    setAllOrders((prev) =>
      prev.map((o) => (o.id === subOrderId ? { ...o, status } : o))
    );
    fetch(`${API_BASE}/api/orders/${subOrderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(err => console.warn("API fulfillment status update error:", err));
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
        newOrderAlert,
        dismissAlert,
        playTestSound,
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
