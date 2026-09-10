"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  PackageCheck,
  Truck,
  ShoppingBag,
  FileText,
  AlertCircle,
  Check,
  HelpCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface TrackingStep {
  id: string;
  key: string;
  titleBn: string;
  titleEn: string;
  description: string;
  location: string;
  time: string;
  date: string;
  completed: boolean;
  current: boolean;
  icon: string;
}

interface RiderNote {
  id: string;
  text: string;
  author: string;
  timestamp: string;
}

export default function TrackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { formatPrice, locale } = useLanguage();
  const orderId = (params.id as string) || "TB-194080";

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isCopied, setIsCopied] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.order) {
          setOrder(json.order);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch order tracking:", e);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    // Auto-poll every 10s for real-time status sync
    const pollTimer = setInterval(fetchOrder, 10000);
    return () => clearInterval(pollTimer);
  }, [fetchOrder]);

  const copyOrderNo = () => {
    if (order?.orderNumber) {
      navigator.clipboard?.writeText(order.orderNumber);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Compute status badge & active stage index
  const status = (order?.status || "OUT_FOR_DELIVERY").toUpperCase();

  const getStatusInfo = (s: string) => {
    switch (s) {
      case "PENDING":
        return {
          labelBn: "অর্ডার গ্রহণ করা হয়েছে",
          labelEn: "Order Placed",
          color: "#F59E0B",
          bg: "rgba(245, 158, 11, 0.12)",
          border: "rgba(245, 158, 11, 0.3)",
          stageIndex: 0,
        };
      case "CONFIRMED":
      case "PROCESSING":
        return {
          labelBn: "প্রসেসিং শুরু হয়েছে",
          labelEn: "Order Processing",
          color: "#3B82F6",
          bg: "rgba(59, 130, 246, 0.12)",
          border: "rgba(59, 130, 246, 0.3)",
          stageIndex: 1,
        };
      case "VENDOR_ASSIGNED":
      case "PREPARING":
      case "READY_FOR_PICKUP":
        return {
          labelBn: "ভেন্ডরের কাছে পাঠানো হয়েছে",
          labelEn: "Sent to Vendor / Sorting Hub",
          color: "#8B5CF6",
          bg: "rgba(139, 92, 246, 0.12)",
          border: "rgba(139, 92, 246, 0.3)",
          stageIndex: 2,
        };
      case "RIDER_ASSIGNED":
      case "ASSIGNED":
        return {
          labelBn: "ডেলিভারি রাইডার নিয়োগ করা হয়েছে",
          labelEn: "Rider Assigned",
          color: "#EC4899",
          bg: "rgba(236, 72, 153, 0.12)",
          border: "rgba(236, 72, 153, 0.3)",
          stageIndex: 3,
        };
      case "OUT_FOR_DELIVERY":
      case "ON_THE_WAY":
      case "SHIPPED":
        return {
          labelBn: "রাইডার ডেলিভারির পথে (অন-দ্য-ওয়ে)",
          labelEn: "Rider Out For Delivery",
          color: "#10B981",
          bg: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.3)",
          stageIndex: 4,
        };
      case "DELIVERED":
        return {
          labelBn: "ডেলিভারি সফলভাবে সম্পন্ন হয়েছে",
          labelEn: "Delivered Successfully",
          color: "#059669",
          bg: "rgba(5, 150, 105, 0.15)",
          border: "rgba(5, 150, 105, 0.4)",
          stageIndex: 5,
        };
      case "CANCELLED":
      case "RETURNED":
        return {
          labelBn: "অর্ডার বাতিল / রিটার্ন",
          labelEn: "Cancelled / Returned",
          color: "#EF4444",
          bg: "rgba(239, 68, 68, 0.12)",
          border: "rgba(239, 68, 68, 0.3)",
          stageIndex: -1,
        };
      default:
        return {
          labelBn: "প্রসেসিং হচ্ছে",
          labelEn: "Processing",
          color: "#10B981",
          bg: "rgba(16, 185, 129, 0.12)",
          border: "rgba(16, 185, 129, 0.3)",
          stageIndex: 2,
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  // Stepper milestones
  const stages = [
    { key: "ORDER_PLACED", labelBn: "অর্ডার প্লেস", labelEn: "Placed", icon: ShoppingBag },
    { key: "PROCESSING", labelBn: "প্রসেসিং", labelEn: "Processing", icon: PackageCheck },
    { key: "VENDOR_ASSIGNED", labelBn: "ভেন্ডরে পাঠানো", labelEn: "At Vendor", icon: Store },
    { key: "RIDER_ASSIGNED", labelBn: "রাইডার নিয়োগ", labelEn: "Rider Assigned", icon: Bike },
    { key: "ON_THE_WAY", labelBn: "অন-দ্য-ওয়ে", labelEn: "On The Way", icon: Truck },
    { key: "DELIVERED", labelBn: "সম্পন্ন", labelEn: "Delivered", icon: CheckCircle2 },
  ];

  const currentStageIndex = statusInfo.stageIndex;

  // Timeline events from API or fallback
  const timeline: TrackingStep[] = order?.timeline || [];

  // Rider notes (aggregated and deduplicated across all possible API formats)
  const rawNotes: any[] = [
    ...(Array.isArray(order?.notes) ? order.notes : []),
    ...(Array.isArray(order?.riderNotes) ? order.riderNotes : []),
    ...(order?.riderNote ? [{ id: "n-solo", text: order.riderNote, author: "RIDER", timestamp: new Date().toISOString() }] : []),
    ...(order?.note && typeof order.note === "string" && order.note.includes("Rider Note:")
      ? [{ id: "n-note", text: order.note.replace("Rider Note:", "").trim(), author: "RIDER", timestamp: new Date().toISOString() }]
      : []),
  ];

  const seenNoteTexts = new Set<string>();
  const riderNotes: RiderNote[] = rawNotes
    .map((n: any) => ({
      id: n.id || String(Math.random()),
      text: String(n.text || n.note || "").trim(),
      author: n.author || n.riderName || "RIDER",
      timestamp: n.timestamp || n.createdAt || "",
    }))
    .filter((n) => {
      if (!n.text || seenNoteTexts.has(n.text)) return false;
      seenNoteTexts.add(n.text);
      return true;
    });

  return (
    <div style={{ minHeight: "88vh", padding: "40px 16px 80px", background: "var(--bg-main)" }}>
      <div className="container" style={{ maxWidth: "860px", margin: "0 auto" }}>
        
        {/* Navigation Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "22px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <Link
            href="/track"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.88rem",
              fontWeight: 700,
              padding: "6px 12px",
              borderRadius: "8px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              transition: "all 0.2s",
            }}
          >
            <ArrowLeft size={16} />
            <span>অন্য অর্ডার ট্র্যাক করুন</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                fontSize: "0.76rem",
                color: "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "inline-block",
                  animation: "pulse 1.8s infinite",
                }}
              />
              লাইভ সিঙ্ক: {lastRefreshed.toLocaleTimeString()}
            </span>

            <button
              onClick={fetchOrder}
              disabled={loading}
              title="রিফ্রেশ করুন"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--text-main)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <RotateCcw size={13} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "সিঙ্ক হচ্ছে..." : "রিফ্রেশ"}</span>
            </button>
          </div>
        </div>

        {/* ── STEADFAST-STYLE CONSIGNMENT HEADER CARD ── */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "20px",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            overflow: "hidden",
            marginBottom: "24px",
          }}
        >
          {/* Top colored accent bar */}
          <div style={{ height: "4px", background: "linear-gradient(90deg, #059669, #10B981, #F59E0B)" }} />

          <div style={{ padding: "24px 28px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "20px",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "18px",
              }}
            >
              {/* Order Identity */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "var(--text-muted)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Consignment Tracking
                  </span>
                  <button
                    onClick={copyOrderNo}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                      color: isCopied ? "#10B981" : "var(--primary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "2px 6px",
                      borderRadius: "4px",
                    }}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? "কপি হয়েছে!" : "কপি করুন"}</span>
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: "var(--text-main)",
                      fontFamily: "var(--font-mono), monospace",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    #{order?.orderNumber || orderId}
                  </h1>
                </div>
              </div>

              {/* Status Badge */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "8px 16px",
                    borderRadius: "999px",
                    background: statusInfo.bg,
                    border: `1.5px solid ${statusInfo.border}`,
                    color: statusInfo.color,
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    boxShadow: `0 4px 12px ${statusInfo.bg}`,
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: statusInfo.color,
                      display: "inline-block",
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                  <span>{statusInfo.labelBn}</span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "5px" }}>
                  বর্তমান স্ট্যাটাস আপডেট
                </div>
              </div>
            </div>

            {/* Consignment Specs Grid (SteadFast Style) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "18px",
              }}
            >
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  গ্রাহকের নাম
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: 800, color: "var(--text-main)", marginTop: "3px" }}>
                  {order?.customerName || "গ্রাহক"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  মোবাইল নম্বর
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: 800, color: "var(--text-main)", marginTop: "3px" }}>
                  {order?.customerPhone || "017XXXXXXXX"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  গন্তব্য ও এলাকা
                </div>
                <div style={{ fontSize: "0.94rem", fontWeight: 800, color: "var(--text-main)", marginTop: "3px" }}>
                  {order?.deliveryArea || "ঢাকা"}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
                  মোট বিল ও পেমেন্ট
                </div>
                <div style={{ fontSize: "0.98rem", fontWeight: 900, color: "#059669", marginTop: "3px" }}>
                  ৳{order?.totalAmount ? Number(order.totalAmount).toLocaleString() : "১,৫৫০"}{" "}
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 7px",
                      borderRadius: "6px",
                      background: order?.paymentStatus === "PAID" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                      color: order?.paymentStatus === "PAID" ? "#059669" : "#D97706",
                      fontWeight: 800,
                    }}
                  >
                    {order?.paymentStatus === "PAID" ? "পরিশোধিত" : "ক্যাশ অন ডেলিভারি"}
                  </span>
                </div>
              </div>
            </div>

            {/* Address line */}
            <div
              style={{
                marginTop: "16px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "var(--bg-main)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              <MapPin size={15} color="#10B981" style={{ flexShrink: 0 }} />
              <span>
                <strong style={{ color: "var(--text-main)" }}>ডেলিভারি ঠিকানা:</strong>{" "}
                {order?.customerAddress || "বাড়ি নং ২৭, রোড ৮/এ, ধানমন্ডি, ঢাকা"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 6-STAGE PROGRESSION STEPPER (STEADFAST STYLE) ── */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "20px",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            padding: "26px 20px",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "20px", textAlign: "center" }}>
            অর্ডার ডেলিভারি লাইফসাইকেল ট্র্যাকার
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              position: "relative",
              gap: "4px",
            }}
          >
            {stages.map((st, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const IconComp = st.icon;

              return (
                <div
                  key={st.key}
                  style={{
                    textAlign: "center",
                    position: "relative",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* Step Bubble */}
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: isCompleted
                        ? isCurrent
                          ? "linear-gradient(135deg, #10B981, #059669)"
                          : "#10B981"
                        : "var(--bg-main)",
                      color: isCompleted ? "#FFFFFF" : "var(--text-muted)",
                      border: isCompleted
                        ? "none"
                        : "2px solid var(--border-medium)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "8px",
                      boxShadow: isCurrent ? "0 0 0 6px rgba(16, 185, 129, 0.22)" : "none",
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check size={20} strokeWidth={3} />
                    ) : (
                      <IconComp size={18} />
                    )}
                  </div>

                  {/* Stage title */}
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: isCompleted ? 800 : 500,
                      color: isCurrent
                        ? "#10B981"
                        : isCompleted
                        ? "var(--text-main)"
                        : "var(--text-muted)",
                      lineHeight: 1.25,
                      marginBottom: "3px",
                    }}
                  >
                    {st.labelBn}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--text-muted)",
                      display: "none",
                    }}
                  >
                    {st.labelEn}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIDER DELIVERY NOTES HIGHLIGHT CARD ── */}
        {riderNotes.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
              border: "1.5px solid #FCD34D",
              borderRadius: "18px",
              padding: "20px 24px",
              marginBottom: "24px",
              boxShadow: "0 8px 24px rgba(245, 158, 11, 0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#F59E0B",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <MessageSquare size={16} />
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 900, color: "#92400E" }}>
                  রাইডার ও ডেলিভারি আপডেট নোট
                </div>
                <div style={{ fontSize: "0.72rem", color: "#B45309" }}>
                  রাইডার ডেলিভারি সম্পন্ন করার সময় এই নোটটি যুক্ত করেছেন
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {riderNotes.map((n, i) => (
                <div
                  key={n.id || i}
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#78350F", lineHeight: 1.5 }}>
                    "{n.text}"
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#92400E", marginTop: "4px", fontWeight: 600 }}>
                    পোস্ট করেছেন: {n.author === "RIDER" ? "ডেলিভারি রাইডার" : "অ্যাডমিন"} •{" "}
                    {n.timestamp ? new Date(n.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "এখনই"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEADFAST CHRONOLOGICAL TRACKING TIMELINE ── */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "20px",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            padding: "28px 24px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "22px",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "12px",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                📋 বিস্তারিত ট্র্যাকিং হিস্টোরি (SteadFast Timeline)
              </h2>
              <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                প্রতিটি স্ট্যাটাস পরিবর্তন সময় ও স্থান অনুযায়ী রেকর্ড করা হয়েছে
              </p>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                background: "rgba(16, 185, 129, 0.1)",
                color: "#10B981",
                padding: "3px 10px",
                borderRadius: "6px",
                fontWeight: 800,
              }}
            >
              ভেরিফাইড রেকর্ড
            </span>
          </div>

          {/* Vertical Stepper Timeline */}
          <div style={{ position: "relative", paddingLeft: "10px" }}>
            {timeline.map((step, idx) => {
              const isLast = idx === timeline.length - 1;
              const isCompleted = step.completed;
              const isCurrent = step.current;

              return (
                <div
                  key={step.id || idx}
                  style={{
                    display: "flex",
                    gap: "18px",
                    position: "relative",
                    paddingBottom: isLast ? 0 : "28px",
                  }}
                >
                  {/* Vertical Connector Line */}
                  {!isLast && (
                    <div
                      style={{
                        position: "absolute",
                        left: "17px",
                        top: "36px",
                        bottom: 0,
                        width: "2px",
                        background: isCompleted ? "#10B981" : "var(--border-subtle)",
                        transition: "background 0.3s ease",
                      }}
                    />
                  )}

                  {/* Step Node Icon */}
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: isCompleted
                        ? isCurrent
                          ? "#10B981"
                          : "#059669"
                        : "var(--bg-main)",
                      color: isCompleted ? "#FFFFFF" : "var(--text-muted)",
                      border: isCompleted
                        ? "none"
                        : "2px solid var(--border-medium)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      zIndex: 2,
                      boxShadow: isCurrent ? "0 0 0 5px rgba(16, 185, 129, 0.25)" : "none",
                    }}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={2.8} />
                    ) : (
                      <span style={{ fontSize: "0.75rem", fontWeight: 800 }}>{idx + 1}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div style={{ flex: 1, paddingTop: "4px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.96rem",
                          fontWeight: 800,
                          color: isCompleted ? "var(--text-main)" : "var(--text-muted)",
                        }}
                      >
                        {step.titleBn}
                      </div>
                      <div
                        style={{
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          color: isCurrent ? "#10B981" : "var(--text-muted)",
                          fontFamily: "var(--font-mono), monospace",
                        }}
                      >
                        {step.time} {step.date ? `• ${step.date}` : ""}
                      </div>
                    </div>

                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "5px" }}>
                      {step.description}
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "0.72rem",
                        color: "var(--text-muted)",
                        background: "var(--bg-main)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      <MapPin size={11} color="#10B981" />
                      <span>{step.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2-COLUMN BOTTOM DETAILS (RIDER & ITEMS) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
          
          {/* Rider Card */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "20px",
              border: "1px solid var(--border-subtle)",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                🛵 আপনার ডেলিভারি রাইডার
              </h3>
              <span
                style={{
                  fontSize: "0.72rem",
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#059669",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontWeight: 800,
                }}
              >
                ★ {order?.rider?.rating || 4.95} ভেরিফাইড
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #059669, #10B981)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  fontWeight: 900,
                  boxShadow: "0 8px 16px rgba(16, 185, 129, 0.3)",
                }}
              >
                {order?.rider?.name?.[0] || "ক"}
              </div>

              <div>
                <div style={{ fontWeight: 900, fontSize: "1rem", color: "var(--text-main)" }}>
                  {order?.rider?.name || "করিম মোল্লা (Tatka Delivery)"}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  {order?.rider?.vehicle || "HONDA CB SHINE (মোটরসাইকেল)"}
                </div>
              </div>
            </div>

            {/* Direct Call & WhatsApp Action Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <a
                href={`tel:${order?.rider?.phone || "01701998877"}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #059669, #10B981)",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  boxShadow: "0 6px 16px rgba(16, 185, 129, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <Phone size={15} />
                <span>রাইডারকে কল দিন</span>
              </a>

              <a
                href={`https://wa.me/88${(order?.rider?.phone || "01701998877").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#25D366",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  boxShadow: "0 6px 16px rgba(37, 211, 102, 0.25)",
                  transition: "all 0.2s ease",
                }}
              >
                <MessageSquare size={15} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Order Items & Cash Memo */}
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "20px",
              border: "1px solid var(--border-subtle)",
              padding: "24px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                📦 অর্ডারের আইটেম ({order?.items?.length || 3}টি)
              </h3>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                স্লট: {order?.deliverySlot || "Standard"}
              </span>
            </div>

            {/* List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                maxHeight: "140px",
                overflowY: "auto",
                marginBottom: "14px",
                paddingRight: "4px",
              }}
            >
              {(order?.items || [
                { name: "পদ্মার তাজা বড় ইলিশ মাছ", quantity: 1, price: 1450 },
                { name: "খামারের লাল টমেটো", quantity: 1, price: 65 },
                { name: "টাটকা লাল শাক (২ আঁটি)", quantity: 1, price: 35 },
              ]).map((it: any, i: number) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.84rem",
                    padding: "6px 0",
                    borderBottom: "1px dashed var(--border-subtle)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                    • {it.name} <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>x{it.quantity}</span>
                  </span>
                  <span style={{ fontWeight: 800, color: "#059669" }}>
                    ৳{(it.price * it.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderTop: "1.5px solid var(--border-subtle)",
                marginBottom: "14px",
              }}
            >
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                সর্বমোট পরিশোধযোগ্য:
              </span>
              <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#059669" }}>
                ৳{order?.totalAmount ? Number(order.totalAmount).toLocaleString() : "১,৫৫০"}
              </span>
            </div>

            {/* Invoice Link */}
            <Link
              href={`/track/${order?.orderNumber || orderId}/invoice`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(16, 185, 129, 0.08)",
                border: "1.5px solid rgba(16, 185, 129, 0.25)",
                color: "#059669",
                fontWeight: 800,
                fontSize: "0.86rem",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Printer size={16} />
              <span>ক্যাশ মেমো / ইনভয়েস ডাউনলোড করুন</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
