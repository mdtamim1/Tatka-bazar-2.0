"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Package,
  Bike,
  AlertTriangle,
  DollarSign,
  FileText,
} from "lucide-react";
import { useRider } from "@/context/RiderContext";
import { DeliveryStatus } from "@/types";

export default function RiderOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { deliveries, updateStatus, toggleCodCollected } = useRider();

  const orderId = params.id as string;
  const order = deliveries.find((d) => d.id === orderId);

  const [failureReason, setFailureReason] = useState("Customer Unreachable");
  const [showFailureModal, setShowFailureModal] = useState(false);

  if (!order) {
    return (
      <div className="rider-card" style={{ textAlign: "center", padding: "40px 16px" }}>
        <h3>Order Not Found</h3>
        <Link href="/" className="rider-btn rider-btn-secondary" style={{ marginTop: "14px" }}>
          Return to Deliveries
        </Link>
      </div>
    );
  }

  const handleDeliver = () => {
    updateStatus(order.id, "DELIVERED");
    router.push("/");
  };

  const handleFailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatus(order.id, "FAILED", failureReason);
    setShowFailureModal(false);
    router.push("/");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Top Back Nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Link
          href="/"
          style={{
            padding: "8px",
            borderRadius: "50%",
            background: "#E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 800 }}>Delivery Run-Sheet</h1>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Order #{order.orderNumber}</div>
        </div>
      </div>

      {/* Customer & Address Card */}
      <div className="rider-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>{order.customerName}</h2>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
              {order.customerPhone}
            </div>
          </div>
          <span className={`status-pill ${order.status === "DELIVERED" ? "green" : "blue"}`}>
            {order.status}
          </span>
        </div>

        <div style={{ background: "#F8FAFC", padding: "12px", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.85rem" }}>
          <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontWeight: 700 }}>{order.deliveryArea}</div>
            <div style={{ color: "var(--text-muted)", marginTop: "2px" }}>{order.deliveryAddress}</div>
          </div>
        </div>

        {order.notes && (
          <div style={{ fontSize: "0.78rem", background: "#FEF3C7", color: "#92400E", padding: "8px 12px", borderRadius: "var(--radius-sm)" }}>
            💬 <strong>Customer Note:</strong> {order.notes}
          </div>
        )}

        {/* Big Action Buttons (Call & Direct GPS Navigation) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
          <a
            href={`tel:${order.customerPhone}`}
            className="rider-btn rider-btn-secondary"
            style={{ padding: "10px" }}
          >
            <Phone size={18} color="var(--primary)" />
            <span>Call Customer</span>
          </a>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.mapQuery)}`}
            target="_blank"
            rel="noreferrer"
            className="rider-btn rider-btn-secondary"
            style={{ padding: "10px" }}
          >
            <Navigation size={18} color="#2563EB" />
            <span>Google Maps</span>
          </a>
        </div>
      </div>

      {/* Package Items Card */}
      <div className="rider-card" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 800, borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
          Package Manifest ({order.items.length} items)
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "4px 0", borderBottom: "1px dashed var(--border-subtle)" }}>
              <span>{item.nameEn || item.nameBn}</span>
              <span style={{ fontWeight: 700, color: "var(--primary-dark)" }}>{item.weight} × {item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment & Cash Collection Card */}
      <div className="rider-card" style={{ display: "flex", flexDirection: "column", gap: "10px", background: order.isCod ? "#FFFDF5" : "#F8FAFC", border: order.isCod ? "1px solid #FDE68A" : "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Payment Method:</span>
          <span style={{ fontWeight: 800, color: order.isCod ? "var(--primary-dark)" : "#2563EB" }}>
            {order.isCod ? "Cash on Delivery (COD)" : "Prepaid Online (bKash/SSL)"}
          </span>
        </div>

        {order.isCod && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px dashed #FCD34D", paddingTop: "8px" }}>
            <span style={{ fontSize: "1rem", fontWeight: 800 }}>Cash to Collect:</span>
            <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary-dark)" }}>
              ৳{order.codAmountToCollect.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Primary Status Update Action */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "6px" }}>
        {order.status === "ASSIGNED" && (
          <button
            onClick={() => updateStatus(order.id, "PICKED_UP_FROM_HUB")}
            className="rider-btn rider-btn-primary"
            style={{ fontSize: "1rem" }}
          >
            <Package size={20} />
            <span>1. Pick up from Hub</span>
          </button>
        )}

        {order.status === "PICKED_UP_FROM_HUB" && (
          <button
            onClick={() => updateStatus(order.id, "EN_ROUTE")}
            className="rider-btn"
            style={{ background: "var(--accent)", color: "#FFF", fontSize: "1rem" }}
          >
            <Bike size={20} />
            <span>2. Start Delivery Route</span>
          </button>
        )}

        {order.status === "EN_ROUTE" && (
          <>
            <button
              onClick={handleDeliver}
              className="rider-btn rider-btn-primary"
              style={{ background: "var(--neon-green)", color: "#0F172A", fontWeight: 800, fontSize: "1rem" }}
            >
              <CheckCircle2 size={20} />
              <span>
                {order.isCod
                  ? `✓ Collect ৳${order.codAmountToCollect} Cash & Complete`
                  : "✓ Handover & Complete Delivery"}
              </span>
            </button>

            <button
              onClick={() => setShowFailureModal(true)}
              className="rider-btn rider-btn-secondary"
              style={{ color: "var(--danger)" }}
            >
              Report Failed Delivery
            </button>
          </>
        )}

        {order.status === "DELIVERED" && (
          <div style={{ background: "var(--primary-light)", padding: "14px", borderRadius: "var(--radius-md)", textAlign: "center", color: "var(--primary-hover)", fontWeight: 800 }}>
            ✓ This delivery has been successfully completed!
          </div>
        )}
      </div>

      {/* Failure Reason Modal */}
      {showFailureModal && (
        <div className="modal-overlay" onClick={() => setShowFailureModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "10px" }}>
              Select Failure Reason
            </h2>

            <form onSubmit={handleFailSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
                >
                  <option value="Customer Unreachable">Customer Unreachable</option>
                  <option value="Customer Not at Home">Customer Not at Home</option>
                  <option value="Address Not Found">Address Not Found</option>
                  <option value="Customer Refused Package">Customer Refused Package</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowFailureModal(false)} className="rider-btn rider-btn-secondary" style={{ width: "auto" }}>
                  Cancel
                </button>
                <button type="submit" className="rider-btn rider-btn-danger" style={{ width: "auto" }}>
                  Submit Failure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
