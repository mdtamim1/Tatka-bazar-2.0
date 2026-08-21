"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import {
  RiderProfile,
  RiderDeliveryOrder,
  DeliveryStatus,
  DailySummary,
} from "@/types";

export const AVAILABLE_RIDERS: RiderProfile[] = [
  {
    id: "rider-karim",
    name: "করিম মোল্লা",
    phone: "01701998877",
    email: "karim.rider@tatkabazar.com",
    nid: "19942691234567890",
    vehicleType: "MOTORCYCLE",
    assignedHubId: "branch-dhanmondi",
    assignedHubName: "ধানমন্ডি এক্সপ্রেস হাব",
    rating: 4.95,
    totalDeliveriesCompleted: 142,
    isOnline: true,
    activeDeliveriesCount: 2,
  },
  {
    id: "rider-rahim",
    name: "রহিম শেখ",
    phone: "01802334455",
    email: "rahim.rider@tatkabazar.com",
    nid: "19952699887766554",
    vehicleType: "BICYCLE",
    assignedHubId: "branch-gulshan",
    assignedHubName: "গুলশান সেন্ট্রাল হাব",
    rating: 4.88,
    totalDeliveriesCompleted: 98,
    isOnline: true,
    activeDeliveriesCount: 1,
  },
];

const INITIAL_DELIVERIES: RiderDeliveryOrder[] = [
  {
    id: "del-01",
    orderNumber: "TB-928410",
    customerName: "রাফিক আহমেদ (Rafiq Ahmed)",
    customerPhone: "01700000002",
    deliveryAddress: "বাড়ি ২৭, রোড ৮/এ, ধানমন্ডি আ/এ, ঢাকা",
    deliveryArea: "ধানমন্ডি (Dhanmondi)",
    mapQuery: "House 27, Road 8/A, Dhanmondi, Dhaka",
    deliverySlot: "তাজা সকাল (০৭:০০ - ০৯:০০)",
    items: [
      { nameBn: "পদ্মার তাজা রূপালি ইলিশ", nameEn: "Fresh Padma Hilsa", weight: "১ কেজি", quantity: 1 },
      { nameBn: "পাকা লাল দেশি টমেটো", nameEn: "Organic Tomatoes", weight: "১ কেজি", quantity: 1 },
      { nameBn: "তাজা কচি দেশি লাল শাক", nameEn: "Red Spinach", weight: "৫০০ গ্রাম", quantity: 1 },
    ],
    isCod: true,
    codAmountToCollect: 1550,
    codCollected: false,
    status: "ASSIGNED",
    assignedAt: "21 Aug 2026, 07:05 AM",
    notes: "গেটে পৌঁছে দারোয়ানকে ফোন দিতে হবে না, সরাসরি লিফটের ৪-এ কলিংবেল বাজাবেন।",
  },
  {
    id: "del-02",
    orderNumber: "TB-928412",
    customerName: "সুলতানা জাহান (Sultana Jahan)",
    customerPhone: "01711223388",
    deliveryAddress: "ফ্ল্যাট ৩বি, বাড়ি ১২, রোড ৪, কলাবাগান, ঢাকা",
    deliveryArea: "কলাবাগান (Kalabagan)",
    mapQuery: "Road 4, Kalabagan, Dhaka",
    deliverySlot: "তাজা সকাল (০৭:০০ - ০৯:০০)",
    items: [
      { nameBn: "দেশি কচি লাউ", nameEn: "Desi Bottle Gourd", weight: "১ পিস", quantity: 1 },
      { nameBn: "খাঁটি গাওয়া ঘি", nameEn: "Pure Desi Ghee", weight: "৫০০ গ্রাম", quantity: 1 },
    ],
    isCod: false, // Paid via bKash online
    codAmountToCollect: 0,
    codCollected: true,
    status: "PICKED_UP_FROM_HUB",
    assignedAt: "21 Aug 2026, 07:10 AM",
    notes: "অনলাইনে বিকাশ দিয়ে পেইড করা আছে। ক্যাশ নেওয়ার প্রয়োজন নেই।",
  },
  {
    id: "del-03",
    orderNumber: "TB-928405",
    customerName: "মাহমুদ হাসান (Mahmud Hasan)",
    customerPhone: "01999887766",
    deliveryAddress: "বাড়ি ১৫, রোড ২৭, ধানমন্ডি, ঢাকা",
    deliveryArea: "ধানমন্ডি (Dhanmondi)",
    mapQuery: "Road 27, Dhanmondi, Dhaka",
    deliverySlot: "ভোরের এক্সপ্রেস (০৬:৩০ - ০৭:৩০)",
    items: [
      { nameBn: "কাঁচাগোল্লা ও মিষ্টি দই", nameEn: "Shahi Bogura Sweets", weight: "১ কেজি", quantity: 1 },
    ],
    isCod: true,
    codAmountToCollect: 480,
    codCollected: true,
    status: "DELIVERED",
    assignedAt: "21 Aug 2026, 06:40 AM",
    deliveredAt: "21 Aug 2026, 07:20 AM",
    notes: "ডেলিভারি সফল হয়েছে।",
  },
];

