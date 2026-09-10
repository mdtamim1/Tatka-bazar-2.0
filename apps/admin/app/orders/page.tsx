"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag, Search, X, Phone, MapPin, Clock,
  Store, Eye, Package, CreditCard, CheckCircle,
  ArrowRight, User, StickyNote, RefreshCw, Download,
  Plus, ShieldCheck, FileText, Check, Trash2, Calendar,
  Mail, Truck, Tag, ExternalLink, Printer, ChevronDown,
  AlertTriangle, Bike, Lock, MessageSquare, ArrowLeftRight,
  UserCog, History, UserCheck,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { AdminOrder, AdminVendor, AdminRider, OrderStatus, OrderItem, StaffMember, OrderHistoryEntry } from "@/types";
import { STOREFRONT_SYNC_QUEUE } from "@/lib/admin-data";

// ── Display Statuses & Normalized Mapping ─────────────────────────────────────

type DisplaySection =
  | "ALL"
  | "TODAY"
  | "PROCESSING"
  | "PENDING"
  | "SHIPPED"
  | "RIDER_ASSIGNED"
  | "DELIVERY_COMPLETED"
  | "CANCELED_RETURNED";

function normalizeSection(s: OrderStatus): DisplaySection {
  if (s === "PENDING") return "PENDING";
  if (s === "PROCESSING" || s === "CONFIRMED" || s === "PREPARING") return "PROCESSING";
  if (s === "SHIPPED" || s === "VENDOR_ASSIGNED" || s === "READY_FOR_PICKUP") return "SHIPPED";
  if (s === "OUT_FOR_DELIVERY") return "RIDER_ASSIGNED";
  if (s === "DELIVERED") return "DELIVERY_COMPLETED";
  if (s === "CANCELLED" || s === "RETURNED") return "CANCELED_RETURNED";
  return "ALL";
}

// ── Vendor Shift Modal (with Customer Area Match, Location Filter & Skip Option) ───────────────

// BD Location data for manual filter
const ADMIN_BD_DISTRICTS = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"];
const ADMIN_BD_THANAS: Record<string, string[]> = {
  "Dhaka": ["Mirpur", "Mohammadpur", "Dhanmondi", "Gulshan", "Uttara", "Motijheel", "Demra", "Badda", "Khilgaon", "Lalbagh"],
  "Chattogram": ["Kotwali", "Pahartali", "Hathazari", "Chandgaon"],
  "Sylhet": ["Kotwali", "Shah Poran"],
  "Rajshahi": ["Boalia", "Rajpara"],
  "Khulna": ["Sonadanga", "Khalishpur"],
  "Barishal": ["Kotwali", "Bandar"],
  "Rangpur": ["Kotwali", "Mithapukur"],
  "Mymensingh": ["Kotwali", "Trishal"],
};
const ADMIN_BD_BAZARS: Record<string, Record<string, string[]>> = {
  "Dhaka": {
    "Mirpur": ["Mirpur-1 Bazar", "Mirpur-10 Bazar", "Mirpur-11 Bazar", "Mirpur-12 Bazar", "Pallabi Bazar", "Kazipara Bazar"],
    "Mohammadpur": ["Mohammadpur Krishi Market", "Mohammadpur Town Hall Bazar", "Shyamoli Bazar", "Adabor Bazar"],
    "Dhanmondi": ["Dhanmondi Road 27 Bazar", "Jigatola Bazar", "Hazaribagh Bazar"],
    "Gulshan": ["Gulshan-1 Bazar", "Gulshan-2 Bazar", "Banani Bazar", "DOHS Bazar"],
    "Uttara": ["Uttara Sector-3 Bazar", "Uttara Sector-7 Bazar", "Uttara Sector-10 Bazar", "Abdullahpur Bazar"],
    "Motijheel": ["Motijheel Bazar", "Arambagh Bazar", "Fakirapool Bazar"],
    "Demra": ["Demra Bazar", "Jurain Bazar", "Shyampur Bazar"],
    "Badda": ["Badda Bazar", "Boro Beraid Bazar", "Satarkul Bazar"],
    "Khilgaon": ["Khilgaon Bazar", "Taltola Bazar", "Chowdhury Para Bazar"],
    "Lalbagh": ["Lalbagh Bazar", "Azimpur Bazar", "Newmarket Bazar"],
  },
};

