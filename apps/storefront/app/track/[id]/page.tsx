"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ArrowLeft,
  Store,
  RotateCcw,
  Sparkles,
  Printer,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice } = useLanguage();
  const orderId = (params.id as string) || "TB-194080";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [bikeProgress, setBikeProgress] = useState(45);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchOrder();

    // Auto-poll order status every 15s
    const pollInterval = setInterval(() => {
      fetchOrder();
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [orderId]);

  // Simulate smooth live bike movement on map
  useEffect(() => {
    const bikeTimer = setInterval(() => {
      setBikeProgress((prev) => (prev >= 85 ? 20 : prev + 2));
    }, 800);
    return () => clearInterval(bikeTimer);
  }, []);

  // Fallback demo order if order not found in DB yet
  const displayOrder = order || {
    id: "demo-ord-1",
    orderNumber: orderId.startsWith("TB-") ? orderId : "TB-194080",
    customerName: "Rafiq Ahmed",
    customerPhone: "01700000002",
    customerAddress: "House 27, Road 8/A, Dhanmondi R/A, Dhaka",
    deliveryArea: "Dhanmondi",
    deliverySlot: "Morning Fresh (07:00 - 09:00 AM)",
    status: "OUT_FOR_DELIVERY",
    paymentStatus: "PAID",
    paymentMethod: "BKASH",
    totalAmount: 1550,
    items: [
      { name: "Padma River Fresh Hilsa Fish", quantity: 1, price: 1450 },
      { name: "Farm Fresh Ripe Tomatoes", quantity: 1, price: 65 },
      { name: "Fresh Tender Red Spinach", quantity: 1, price: 35 },
    ],
    rider: {
      name: "Karim Molla",
      phone: "01701998877",
      vehicle: "HONDA CB SHINE (DHAKA METRO HA-4491)",
      rating: 4.95,
      deliveriesCompleted: 142,
    },
  };

  // Determine active step index
  const getStepIndex = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
      case "PROCESSING":
        return 1;
      case "OUT_FOR_DELIVERY":
        return 2;
      case "DELIVERED":
        return 3;
      default:
        return 2;
    }
  };

  const currentStep = getStepIndex(displayOrder.status);

  const steps = [
    { title: "Order Placed", time: "07:00 AM", desc: "Order verified and confirmed" },
    { title: "Packing & Quality Check", time: "07:15 AM", desc: "Packed at local hub in insulated box" },
    { title: "Out for Delivery", time: "07:30 AM", desc: "Rider on route to your location" },
    { title: "Delivered", time: "Est. 08:15 AM", desc: "Doorstep delivery completed" },
  ];

  return (
    <div style={{ minHeight: "85vh", padding: "40px 0 80px", background: "var(--bg-main)" }}>
      <div className="container" style={{ maxWidth: "860px" }}>
        
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Link
            href="/track"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            <ArrowLeft size={18} />
            <span>Track Another Order</span>
          </Link>

          <button
            onClick={fetchOrder}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              padding: "6px 12px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={14} />
            <span>Live Sync: {lastRefreshed.toLocaleTimeString()}</span>
          </button>
        </div>

        {/* Big Live Tracker Card */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #064E3B 0%, #059669 100%)",
              color: "#FFFFFF",
              padding: "24px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "1.3rem", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                  #{displayOrder.orderNumber}
                </span>
                <span
                  style={{
                    background: "rgba(34, 197, 94, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#4ADE80",
                    padding: "2px 10px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                  }}
                >
                  LIVE TRACKING
                </span>
              </div>
              <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>
                Slot: <strong>{displayOrder.deliverySlot}</strong> • {displayOrder.deliveryArea}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", opacity: 0.85 }}>Total Bill (Paid)</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#FEF08A" }}>
                ৳{displayOrder.totalAmount?.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stepper Progression */}
          <div style={{ padding: "28px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", position: "relative" }}>
              
              {steps.map((st, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={idx} style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: isPassed ? "var(--primary)" : "#E2E8F0",
                        color: isPassed ? "#FFFFFF" : "#64748B",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        boxShadow: isCurrent ? "0 0 0 5px rgba(5, 150, 105, 0.2)" : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {idx < currentStep ? <CheckCircle2 size={20} /> : idx === currentStep ? <Bike size={20} /> : idx + 1}
                    </div>

                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: isPassed ? "var(--text-main)" : "var(--text-muted)", marginBottom: "2px" }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: isCurrent ? "var(--primary)" : "var(--text-muted)", fontWeight: isCurrent ? 700 : 500 }}>
                      {st.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulated Animated GPS Map View */}
          <div
            style={{
              background: "#0F172A",
              padding: "30px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Map Grid Background */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                opacity: 0.6,
              }}
            />

            <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              
              {/* Point A: Hub */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(5, 150, 105, 0.3)", border: "1.5px solid #10B981", display: "flex", alignItems: "center", justifyContent: "center", color: "#34D399" }}>
                  <Store size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Pickup Hub</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>Dhanmondi Express Hub</div>
                </div>
              </div>

              {/* Point B: Customer */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#FFFFFF", textAlign: "right" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Delivery Destination</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{displayOrder.customerAddress?.slice(0, 24)}...</div>
                </div>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.25)", border: "1.5px solid #EF4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#F87171" }}>
                  <MapPin size={18} />
                </div>
              </div>

            </div>

            {/* Moving Bike Route Line */}
            <div style={{ position: "relative", margin: "24px 0 10px", height: "4px", background: "rgba(255, 255, 255, 0.15)", borderRadius: "999px" }}>
              {/* Filled progress bar */}
              <div
                style={{
                  height: "100%",
                  width: `${bikeProgress}%`,
                  background: "linear-gradient(90deg, #10B981, #F59E0B)",
                  borderRadius: "999px",
                  transition: "width 0.8s linear",
                }}
              />

              {/* Moving Bike Icon */}
              <div
                style={{
                  position: "absolute",
                  top: "-16px",
                  left: `calc(${bikeProgress}% - 18px)`,
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#F59E0B",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 15px rgba(245, 158, 11, 0.8)",
                  transition: "left 0.8s linear",
                }}
              >
                <Bike size={20} />
              </div>
            </div>

            <div style={{ textAlign: "center", color: "#CBD5E1", fontSize: "0.75rem", marginTop: "16px" }}>
              ⚡ Rider is speeding to your address • Approx. <strong>15 mins</strong> remaining
            </div>
          </div>

        </div>

        {/* Bottom 2-Column Details (Rider Contact & Order Items) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          
          {/* Rider Details Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Your Delivery Rider</h3>
              <span style={{ fontSize: "0.72rem", background: "var(--primary-light)", color: "var(--primary)", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                ★ {displayOrder.rider?.rating || 4.9}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#064E3B",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                }}
              >
                {displayOrder.rider?.name?.[0] || "K"}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                  {displayOrder.rider?.name || "Karim Molla (Bike Rider)"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {displayOrder.rider?.vehicle || "HONDA CB SHINE (BIKE)"}
                </div>
              </div>
            </div>

            {/* Direct Call & Message Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <a
                href={`tel:${displayOrder.rider?.phone || "01701998877"}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--primary)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                <Phone size={15} />
                <span>Call Rider</span>
              </a>

              <a
                href={`https://wa.me/88${displayOrder.rider?.phone || "01701998877"}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  background: "#25D366",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                }}
              >
                <MessageSquare size={15} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "14px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              Order Items ({displayOrder.items?.length || 3})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "150px", overflowY: "auto" }}>
              {displayOrder.items?.map((it: any, idx: number) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "var(--text-main)", fontWeight: 600 }}>• {it.name} x {it.quantity}</span>
                  <span style={{ fontWeight: 700, color: "var(--primary-dark)" }}>৳{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1.5px dashed var(--border-medium)", display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Payment Method:</span>
              <span style={{ fontWeight: 800, color: displayOrder.paymentStatus === "PAID" ? "var(--primary)" : "var(--accent)" }}>
                {displayOrder.paymentStatus === "PAID" ? "✓ Paid (Online)" : "Cash on Delivery (COD)"}
              </span>
            </div>

            {/* Print Cash Memo Action */}
            <Link
              href={`/track/${orderId}/invoice`}
              style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                background: "rgba(16, 185, 129, 0.1)",
                color: "var(--primary-dark)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                fontWeight: 700,
                fontSize: "0.88rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Printer size={16} />
              <span>Print Cash Memo / Invoice (PDF)</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
