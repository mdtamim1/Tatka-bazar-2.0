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
} from "lucide-react";
import { useVendor } from "@/context/VendorContext";
import { VendorSubOrder, FulfillmentStatus } from "@/types";

export default function VendorOrdersPage() {
  const { orders, updateFulfillmentStatus, currentVendor } = useVendor();

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
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)" }}>
            অর্ডার ফুলফিলমেন্ট ও প্যাকেজিং (Slice-Only View)
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>
            নিরাপদ ভেন্ডর আইসোলেশন — শুধুমাত্র আপনার দোকানের অংশের অর্ডার আইটেম ও রাইডার পিকআপ
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
            placeholder="অর্ডার নম্বর বা গ্রাহক এলাকা দিয়ে খুঁজুন..."
            style={{ width: "100%", padding: "7px 12px 7px 36px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", outline: "none" }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-medium)", background: "#FFF" }}
        >
          <option value="all">সকল অর্ডার অবস্থা</option>
          <option value="PREPARING">PREPARING (প্যাকিং চলছে)</option>
          <option value="READY_FOR_PICKUP">READY_FOR_PICKUP (পিকআপের জন্য প্রস্তুত)</option>
          <option value="PICKED_UP_BY_RIDER">PICKED_UP_BY_RIDER (রাইডার নিয়ে গেছে)</option>
          <option value="DELIVERED">DELIVERED (সম্পন্ন)</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="vendor-card">
        <div style={{ overflowX: "auto" }}>
          <table className="vendor-table">
            <thead>
              <tr>
                <th>মাস্টার অর্ডার নং</th>
                <th>আমার দোকানের আইটেমসমূহ</th>
                <th>ডেলিভারি স্লট ও এলাকা</th>
                <th>মোট ও নেট আয়</th>
                <th>রাইডার পিকআপ</th>
                <th>ফুলফিলমেন্ট স্ট্যাটাস</th>
                <th>অ্যাকশন</th>
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
                          • {item.nameBn} — <span style={{ color: "var(--primary-dark)", fontWeight: 700 }}>{item.quantity * item.weight} {item.unit}</span> (৳{item.totalPrice})
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
                      নেট প্রদেয়: ৳{ord.netEarnings}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      (কমিশন -{currentVendor.commissionRate}%: ৳{ord.commissionDeducted})
                    </div>
                  </td>
                  <td>
                    {ord.assignedRiderName ? (
                      <div style={{ fontSize: "0.78rem" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-main)" }}>🛵 {ord.assignedRiderName}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{ord.assignedRiderPhone}</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>রাইডার অপেক্ষমাণ</span>
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
                      <option value="PREPARING">PREPARING (প্যাকিং)</option>
                      <option value="READY_FOR_PICKUP">READY_FOR_PICKUP (প্রস্তুত)</option>
                      <option value="PICKED_UP_BY_RIDER">PICKED_UP_BY_RIDER (পথে)</option>
                      <option value="DELIVERED">DELIVERED (সম্পন্ন)</option>
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
                      <span>স্লিপ</span>
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
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>{currentVendor.nameBn}</h2>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ভেন্ডর প্যাকেজিং চালান (Vendor Slip)</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800 }}>{selectedOrder.masterOrderNumber}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{selectedOrder.createdAt}</div>
              </div>
            </div>

            <div style={{ background: "#F8FAFC", padding: "10px", borderRadius: "6px", fontSize: "0.8rem", marginBottom: "14px" }}>
              <div><strong>ডেলিভারি এলাকা:</strong> {selectedOrder.deliveryArea}</div>
              <div><strong>ডেলিভারি স্লট:</strong> {selectedOrder.deliverySlot}</div>
              <div><strong>নিযুক্ত রাইডার:</strong> {selectedOrder.assignedRiderName || "অ্যাসাইনমেন্ট চলছে"}</div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: "6px" }}>প্যাকেজিং আইটেমসমূহ:</div>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed #DDD", fontSize: "0.82rem" }}>
                  <span>{it.nameBn} ({it.quantity * it.weight} {it.unit})</span>
                  <span style={{ fontWeight: 700 }}>৳{it.totalPrice}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px solid #000", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: 800 }}>
              <span>ভেন্ডর সাবটোটাল:</span>
              <span>৳{selectedOrder.subtotal}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "18px" }}>
              <button onClick={() => window.print()} className="vendor-btn vendor-btn-primary">
                <Printer size={16} />
                <span>প্রিন্ট করুন</span>
              </button>
              <button onClick={() => setSelectedOrder(null)} className="vendor-btn vendor-btn-secondary">
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
