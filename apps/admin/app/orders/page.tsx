"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShoppingBag, Search, Plus, X, Save, Bike,
  MapPin, Clock, User, Phone, CreditCard, Package,
  ChevronRight, Check, AlertCircle, Printer,
  FileText, Edit3, Truck, RefreshCw,
  Volume2, BellRing,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminOrder, OrderStatus } from "@/types";

/* ── Helpers ──────────────────────────────────────────────── */
const STATUS_META: Record<OrderStatus, { label: string; color: string; cls: string; icon: React.ReactNode }> = {
  PENDING:          { label: "Pending",          color: "var(--amber)", cls: "warning", icon: <Clock size={11} /> },
  CONFIRMED:        { label: "Confirmed",        color: "var(--blue)",  cls: "info",    icon: <Check size={11} /> },
  PREPARING:        { label: "Preparing",        color: "var(--purple)",cls: "purple",  icon: <Package size={11} /> },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "var(--cyan)",  cls: "cyan",    icon: <Truck size={11} /> },
  DELIVERED:        { label: "Delivered",        color: "var(--green)", cls: "success", icon: <Check size={11} /> },
  CANCELLED:        { label: "Cancelled",        color: "var(--red)",   cls: "danger",  icon: <X size={11} /> },
};
const STATUS_ORDER: OrderStatus[] = ["PENDING","CONFIRMED","PREPARING","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"];
const PAY_STATUS: Record<string, { cls: string; label: string }> = {
  PAID:     { cls: "success", label: "Paid" },
  UNPAID:   { cls: "warning", label: "Unpaid" },
  REFUNDED: { cls: "info",    label: "Refunded" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return <span className={`status-badge ${m.cls}`}>{m.icon}{m.label}</span>;
}

/* ── Order Detail Drawer ───────────────────────────────────── */
function OrderDetailDrawer({
  order, onClose, onSave,
}: {
  order: AdminOrder;
  onClose: () => void;
  onSave: (id: string, updates: Partial<AdminOrder>) => void;
}) {
  const { riders, updateOrderStatus, assignRiderToOrder } = useAdmin();
  const [draft, setDraft] = useState({ ...order });
  const [dirty, setDirty] = useState(false);

  const update = (k: keyof AdminOrder, v: unknown) => {
    setDraft(d => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const handleStatusChange = (s: OrderStatus) => {
    update("status", s);
    updateOrderStatus(order.id, s);
    setDirty(false);
  };

  const handleRiderAssign = (riderId: string) => {
    const r = riders.find(rd => rd.id === riderId);
    if (!r) return;
    update("assignedRiderId", r.id);
    update("assignedRiderName", `${r.name} (${r.vehicleType})`);
    assignRiderToOrder(order.id, r.id, `${r.name} (${r.vehicleType})`);
  };

  const handleSave = () => {
    onSave(order.id, {
      customerAddress: draft.customerAddress,
      deliverySlot: draft.deliverySlot,
      paymentStatus: draft.paymentStatus,
      ...(draft.internalNotes !== undefined && { internalNotes: draft.internalNotes }),
    });
    setDirty(false);
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel">
        {/* Header */}
        <div className="drawer-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span className="mono" style={{ fontSize: "0.95rem", fontWeight: 700 }}>#{order.orderNumber}</span>
              <StatusBadge status={order.status} />
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>
              {order.createdAt} · {order.deliveryArea}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="admin-btn admin-btn-ghost admin-btn-icon"
              title="Print Invoice / Challan"
              onClick={() => window.open(`/orders/${order.orderNumber || order.id}/invoice`, "_blank")}
            >
              <Printer size={16} />
            </button>
            <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="drawer-body">

          {/* Status Pipeline */}
          <div style={{ marginBottom: "24px" }}>
            <div className="section-label">Update Order Status</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {STATUS_ORDER.map(s => (
                <button
                  key={s}
                  className={`status-step-btn ${draft.status === s ? "current" : ""}`}
                  onClick={() => handleStatusChange(s)}
                >
                  {STATUS_META[s].icon}
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: "20px" }}>
            <div className="section-label">Customer Information</div>
            <div style={{
              background: "var(--bg-raised)", border: "1px solid var(--border-1)",
              borderRadius: "var(--r-md)", padding: "14px",
            }}>
              <div className="detail-row">
                <span className="detail-label"><User size={12} style={{ display: "inline", marginRight: 4 }} />Name</span>
                <span className="detail-value" style={{ fontWeight: 700 }}>{order.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label"><Phone size={12} style={{ display: "inline", marginRight: 4 }} />Phone</span>
                <span className="detail-value mono">{order.customerPhone}</span>
              </div>
              <div className="detail-row" style={{ borderBottom: "none" }}>
                <span className="detail-label"><MapPin size={12} style={{ display: "inline", marginRight: 4 }} />Area</span>
                <span className="detail-value">{order.deliveryArea}</span>
              </div>
            </div>
          </div>

          {/* Editable Address */}
          <div style={{ marginBottom: "16px" }}>
            <label className="admin-label"><Edit3 size={11} style={{ display: "inline", marginRight: 4 }} />Delivery Address</label>
            <textarea
              className="admin-textarea"
              rows={2}
              value={draft.customerAddress}
              onChange={e => update("customerAddress", e.target.value)}
            />
          </div>

          {/* Delivery Slot */}
          <div style={{ marginBottom: "16px" }}>
            <label className="admin-label"><Clock size={11} style={{ display: "inline", marginRight: 4 }} />Delivery Slot</label>
            <select
              className="admin-select"
              value={draft.deliverySlot}
              onChange={e => update("deliverySlot", e.target.value)}
            >
              {["Morning (07:00 - 09:00 AM)", "Prime Morning (09:00 - 11:00 AM)", "Noon Express (12:00 - 02:00 PM)", "Afternoon (03:00 - 06:00 PM)", "Evening (06:00 - 08:30 PM)"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Payment Info */}
          <div style={{ marginBottom: "20px" }}>
            <div className="section-label">Payment Information</div>
            <div style={{
              background: "var(--bg-raised)", border: "1px solid var(--border-1)",
              borderRadius: "var(--r-md)", padding: "14px",
            }}>
              <div className="detail-row">
                <span className="detail-label"><CreditCard size={12} style={{ display: "inline", marginRight: 4 }} />Method</span>
                <span className="detail-value mono">{order.paymentMethod}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value" style={{ fontWeight: 800, color: "var(--green)", fontSize: "1rem" }}>
                  ৳{order.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="detail-row" style={{ borderBottom: "none" }}>
                <span className="detail-label">Payment Status</span>
                <select
                  className="admin-select"
                  style={{ width: "auto", padding: "4px 8px", fontSize: "0.78rem" }}
                  value={draft.paymentStatus}
                  onChange={e => update("paymentStatus", e.target.value)}
                >
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rider Assignment */}
          <div style={{ marginBottom: "20px" }}>
            <div className="section-label"><Bike size={11} style={{ display: "inline", marginRight: 4 }} />Rider Assignment</div>
            {draft.assignedRiderName ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--green-glass)", border: "1px solid var(--border-green)",
                borderRadius: "var(--r-md)", padding: "10px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--green)" }}>{draft.assignedRiderName}</span>
                </div>
                <button
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => update("assignedRiderName", undefined)}
                >
                  Change
                </button>
              </div>
            ) : (
              <select
                className="admin-select"
                onChange={e => handleRiderAssign(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>— Select Active Rider —</option>
                {riders.filter(r => r.status === "ACTIVE").map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} · {r.vehicleType} · {r.assignedHubName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sub-orders */}
          {order.subOrders.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div className="section-label">Vendor Sub-Orders</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {order.subOrders.map(sub => (
                  <div key={sub.id} style={{
                    background: "var(--bg-raised)", border: "1px solid var(--border-1)",
                    borderRadius: "var(--r-md)", padding: "12px 14px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.845rem", color: "var(--text-1)" }}>{sub.vendorName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{sub.itemsCount} items</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "var(--green)", fontFamily: "var(--font-mono)" }}>৳{sub.subtotal.toLocaleString()}</div>
                      <StatusBadge status={sub.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div>
            <label className="admin-label"><FileText size={11} style={{ display: "inline", marginRight: 4 }} />Internal Admin Notes</label>
            <textarea
              className="admin-textarea"
              rows={3}
              placeholder="Visible to internal staff only..."
              value={draft.internalNotes || ""}
              onChange={e => update("internalNotes", e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="drawer-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={!dirty}
            style={{ opacity: dirty ? 1 : 0.5 }}
          >
            <Save size={15} />
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Create Order Modal ────────────────────────────────────── */
function CreateOrderModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (data: Omit<AdminOrder, "id" | "createdAt" | "subOrders">) => void;
}) {
  const [form, setForm] = useState({
    orderNumber: `TB-${Math.floor(900000 + Math.random() * 99999)}`,
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    deliveryArea: "Dhanmondi",
    deliverySlot: "Morning (07:00 - 09:00 AM)",
    totalAmount: 0,
    paymentMethod: "COD" as const,
    paymentStatus: "UNPAID" as const,
    status: "PENDING" as const,
    internalNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(form);
    onClose();
  };

  const AREAS = ["Dhanmondi", "Gulshan", "Uttara", "Mirpur", "Mohammadpur", "Banani", "Rampura", "Badda"];
  const SLOTS = ["Morning (07:00 - 09:00 AM)", "Prime Morning (09:00 - 11:00 AM)", "Noon Express (12:00 - 02:00 PM)", "Afternoon (03:00 - 06:00 PM)", "Evening (06:00 - 08:30 PM)"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "600px" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-1)" }}>
              ➕ Create Manual Order
            </h2>
            <p style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "3px" }}>
              Admin-created order · ID: <span className="mono">{form.orderNumber}</span>
            </p>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Customer */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-label">Customer Name *</label>
              <input className="admin-input" type="text" required placeholder="Full Name"
                value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} />
            </div>
            <div>
              <label className="admin-label">Mobile Phone *</label>
              <input className="admin-input" type="tel" required placeholder="01XXXXXXXXX"
                value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="admin-label">Delivery Address *</label>
            <textarea className="admin-textarea" rows={2} required placeholder="House, Road, Apartment, Area..."
              value={form.customerAddress} onChange={e => setForm(f => ({ ...f, customerAddress: e.target.value }))} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-label">Delivery Area</label>
              <select className="admin-select" value={form.deliveryArea} onChange={e => setForm(f => ({ ...f, deliveryArea: e.target.value }))}>
                {AREAS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Delivery Slot</label>
              <select className="admin-select" value={form.deliverySlot} onChange={e => setForm(f => ({ ...f, deliverySlot: e.target.value }))}>
                {SLOTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div>
              <label className="admin-label">Total Amount (৳) *</label>
              <input className="admin-input" type="number" required min={0}
                value={form.totalAmount || ""} onChange={e => setForm(f => ({ ...f, totalAmount: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="admin-label">Payment Method</label>
              <select className="admin-select" value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value as any }))}>
                <option value="COD">COD (Cash on Delivery)</option>
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
                <option value="SSLCOMMERZ">SSLCommerz</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Payment Status</label>
              <select className="admin-select" value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value as any }))}>
                <option value="UNPAID">Unpaid</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="admin-label">Internal Notes</label>
            <textarea className="admin-textarea" rows={2} placeholder="Optional instructions or notes..."
              value={form.internalNotes} onChange={e => setForm(f => ({ ...f, internalNotes: e.target.value }))} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary">
              <Plus size={15} />
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page Content ─────────────────────────────────────── */
function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const { orders, updateOrder, createOrder, riders, newOrderAlert, dismissAlert, playTestSound } = useAdmin();

  const [search, setSearch]             = useState(searchParams.get("search") || "");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showCreate, setShowCreate]     = useState(false);

  // Sync URL search param on mount
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) setSearch(q);
  }, [searchParams]);

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  // Status tab counts
  const counts: Record<string, number> = { all: orders.length };
  STATUS_ORDER.forEach(s => { counts[s] = orders.filter(o => o.status === s).length; });

  const TABS = [
    { key: "all",              label: "All" },
    { key: "PENDING",          label: "Pending" },
    { key: "CONFIRMED",        label: "Confirmed" },
    { key: "PREPARING",        label: "Preparing" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED",        label: "Delivered" },
    { key: "CANCELLED",        label: "Cancelled" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Live Audio Order Notification Banner */}
      {newOrderAlert && (
        <div style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          border: "2px solid #34D399",
          padding: "16px 20px",
          borderRadius: "var(--r-lg)",
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
              <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>🔔 New Incoming Customer Order!</div>
              <div style={{ fontSize: "0.82rem", opacity: 0.9 }}>
                Order: <strong>{newOrderAlert.orderNumber}</strong> • {newOrderAlert.customerName} • ৳{newOrderAlert.totalAmount}
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
                borderRadius: "var(--r-sm)",
                fontSize: "0.78rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                cursor: "pointer",
              }}
            >
              <Volume2 size={15} /> Play Sound
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

      {/* ── Page Header ────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2 }}>
            Order Fulfillment & Control Center
          </h1>
          <p style={{ fontSize: "0.80rem", color: "var(--text-3)", marginTop: "3px" }}>
            Displaying {filteredOrders.length} orders · Rider assignment and live status pipeline
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={playTestSound}
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              color: "var(--green)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "7px 12px",
              borderRadius: "var(--r-sm)",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Volume2 size={14} /> Test Sound
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Create Manual Order
          </button>
        </div>
      </div>

      {/* ── Search + Status Tabs ───────────────────────────── */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div className="search-wrap" style={{ width: "280px" }}>
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search by Order ID, name, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ position: "absolute", right: "10px", color: "var(--text-3)", padding: "2px", display: "flex" }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="tab-bar" style={{ flex: 1, minWidth: 0 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`tab-pill ${filterStatus === tab.key ? "active" : ""}`}
              onClick={() => setFilterStatus(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{counts[tab.key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders Table ───────────────────────────────────── */}
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Delivery Area</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Rider</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "var(--text-3)" }}>
                  <AlertCircle size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.4 }} />
                  No orders match the current criteria
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className="order-row-clickable"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td>
                    <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--green)" }}>
                      {order.orderNumber}
                    </span>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-4)", marginTop: "1px" }}>
                      {order.subOrders.length} vendor{order.subOrders.length !== 1 ? "s" : ""}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "0.845rem", color: "var(--text-1)" }}>{order.customerName}</div>
                    <div style={{ fontSize: "0.74rem", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{order.customerPhone}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.82rem", color: "var(--text-2)" }}>
                      <MapPin size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                      {order.deliveryArea}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-4)", marginTop: "2px" }}>{order.deliverySlot}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
                      ৳{order.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${PAY_STATUS[order.paymentStatus]?.cls || "neutral"}`}>
                      {order.paymentMethod}
                    </span>
                    <div style={{ marginTop: "3px" }}>
                      <span className={`status-badge ${PAY_STATUS[order.paymentStatus]?.cls || "neutral"}`} style={{ fontSize: "0.65rem" }}>
                        {PAY_STATUS[order.paymentStatus]?.label}
                      </span>
                    </div>
                  </td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>
                    {order.assignedRiderName ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span className="live-dot" style={{ width: "6px", height: "6px" }} />
                        <span style={{ fontSize: "0.78rem", color: "var(--text-2)" }}>
                          {order.assignedRiderName.split(" ")[0]}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-4)" }}>—</span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{order.createdAt.split(",")[0]}</td>
                  <td>
                    <ChevronRight size={16} style={{ color: "var(--text-4)" }} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Order Detail Drawer ────────────────────────────── */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={(id, updates) => {
            updateOrder(id, updates);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* ── Create Order Modal ─────────────────────────────── */}
      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onCreate={data => { createOrder(data); }}
        />
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: "32px", textAlign: "center", color: "var(--text-3)" }}>Loading Orders...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
