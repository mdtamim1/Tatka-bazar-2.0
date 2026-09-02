"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Package,
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TrackSearchPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) {
      setErrorMsg("Please enter an order number or phone number");
      return;
    }
    setErrorMsg("");
    setIsSearching(true);
    router.push(`/track/${encodeURIComponent(query)}`);
  };

  const sampleOrders = [
    { orderNo: "TB-194080", status: "CONFIRMED", area: "Dhanmondi", time: "Morning Slot (07:00 - 09:00 AM)" },
    { orderNo: "TB-928410", status: "OUT_FOR_DELIVERY", area: "Gulshan-2", time: "Midday Express (12:00 - 02:00 PM)" },
  ];

  return (
    <div style={{ minHeight: "80vh", padding: "60px 0", background: "var(--bg-main)" }}>
      <div className="container" style={{ maxWidth: "720px" }}>
        
        {/* Banner Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #064E3B 0%, #059669 100%)",
            borderRadius: "var(--radius-xl)",
            color: "#FFFFFF",
            padding: "40px 30px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(5, 150, 105, 0.2)",
            marginBottom: "32px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.08)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Bike size={32} />
          </div>

          <span
            style={{
              background: "var(--accent)",
              color: "#FFF",
              padding: "4px 14px",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              display: "inline-block",
              marginBottom: "10px",
            }}
          >
            LIVE GPS ORDER RADAR ⚡
          </span>

          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "8px" }}>
            Live Order Tracking
          </h1>
          <p style={{ fontSize: "0.95rem", opacity: 0.9, maxWidth: "480px", margin: "0 auto" }}>
            Track your fresh grocery delivery live from partner farms & river docks to your doorstep.
          </p>
        </div>

        {/* Search Input Box */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "30px",
            boxShadow: "var(--shadow-md)",
            marginBottom: "30px",
          }}
        >
          <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <label style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text-main)" }}>
              Enter Order Number (e.g. TB-194080)
            </label>

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="TB-194080 or your phone number..."
                  style={{
                    width: "100%",
                    padding: "14px 14px 14px 42px",
                    borderRadius: "var(--radius-md)",
                    border: "1.5px solid var(--border-medium)",
                    fontSize: "1rem",
                    fontWeight: 700,
                    outline: "none",
                    background: "var(--bg-main)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="btn-primary"
                style={{
                  padding: "0 28px",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <span>{isSearching ? "Searching..." : "Track Order"}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {errorMsg && (
              <div style={{ color: "#EF4444", fontSize: "0.82rem", fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}
          </form>
        </div>

        {/* Quick Demo Orders */}
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "20px" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={16} color="var(--primary)" />
            <span>Click any demo order to view live tracking:</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {sampleOrders.map((ord) => (
              <Link
                key={ord.orderNo}
                href={`/track/${ord.orderNo}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-subtle)",
                  transition: "all 0.15s ease",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ padding: "8px", borderRadius: "8px", background: "var(--primary-light)", color: "var(--primary)" }}>
                    <Package size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem", fontFamily: "var(--font-mono)", color: "var(--text-main)" }}>
                      #{ord.orderNo}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {ord.area} • {ord.time}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      background: ord.status === "OUT_FOR_DELIVERY" ? "rgba(245, 158, 11, 0.15)" : "var(--primary-light)",
                      color: ord.status === "OUT_FOR_DELIVERY" ? "#D97706" : "var(--primary)",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    {ord.status === "OUT_FOR_DELIVERY" ? "On the Way 🛵" : "Confirmed ✓"}
                  </span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