function VendorShiftModal({
  order,
  vendors,
  onAssign,
  onSkip,
  onClose,
}: {
  order: AdminOrder;
  vendors: AdminVendor[];
  onAssign: (vendorIds: string[], mainVendorName: string) => void;
  onSkip: () => void;
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    order.assignedVendorId ? [order.assignedVendorId] : []
  );
  const [filter, setFilter] = useState("");
  // Manual location filter (overrides auto-detect)
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterThana, setFilterThana] = useState("");
  const [filterBazar, setFilterBazar] = useState("");
  const [showManualFilter, setShowManualFilter] = useState(false);

  const targetDistrict = filterDistrict || order.district || "Dhaka";
  const targetThana = filterThana || order.thana || "";
  const targetArea = filterBazar || order.areaNeighborhood || order.deliveryArea || "";

  const filterThanas = useMemo(() => ADMIN_BD_THANAS[filterDistrict] || [], [filterDistrict]);
  const filterBazars = useMemo(() => ADMIN_BD_BAZARS[filterDistrict]?.[filterThana] || [], [filterDistrict, filterThana]);

  // Filter vendors matching customer district, thana or area (or manual filter)
  const areaMatchedVendors = useMemo(() => {
    return vendors.filter(v => {
      if (v.status !== "APPROVED") return false;
      const q = filter.toLowerCase();
      if (q) {
        return (
          v.nameEn.toLowerCase().includes(q) ||
          (v.ownerName && v.ownerName.toLowerCase().includes(q)) ||
          v.area.toLowerCase().includes(q) ||
          (v.district && v.district.toLowerCase().includes(q)) ||
          (v.thana && v.thana.toLowerCase().includes(q))
        );
      }
      // Manual location filter takes precedence
      if (filterDistrict) {
        const matchDist = v.district && v.district.toLowerCase() === filterDistrict.toLowerCase();
        if (!matchDist) return false;
        if (filterThana && v.thana && v.thana.toLowerCase() !== filterThana.toLowerCase()) return false;
        if (filterBazar && v.area && !v.area.toLowerCase().includes(filterBazar.toLowerCase())) return false;
        return true;
      }
      // Auto-match with customer's address
      const matchDist = v.district && v.district.toLowerCase() === targetDistrict.toLowerCase();
      const matchThana = targetThana && v.thana && v.thana.toLowerCase() === targetThana.toLowerCase();
      const matchArea = targetArea && v.area && v.area.toLowerCase().includes(targetArea.toLowerCase());
      return matchDist || matchThana || matchArea || v.city.toLowerCase() === targetDistrict.toLowerCase();
    });
  }, [vendors, targetDistrict, targetThana, targetArea, filter, filterDistrict, filterThana, filterBazar]);

  // Other available vendors
  const otherVendors = useMemo(() => {
    return vendors.filter(v => v.status === "APPROVED" && !areaMatchedVendors.some(mv => mv.id === v.id));
  }, [vendors, areaMatchedVendors]);

  const toggleVendor = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isManualFiltering = !!(filterDistrict || filterThana || filterBazar);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "720px", background: "#141417", border: "1px solid #27272e" }}
      >
        <div className="modal-header" style={{ borderBottom: "1px solid #232328" }}>
          <div>
            <div className="modal-title" style={{ fontSize: "1.05rem", color: "#fff" }}>
              🏪 Shift Order to Area Vendors
            </div>
            <div className="modal-subtitle">
              Order #{order.orderNumber} · Customer Area:{" "}
              <strong style={{ color: "#f59e0b" }}>
                {targetArea ? `${targetArea}, ` : ""}
                {targetThana ? `${targetThana}, ` : ""}
                {targetDistrict}
              </strong>
            </div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {/* Search */}
          <div style={{ marginBottom: "10px" }}>
            <div className="search-wrap" style={{ width: "100%" }}>
              <Search size={14} className="search-icon" />
              <input
                className="search-input"
                placeholder="Search vendor by store name, owner name, or area..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Manual Location Filter Toggle */}
          <div style={{ marginBottom: 12 }}>
            <button
              type="button"
              onClick={() => { setShowManualFilter(v => !v); if (showManualFilter) { setFilterDistrict(""); setFilterThana(""); setFilterBazar(""); } }}
              style={{
                fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", background: "none",
                border: "1px solid #2d2d35", borderRadius: 6, padding: "5px 10px",
                color: isManualFiltering ? "#10b981" : "var(--text-3)",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <MapPin size={11} />
              {isManualFiltering ? `📍 Filtered: ${[filterBazar, filterThana, filterDistrict].filter(Boolean).join(", ")}` : "Manual Location Filter"}
              {isManualFiltering && <span style={{ marginLeft: 4, opacity: 0.7 }}>✕ Clear</span>}
            </button>

            {showManualFilter && !isManualFiltering && (
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {/* District */}
                <select
                  style={{ flex: 1, minWidth: 140, padding: "6px 10px", borderRadius: 6, background: "#1a1a1f", border: "1px solid #2d2d35", color: "#fff", fontSize: "0.78rem" }}
                  value={filterDistrict}
                  onChange={e => { setFilterDistrict(e.target.value); setFilterThana(""); setFilterBazar(""); }}
                >
                  <option value="">All Districts</option>
                  {ADMIN_BD_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {/* Thana */}
                {filterDistrict && (
                  <select
                    style={{ flex: 1, minWidth: 130, padding: "6px 10px", borderRadius: 6, background: "#1a1a1f", border: "1px solid #2d2d35", color: "#fff", fontSize: "0.78rem" }}
                    value={filterThana}
                    onChange={e => { setFilterThana(e.target.value); setFilterBazar(""); }}
                  >
                    <option value="">All Thanas</option>
                    {filterThanas.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}

                {/* Bazar */}
                {filterThana && filterBazars.length > 0 && (
                  <select
                    style={{ flex: 1, minWidth: 160, padding: "6px 10px", borderRadius: 6, background: "#1a1a1f", border: "1px solid #2d2d35", color: "#fff", fontSize: "0.78rem" }}
                    value={filterBazar}
                    onChange={e => setFilterBazar(e.target.value)}
                  >
                    <option value="">All Bazars</option>
                    {filterBazars.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                )}
              </div>
            )}
          </div>

          <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase" }}>
            📍 {isManualFiltering ? `Vendors in ${[filterBazar, filterThana, filterDistrict].filter(Boolean).join(", ")}` : `Vendors in Customer's Zone`} ({areaMatchedVendors.length} Found)
          </div>

          <div style={{ maxHeight: "310px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {areaMatchedVendors.map(v => {
              const isSelected = selectedIds.includes(v.id);
              const parcelsToday = v.parcelsToday ?? 14;
              const pendingCount = v.pendingOrdersCount ?? v.activeOrders ?? 0;

              return (
                <div
                  key={v.id}
                  className={`vendor-shift-card ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleVendor(v.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ cursor: "pointer", width: "16px", height: "16px" }}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                      alt={v.nameEn}
                      className="vendor-shift-avatar"
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.88rem", color: "#fff" }}>
                        {v.nameEn}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--text-3)", marginTop: "2px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span>👤 Owner: <strong style={{ color: "var(--text-1)" }}>{v.ownerName || v.contactName}</strong></span>
                        <span>📞 {v.phone}</span>
                      </div>
                      <div style={{ fontSize: "0.70rem", color: "var(--text-4)", marginTop: "2px" }}>
                        📍 {v.area}{v.thana ? `, ${v.thana}` : ""}{v.district ? `, ${v.district}` : ""} · Rating: ⭐ {v.rating > 0 ? v.rating.toFixed(1) : "New"}
                      </div>
                    </div>
                  </div>

                  {/* Vendor Activity Info */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
                    <span className="vendor-activity-pill parcels">
                      📦 {parcelsToday} parcels today
                    </span>
                    <span className="vendor-activity-pill pending">
                      ⏳ {pendingCount} pending orders
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Other Vendors fallback */}
            {areaMatchedVendors.length === 0 && (
              <div style={{ padding: "16px", textAlign: "center", color: "var(--text-3)", fontSize: "0.80rem" }}>
                {isManualFiltering
                  ? `No vendor found for selected location. Try a broader filter.`
                  : `No direct vendor matched in ${targetDistrict}. You can select from other city hubs below:`}
              </div>
            )}

            {!isManualFiltering && otherVendors.slice(0, 3).map(v => {
              const isSelected = selectedIds.includes(v.id);
              return (
                <div
                  key={v.id}
                  className={`vendor-shift-card ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleVendor(v.id)}
                  style={{ opacity: 0.85 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                      alt={v.nameEn}
                      className="vendor-shift-avatar"
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#fff" }}>{v.nameEn}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                        {v.ownerName || v.contactName} · {v.phone}
                      </div>
                    </div>
                  </div>
                  <span className="vendor-activity-pill parcels">
                    📦 {v.parcelsToday || 10} today
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: "1px solid #232328", padding: "14px 22px", display: "flex", justifyContent: "space-between" }}>
          {/* Skip Button for Rush Hours */}
          <button
            type="button"
            className="btn-bulk-process"
            style={{ border: "1px dashed #64748b" }}
            onClick={() => {
              onSkip();
              onClose();
            }}
          >
            ⏭️ Skip for Now (Shift Status Only)
          </button>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-create-order-amber"
              disabled={selectedIds.length === 0}
              onClick={() => {
                const mainVendor = vendors.find(x => x.id === selectedIds[0]);
                onAssign(selectedIds, mainVendor?.nameEn || "Assigned Vendor");
                onClose();
              }}
            >
              <Store size={14} /> Assign &amp; Shift ({selectedIds.length} Selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reassign Staff Modal ──────────────────────────────────────────────────────

function ReassignStaffModal({
  order,
  staffList,
  onReassign,
  onClose,
}: {
  order: AdminOrder;
  staffList: StaffMember[];
  onReassign: (staffMember: StaffMember) => void;
  onClose: () => void;
}) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>(order.assignedStaffId || "");

  // Only active staff with verified KYC
  const eligibleStaff = useMemo(() => {
    return staffList.filter(s => s.status === "ACTIVE" && s.kycStatus === "VERIFIED");
  }, [staffList]);

  const handleConfirm = () => {
    const target = eligibleStaff.find(s => s.id === selectedStaffId);
    if (!target) {
      alert("Please select a staff member to reassign this order.");
      return;
    }
    onReassign(target);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "560px", background: "#141418", border: "1px solid #282834" }}>
        <div className="modal-header" style={{ borderBottom: "1px solid #232328" }}>
          <div>
            <div className="modal-title" style={{ color: "#fff", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <UserCog size={18} color="#818cf8" /> Reassign Order to Staff
            </div>
            <div className="modal-subtitle">
              Order #{order.orderNumber} · Customer: <strong>{order.customerName}</strong>
            </div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "18px 22px" }}>
          {/* Current Assignee Banner */}
          <div style={{
            background: "#181822",
            border: "1px solid #282834",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>CURRENT ASSIGNED STAFF:</span>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, color: order.assignedStaffName ? "#38bdf8" : "#94a3b8" }}>
              {order.assignedStaffName || "Not Assigned"}
            </span>
          </div>

          <label className="admin-label">Select Staff Member</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "320px", overflowY: "auto", marginTop: "8px" }}>
            {eligibleStaff.map(member => {
              const isSelected = selectedStaffId === member.id;
              const online = member.dailySession.isCurrentlyOnline;

              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedStaffId(member.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "8px",
                    background: isSelected ? "rgba(99, 102, 241, 0.15)" : "#18181f",
                    border: isSelected ? "1.5px solid #818cf8" : "1px solid #262632",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={member.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                      alt={member.name}
                      style={{ width: "36px", height: "36px", borderRadius: "8px", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.86rem", color: "#fff", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{member.name}</span>
                        <span className={online ? "online-beacon" : "offline-beacon"} />
                        <span style={{ fontSize: "0.68rem", color: online ? "#34d399" : "var(--text-4)", fontWeight: 600 }}>
                          {online ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "1px" }}>
                        {member.role.replace("_", " ")} · {member.department}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.70rem", color: "var(--text-4)" }}>Today&apos;s Orders</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#38bdf8" }}>
                      {member.ordersCollectedToday}
                    </div>
                  </div>
                </div>
              );
            })}

            {eligibleStaff.length === 0 && (
              <div style={{ padding: "16px", textAlign: "center", color: "var(--text-4)", fontSize: "0.78rem" }}>
                No active KYC-verified staff found.
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: "1px solid #232328" }}>
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-create-order-amber" onClick={handleConfirm}>
            <Check size={14} /> Confirm Reassignment
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Order Details Modal (with Vendor / Rider Live Tracking) ───────────────

function EditOrderModal({
  order,
  isReadOnly,
  onClose,
  onSave,
  onOpenVendorShift,
}: {
  order: AdminOrder;
  isReadOnly?: boolean;
  onClose: () => void;
  onSave: (updated: Partial<AdminOrder>) => void;
  onOpenVendorShift: () => void;
}) {
  const { products, currentUser } = useAdmin();

  const [storeName, setStoreName] = useState(order.storeName || "Tatka Bazar");
  const [invoiceNumber, setInvoiceNumber] = useState(order.orderNumber || "");
  const [customerName, setCustomerName] = useState(order.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone || "");
  const [email, setEmail] = useState(order.email || `guest_${order.customerPhone}@tatkabazar.com`);
  const [customerAddress, setCustomerAddress] = useState(order.customerAddress || "");
  const [courier, setCourier] = useState(order.courier || "Pathao");
  const [status, setStatus] = useState<OrderStatus>(order.status || "PROCESSING");
  const [orderDate, setOrderDate] = useState(
    order.createdAt?.split(",")[0]?.trim() || new Date().toISOString().slice(0, 10)
  );
  const [assignedModerator, setAssignedModerator] = useState(order.assignedModerator || "Super Admin (Default)");
  const [district, setDistrict] = useState(order.district || order.deliveryArea || "Dhaka");
  const [thana, setThana] = useState(order.thana || "Uttara");
  const [areaNeighborhood, setAreaNeighborhood] = useState(order.areaNeighborhood || "Doutola");
  const [customerNote, setCustomerNote] = useState(order.customerNote || "");
  const [shopNote, setShopNote] = useState(order.shopNote || "");

  // Products and Calculation states
  const [items, setItems] = useState<OrderItem[]>(
    order.items && order.items.length > 0
      ? order.items
      : [
          {
            id: "default-item",
            name: "Fresh Farm Produce Basket",
            sku: "TB-1000",
            size: "1 Basket",
            price: 250,
            quantity: 1,
          },
        ]
  );
  const [productSearch, setProductSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod || "bKash");
  const [memoTransactionNo, setMemoTransactionNo] = useState(order.memoTransactionNo || "8D3F9");
  const [deliveryCharge, setDeliveryCharge] = useState<number>(order.deliveryCharge ?? 120);
  const [couponCode, setCouponCode] = useState(order.couponCode || "");
  const [manualDiscount, setManualDiscount] = useState<number>(order.discountAmount ?? 0);
  const [paidAmount, setPaidAmount] = useState<number>(order.paidAmount ?? 0);

  const subTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  }, [items]);

  const total = useMemo(() => {
    return Math.max(0, subTotal + Number(deliveryCharge || 0) - Number(manualDiscount || 0));
  }, [subTotal, deliveryCharge, manualDiscount]);

  const QUICK_CHIPS = [
    "Urgent delivery request",
    "Handle with care",
    "Gift wrap please",
    "Call before delivery",
  ];

  const handleAddChip = (chip: string) => {
    if (isReadOnly) return;
    setShopNote(prev => (prev ? `${prev}, ${chip}` : chip));
  };

  const handleQty = (idx: number, delta: number) => {
    if (isReadOnly) return;
    setItems(prev =>
      prev
        .map((it, i) => {
          if (i !== idx) return it;
          const newQty = it.quantity + delta;
          return newQty > 0 ? { ...it, quantity: newQty } : null;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (idx: number) => {
    if (isReadOnly) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSelectProduct = (prod: any) => {
    if (isReadOnly) return;
    setItems(prev => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        name: prod.nameEn,
        sku: prod.sku,
        size: prod.baseUnit || "1 unit",
        price: prod.basePrice,
        quantity: 1,
      },
    ]);
    setProductSearch("");
  };

  const filteredCatalog = useMemo(() => {
    if (!productSearch.trim()) return [];
    return products.filter(
      p =>
        p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch, products]);

  const handleSave = () => {
    if (isReadOnly) return;
    const auditEntry: OrderHistoryEntry = {
      id: `hist-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      actorName: currentUser?.name || "Admin",
      actorRole: currentUser?.role || "SUPER_ADMIN",
      action: "NOTE_ADDED",
      details: `${currentUser?.name || "Admin"} updated order details (Status: ${status}, Total: ৳${total})`,
    };

    onSave({
      storeName,
      orderNumber: invoiceNumber,
      customerName,
      customerPhone,
      email,
      customerAddress,
      courier,
      status,
      assignedModerator,
      district,
      thana,
      areaNeighborhood,
      customerNote,
      shopNote,
      items,
      subtotalAmount: subTotal,
      deliveryCharge,
      couponCode,
      discountAmount: manualDiscount,
      paidAmount,
      memoTransactionNo,
      totalAmount: total,
      paymentMethod,
      orderHistory: [auditEntry, ...(order.orderHistory || [])],
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div className="edit-order-modal-dialog" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="edit-order-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#818cf8",
              }}
            >
              <Eye size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Edit Order Details</span>
                {isReadOnly && (
                  <span style={{ fontSize: "0.68rem", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                    🔒 Staff Read-Only
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                Modify order settings, customer data, and item quantities
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className={`table-status-pill status-${status.toLowerCase()}`} style={{ paddingRight: "10px", backgroundImage: "none", cursor: "default" }}>
              {status}
            </span>
            <span style={{ background: "#1c1c22", border: "1px solid #2e2e38", color: "var(--text-2)", fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px", borderRadius: "5px" }}>
              {invoiceNumber}
            </span>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", padding: "4px", display: "flex" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="edit-order-modal-body">
          {/* Left Column: Form Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Row 1: Store & Invoice */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
              <div>
                <label className="order-form-label">Store Name</label>
                <input
                  disabled={isReadOnly}
                  className="order-form-input"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                />
              </div>
              <div>
                <label className="order-form-label">Invoice Number</label>
                <div className="order-form-input-with-icon">
                  <input
                    disabled={isReadOnly}
                    className="order-form-input"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    style={{ paddingRight: "26px" }}
                  />
                  <span style={{ position: "absolute", right: "10px", color: "var(--text-4)", fontSize: "0.8rem" }}>#</span>
                </div>
              </div>
            </div>

            {/* Row 2: Customer */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "10px" }}>
              <div>
                <label className="order-form-label">Customer Name *</label>
                <div className="order-form-input-with-icon">
                  <User size={12} className="order-form-input-icon" />
                  <input
                    disabled={isReadOnly}
                    className="order-form-input"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="order-form-label">Customer Phone *</label>
                <div className="order-form-input-with-icon">
                  <Phone size={12} className="order-form-input-icon" />
                  <input
                    disabled={isReadOnly}
                    className="order-form-input"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="order-form-label">Email / Gmail</label>
                <div className="order-form-input-with-icon">
                  <Mail size={12} className="order-form-input-icon" />
                  <input
                    disabled={isReadOnly}
                    className="order-form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Address */}
            <div>
              <label className="order-form-label">Customer Address</label>
              <div className="order-form-input-with-icon" style={{ alignItems: "flex-start" }}>
                <MapPin size={12} className="order-form-input-icon" style={{ top: "10px" }} />
                <textarea
                  disabled={isReadOnly}
                  className="order-form-input"
                  style={{ minHeight: "44px", paddingLeft: "28px", resize: "vertical" }}
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Row 4: Courier, Status, Date, Moderator */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr", gap: "10px" }}>
              <div>
                <label className="order-form-label">Courier</label>
                <select
                  disabled={isReadOnly}
                  className="order-form-input"
                  value={courier}
                  onChange={e => setCourier(e.target.value)}
                >
                  <option value="Pathao">Pathao</option>
                  <option value="Steadfast">Steadfast</option>
                  <option value="Tatka Express">Tatka Express</option>
                  <option value="Vendor Direct">Vendor Direct</option>
                </select>
              </div>
              <div>
                <label className="order-form-label">Order Status</label>
                <select
                  disabled={isReadOnly || status === "OUT_FOR_DELIVERY" || status === "DELIVERED"}
                  className="order-form-input"
                  value={status}
                  onChange={e => setStatus(e.target.value as OrderStatus)}
                >
                  <option value="PROCESSING">Processing</option>
                  <option value="PENDING">Pending</option>
                  <option value="SHIPPED">Shipped</option>
                  {status === "OUT_FOR_DELIVERY" && (
                    <option value="OUT_FOR_DELIVERY">Rider Assigned (Automated)</option>
                  )}
                  {status === "DELIVERED" && (
                    <option value="DELIVERED">Delivery Completed (Automated)</option>
                  )}
                  <option value="CANCELLED">Canceled &amp; Returned</option>
                </select>
              </div>
              <div>
                <label className="order-form-label">Order Date</label>
                <div className="order-form-input-with-icon">
                  <Calendar size={12} className="order-form-input-icon" />
                  <input
                    disabled={isReadOnly}
                    type="text"
                    className="order-form-input"
                    value={orderDate}
                    onChange={e => setOrderDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="order-form-label">Assigned Moderator</label>
                <select
                  disabled={isReadOnly}
                  className="order-form-input"
                  value={assignedModerator}
                  onChange={e => setAssignedModerator(e.target.value)}
                >
                  <option value="Super Admin (Default)">Super Admin (Default)</option>
                  <option value="Operations Lead">Operations Lead</option>
                  <option value="Support Agent">Support Agent</option>
                </select>
              </div>
            </div>

            {/* Row 5: District, Thana, Area */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label className="order-form-label">District</label>
                <select
                  disabled={isReadOnly}
                  className="order-form-input"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                >
                  <option value="Barguna">Barguna</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barishal">Barishal</option>
                  <option value="Sylhet">Sylhet</option>
                </select>
              </div>
              <div>
                <label className="order-form-label">Thana / Upazila</label>
                <input
                  disabled={isReadOnly}
                  className="order-form-input"
                  value={thana}
                  onChange={e => setThana(e.target.value)}
                />
              </div>
              <div>
                <label className="order-form-label">Area / Neighborhood</label>
                <input
                  disabled={isReadOnly}
                  className="order-form-input"
                  value={areaNeighborhood}
                  onChange={e => setAreaNeighborhood(e.target.value)}
                />
              </div>
            </div>

            {/* Row 6: Notes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "10px" }}>
              <div>
                <label className="order-form-label">Customer Note</label>
                <textarea
                  disabled={isReadOnly}
                  className="order-form-input"
                  rows={3}
                  value={customerNote}
                  onChange={e => setCustomerNote(e.target.value)}
                />
              </div>
              <div>
                <label className="order-form-label">Shop Note</label>
                <textarea
                  disabled={isReadOnly}
                  className="order-form-input"
                  rows={3}
                  value={shopNote}
                  onChange={e => setShopNote(e.target.value)}
                />
                {!isReadOnly && (
                  <div className="order-note-chips">
                    {QUICK_CHIPS.map(chip => (
                      <button
                        key={chip}
                        type="button"
                        className="order-note-chip"
                        onClick={() => handleAddChip(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Live Vendor & Rider Tracking Card ── */}
            <div style={{ background: "#17171d", border: "1px solid #282832", borderRadius: "10px", padding: "14px", marginTop: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.82rem", color: "#fff" }}>
                  <Store size={14} color="#f59e0b" />
                  <span>Assigned Vendor &amp; Handover</span>
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-indigo admin-btn-sm"
                    onClick={onOpenVendorShift}
                    style={{ fontSize: "0.72rem", padding: "3px 8px" }}
                  >
                    Change / Shift Vendor
                  </button>
                )}
              </div>

              {order.assignedVendorName ? (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#1c1c24", padding: "10px 12px", borderRadius: "8px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.vendorAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                    alt={order.assignedVendorName}
                    style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#fff" }}>{order.assignedVendorName}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-3)" }}>
                      Owner: {order.vendorOwnerName || "Vendor Lead"} · Phone: {order.vendorPhone || "01700-123456"}
                    </div>
                  </div>
                  <span className="vendor-activity-pill parcels">
                    Handover: {order.vendorHandoverAt || "In Preparation"}
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: "0.76rem", color: "#f59e0b", padding: "8px", background: "rgba(245, 158, 11, 0.08)", borderRadius: "6px" }}>
                  ⚠️ No vendor assigned yet. Click &quot;Change / Shift Vendor&quot; above to assign.
                </div>
              )}

              {/* Rider Section if assigned */}
              {order.assignedRiderName && (
                <div style={{ marginTop: "12px", borderTop: "1px solid #23232b", paddingTop: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "0.80rem", color: "#38bdf8", marginBottom: "8px" }}>
                    <Bike size={13} /> Assigned Rider Live Tracking
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#1c1c24", padding: "8px 12px", borderRadius: "8px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.riderAvatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"}
                      alt={order.assignedRiderName}
                      style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#fff" }}>{order.assignedRiderName}</div>
                      <div style={{ fontSize: "0.70rem", color: "var(--text-3)" }}>
                        📞 {order.riderPhone || "01811-223344"} · Status: <span style={{ color: "#38bdf8" }}>{order.riderTrackingStatus || "En route to customer"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── SteadFast Courier-Style Tracking Timeline & Rider Notes ── */}
            <div style={{ background: "#17171d", border: "1px solid #282832", borderRadius: "10px", padding: "14px", marginTop: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.84rem", color: "#fff" }}>
                  <Truck size={14} color="#00D68F" />
                  <span>লাইভ অর্ডার ট্র্যাকিং ও ডেলিভারি টাইমলাইন (SteadFast Style)</span>
                </div>
                <span style={{ fontSize: "0.68rem", color: "#00D68F", background: "rgba(0,214,143,0.12)", border: "1px solid rgba(0,214,143,0.3)", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                  কাস্টমার লাইভ ট্র্যাকিং
                </span>
              </div>

              {/* 6-Stage Visual Stepper */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px", marginBottom: "14px" }}>
                {[
                  {
                    step: 1,
                    title: "অর্ডার গ্রহণ",
                    sub: "Placed",
                    done: true,
                    active: status === "PENDING",
                  },
                  {
                    step: 2,
                    title: "প্রসেসিং",
                    sub: "Confirmed",
                    done: ["CONFIRMED", "PROCESSING", "VENDOR_ASSIGNED", "PREPARING", "READY_FOR_PICKUP", "ASSIGNED", "OUT_FOR_DELIVERY", "ON_THE_WAY", "DELIVERED"].includes(String(status).toUpperCase()),
                    active: status === "PROCESSING" || status === "CONFIRMED",
                  },
                  {
                    step: 3,
                    title: "ভেন্ডর",
                    sub: "Sent to Vendor",
                    done: ["VENDOR_ASSIGNED", "PREPARING", "READY_FOR_PICKUP", "ASSIGNED", "OUT_FOR_DELIVERY", "ON_THE_WAY", "DELIVERED"].includes(String(status).toUpperCase()) || !!order.assignedVendorName,
                    active: (status as string) === "VENDOR_ASSIGNED" || (status as string) === "PREPARING" || (status as string) === "READY_FOR_PICKUP",
                  },
                  {
                    step: 4,
                    title: "রাইডার",
                    sub: "Assigned",
                    done: ["ASSIGNED", "OUT_FOR_DELIVERY", "ON_THE_WAY", "DELIVERED"].includes(String(status).toUpperCase()) || !!order.assignedRiderName,
                    active: (status as string) === "ASSIGNED",
                  },
                  {
                    step: 5,
                    title: "ডেলিভারির পথে",
                    sub: "On The Way",
                    done: ["OUT_FOR_DELIVERY", "ON_THE_WAY", "DELIVERED"].includes(String(status).toUpperCase()),
                    active: (status as string) === "OUT_FOR_DELIVERY" || (status as string) === "ON_THE_WAY",
                  },
                  {
                    step: 6,
                    title: "সম্পন্ন",
                    sub: "Delivered",
                    done: String(status).toUpperCase() === "DELIVERED",
                    active: String(status).toUpperCase() === "DELIVERED",
                  },
                ].map((st) => (
                  <div
                    key={st.step}
                    style={{
                      background: st.active ? "rgba(0,214,143,0.15)" : st.done ? "rgba(255,255,255,0.04)" : "#131317",
                      border: `1px solid ${st.active ? "#00D68F" : st.done ? "rgba(0,214,143,0.3)" : "#23232b"}`,
                      borderRadius: "8px",
                      padding: "8px 4px",
                      textAlign: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        margin: "0 auto 4px",
                        background: st.active ? "#00D68F" : st.done ? "rgba(0,214,143,0.2)" : "#1c1c24",
                        color: st.active ? "#04140e" : st.done ? "#00D68F" : "var(--text-4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.68rem",
                        fontWeight: 800,
                      }}
                    >
                      {st.done && !st.active ? "✓" : st.step}
                    </div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: st.active ? "#00D68F" : st.done ? "#fff" : "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: "0.58rem", color: "var(--text-4)", whiteSpace: "nowrap" }}>
                      {st.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rider Delivery Notes Section */}
              <div style={{ borderTop: "1px solid #23232b", paddingTop: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: 700, color: "#38bdf8" }}>
                    <MessageSquare size={13} /> রাইডারের ডেলিভারি নোট ও কাস্টমার আপডেট
                  </div>
                  <span style={{ fontSize: "0.66rem", color: "var(--text-4)" }}>
                    Rider Portal Note Sync
                  </span>
                </div>

                {order.riderNotes && order.riderNotes.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {order.riderNotes.map((rn: any, idx: number) => (
                      <div
                        key={rn.id || idx}
                        style={{
                          background: "#1c1c24",
                          borderLeft: "3px solid #38bdf8",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.78rem", color: "#fff", fontWeight: 600 }}>
                            💬 {rn.note}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "var(--text-4)", marginTop: "2px" }}>
                            প্রেরক: {rn.riderName || order.assignedRiderName || "রাইডার"}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-3)", whiteSpace: "nowrap" }}>
                          {rn.createdAt
                            ? new Date(rn.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
                            : "সাম্প্রতিক"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : order.riderNote ? (
                  <div
                    style={{
                      background: "#1c1c24",
                      borderLeft: "3px solid #38bdf8",
                      padding: "8px 12px",
                      borderRadius: "6px",
                    }}
                  >
                    <div style={{ fontSize: "0.78rem", color: "#fff", fontWeight: 600 }}>
                      💬 {order.riderNote}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-4)", marginTop: "2px" }}>
                      প্রেরক: {order.assignedRiderName || "রাইডার"}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: "0.72rem", color: "var(--text-4)", fontStyle: "italic", padding: "6px 0" }}>
                    রাইডার এখনো কোনো ডেলিভারি নোট প্রদান করেননি। রাইডার অ্যাপ থেকে নোট দিলে এখানে সরাসরি আপডেট দেখা যাবে।
                  </div>
                )}
              </div>
            </div>

            {/* Order Activity & Assignment History */}
            <div className="order-history-box" style={{ marginTop: "14px" }}>
              <div className="order-history-title">
                <History size={13} style={{ color: "#38bdf8" }} /> Order Activity &amp; Assignment History
              </div>
              {order.orderHistory && order.orderHistory.length > 0 ? (
                order.orderHistory.map((item) => (
                  <div key={item.id} className="order-history-item">
                    <div className="order-history-bullet" />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="order-history-actor">{item.actorName}</span>
                        <span className="order-history-time">{item.timestamp}</span>
                      </div>
                      <div className="order-history-text">{item.details}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "0.72rem", color: "var(--text-4)", fontStyle: "italic", padding: "6px 0" }}>
                  No historical activity logged yet for this order.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Products & Calculation */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label className="order-form-label">Add Products</label>
            {!isReadOnly && (
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "10px", color: "var(--text-4)" }} />
                <input
                  className="order-form-input"
                  style={{ paddingLeft: "30px" }}
                  placeholder="Search product name..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />

                {filteredCatalog.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      background: "#1c1c22",
                      border: "1px solid #2e2e38",
                      borderRadius: "7px",
                      zIndex: 20,
                      maxHeight: "180px",
                      overflowY: "auto",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      marginTop: "4px",
                    }}
                  >
                    {filteredCatalog.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p)}
                        style={{
                          padding: "8px 12px",
                          borderBottom: "1px solid #282830",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{p.nameEn}</span>
                        <span className="mono" style={{ color: "#f59e0b" }}>৳{p.basePrice}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 90px 70px 30px",
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "var(--text-4)",
                textTransform: "uppercase",
                padding: "0 8px 6px",
              }}
            >
              <span>Product / Size</span>
              <span style={{ textAlign: "center" }}>Qty</span>
              <span style={{ textAlign: "right" }}>Price</span>
              <span></span>
            </div>

            {/* Product Items List */}
            <div style={{ maxHeight: "160px", overflowY: "auto", marginBottom: "14px" }}>
              {items.map((it, idx) => (
                <div key={it.id || idx} className="order-product-row">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#fff" }} className="truncate">
                      {it.name}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-4)" }}>
                      -- {it.sku || "TB-1000"} {it.size ? `· ${it.size}` : ""}
                    </div>
                  </div>

                  {/* Qty */}
                  <div className="order-qty-adjuster">
                    <button disabled={isReadOnly} type="button" className="order-qty-btn" onClick={() => handleQty(idx, -1)}>
                      -
                    </button>
                    <span className="order-qty-val">{it.quantity}</span>
                    <button disabled={isReadOnly} type="button" className="order-qty-btn" onClick={() => handleQty(idx, 1)}>
                      +
                    </button>
                  </div>

                  <div className="mono" style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", textAlign: "right" }}>
                    ৳{it.price * it.quantity}
                  </div>

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      style={{ background: "transparent", border: "none", color: "var(--text-4)", cursor: "pointer", padding: "2px" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Payment & Trx */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div>
                <label className="order-form-label">Payment Method</label>
                <select
                  disabled={isReadOnly}
                  className="order-form-input"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="COD">COD</option>
                </select>
              </div>
              <div>
                <label className="order-form-label">Memo / Transaction No</label>
                <input
                  disabled={isReadOnly}
                  className="order-form-input"
                  value={memoTransactionNo}
                  onChange={e => setMemoTransactionNo(e.target.value)}
                />
              </div>
            </div>

            {/* Calculations */}
            <div className="order-calc-card">
              <div className="order-calc-row">
                <span>Sub Total</span>
                <span className="mono" style={{ fontWeight: 700, color: "#fff" }}>৳{subTotal}</span>
              </div>
              <div className="order-calc-row">
                <span>Delivery Charge</span>
                <input
                  disabled={isReadOnly}
                  type="number"
                  className="order-form-input"
                  style={{ width: "80px", padding: "4px 8px", textAlign: "right" }}
                  value={deliveryCharge}
                  onChange={e => setDeliveryCharge(Number(e.target.value))}
                />
              </div>
              <div className="order-calc-row">
                <span>Coupon</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    disabled={isReadOnly}
                    className="order-form-input"
                    style={{ width: "90px", padding: "4px 8px", textTransform: "uppercase" }}
                    placeholder="CODE"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                  />
                  {!isReadOnly && (
                    <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ padding: "4px 8px", fontSize: "0.72rem" }}>
                      Apply
                    </button>
                  )}
                </div>
              </div>
              <div className="order-calc-row">
                <span>Manual Discount (৳)</span>
                <input
                  disabled={isReadOnly}
                  type="number"
                  className="order-form-input"
                  style={{ width: "80px", padding: "4px 8px", textAlign: "right" }}
                  value={manualDiscount}
                  onChange={e => setManualDiscount(Number(e.target.value))}
                />
              </div>
              <div className="order-calc-row">
                <span>Paid Amount (৳)</span>
                <input
                  disabled={isReadOnly}
                  type="number"
                  className="order-form-input"
                  style={{ width: "80px", padding: "4px 8px", textAlign: "right" }}
                  value={paidAmount}
                  onChange={e => setPaidAmount(Number(e.target.value))}
                />
              </div>
              <div className="order-calc-row total-row">
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff" }}>Total</span>
                <span className="mono" style={{ fontSize: "1.3rem", fontWeight: 900, color: "#fff" }}>
                  ৳{total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="edit-order-modal-footer">
          <button
            type="button"
            className="btn-bulk-process"
            onClick={() => window.open(`/orders/${order.id}/invoice`, "_blank")}
          >
            <Download size={13} /> Download Invoice PDF
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onClose}>
              Close
            </button>
            {!isReadOnly && (
              <button type="button" className="btn-create-order-amber" onClick={handleSave}>
                💾 Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fraud Checker Modal ────────────────────────────────────────────────────────

function FraudCheckerModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "520px", background: "#141417", border: "1px solid #27272e" }}>
        <div className="modal-header" style={{ borderBottom: "1px solid #232328" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldCheck size={18} color="#4ade80" />
            <div className="modal-title">Customer Fraud &amp; Risk Checker</div>
          </div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "20px" }}>
          <p style={{ fontSize: "0.82rem", color: "var(--text-2)", marginBottom: "16px" }}>
            Real-time verification against Blacklisted Phone numbers, Repeated Return abusers, and Fake COD addresses.
          </p>
          <div style={{ background: "#18181c", border: "1px solid #27272e", borderRadius: "8px", padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>Fraud System Status:</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#4ade80" }}>ACTIVE (0 Risks Detected)</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>Trusted Order Score:</span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#60a5fa" }}>99.2% High Confidence</span>
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ borderTop: "1px solid #232328" }}>
          <button className="admin-btn admin-btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Bulk Process Modal ─────────────────────────────────────────────────────────

function BulkProcessModal({
  selectedCount,
  onApply,
  onClose,
}: {
  selectedCount: number;
  onApply: (status: OrderStatus) => void;
  onClose: () => void;
}) {
  const [targetStatus, setTargetStatus] = useState<OrderStatus>("SHIPPED");

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: "440px", background: "#141417", border: "1px solid #27272e" }}>
        <div className="modal-header" style={{ borderBottom: "1px solid #232328" }}>
          <div className="modal-title">📋 Bulk Process ({selectedCount} Orders)</div>
          <button className="admin-btn admin-btn-ghost admin-btn-icon" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "20px" }}>
          <label className="order-form-label">Set Status For Selected Orders</label>
          <select
            className="order-form-input"
            value={targetStatus}
            onChange={e => setTargetStatus(e.target.value as OrderStatus)}
          >
            <option value="PROCESSING">Processing</option>
            <option value="PENDING">Pending</option>
            <option value="SHIPPED">Shipped</option>
            <option value="CANCELLED">Canceled &amp; Returned</option>
          </select>
        </div>
        <div className="modal-footer" style={{ borderTop: "1px solid #232328" }}>
          <button className="admin-btn admin-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-create-order-amber"
            onClick={() => {
              onApply(targetStatus);
              onClose();
            }}
          >
            Apply to {selectedCount} Orders
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Orders Page Component ────────────────────────────────────────────────

export default function OrdersPage() {
  const {
    orders,
    updateOrder,
    updateOrderStatus,
    assignVendorToOrder,
    createOrder,
    vendors,
    currentUser,
    staff,
  } = useAdmin();

  // Role check: Only Super Admin can change status or edit in "All Orders"
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState<DisplaySection>("ALL");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  // Modals state
  const [editOrder, setEditOrder] = useState<AdminOrder | null>(null);
  const [vendorShiftOrder, setVendorShiftOrder] = useState<AdminOrder | null>(null);
  const [reassignStaffOrder, setReassignStaffOrder] = useState<AdminOrder | null>(null);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Today's date string for comparison
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Calculate Counts for the 8 KPI Cards
  const kpiCounts = useMemo(() => {
    return {
      all: orders.length,
      today: orders.filter(o => o.createdAt.includes("2026-09-08") || o.createdAt.includes(todayStr)).length,
      processing: orders.filter(o => normalizeSection(o.status) === "PROCESSING").length,
      pending: orders.filter(o => o.status === "PENDING").length,
      shipped: orders.filter(o => normalizeSection(o.status) === "SHIPPED").length,
      riderAssigned: orders.filter(o => normalizeSection(o.status) === "RIDER_ASSIGNED").length,
      deliveryCompleted: orders.filter(o => normalizeSection(o.status) === "DELIVERY_COMPLETED").length,
      canceledReturned: orders.filter(o => normalizeSection(o.status) === "CANCELED_RETURNED").length,
    };
  }, [orders, todayStr]);

  // Filtered orders list based on active section & search
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 1. Section filtering
      if (activeSection === "TODAY") {
        const isToday = o.createdAt.includes("2026-09-08") || o.createdAt.includes(todayStr);
        if (!isToday) return false;
      } else if (activeSection !== "ALL") {
        const sec = normalizeSection(o.status);
        if (sec !== activeSection) return false;
      }

      // 2. Search query filtering
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = o.orderNumber.toLowerCase().includes(q);
        const matchName = o.customerName.toLowerCase().includes(q);
        const matchPhone = o.customerPhone.toLowerCase().includes(q);
        const matchArea = (o.district || o.deliveryArea || "").toLowerCase().includes(q);
        if (!matchNum && !matchName && !matchPhone && !matchArea) return false;
      }

      return true;
    });
  }, [orders, activeSection, search, todayStr]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Sync real storefront orders from PostgreSQL database with Round-Robin distribution to active online KYC-verified staff
  const handleSync = async () => {
    setSyncing(true);
    try {
      // 1. Fetch latest real orders from database API (try local Next.js route first, then Fastify API)
      let dbOrders: any[] = [];
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            dbOrders = json.data;
          }
        }
      } catch {}

      if (dbOrders.length === 0) {
        try {
          const res = await fetch("/api/dispatch?all=true");
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              dbOrders = json.data;
            }
          }
        } catch {}
      }

      if (dbOrders.length === 0) {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const res = await fetch(`${apiBase}/api/orders`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              dbOrders = json.data;
            }
          }
        } catch {}
      }

      // 2. Filter online KYC-verified staff for round-robin assignment
      const onlineVerifiedStaff = staff.filter(
        s => s.status === "ACTIVE" && s.kycStatus === "VERIFIED" && s.dailySession.isCurrentlyOnline
      );

      // 3. Identify real database orders that have not yet been imported into admin
      const existingIds = new Set(orders.map(o => o.id));
      const existingNumbers = new Set(orders.map(o => o.orderNumber));
      const pendingToSync = dbOrders.filter(
        (q: any) => !existingIds.has(q.id) && !existingNumbers.has(q.orderNumber)
      );

      // If no new orders exist in PostgreSQL database:
      if (pendingToSync.length === 0) {
        alert("ℹ️ ডাটাবেস সম্পূর্ণ আপ-টু-ডেট! সিঙ্ক করার মতো কোনো নতুন ফ্রন্টএন্ড অর্ডার নেই।\n(No new orders to sync from database)");
        setSyncing(false);
        return;
      }

      const nowTime = new Date().toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      const summaryList: string[] = [];

      pendingToSync.forEach((rawOrder: any, idx: number) => {
        let assignedId: string;
        let assignedName: string;
        let assignedAvatar: string;
        let assignmentNote: string;

        const target = onlineVerifiedStaff.length > 0 ? onlineVerifiedStaff[idx % onlineVerifiedStaff.length] : undefined;
        if (target) {
          assignedId = target.id;
          assignedName = target.name;
          assignedAvatar = target.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
          assignmentNote = `Distributed via Round-Robin to online staff ${target.name}`;
        } else {
          assignedId = currentUser?.id || "admin-1";
          assignedName = currentUser?.name || "Tamim Khan (Admin)";
          assignedAvatar = currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
          assignmentNote = `No staff online; auto-routed to Super Admin ${assignedName}`;
        }

        summaryList.push(`${rawOrder.orderNumber} → ${assignedName}`);

        const syncHistory: OrderHistoryEntry = {
          id: `hist-sync-${Date.now()}-${idx}`,
          timestamp: nowTime,
          actorName: "Storefront Sync Engine",
          actorRole: "SYSTEM",
          action: "ORDER_SYNC",
          details: `Order synced from storefront database into Processing. ${assignmentNote}.`,
        };

        const completeOrder: AdminOrder = {
          ...rawOrder,
          status: "PROCESSING",
          assignedStaffId: assignedId,
          assignedStaffName: assignedName,
          assignedStaffAvatar: assignedAvatar,
          orderHistory: [syncHistory, ...(rawOrder.orderHistory || [])],
        };

        createOrder(completeOrder);
      });

      setSyncing(false);
      alert(`✅ Synced ${pendingToSync.length} storefront order(s) from database!\n\nRound-Robin Staff Distribution:\n${summaryList.join("\n")}`);
    } catch (err: any) {
      alert("⚠️ ডাটাবেস এর সাথে যোগাযোগ করা যায়নি। সার্ভার ও ডাটাবেস চেক করুন।");
      setSyncing(false);
    }
  };

  // Status Change Logic with business rules:
  const handleStatusChange = (order: AdminOrder, newStatus: OrderStatus) => {
    // 1. If in "All Orders" and user is staff (not Super Admin), block change
    if (activeSection === "ALL" && !isSuperAdmin) {
      alert("Staff access restricted: Only Super Admin can change status from 'All Orders'.");
      return;
    }

    // 2. Automated status rule: Rider Assigned and Delivery Completed can NEVER be set manually
    if (newStatus === "OUT_FOR_DELIVERY" || newStatus === "DELIVERED") {
      alert("Manual update restricted: Orders move to 'Rider Assigned' and 'Delivery Completed' automatically via vendor handover and rider delivery app.");
      return;
    }

    // 3. If order is in "Rider Assigned" or "Delivery Completed", manual change is locked
    const currentSec = normalizeSection(order.status);
    if (currentSec === "RIDER_ASSIGNED" || currentSec === "DELIVERY_COMPLETED") {
      alert("Status is locked: Orders in Rider Assigned and Delivery Completed update automatically via rider activity.");
      return;
    }

    // 4. If transitioning to SHIPPED: Automatically pop up Vendor Shift Modal!
    if (newStatus === "SHIPPED") {
      setVendorShiftOrder(order);
      return;
    }

    // 5. If moving from Processing / Pending to Canceled & Returned: mark canceledBy: "ADMIN"
    if ((currentSec === "PROCESSING" || currentSec === "PENDING") && (newStatus === "CANCELLED" || newStatus === "RETURNED")) {
      updateOrder(order.id, {
        status: newStatus,
        canceledBy: "ADMIN",
        canceledReason: "Order Canceled by Admin during verification",
      });
      return;
    }

    // Default update
    updateOrderStatus(order.id, newStatus);
  };

  // WhatsApp contact
  const handleContact = (order: AdminOrder) => {
    const raw = order.customerPhone.replace(/[^0-9]/g, "");
    const waUrl = raw.startsWith("88") ? `https://wa.me/${raw}` : `https://wa.me/88${raw}`;
    window.open(waUrl, "_blank");
  };

  // Create new blank order
  const handleCreateOrder = () => {
    const blankOrder: AdminOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `BG-${Math.floor(1000 + Math.random() * 9000)}`,
      storeName: "Tatka Bazar",
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      deliveryArea: "Dhaka",
      deliverySlot: "Standard",
      totalAmount: 0,
      paymentMethod: "bKash",
      paymentStatus: "UNPAID",
      status: "PROCESSING",
      createdAt: new Date().toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      subOrders: [],
      source: "ADMIN_MANUAL",
      items: [],
      deliveryCharge: 120,
    };
    setEditOrder(blankOrder);
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Top Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-4)", marginBottom: "4px" }}>
            Admin &gt; <span style={{ color: "var(--text-2)" }}>Orders</span>
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <span>Order Control Center</span>
            {!isSuperAdmin && (
              <span style={{ fontSize: "0.70rem", background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", padding: "2px 8px", borderRadius: "4px", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                Staff Mode
              </span>
            )}
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-3)", margin: "4px 0 0" }}>
            Manage and track all orders in real-time
          </p>
        </div>

        {/* 4 Header Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn-order-sync" onClick={handleSync}>
            <RefreshCw size={13} className={syncing ? "spin" : ""} /> Order Sync
          </button>
          <button className="btn-fraud-checker" onClick={() => setShowFraudModal(true)}>
            <ShieldCheck size={14} /> Fraud Checker
          </button>
          <button
            className="btn-bulk-process"
            onClick={() => {
              if (selectedOrderIds.length === 0) {
                alert("Please select at least one order to bulk process.");
                return;
              }
              setShowBulkModal(true);
            }}
          >
            <FileText size={13} /> Bulk Process
          </button>
          <button className="btn-create-order-amber" onClick={handleCreateOrder}>
            <Plus size={15} /> Create Order
          </button>
        </div>
      </div>

      {/* 8 KPI Filter Cards in 4x2 Grid */}
      <div className="order-kpi-grid">
        {/* Card 1: All Orders */}
        <div
          className={`order-kpi-card ${activeSection === "ALL" ? "active" : ""}`}
          onClick={() => setActiveSection("ALL")}
        >
          <div className="order-kpi-card-header">
            <span className="order-kpi-title">
              <ShoppingBag size={14} color="#818cf8" /> All Orders
            </span>
            <span className="order-kpi-badge badge-all">all</span>
          </div>
          <div className="order-kpi-count">{kpiCounts.all}</div>
        </div>

        {/* Card 2: Today's Orders */}
        <div
          className={`order-kpi-card ${activeSection === "TODAY" ? "active" : ""}`}
          onClick={() => setActiveSection("TODAY")}
        >
          <div className="order-kpi-card-header">
            <span className="order-kpi-title">
              <Calendar size={14} color="#94a3b8" /> Today&apos;s Orders
            </span>
            <span className="order-kpi-badge">today</span>
          </div>
          <div className="order-kpi-count">{kpiCounts.today}</div>
        </div>

        {/* Card 3: Processing */}
        <div
          className={`order-kpi-card ${activeSection === "PROCESSING" ? "active" : ""}`}
          onClick={() => setActiveSection("PROCESSING")}
        >
          <div className="order-kpi-card-header">
            <span className="order-kpi-title">
              <RefreshCw size={14} color="#fbbf24" /> Processing
            </span>
            <span className="order-kpi-badge badge-processing">processing</span>
          </div>
          <div className="order-kpi-count">{kpiCounts.processing}</div>
        </div>

        {/* Card 4: Pending */}
        <div
          className={`order-kpi-card ${activeSection === "PENDING" ? "active" : ""}`}
          onClick={() => setActiveSection("PENDING")}
        >
          <div className="order-kpi-card-header">
            <span className="order-kpi-title">
              <Clock size={14} color="#fde047" /> Pending
            </span>
            <span className="order-kpi-badge badge-pending">pending</span>
          </div>
          <div className="order-kpi-count">{kpiCounts.pending}</div>
        </div>

        {/* Card 5: Shipped */}
        <div
          className={`order-kpi-card ${activeSection === "SHIPPED" ? "active" : ""}`}
          onClick={() => setActiveSection("SHIPPED")}
        >
          <div className="order-kpi-card-header">
            <span className="order-kpi-title">
              <Truck size={14} color="#38bdf8" /> Shipped
            </span>
            <span className="order-kpi-badge badge-shipped">shipped</span>
          </div>
          <div className="order-kpi-count">{kpiCounts.shipped}</div>
        </div>

        {/* Card 6: Rider Assigned */}
        <div
          className={`order-kpi-card ${activeSection === "RIDER_ASSIGNED" ? "active" : ""}`}
          onClick={() => setActiveSection("RIDER_ASSIGNED")}
        >
          <div className="order-kpi-card-header">
            <span className="order-kpi-title">
              <Bike size={14} color="#38bdf8" /> Rider Assigned
            </span>
            <span className="order-kpi-badge badge-rider-assigned">rider assigned</span>
          </div>
          <div className="order-kpi-count">{kpiCounts.riderAssigned}</div>
        </div>

        {/* Card 7: Delivery Completed */}
        <div
          className={`order-kpi-card ${activeSection === "DELIVERY_COMPLETED" ? "active" : ""}`}
          onClick={() => setActiveSection("DELIVERY_COMPLETED")}
        >
          <div className="order-kpi-card-header">
            <span className="order-kpi-title">
              <CheckCircle size={14} color="#4ade80" /> Delivery Completed
            </span>
            <span className="order-kpi-badge badge-completed">completed</span>
          </div>
          <div className="order-kpi-count">{kpiCounts.deliveryCompleted}</div>
        </div>

        {/* Card 8: Canceled & Returned (Renamed per user request) */}
        <div
          className={`order-kpi-card ${activeSection === "CANCELED_RETURNED" ? "active" : ""}`}
          onClick={() => setActiveSection("CANCELED_RETURNED")}
        >
          <div className="order-kpi-card-header">
            <span className="order-kpi-title">
              <X size={14} color="#f87171" /> Cancel &amp; Returned
            </span>
            <span className="order-kpi-badge badge-canceled-returned">cancel &amp; return</span>
          </div>
          <div className="order-kpi-count">{kpiCounts.canceledReturned}</div>
        </div>
      </div>

      {/* Notice if Staff in All Orders */}
      {activeSection === "ALL" && !isSuperAdmin && (
        <div style={{ background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Lock size={15} color="#818cf8" />
          <span style={{ fontSize: "0.78rem", color: "#c7d2fe" }}>
            <strong>All Orders View (Staff Mode):</strong> You can review orders, but only Super Admin has permission to modify or change order status from this view.
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: "16px" }}>
        <div className="search-wrap" style={{ maxWidth: "380px" }}>
          <Search size={14} className="search-icon" />
          <input
            className="search-input"
            style={{ background: "#141417", borderColor: "#27272e" }}
            placeholder="Search order ID, customer, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card" style={{ padding: 0, overflow: "hidden", background: "#141417", border: "1px solid #232328" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr style={{ background: "#16161a", borderBottom: "1px solid #232328" }}>
                <th style={{ width: "38px" }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      filteredOrders.every(o => selectedOrderIds.includes(o.id))
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>ORDER ID</th>
                <th>CUSTOMER</th>
                <th>LOCATION</th>
                <th>DATE &amp; TIME</th>
                <th>AMOUNT</th>
                <th>PAYMENT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const sec = normalizeSection(order.status);
                const shipSubtext = order.deliveryCharge ? `+৳${order.deliveryCharge} ship` : "+৳120 ship";

                // Check permissions
                const isAllOrdersStaffLocked = activeSection === "ALL" && !isSuperAdmin;
                const isAutomatedLocked = sec === "RIDER_ASSIGNED" || sec === "DELIVERY_COMPLETED";
                const isDropdownDisabled = isAllOrdersStaffLocked || isAutomatedLocked;

                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid #1f1f26" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => handleToggleSelect(order.id)}
                      />
                    </td>
                    <td>
                      <div className="mono" style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>
                        {order.orderNumber}
                      </div>
                      {/* Canceled By Admin Badge */}
                      {order.canceledBy === "ADMIN" && (
                        <div style={{ marginTop: "4px" }}>
                          <span className="badge-admin-canceled">
                            <X size={10} /> Order Canceled by Admin
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#fff" }}>
                        {order.customerName}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: "1px" }}>
                        {order.customerPhone}
                      </div>
                      {order.assignedStaffName ? (
                        <div style={{ marginTop: "4px" }}>
                          <span className="staff-assigned-chip" title={`Assigned Staff: ${order.assignedStaffName}`}>
                            <UserCheck size={10} /> {order.assignedStaffName}
                          </span>
                        </div>
                      ) : (
                        <div style={{ marginTop: "4px" }}>
                          <span className="staff-assigned-chip unassigned">
                            <User size={10} /> Unassigned
                          </span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: "0.80rem", color: "#e5e7eb" }}>
                        {order.customerAddress}
                      </div>
                      <div style={{ fontSize: "0.70rem", color: "var(--text-4)", marginTop: "1px" }}>
                        {order.district || order.deliveryArea}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.78rem", color: "#e5e7eb" }}>
                        {order.createdAt.split(",")[0]?.trim() || "2026-09-08"}
                      </div>
                      <div style={{ fontSize: "0.70rem", color: "var(--text-4)", marginTop: "1px" }}>
                        {order.createdAt.split(",")[1]?.trim() || "12:08 AM"}
                      </div>
                    </td>
                    <td>
                      <div className="mono" style={{ fontSize: "0.88rem", fontWeight: 800, color: "#fff" }}>
                        ৳{order.totalAmount}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-4)" }}>
                        {shipSubtext}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: order.paymentMethod?.toLowerCase().includes("bkash")
                            ? "#ec4899"
                            : "var(--text-2)",
                        }}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td>
                      {/* Status Dropdown with Business Rules */}
                      {sec === "RIDER_ASSIGNED" ? (
                        <div
                          className="table-status-pill status-shipped"
                          style={{
                            cursor: "not-allowed",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            opacity: 0.95,
                          }}
                          title="Rider Assigned: Automatically tracked from rider portal"
                        >
                          <Bike size={12} /> Rider Assigned
                        </div>
                      ) : sec === "DELIVERY_COMPLETED" ? (
                        <div
                          className="table-status-pill status-delivered"
                          style={{
                            cursor: "not-allowed",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            opacity: 0.95,
                          }}
                          title="Delivery Completed: Automatically verified upon delivery"
                        >
                          <CheckCircle size={12} /> Delivery Completed
                        </div>
                      ) : sec === "SHIPPED" ? (
                        // In Shipped section: only allowed to move to Pending, Processing, or Canceled
                        <select
                          disabled={isDropdownDisabled}
                          className="table-status-pill status-shipped"
                          value="SHIPPED"
                          onChange={e => handleStatusChange(order, e.target.value as OrderStatus)}
                        >
                          <option value="SHIPPED">Shipped (Current)</option>
                          <option value="PENDING">Move to Pending</option>
                          <option value="PROCESSING">Move to Processing</option>
                          <option value="CANCELLED">Cancel &amp; Returned</option>
                        </select>
                      ) : (
                        <select
                          disabled={isDropdownDisabled}
                          className={`table-status-pill status-${sec === "CANCELED_RETURNED" ? "returned" : sec.toLowerCase()}`}
                          value={sec === "CANCELED_RETURNED" ? "CANCELLED" : order.status}
                          onChange={e => handleStatusChange(order, e.target.value as OrderStatus)}
                        >
                          <option value="PROCESSING">Processing</option>
                          <option value="PENDING">Pending</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="CANCELLED">Cancel &amp; Returned</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <div className="order-actions-group">
                        {/* 1. View/Edit Modal */}
                        <button
                          className="order-action-icon-btn"
                          title="View Order Details"
                          onClick={() => setEditOrder(order)}
                        >
                          <Eye size={13} />
                        </button>

                        {/* 2. Reassign Staff */}
                        <button
                          className="order-action-icon-btn btn-reassign-staff"
                          title="Reassign Staff Member"
                          onClick={() => setReassignStaffOrder(order)}
                        >
                          <UserCog size={13} />
                        </button>

                        {/* 3. Print Invoice */}
                        <button
                          className="order-action-icon-btn"
                          title="Print Invoice"
                          onClick={() => window.open(`/orders/${order.id}/invoice`, "_blank")}
                        >
                          <Printer size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No orders in this section</div>
              <div className="empty-state-desc">Try choosing another status card or adjusting search filters</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 18px", borderTop: "1px solid #232328", fontSize: "0.75rem", color: "var(--text-4)" }}>
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}

      {/* 1. Edit Order Details Modal */}
      {editOrder && (
        <EditOrderModal
          order={editOrder}
          isReadOnly={activeSection === "ALL" && !isSuperAdmin}
          onClose={() => setEditOrder(null)}
          onSave={updates => {
            if (orders.some(o => o.id === editOrder.id)) {
              updateOrder(editOrder.id, updates);
            } else {
              createOrder({ ...editOrder, ...updates } as any);
            }
          }}
          onOpenVendorShift={() => {
            setVendorShiftOrder(editOrder);
          }}
        />
      )}

      {/* 2. Vendor Shift Modal (with Skip and Area Match) */}
      {vendorShiftOrder && (
        <VendorShiftModal
          order={vendorShiftOrder}
          vendors={vendors}
          onAssign={(vendorIds, mainVendorName) => {
            const v = vendors.find(x => x.id === vendorIds[0]);
            const updates: Partial<AdminOrder> = {
              status: "SHIPPED",
              assignedVendorName: mainVendorName,
              ...(vendorIds[0] ? { assignedVendorId: vendorIds[0] } : {}),
              ...(v?.ownerName || v?.contactName ? { vendorOwnerName: v?.ownerName || v?.contactName } : {}),
              ...(v?.phone ? { vendorPhone: v?.phone } : {}),
              ...(v?.avatar ? { vendorAvatar: v?.avatar } : {}),
              ...(v?.parcelsToday ? { vendorParcelsToday: v.parcelsToday } : {}),
              ...(v?.pendingOrdersCount ? { vendorPendingOrders: v.pendingOrdersCount } : {}),
            };
            updateOrder(vendorShiftOrder.id, updates);
            setVendorShiftOrder(null);
          }}
          onSkip={() => {
            // Skip assigning vendor, but still set status to Shipped!
            updateOrderStatus(vendorShiftOrder.id, "SHIPPED");
            setVendorShiftOrder(null);
          }}
          onClose={() => setVendorShiftOrder(null)}
        />
      )}

      {/* 3. Fraud Checker Modal */}
      {showFraudModal && (
        <FraudCheckerModal onClose={() => setShowFraudModal(false)} />
      )}

      {/* 4. Bulk Process Modal */}
      {showBulkModal && (
        <BulkProcessModal
          selectedCount={selectedOrderIds.length}
          onApply={newStatus => {
            selectedOrderIds.forEach(id => updateOrderStatus(id, newStatus));
            setSelectedOrderIds([]);
          }}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {/* 5. Reassign Staff Modal (Image 2 Red Circle) */}
      {reassignStaffOrder && (
        <ReassignStaffModal
          order={reassignStaffOrder}
          staffList={staff}
          onClose={() => setReassignStaffOrder(null)}
          onReassign={(targetStaff) => {
            const nowTime = new Date().toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });
            const prevAssignee = reassignStaffOrder.assignedStaffName || "Unassigned";
            const adminName = currentUser?.name || "Admin Tamim Khan";
            const historyEntry: OrderHistoryEntry = {
              id: `hist-${Date.now()}`,
              timestamp: nowTime,
              actorName: adminName,
              actorRole: "SUPER_ADMIN",
              action: "STAFF_REASSIGNED",
              details: `Admin ${adminName} reassigned order from ${prevAssignee} to ${targetStaff.name}`,
            };
            const updatedHistory = [historyEntry, ...(reassignStaffOrder.orderHistory || [])];
            updateOrder(reassignStaffOrder.id, {
              assignedStaffId: targetStaff.id,
              assignedStaffName: targetStaff.name,
              ...(targetStaff.avatar ? { assignedStaffAvatar: targetStaff.avatar } : {}),
              orderHistory: updatedHistory,
            });
            setReassignStaffOrder(null);
          }}
        />
      )}
    </div>
  );
}
