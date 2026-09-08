"use client";

import React, { useState, useEffect } from "react";
import {
  Radio, MapPin, Phone, User, ShoppingBag, Store, Bike, X,
  Check, Clock, ChevronRight, Zap, Package, Truck, AlertTriangle,
  CheckCircle, Star, RefreshCw, ArrowRight,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminOrder, AdminVendor, AdminRider, OrderStatus } from "@/types";

// ── Status helpers ───────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, { label: string; cls: string; step: number }> = {
  PENDING:          { label: "Pending",        cls: "warning", step: 0 },
  CONFIRMED:        { label: "Confirmed",      cls: "info",    step: 1 },
  PROCESSING:       { label: "Processing",     cls: "info",    step: 1 },
  VENDOR_ASSIGNED:  { label: "Vendor Assigned",cls: "indigo",  step: 2 },
  PREPARING:        { label: "Preparing",      cls: "purple",  step: 3 },
  READY_FOR_PICKUP: { label: "Ready",          cls: "cyan",    step: 4 },
  OUT_FOR_DELIVERY: { label: "On Delivery",    cls: "cyan",    step: 5 },
  SHIPPED:          { label: "Shipped",        cls: "cyan",    step: 5 },
  DELIVERED:        { label: "Delivered",      cls: "success", step: 6 },
  CANCELLED:        { label: "Cancelled",      cls: "danger",  step: -1 },
  RETURNED:         { label: "Returned",       cls: "danger",  step: -1 },
};

const DISPATCH_STATUSES: OrderStatus[] = [
  "PENDING", "CONFIRMED", "VENDOR_ASSIGNED", "PREPARING",
  "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED",
];

// ── Assign Vendor Modal ──────────────────────────────────────────────────────

