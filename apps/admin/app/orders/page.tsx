"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingBag, Search, Filter, X, Phone, MapPin, Clock,
  ChevronDown, Store, Bike, Eye, Package, CreditCard,
  CheckCircle, ArrowRight, User, StickyNote, RefreshCw,
  Download, Plus,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminOrder, OrderStatus } from "@/types";

const STATUS_META: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING:          { label: "Pending",         cls: "warning" },
  CONFIRMED:        { label: "Confirmed",        cls: "info"    },
  VENDOR_ASSIGNED:  { label: "Vendor Assigned",  cls: "indigo"  },
  PREPARING:        { label: "Preparing",        cls: "purple"  },
  READY_FOR_PICKUP: { label: "Ready",            cls: "cyan"    },
  OUT_FOR_DELIVERY: { label: "On Delivery",      cls: "cyan"    },
  DELIVERED:        { label: "Delivered",        cls: "success" },
  CANCELLED:        { label: "Cancelled",        cls: "danger"  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status] || { label: status, cls: "neutral" };
  return <span className={`status-badge ${m.cls}`}>{m.label}</span>;
}

const ALL_STATUSES: (OrderStatus | "ALL")[] = [
  "ALL", "PENDING", "CONFIRMED", "VENDOR_ASSIGNED",
  "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "VENDOR_ASSIGNED",
  VENDOR_ASSIGNED: "PREPARING",
  PREPARING: "READY_FOR_PICKUP",
  READY_FOR_PICKUP: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

// ── Order Detail Drawer ──────────────────────────────────────────────────────

function OrderDrawer({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const { updateOrderStatus, confirmOrder, updateOrder } = useAdmin();
  const [note, setNote] = useState(order.internalNotes || "");
  const meta = STATUS_META[order.status] || { label: order.status, cls: "neutral" };

  const nextStatus = NEXT_STATUS[order.status];

  const handleStatusPush = () => {
    if (!nextStatus) return;
    if (order.status === "PENDING") {
      confirmOrder(order.id);
    } else {
      updateOrderStatus(order.id, nextStatus);
    }
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        <div className="drawer-header">
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-0)" }}>
              Order #{order.orderNumber}
            </div>
            <div style={{ marginTop: "4px" }}>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Customer */}
          <div className="section-label"><User size={11} /> Customer Info</div>
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{order.customerName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value mono">{order.customerPhone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Address</span>
            <span className="detail-value" style={{ fontSize: "0.80rem", maxWidth: "260px", textAlign: "right", lineHeight: 1.5 }}>
              {order.customerAddress}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Area</span>
            <span className="detail-value">{order.deliveryArea}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Delivery Slot</span>
            <span className="detail-value" style={{ fontSize: "0.78rem" }}>{order.deliverySlot}</span>
          </div>

          <div className="admin-divider" />

          {/* Payment */}
          <div className="section-label"><CreditCard size={11} /> Payment</div>
          <div className="detail-row">
            <span className="detail-label">Method</span>
            <span className="detail-value">{order.paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value">
              <span className={`status-badge ${order.paymentStatus === "PAID" ? "success" : "warning"}`}>
                {order.paymentStatus}
              </span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Amount</span>
            <span className="detail-value mono" style={{ fontSize: "1.1rem", color: "var(--green-bright)" }}>
              ৳{order.totalAmount.toLocaleString()}
            </span>
          </div>

          <div className="admin-divider" />

          {/* Assignment */}
          <div className="section-label"><Store size={11} /> Vendor & Rider</div>
          {order.assignedVendorName ? (
            <div className="detail-row">
              <span className="detail-label">Vendor</span>
              <span className="detail-value">{order.assignedVendorName}</span>
            </div>
          ) : (
            <div style={{ fontSize: "0.78rem", color: "var(--text-4)", padding: "8px 0" }}>
              No vendor assigned yet.
            </div>
          )}
          {order.assignedRiderName && (
            <div className="detail-row">
              <span className="detail-label">Rider</span>
              <span className="detail-value">{order.assignedRiderName}</span>
            </div>
          )}

          {order.createdAt && (
            <>
              <div className="admin-divider" />
              <div className="section-label"><Clock size={11} /> Timeline</div>
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span className="detail-value" style={{ fontSize: "0.78rem" }}>{order.createdAt}</span>
              </div>
              {order.confirmedAt && (
                <div className="detail-row">
                  <span className="detail-label">Confirmed</span>
                  <span className="detail-value" style={{ fontSize: "0.78rem" }}>{order.confirmedAt}</span>
                </div>
              )}
            </>
          )}

          <div className="admin-divider" />

          {/* Internal Notes */}
          <div className="section-label"><StickyNote size={11} /> Internal Notes</div>
          <textarea
            className="admin-textarea"
            placeholder="Add internal note for this order…"
            rows={3}
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={() => updateOrder(order.id, { internalNotes: note })}
          />

          {/* Status Progress */}
          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
            <>
              <div className="admin-divider" />
              <div className="section-label">Status Pipeline</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {(["PENDING", "CONFIRMED", "VENDOR_ASSIGNED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"] as OrderStatus[]).map((s) => {
                  const curr = STATUS_META[order.status]?.cls;
                  const past = !!(STATUS_META[s]?.label) && (ORDER_STEP_IDX[s] ?? 99) <= (ORDER_STEP_IDX[order.status] ?? 99);
                  return (
                    <span
                      key={s}
                      className={`status-step-btn ${s === order.status ? "current" : ""}`}
                      style={{ cursor: "default", opacity: past ? 1 : 0.4 }}
                    >
                      {STATUS_META[s]?.label}
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="drawer-footer">
          {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
            <button
              className="admin-btn admin-btn-danger admin-btn-sm"
              onClick={() => {
                if (window.confirm("Cancel this order?")) {
                  updateOrderStatus(order.id, "CANCELLED");
                  onClose();
                }
              }}
            >
              <X size={13} /> Cancel
            </button>
          )}
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Close</button>
          {nextStatus && (
            <button className="admin-btn admin-btn-primary" onClick={handleStatusPush}>
              Move to {STATUS_META[nextStatus]?.label}
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const ORDER_STEP_IDX: Record<string, number> = {
  PENDING: 0, CONFIRMED: 1, VENDOR_ASSIGNED: 2,
  PREPARING: 3, READY_FOR_PICKUP: 4, OUT_FOR_DELIVERY: 5, DELIVERED: 6, CANCELLED: -1,
};

// ── Orders Page ──────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { orders } = useAdmin();
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [paymentFilter, setPaymentFilter] = useState<"ALL" | "PAID" | "UNPAID">("ALL");

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !search ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search) ||
        o.deliveryArea.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
      const matchPayment = paymentFilter === "ALL" || o.paymentStatus === paymentFilter;
      return matchSearch && matchStatus && matchPayment;
    }).sort((a, b) => {
      const aIdx = ORDER_STEP_IDX[a.status] ?? 99;
      const bIdx = ORDER_STEP_IDX[b.status] ?? 99;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const totalRevenue = filtered.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.totalAmount, 0);
  const pendingCount = orders.filter(o => o.status === "PENDING").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} total orders · ৳{(totalRevenue / 1000).toFixed(1)}K filtered revenue</p>
        </div>
        <div className="page-actions">
          {pendingCount > 0 && (
            <a href="/dispatch">
              <button className="admin-btn admin-btn-amber">
                <div className="live-dot amber" style={{ width: "6px", height: "6px" }} />
                {pendingCount} Pending — Dispatch
              </button>
            </a>
          )}
          <button className="admin-btn admin-btn-secondary">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="tab-bar">
        {ALL_STATUSES.map(s => {
          const count = s === "ALL" ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              className={`tab-pill ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "ALL" ? "All Orders" : STATUS_META[s as OrderStatus]?.label || s}
              <span className="tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-wrap" style={{ flex: 1, minWidth: "220px" }}>
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search order #, customer name, phone, area…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-select"
          style={{ width: "160px" }}
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value as any)}
        >
          <option value="ALL">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid (COD)</option>
        </select>
        {(search || statusFilter !== "ALL" || paymentFilter !== "ALL") && (
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => { setSearch(""); setStatusFilter("ALL"); setPaymentFilter("ALL"); }}>
            <X size={13} /> Clear
          </button>
        )}
        <span style={{ fontSize: "0.78rem", color: "var(--text-3)", marginLeft: "auto" }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Delivery Area</th>
                <th>Slot</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Vendor</th>
                <th>Rider</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr
                  key={order.id}
                  className="clickable"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td>
                    <div className="mono" style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                      #{order.orderNumber}
                    </div>
                    <div style={{ fontSize: "0.70rem", color: "var(--text-3)", marginTop: "2px" }}>
                      {order.createdAt.split(",")[1]?.trim() || ""}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.84rem" }}>{order.customerName}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-3)", display: "flex", alignItems: "center", gap: "3px" }}>
                      <Phone size={9} /> {order.customerPhone}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.82rem" }}>
                      <MapPin size={11} color="var(--text-3)" /> {order.deliveryArea}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-2)", maxWidth: "140px" }}>
                      {order.deliverySlot}
                    </div>
                  </td>
                  <td>
                    <span className="mono" style={{ color: "var(--green-bright)", fontWeight: 700 }}>
                      ৳{order.totalAmount.toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${order.paymentStatus === "PAID" ? "success" : "warning"}`}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    {order.assignedVendorName
                      ? <span style={{ fontSize: "0.75rem", color: "var(--text-2)" }}>{order.assignedVendorName}</span>
                      : <span style={{ fontSize: "0.72rem", color: "var(--text-4)" }}>—</span>
                    }
                  </td>
                  <td>
                    {order.assignedRiderName
                      ? <span style={{ fontSize: "0.75rem", color: "var(--cyan)" }}>{order.assignedRiderName.split(" (")[0]}</span>
                      : <span style={{ fontSize: "0.72rem", color: "var(--text-4)" }}>—</span>
                    }
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No orders found</div>
              <div className="empty-state-desc">Try adjusting filters</div>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