interface RiderContextType {
  currentRider: RiderProfile;
  switchRider: (riderId: string) => void;
  toggleDutyStatus: () => void;
  
  deliveries: RiderDeliveryOrder[];
  updateStatus: (orderId: string, status: DeliveryStatus, failureReason?: string) => void;
  toggleCodCollected: (orderId: string) => void;
  
  dailySummary: DailySummary;
  depositCashToHub: () => void;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export function RiderProvider({ children }: { children: React.ReactNode }) {
  const [currentRider, setCurrentRider] = useState<RiderProfile>(AVAILABLE_RIDERS[0]!);
  const [deliveries, setDeliveries] = useState<RiderDeliveryOrder[]>(INITIAL_DELIVERIES);
  const [hubDepositStatus, setHubDepositStatus] = useState<"PENDING" | "DEPOSITED">("PENDING");

  // Fetch live orders assigned to this rider from API
  useEffect(() => {
    async function loadRiderDeliveries() {
      try {
        const res = await fetch(`${API_BASE}/api/orders`);
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          const mapped: RiderDeliveryOrder[] = json.data.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            deliveryAddress: o.customerAddress,
            deliveryArea: o.deliveryArea,
            mapQuery: o.customerAddress,
            deliverySlot: o.deliverySlot,
            items: o.items?.map((it: any) => ({
              nameBn: it.name,
              nameEn: it.name,
              weight: `${it.quantity} pc`,
              quantity: it.quantity,
            })) || [],
            isCod: o.paymentMethod === "COD",
            codAmountToCollect: o.paymentMethod === "COD" ? o.totalAmount : 0,
            codCollected: o.paymentStatus === "PAID",
            status: o.status === "DELIVERED" ? "DELIVERED" : o.status === "OUT_FOR_DELIVERY" ? "EN_ROUTE" : "ASSIGNED",
            assignedAt: o.createdAt,
            notes: o.internalNotes || "তাজা শাকসবজি ও মাছ দ্রুত ডেলিভারি করুন।",
          }));
          setDeliveries(prev => [...mapped, ...prev.filter(d => !mapped.some(m => m.id === d.id))]);
        }
      } catch (err) {
        console.warn("Rider API sync fallback:", err);
      }
    }
    loadRiderDeliveries();
  }, [currentRider.id]);

  const switchRider = (riderId: string) => {
    const r = AVAILABLE_RIDERS.find((rd) => rd.id === riderId);
    if (r) setCurrentRider(r);
  };

  const toggleDutyStatus = () => {
    setCurrentRider((prev) => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const updateStatus = (orderId: string, status: DeliveryStatus, failureReason?: string) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === orderId
          ? {
              ...d,
              status,
              failureReason: failureReason || d.failureReason,
              deliveredAt: status === "DELIVERED" ? new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : d.deliveredAt,
              codCollected: status === "DELIVERED" && d.isCod ? true : d.codCollected,
            }
          : d
      )
    );

    // Map Rider status to OrderStatus and sync to Fastify API & Supabase
    const apiStatus = status === "DELIVERED" ? "DELIVERED" : status === "FAILED" ? "CANCELLED" : "OUT_FOR_DELIVERY";
    fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: apiStatus, paymentStatus: status === "DELIVERED" ? "PAID" : undefined }),
    }).catch(err => console.warn("API rider status sync error:", err));
  };

  const toggleCodCollected = (orderId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === orderId ? { ...d, codCollected: !d.codCollected } : d))
    );
  };

  // Compute Daily Summary
  const completedDeliveries = deliveries.filter((d) => d.status === "DELIVERED");
  const failedDeliveries = deliveries.filter((d) => d.status === "FAILED");
  const totalCodCollected = completedDeliveries.reduce(
    (sum, d) => (d.isCod && d.codCollected ? sum + d.codAmountToCollect : sum),
    0
  );
  const riderEarnings = completedDeliveries.length * 60; // ৳60 base per successful fresh drop

  const dailySummary: DailySummary = {
    date: "২১ আগস্ট ২০২৬ (আজ)",
    completedCount: completedDeliveries.length,
    failedCount: failedDeliveries.length,
    totalCodCollected,
    riderEarnings,
    hubCashDepositStatus: hubDepositStatus,
  };

  const depositCashToHub = () => {
    setHubDepositStatus("DEPOSITED");
  };

  return (
    <RiderContext.Provider
      value={{
        currentRider,
        switchRider,
        toggleDutyStatus,
        deliveries,
        updateStatus,
        toggleCodCollected,
        dailySummary,
        depositCashToHub,
      }}
    >
      {children}
    </RiderContext.Provider>
  );
}

export function useRider() {
  const context = useContext(RiderContext);
  if (!context) {
    throw new Error("useRider must be used within a RiderProvider");
  }
  return context;
}