function AssignVendorModal({
  order, vendors, onAssign, onClose,
}: {
  order: AdminOrder;
  vendors: AdminVendor[];
  onAssign: (vendorId: string, vendorName: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const zoneVendors = vendors.filter(v =>
    v.status === "APPROVED" &&
    (v.area.toLowerCase().includes(order.deliveryArea.toLowerCase()) ||
     filter === "" ||
     v.nameEn.toLowerCase().includes(filter.toLowerCase()) ||
     v.area.toLowerCase().includes(filter.toLowerCase()))
  );

  const allVendors = vendors.filter(v =>
    v.status === "APPROVED" &&
    !zoneVendors.find(zv => zv.id === v.id) &&
    (filter === "" ||
     v.nameEn.toLowerCase().includes(filter.toLowerCase()) ||
     v.area.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wide" onClick={e => e.stopPropagation()} style={{ maxWidth: "720px" }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">🏪 Assign Vendor to Order</div>
            <div className="modal-subtitle">
              #{order.orderNumber} · {order.customerName} · {order.deliveryArea}
            </div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Order summary strip */}
        <div style={{
          background: "var(--bg-raised)", border: "1px solid var(--border-1)",
          borderRadius: "var(--r-md)", padding: "12px 16px",
          display: "flex", gap: "20px", marginBottom: "20px", flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
            <MapPin size={13} color="var(--text-3)" />
            <span style={{ color: "var(--text-3)" }}>Delivery Area:</span>
            <span style={{ fontWeight: 700, color: "var(--text-1)" }}>{order.deliveryArea}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
            <ShoppingBag size={13} color="var(--text-3)" />
            <span style={{ color: "var(--text-3)" }}>Amount:</span>
            <span className="mono" style={{ color: "var(--green-bright)", fontWeight: 700 }}>৳{order.totalAmount.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem" }}>
            <Clock size={13} color="var(--text-3)" />
            <span style={{ color: "var(--text-3)" }}>Slot:</span>
            <span style={{ fontWeight: 600, color: "var(--text-2)" }}>{order.deliverySlot}</span>
          </div>
        </div>

        {/* Search */}
        <div className="search-wrap" style={{ marginBottom: "16px" }}>
          <Store size={14} className="search-icon" />
          <input className="search-input" placeholder="Search vendors by name or area…"
            value={filter} onChange={e => setFilter(e.target.value)} />
        </div>

        {/* Zone vendors */}
        {zoneVendors.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div className="section-label">
              <MapPin size={11} /> Vendors in {order.deliveryArea}
            </div>
            <div className="vendor-picker-grid">
              {zoneVendors.map(v => (
                <VendorPickerCard key={v.id} vendor={v} selected={selected === v.id}
                  onSelect={() => setSelected(v.id === selected ? null : v.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Other vendors */}
        {(allVendors.length > 0 || filter) && (
          <div>
            <div className="section-label" style={{ color: "var(--text-4)" }}>
              Other Approved Vendors
            </div>
            <div className="vendor-picker-grid">
              {allVendors.map(v => (
                <VendorPickerCard key={v.id} vendor={v} selected={selected === v.id}
                  onSelect={() => setSelected(v.id === selected ? null : v.id)} />
              ))}
            </div>
          </div>
        )}

        {vendors.filter(v => v.status === "APPROVED").length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <div className="empty-state-title">No approved vendors</div>
            <div className="empty-state-desc">Approve vendors in the Vendors section first.</div>
          </div>
        )}

        <div className="modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="admin-btn admin-btn-primary"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              const v = vendors.find(x => x.id === selected);
              if (v) onAssign(v.id, v.nameEn);
              onClose();
            }}
          >
            <Store size={14} />
            Assign Vendor & Notify
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function VendorPickerCard({ vendor, selected, onSelect }: {
  vendor: AdminVendor; selected: boolean; onSelect: () => void;
}) {
  return (
    <div className={`vendor-picker-card ${selected ? "selected" : ""}`} onClick={onSelect}>
      {selected && (
        <div style={{
          position: "absolute", top: "8px", right: "8px",
          background: "var(--green)", borderRadius: "50%",
          width: "18px", height: "18px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Check size={10} color="#fff" />
        </div>
      )}
      <div className="vendor-picker-avatar">{vendor.nameEn[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "0.83rem", color: "var(--text-1)", marginBottom: "3px" }} className="truncate">
          {vendor.nameEn}
        </div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-3)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span><MapPin size={9} style={{ display: "inline", marginRight: "2px" }} />{vendor.area}</span>
          <span><Star size={9} style={{ display: "inline", marginRight: "2px" }} />{vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}</span>
          {vendor.activeOrders > 0 && (
            <span style={{ color: "var(--amber)" }}>{vendor.activeOrders} active orders</span>
          )}
        </div>
        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
          <span className="status-badge success" style={{ fontSize: "0.60rem" }}>APPROVED</span>
          <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
            {vendor.commissionRate}% comm.
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Assign Rider Modal ───────────────────────────────────────────────────────

function AssignRiderModal({
  order, riders, onAssign, onClose,
}: {
  order: AdminOrder;
  riders: AdminRider[];
  onAssign: (riderId: string, riderName: string) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const areaRiders = riders.filter(r =>
    (r.status === "ACTIVE") &&
    r.area.toLowerCase().includes(order.deliveryArea.toLowerCase())
  );
  const otherRiders = riders.filter(r => r.status === "ACTIVE" && !areaRiders.find(ar => ar.id === r.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "560px" }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">🏍️ Assign Rider</div>
            <div className="modal-subtitle">#{order.orderNumber} · {order.deliveryArea}</div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {areaRiders.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div className="section-label"><MapPin size={11} /> Riders in {order.deliveryArea}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {areaRiders.map(r => (
                <RiderSelectCard key={r.id} rider={r} selected={selected === r.id} onSelect={() => setSelected(r.id === selected ? null : r.id)} />
              ))}
            </div>
          </div>
        )}
        {otherRiders.length > 0 && (
          <div>
            <div className="section-label" style={{ color: "var(--text-4)" }}>Other Available Riders</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {otherRiders.slice(0, 5).map(r => (
                <RiderSelectCard key={r.id} rider={r} selected={selected === r.id} onSelect={() => setSelected(r.id === selected ? null : r.id)} />
              ))}
            </div>
          </div>
        )}
        {riders.filter(r => r.status === "ACTIVE").length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🏍️</div>
            <div className="empty-state-title">No active riders available</div>
          </div>
        )}

        <div className="modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" disabled={!selected}
            onClick={() => {
              if (!selected) return;
              const r = riders.find(x => x.id === selected);
              if (r) onAssign(r.id, `${r.name} (${r.vehicleType})`);
              onClose();
            }}>
            <Bike size={14} /> Assign Rider
          </button>
        </div>
      </div>
    </div>
  );
}

function RiderSelectCard({ rider, selected, onSelect }: { rider: AdminRider; selected: boolean; onSelect: () => void; }) {
  return (
    <div onClick={onSelect} style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "12px 14px",
      background: selected ? "var(--green-glass)" : "var(--bg-elevated)",
      border: `1.5px solid ${selected ? "var(--green)" : "var(--border-1)"}`,
      borderRadius: "var(--r-md)",
      cursor: "pointer",
      transition: "all var(--t-fast)",
    }}>
      <div style={{
        width: "38px", height: "38px", borderRadius: "50%",
        background: "linear-gradient(135deg, var(--cyan-glass), var(--blue-glass))",
        border: "1px solid var(--border-2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: "0.85rem", color: "var(--text-1)",
      }}>
        {rider.name[0]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "var(--text-1)" }}>{rider.name}</div>
        <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "2px" }}>
          {rider.area} · {rider.vehicleType} · ⭐ {rider.rating.toFixed(1)} · {rider.totalDeliveriesCompleted} deliveries
        </div>
      </div>
      {selected && <Check size={16} color="var(--green)" />}
    </div>
  );
}

// ── Dispatch Order Card ──────────────────────────────────────────────────────

function DispatchOrderCard({
  order,
  onConfirm,
  onAssignVendor,
  onAssignRider,
  onCancel,
}: {
  order: AdminOrder;
  onConfirm: () => void;
  onAssignVendor: () => void;
  onAssignRider: () => void;
  onCancel: () => void;
}) {
  const meta = STATUS_META[order.status] || { label: order.status, cls: "neutral", step: 0 };
  const isPending = order.status === "PENDING";
  const isConfirmed = order.status === "CONFIRMED";
  const isVendorAssigned = order.status === "VENDOR_ASSIGNED";
  const isPreparing = order.status === "PREPARING" || order.status === "READY_FOR_PICKUP";
  const isDelivering = order.status === "OUT_FOR_DELIVERY";
  const isDone = order.status === "DELIVERED" || order.status === "CANCELLED";

  return (
    <div className={`dispatch-card ${isPending ? "pending" : isConfirmed ? "confirmed" : isVendorAssigned || isPreparing ? "preparing" : isDelivering ? "delivering" : ""}`}>
      <div className={`card-accent-line`} style={{
        background: isPending ? "var(--amber)" : isConfirmed ? "var(--blue)" : isVendorAssigned ? "var(--indigo)" : isPreparing ? "var(--purple)" : isDelivering ? "var(--cyan)" : isDone ? "var(--green)" : "var(--text-3)",
      }} />
      <div style={{ padding: "16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {isPending && <div className="live-dot amber" />}
              <span className="mono" style={{ fontSize: "0.85rem", fontWeight: 700 }}>#{order.orderNumber}</span>
              <span className={`status-badge ${meta.cls}`}>{meta.label}</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "3px" }}>
              {order.createdAt} · {order.source}
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {!isDone && (
              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={onCancel} title="Cancel Order">
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Customer + Amount */}
        <div style={{
          background: "var(--bg-raised)", borderRadius: "var(--r-md)",
          padding: "10px 12px", marginBottom: "12px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--text-1)" }}>
              {order.customerName}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "2px", display: "flex", gap: "10px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <Phone size={10} /> {order.customerPhone}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <MapPin size={10} /> {order.deliveryArea}
              </span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: "1rem", fontWeight: 800, color: "var(--green-bright)" }}>
              ৳{order.totalAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>{order.paymentMethod}</div>
          </div>
        </div>

        {/* Delivery slot */}
        <div style={{
          fontSize: "0.75rem", color: "var(--text-3)",
          display: "flex", alignItems: "center", gap: "6px",
          marginBottom: "14px",
        }}>
          <Clock size={11} />
          Slot: <span style={{ color: "var(--text-2)", fontWeight: 600 }}>{order.deliverySlot}</span>
        </div>

        {/* Vendor assignment info */}
        {order.assignedVendorName && (
          <div style={{
            background: "var(--indigo-glass)", border: "1px solid var(--border-indigo)",
            borderRadius: "var(--r-md)", padding: "8px 12px", marginBottom: "10px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Store size={13} color="var(--indigo)" />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#A5B4FC" }}>
              {order.assignedVendorName}
            </span>
          </div>
        )}

        {/* Rider assignment info */}
        {order.assignedRiderName && (
          <div style={{
            background: "var(--cyan-glass)", border: "1px solid rgba(34,211,238,.3)",
            borderRadius: "var(--r-md)", padding: "8px 12px", marginBottom: "10px",
            display: "flex", alignItems: "center", gap: "8px",
          }}>
            <Bike size={13} color="var(--cyan)" />
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--cyan-bright)" }}>
              {order.assignedRiderName}
            </span>
          </div>
        )}

        {/* Action Buttons based on status */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {isPending && (
            <button className="admin-btn admin-btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={onConfirm}>
              <Phone size={13} /> Confirm Order
            </button>
          )}
          {isConfirmed && (
            <button className="admin-btn admin-btn-indigo" style={{ flex: 1, justifyContent: "center" }} onClick={onAssignVendor}>
              <Store size={13} /> Assign Vendor
              <ArrowRight size={12} />
            </button>
          )}
          {(isVendorAssigned && !order.assignedRiderName) && (
            <button className="admin-btn admin-btn-secondary" style={{ flex: 1, justifyContent: "center", opacity: 0.7 }}>
              <Package size={13} /> Waiting for Vendor…
            </button>
          )}
          {isPreparing && !order.assignedRiderId && (
            <button className="admin-btn admin-btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={onAssignRider}>
              <Bike size={13} /> Assign Rider
              <ArrowRight size={12} />
            </button>
          )}
          {isDelivering && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0" }}>
              <Truck size={14} color="var(--cyan)" />
              <span style={{ fontSize: "0.80rem", color: "var(--cyan)", fontWeight: 600 }}>
                En route to customer
              </span>
            </div>
          )}
          {isDone && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {order.status === "DELIVERED"
                ? <CheckCircle size={14} color="var(--green)" />
                : <X size={14} color="var(--red)" />
              }
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: order.status === "DELIVERED" ? "var(--green)" : "var(--red)" }}>
                {order.status === "DELIVERED" ? "Delivered successfully" : "Order cancelled"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Dispatch Page ───────────────────────────────────────────────────────

export default function DispatchPage() {
  const { orders, vendors, riders, confirmOrder, assignVendorToOrder, assignRiderToOrder, cancelOrder } = useAdmin();

  const [assignVendorOrder, setAssignVendorOrder] = useState<AdminOrder | null>(null);
  const [assignRiderOrder, setAssignRiderOrder] = useState<AdminOrder | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "CONFIRMED" | "VENDOR_ASSIGNED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DONE">("ALL");
  const [tick, setTick] = useState(0);

  // Tick every second for live display
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const pendingCount = orders.filter(o => o.status === "PENDING").length;
  const confirmedCount = orders.filter(o => o.status === "CONFIRMED").length;
  const activeCount = orders.filter(o => !["DELIVERED", "CANCELLED"].includes(o.status)).length;
  const deliveredToday = orders.filter(o => o.status === "DELIVERED").length;

  const filteredOrders = orders.filter(o => {
    if (filter === "ALL") return !["DELIVERED", "CANCELLED"].includes(o.status);
    if (filter === "DONE") return ["DELIVERED", "CANCELLED"].includes(o.status);
    return o.status === filter;
  }).sort((a, b) => {
    // Pending first, then by time
    const aStep = STATUS_META[a.status]?.step ?? 99;
    const bStep = STATUS_META[b.status]?.step ?? 99;
    if (aStep !== bStep) return aStep - bStep;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px",
              borderRadius: "var(--r-md)",
              background: pendingCount > 0 ? "var(--amber-glass)" : "var(--green-glass)",
              border: `1px solid ${pendingCount > 0 ? "var(--border-amber)" : "var(--border-green)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Radio size={18} color={pendingCount > 0 ? "var(--amber)" : "var(--green)"} />
            </div>
            <h1 className="page-title">Live Dispatch Center</h1>
          </div>
          <p className="page-subtitle">
            Real-time order routing: Confirm → Assign Vendor → Rider → Delivery
          </p>
        </div>
        <div className="page-actions">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "var(--green)", fontWeight: 600 }}>
            <span className="live-dot" style={{ width: "6px", height: "6px" }} />
            LIVE · refreshing
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px" }}>
        {[
          { label: "Pending Action", value: pendingCount, color: "var(--amber)", glow: "var(--amber-glass)", icon: AlertTriangle, urgent: pendingCount > 0 },
          { label: "Confirmed", value: confirmedCount, color: "var(--blue)", glow: "var(--blue-glass)", icon: Check, urgent: false },
          { label: "Active Pipeline", value: activeCount, color: "var(--indigo)", glow: "var(--indigo-glass)", icon: Zap, urgent: false },
          { label: "Delivered Today", value: deliveredToday, color: "var(--green)", glow: "var(--green-glass)", icon: CheckCircle, urgent: false },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="kpi-card" style={{ "--kpi-accent": stat.color, "--kpi-glow": stat.glow, padding: "16px 18px" } as React.CSSProperties}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-0)" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-3)", marginTop: "2px" }}>{stat.label}</div>
                </div>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "var(--r-md)",
                  background: stat.glow, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={17} color={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="tab-bar">
        {[
          { key: "ALL",             label: "Active Orders",    count: activeCount },
          { key: "PENDING",         label: "Pending",          count: pendingCount },
          { key: "CONFIRMED",       label: "Confirmed",        count: confirmedCount },
          { key: "VENDOR_ASSIGNED", label: "Vendor Assigned",  count: orders.filter(o => o.status === "VENDOR_ASSIGNED").length },
          { key: "PREPARING",       label: "Preparing",        count: orders.filter(o => o.status === "PREPARING" || o.status === "READY_FOR_PICKUP").length },
          { key: "OUT_FOR_DELIVERY",label: "On Delivery",      count: orders.filter(o => o.status === "OUT_FOR_DELIVERY").length },
          { key: "DONE",            label: "Completed",        count: orders.filter(o => ["DELIVERED", "CANCELLED"].includes(o.status)).length },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab-pill ${filter === tab.key ? "active" : ""}`}
            onClick={() => setFilter(tab.key as any)}
          >
            {tab.label}
            {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Dispatch Grid */}
      {filteredOrders.length === 0 ? (
        <div className="admin-card">
          <div className="empty-state">
            <div className="empty-state-icon">{filter === "DONE" ? "✅" : "📦"}</div>
            <div className="empty-state-title">
              {filter === "DONE" ? "No completed orders yet" : "No orders in this status"}
            </div>
            <div className="empty-state-desc">
              {filter === "PENDING" ? "Great! No orders are waiting for action." : "Check other tabs or wait for new orders."}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "16px",
        }}>
          {filteredOrders.map(order => (
            <DispatchOrderCard
              key={order.id}
              order={order}
              onConfirm={() => confirmOrder(order.id)}
              onAssignVendor={() => setAssignVendorOrder(order)}
              onAssignRider={() => setAssignRiderOrder(order)}
              onCancel={() => {
                if (window.confirm(`Cancel order #${order.orderNumber}?`)) cancelOrder(order.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Assign Vendor Modal */}
      {assignVendorOrder && (
        <AssignVendorModal
          order={assignVendorOrder}
          vendors={vendors}
          onAssign={(vId, vName) => {
            assignVendorToOrder(assignVendorOrder.id, vId, vName);
            setAssignVendorOrder(null);
          }}
          onClose={() => setAssignVendorOrder(null)}
        />
      )}

      {/* Assign Rider Modal */}
      {assignRiderOrder && (
        <AssignRiderModal
          order={assignRiderOrder}
          riders={riders}
          onAssign={(rId, rName) => {
            assignRiderToOrder(assignRiderOrder.id, rId, rName);
            setAssignRiderOrder(null);
          }}
          onClose={() => setAssignRiderOrder(null)}
        />
      )}

    </div>
  );
}
