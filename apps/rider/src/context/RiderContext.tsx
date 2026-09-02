"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
import {
  RiderProfile,
  RiderDeliveryOrder,
  DeliveryStatus,
  DailySummary,
} from "@/types";
import { audioAlert } from "../utils/audioAlert";

export const AVAILABLE_RIDERS: RiderProfile[] = [
  {
    id: "rider-karim",
    name: "Karim Molla",
    phone: "01701998877",
    email: "karim.rider@tatkabazar.com",
    nid: "19942691234567890",
    vehicleType: "MOTORCYCLE",
    assignedHubId: "branch-dhanmondi",
    assignedHubName: "Dhanmondi Express Hub",
    rating: 4.95,
    totalDeliveriesCompleted: 142,
    isOnline: true,
    activeDeliveriesCount: 2,
  },
  {
    id: "rider-rahim",
    name: "Rahim Sheikh",
    phone: "01802334455",
    email: "rahim.rider@tatkabazar.com",
    nid: "19952699887766554",
    vehicleType: "BICYCLE",
    assignedHubId: "branch-gulshan",
    assignedHubName: "Gulshan Central Hub",
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
    customerName: "Rafiq Ahmed",
    customerPhone: "01700000002",
    deliveryAddress: "House 27, Road 8/A, Flat 4B, Dhanmondi R/A, Dhaka",
    deliveryArea: "Dhanmondi",
    mapQuery: "House 27, Road 8/A, Dhanmondi, Dhaka",
    deliverySlot: "Morning (07:00 - 09:00 AM)",
    items: [
      { nameBn: "Fresh Padma River Hilsa", nameEn: "Fresh Padma Hilsa", weight: "1 kg", quantity: 1 },
      { nameBn: "Organic Farm Tomatoes", nameEn: "Organic Tomatoes", weight: "1 kg", quantity: 1 },
      { nameBn: "Fresh Red Spinach", nameEn: "Red Spinach", weight: "500 g", quantity: 1 },
    ],
    isCod: true,
    codAmountToCollect: 1550,
    codCollected: false,
    status: "ASSIGNED",
    assignedAt: "21 Aug 2026, 07:05 AM",
    notes: "Directly ring the calling bell on 4th floor via elevator.",
  },
  {
    id: "del-02",
    orderNumber: "TB-928412",
    customerName: "Sultana Jahan",
    customerPhone: "01711223388",
    deliveryAddress: "Flat 3B, House 12, Road 4, Kalabagan, Dhaka",
    deliveryArea: "Kalabagan",
    mapQuery: "Road 4, Kalabagan, Dhaka",
    deliverySlot: "Morning (07:00 - 09:00 AM)",
    items: [
      { nameBn: "Desi Bottle Gourd", nameEn: "Desi Bottle Gourd", weight: "1 pc", quantity: 1 },
      { nameBn: "Pure Desi Ghee", nameEn: "Pure Desi Ghee", weight: "500 g", quantity: 1 },
    ],
    isCod: false,
    codAmountToCollect: 0,
    codCollected: true,
    status: "PICKED_UP_FROM_HUB",
    assignedAt: "21 Aug 2026, 07:10 AM",
    notes: "Prepaid online via bKash. No cash collection required.",
  },
  {
    id: "del-03",
    orderNumber: "TB-928405",
    customerName: "Mahmud Hasan",
    customerPhone: "01999887766",
    deliveryAddress: "House 15, Road 27, Dhanmondi, Dhaka",
    deliveryArea: "Dhanmondi",
    mapQuery: "Road 27, Dhanmondi, Dhaka",
    deliverySlot: "Dawn Express (06:30 - 07:30 AM)",
    items: [
      { nameBn: "Shahi Bogura Sweets", nameEn: "Shahi Bogura Sweets", weight: "1 kg", quantity: 1 },
    ],
    isCod: true,
    codAmountToCollect: 480,
    codCollected: true,
    status: "DELIVERED",
    assignedAt: "21 Aug 2026, 06:40 AM",
    deliveredAt: "21 Aug 2026, 07:20 AM",
    notes: "Delivery completed successfully.",
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

  newOrderAlert: { orderNumber: string; customerName: string; area: string } | null;
  dismissAlert: () => void;
  playTestSound: () => void;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export function RiderProvider({ children }: { children: React.ReactNode }) {
  const [currentRider, setCurrentRider] = useState<RiderProfile>(AVAILABLE_RIDERS[0]!);
  const [deliveries, setDeliveries] = useState<RiderDeliveryOrder[]>(INITIAL_DELIVERIES);
  const [hubDepositStatus, setHubDepositStatus] = useState<"PENDING" | "DEPOSITED">("PENDING");
  const [knownOrderIds, setKnownOrderIds] = useState<Set<string>>(new Set(INITIAL_DELIVERIES.map(d => d.id)));
  const [newOrderAlert, setNewOrderAlert] = useState<{ orderNumber: string; customerName: string; area: string } | null>(null);

  // Fetch live orders assigned to this rider from API with sound chime
  useEffect(() => {
    let isMounted = true;

    async function loadRiderDeliveries() {
      try {
        const res = await fetch(`${API_BASE}/api/orders`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
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
            notes: o.internalNotes || "Deliver fresh groceries promptly.",
          }));

          // Detect new assignments
          setKnownOrderIds((prevKnown) => {
            const newlyAssigned = mapped.filter(d => !prevKnown.has(d.id) && d.status === "ASSIGNED");
            if (newlyAssigned.length > 0) {
              const latest = newlyAssigned[0]!;
              audioAlert.playOrderAssignedSound();
              setNewOrderAlert({
                orderNumber: latest.orderNumber,
                customerName: latest.customerName,
                area: latest.deliveryArea,
              });
            }
            return new Set([...prevKnown, ...mapped.map(m => m.id)]);
          });

          setDeliveries(prev => [...mapped, ...prev.filter(d => !mapped.some(m => m.id === d.id))]);
        }
      } catch (err) {
        console.warn("Rider API sync fallback:", err);
      }
    }

    loadRiderDeliveries();
    const interval = setInterval(loadRiderDeliveries, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentRider.id]);

  const dismissAlert = () => setNewOrderAlert(null);
  const playTestSound = () => audioAlert.playOrderAssignedSound();

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
  const totalEarnings = completedDeliveries.length * 60;
  const cashInHandToDeposit = totalCodCollected;

  const dailySummary: DailySummary = {
    date: "21 Aug 2026 (Today)",
    completedCount: completedDeliveries.length,
    failedCount: failedDeliveries.length,
    totalCodCollected,
    totalEarnings,
    cashInHandToDeposit,
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
        newOrderAlert,
        dismissAlert,
        playTestSound,
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
