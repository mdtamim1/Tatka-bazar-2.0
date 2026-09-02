"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Printer,
  Bike,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Package,
  Volume2,
  BellRing,
  X,
} from "lucide-react";
import { useVendor } from "@/context/VendorContext";
import { VendorSubOrder, FulfillmentStatus } from "@/types";

export default function VendorOrdersPage() {
  const { orders, updateFulfillmentStatus, currentVendor, newOrderAlert, dismissAlert, playTestSound } = useVendor();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<VendorSubOrder | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.masterOrderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.deliveryArea.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Live Audio Order Notification Banner */}
      {newOrderAlert && (
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          border: "2px solid #34D399",
          padding: "16px 20px",
          borderRadius: "var(--radius-lg)",
          color: "#FFFFFF",
          boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "10px", borderRadius: "50%" }}>
              <BellRing size={22} className="animate-bounce" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>🔔 New items ordered from your store!</div>
              <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>
                Order: <strong>{newOrderAlert.orderNumber}</strong> • {newOrderAlert.customerName} • ৳{newOrderAlert.subtotal}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={playTestSound}
              style={{
                background: "#FFFFFF",
                color: "#065F46",
                border: "none",
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.78rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
            >
              <Volume2 size={15} /> Play Again
            </button>
            <button
              onClick={dismissAlert}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.8)",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            Order Fulfillment & Packaging (Slice-Only View)
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            Strict vendor isolation — view and manage only items belonging to your shop with rider dispatch
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="vendor-card" style={{ padding: "14px 18px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "240px" }}>
          <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number or delivery area..."
            style={{ width: "100%", padding: "7px 12px 7px 36px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
        >
          <option value="all">All Order Statuses</option>
          <option value="PREPARING">PREPARING (Packaging in progress)</option>
          <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
          <option value="PICKED_UP_BY_RIDER">PICKED UP BY RIDER</option>
          <option value="DELIVERED">DELIVERED (Completed)</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="vendor-card">
        <div style={{ overflowX: "auto" }}>
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Master Order No</th>
                <th>Shop Items</th>
                <th>Delivery Slot & Area</th>
                <th>Subtotal & Net</th>
                <th>Rider Pickup</th>
                <th>Fulfillment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: "var(--primary-dark)" }}>{ord.masterOrderNumber}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{ord.createdAt}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {ord.items.map((item, idx) => (
                        <div key={idx} style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                          • {item.nameEn || item.nameBn} — <span style={{ color: "var(--primary-dark)", fontWeight: 700 }}>{item.quantity * item.weight} {item.unit}</span> (৳{item.totalPrice})
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{ord.deliveryArea}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 700 }}>
                      ⏰ {ord.deliverySlot}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>৳{ord.subtotal}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--primary-dark)", fontWeight: 700 }}>
                      Net Earnings: ৳{ord.netEarnings}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      (Commission -{currentVendor.commissionRate}%: ৳{ord.commissionDeducted})
                    </div>
                  </td>
                  <td>
                    {ord.assignedRiderName ? (
                      <div style={{ fontSize: "0.78rem" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-main)" }}>🛵 {ord.assignedRiderName}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ord.assignedRiderPhone}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Rider Pending</span>
                    )}
                  </td>
                  <td>
                    <select
                      value={ord.status}
                      onChange={(e) => updateFulfillmentStatus(ord.id, e.target.value as FulfillmentStatus)}
                      style={{
                        padding: "5px 8px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-medium)",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        background: "#FFF",
                      }}
                    >
                      <option value="PREPARING">PREPARING (Packing)</option>
                      <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                      <option value="PICKED_UP_BY_RIDER">ON THE WAY</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="vendor-btn vendor-btn-secondary"
                      style={{ padding: "5px 8px", fontSize: "0.72rem" }}
                      title="Print Vendor Packing Slip"
                    >
                      <Printer size={14} />
                      <span>Slip</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Packing Slip Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "14px" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{currentVendor.nameEn || currentVendor.nameBn}</h2>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Vendor Packaging Slip</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800 }}>{selectedOrder.masterOrderNumber}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{selectedOrder.createdAt}</div>
              </div>
            </div>

            <div style={{ background: "#F8FAFC", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "14px" }}>
              <div><strong>Delivery Area:</strong> {selectedOrder.deliveryArea}</div>
              <div><strong>Delivery Slot:</strong> {selectedOrder.deliverySlot}</div>
              <div><strong>Assigned Rider:</strong> {selectedOrder.assignedRiderName || "Assignment in progress"}</div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "6px" }}>Packaging Items:</div>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed #DDD", fontSize: "0.82rem" }}>
                  <span>{it.nameEn || it.nameBn} ({it.quantity * it.weight} {it.unit})</span>
                  <span style={{ fontWeight: 700 }}>৳{it.totalPrice}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px solid #000", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
              <span>Vendor Subtotal:</span>
              <span>৳{selectedOrder.subtotal}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
              <button onClick={() => window.print()} className="vendor-btn vendor-btn-primary">
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button onClick={() => setSelectedOrder(null)} className="vendor-btn vendor-btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
