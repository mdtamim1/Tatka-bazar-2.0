"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Phone,
  MessageSquare,
  MapPin,
  Bike,
  Sparkles,
  X,
  CreditCard,
  Printer,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import {
  CustomerOrder,
  getCustomerOrders,
  OrderStatus,
} from "@/lib/order-storage";
import { CustomerLiveTrackingModal } from "@/components/account/CustomerLiveTrackingModal";
import styles from "./page.module.css";

export default function CustomerOrdersHistoryPage() {
  const router = useRouter();
  const { locale, formatPrice } = useLanguage();
  const { addItem } = useCartStore();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<string>("All");

  // Detailed Modal state
  const [detailsModalOrder, setDetailsModalOrder] = useState<CustomerOrder | null>(null);

  // Live Tracking Modal state
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<CustomerOrder | null>(null);

  // Feedback Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setOrders(getCustomerOrders());

    const handleUpdate = () => {
      setOrders(getCustomerOrders());
    };

    window.addEventListener("tatka_orders_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("tatka_orders_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  // Handle Order Again (Reorder)
  function handleReorder(order: CustomerOrder) {
    let addedCount = 0;

    if (order.rawItems && order.rawItems.length > 0) {
      order.rawItems.forEach((item) => {
        // Find matching product in catalog or fallback
        const matched =
          PRODUCTS.find(
            (p) =>
              p.nameBn.toLowerCase().includes(item.name.toLowerCase()) ||
              p.nameEn.toLowerCase().includes(item.name.toLowerCase()) ||
              item.name.toLowerCase().includes(p.nameBn.toLowerCase()) ||
              item.name.toLowerCase().includes(p.nameEn.toLowerCase())
          ) || PRODUCTS[0];

        if (matched) {
          addItem(
            matched,
            1,
            (matched.baseUnit || "kg") as any,
            matched.basePrice || item.price,
            1
          );
          addedCount++;
        }
      });
    } else {
      // Fallback first product
      if (PRODUCTS[0]) {
        addItem(PRODUCTS[0], 1, (PRODUCTS[0].baseUnit || "kg") as any, PRODUCTS[0].basePrice, 1);
        addedCount++;
      }
    }

    triggerToast(
      locale === "bn"
        ? `🎉 অর্ডার #${order.id} এর ${addedCount}টি পণ্য কার্টে যোগ করা হয়েছে!`
        : `🎉 ${addedCount} items from order #${order.id} added to your cart!`
    );
  }

  // Filtered orders logic
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Tab filter
      const statusLower = ord.status.toLowerCase();
      if (selectedTab === "Active") {
        const isActive = ["processing", "shipped", "pending", "out_for_delivery"].includes(statusLower);
        if (!isActive) return false;
      } else if (selectedTab !== "All") {
        if (statusLower !== selectedTab.toLowerCase()) return false;
      }

      // 2. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = ord.id.toLowerCase().includes(q) || (ord.orderNumber && ord.orderNumber.toLowerCase().includes(q));
        const matchesItems = ord.items?.toLowerCase().includes(q);
        const matchesAddress = ord.deliveryAddress?.toLowerCase().includes(q);
        if (!matchesId && !matchesItems && !matchesAddress) return false;
      }

      return true;
    });
  }, [orders, selectedTab, searchQuery]);

  // Status Badge color & icon helper
  function renderStatusBadge(status: OrderStatus) {
    const s = status.toLowerCase();
    if (s === "processing") {
      return (
        <span
          className={styles.statusPill}
          style={{ background: "rgba(59, 130, 246, 0.12)", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
        >
          <Clock size={12} />
          <span>{locale === "bn" ? "প্রসেসিং হচ্ছে" : "Processing"}</span>
        </span>
      );
    }
    if (s === "shipped" || s === "out_for_delivery") {
      return (
        <span
          className={styles.statusPill}
          style={{ background: "rgba(16, 185, 129, 0.12)", color: "#047857", border: "1px solid #a7f3d0" }}
        >
          <Bike size={12} />
          <span>{locale === "bn" ? "রাইডার পথে আছেন" : "Out for Delivery"}</span>
        </span>
      );
    }
    if (s === "delivered") {
      return (
        <span
          className={styles.statusPill}
          style={{ background: "rgba(5, 150, 105, 0.12)", color: "#065f46", border: "1px solid #6ee7b7" }}
        >
          <CheckCircle2 size={12} />
          <span>{locale === "bn" ? "সম্পন্ন ডেলিভারি" : "Delivered"}</span>
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span
          className={styles.statusPill}
          style={{ background: "rgba(245, 158, 11, 0.12)", color: "#b45309", border: "1px solid #fde68a" }}
        >
          <Clock size={12} />
          <span>{locale === "bn" ? "পেন্ডিং" : "Pending"}</span>
        </span>
      );
    }
    if (s === "preorder") {
      return (
        <span
          className={styles.statusPill}
          style={{ background: "rgba(239, 68, 68, 0.12)", color: "#b91c1c", border: "1px solid #fecaca" }}
        >
          <Sparkles size={12} />
          <span>{locale === "bn" ? "প্রি-অর্ডার" : "Preorder"}</span>
        </span>
      );
    }
    return (
      <span
        className={styles.statusPill}
        style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}
      >
        <Package size={12} />
        <span>{status}</span>
      </span>
    );
  }

  const tabs = [
    { id: "All", label: locale === "bn" ? "সবগুলো অর্ডার" : "All Orders" },
    { id: "Active", label: locale === "bn" ? "⚡ চলমান অর্ডার" : "⚡ Active Orders" },
    { id: "Processing", label: locale === "bn" ? "প্রসেসিং" : "Processing" },
    { id: "Shipped", label: locale === "bn" ? "শিপড / পথে" : "Shipped" },
    { id: "Delivered", label: locale === "bn" ? "ডেলিভার্ড" : "Delivered" },
    { id: "Pending", label: locale === "bn" ? "পেন্ডিং" : "Pending" },
    { id: "Preorder", label: locale === "bn" ? "প্রি-অর্ডার" : "Preorder" },
  ];

  return (
    <main className={styles.pageContainer}>
      <div className={styles.innerWrapper}>
        {/* Top Navigation */}
        <div className={styles.topNav}>
          <Link href="/account" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>{locale === "bn" ? "প্রোফাইলে ফিরুন" : "Back to Profile"}</span>
          </Link>
          <Link
            href="/cart"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#059669",
              textDecoration: "none",
            }}
          >
            <span>{locale === "bn" ? "কার্ট দেখুন" : "View Cart"}</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Page Title & Subtitle */}
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            <Package size={28} color="#059669" />
            <span>{locale === "bn" ? "আমার অর্ডার হিস্ট্রি" : "My Order History"}</span>
          </h1>
          <p className={styles.pageSubtitle}>
            {locale === "bn"
              ? "আপনার অতীত ও চলমান সকল অর্ডারের বিস্তারিত তথ্য, লাইভ ট্র্যাকিং এবং পুনরায় অর্ডার করুন"
              : "Track live status, view invoices, and easily reorder your favorite groceries"}
          </p>
        </header>

        {/* Filter Controls Bar */}
        <div className={styles.controlsBar}>
          {/* Search Box */}
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={
                locale === "bn"
                  ? "অর্ডার আইডি, পণ্যের নাম বা ঠিকানা দিয়ে খুঁজুন..."
                  : "Search by Order ID, item name or address..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Status Tabs */}
          <div className={styles.tabsRow}>
            {tabs.map((tab) => {
              const count =
                tab.id === "All"
                  ? orders.length
                  : tab.id === "Active"
                  ? orders.filter((o) =>
                      ["processing", "shipped", "pending", "out_for_delivery"].includes(
                        o.status.toLowerCase()
                      )
                    ).length
                  : orders.filter(
                      (o) => o.status.toLowerCase() === tab.id.toLowerCase()
                    ).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`${styles.tabBtn} ${
                    selectedTab === tab.id ? styles.activeTabBtn : ""
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: "0.72rem",
                      opacity: 0.8,
                      background: selectedTab === tab.id ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                      padding: "1px 6px",
                      borderRadius: 999,
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Package size={32} />
            </div>
            <h3 className={styles.emptyTitle}>
              {locale === "bn" ? "কোনো অর্ডার পাওয়া যায়নি" : "No Orders Found"}
            </h3>
            <p className={styles.emptySubtitle}>
              {locale === "bn"
                ? "আপনার বর্তমান ফিল্টারের সাথে কোনো অর্ডার মিলছে না।"
                : "No orders match your selected filters or search query."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTab("All");
                setSearchQuery("");
              }}
              className={styles.btnSecondary}
            >
              <RotateCcw size={14} />
              <span>{locale === "bn" ? "ফিল্টার রিসেট করুন" : "Reset Filters"}</span>
            </button>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {filteredOrders.map((ord) => {
              const isOngoing = ["processing", "shipped", "out_for_delivery"].includes(
                ord.status.toLowerCase()
              );

              return (
                <div key={ord.id} className={styles.orderCard}>
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderId}>#{ord.id}</span>
                      <span className={styles.orderDate}>
                        <Clock size={13} />
                        <span>{ord.date}</span>
                      </span>
                    </div>
                    <div>{renderStatusBadge(ord.status)}</div>
                  </div>

                  {/* Card Body */}
                  <div className={styles.cardBody}>
                    <div className={styles.itemsSummary}>
                      🛒 {ord.items}
                    </div>

                    {/* Raw Items Breakdown */}
                    {ord.rawItems && ord.rawItems.length > 0 && (
                      <div className={styles.rawItemList}>
                        {ord.rawItems.map((it, idx) => (
                          <div key={idx} className={styles.rawItemRow}>
                            <span className={styles.rawItemName}>
                              • {it.name} <span style={{ color: "#64748b", fontSize: "0.78rem" }}>({it.qty})</span>
                            </span>
                            <span className={styles.rawItemPrice}>৳{it.price}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Details Strip (Address & Payment) */}
                    <div className={styles.detailsStrip}>
                      <div className={styles.detailItem}>
                        <MapPin size={15} color="#059669" />
                        <span>
                          <strong>{locale === "bn" ? "ঠিকানা:" : "Address:"}</strong>{" "}
                          {ord.deliveryAddress || "ধানমন্ডি, ঢাকা"}
                        </span>
                      </div>
                      <div className={styles.detailItem}>
                        <CreditCard size={15} color="#059669" />
                        <span>
                          <strong>{locale === "bn" ? "পেমেন্ট:" : "Payment:"}</strong>{" "}
                          {ord.paymentMethod || "bKash"} ({ord.paymentStatus || "PAID"})
                        </span>
                      </div>
                    </div>

                    {/* Rider Box (if ongoing order has a rider assigned) */}
                    {ord.rider && isOngoing && (
                      <div className={styles.riderBox}>
                        <div className={styles.riderLeft}>
                          <div className={styles.riderAvatar}>🛵</div>
                          <div>
                            <div className={styles.riderName}>{ord.rider.name}</div>
                            <div className={styles.riderSub}>
                              {ord.rider.vehicle || "বাইক রাইডার"} • রেটিং: {ord.rider.rating || "4.9 ★"}
                            </div>
                          </div>
                        </div>

                        <div className={styles.riderActions}>
                          <a
                            href={`tel:${ord.rider.phone}`}
                            className={styles.riderCallBtn}
                            title="Call Rider"
                          >
                            <Phone size={13} />
                            <span>{locale === "bn" ? "কল দিন" : "Call"}</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => setActiveTrackingOrder(ord)}
                            className={styles.riderChatBtn}
                            title="Chat with Rider"
                          >
                            <MessageSquare size={13} />
                            <span>{locale === "bn" ? "চ্যাট করুন" : "Chat"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className={styles.cardFooter}>
                    <div className={styles.totalPriceCol}>
                      <span className={styles.totalLabel}>
                        {locale === "bn" ? "সর্বমোট বিল" : "Total Bill"}
                      </span>
                      <span className={styles.totalAmount}>
                        ৳{ord.total?.toLocaleString()}
                      </span>
                    </div>

                    <div className={styles.actionBtnsGroup}>
                      {/* View Details Modal Button */}
                      <button
                        type="button"
                        onClick={() => setDetailsModalOrder(ord)}
                        className={styles.btnSecondary}
                      >
                        <FileText size={15} />
                        <span>{locale === "bn" ? "বিস্তারিত" : "Details"}</span>
                      </button>

                      {/* Order Again (Reorder) Button */}
                      <button
                        type="button"
                        onClick={() => handleReorder(ord)}
                        className={styles.btnPrimary}
                      >
                        <RotateCcw size={15} />
                        <span>{locale === "bn" ? "পুনরায় অর্ডার" : "Order Again"}</span>
                      </button>

                      {/* Live Track Order Button (for ongoing / trackable orders) */}
                      {(isOngoing || ord.canTrack) && (
                        <button
                          type="button"
                          onClick={() => setActiveTrackingOrder(ord)}
                          className={styles.btnTrack}
                        >
                          <Bike size={15} />
                          <span>{locale === "bn" ? "লাইভ ট্র্যাক" : "Track Order"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Order Details Modal ── */}
      {detailsModalOrder && (
        <div className={styles.modalOverlay} onClick={() => setDetailsModalOrder(null)}>
          <div className={styles.modalWindow} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "অর্ডারের পূর্ণ বিবরণ" : "Order Details"}
                </h3>
                <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 2 }}>
                  #{detailsModalOrder.id} • {detailsModalOrder.date}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOrder(null)}
                className={styles.closeModalBtn}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Status Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#f8fafc",
                  padding: "12px 16px",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                }}
              >
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#334155" }}>
                  {locale === "bn" ? "বর্তমান স্ট্যাটাস" : "Current Status"}
                </span>
                {renderStatusBadge(detailsModalOrder.status)}
              </div>

              {/* Items Table */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
                <div
                  style={{
                    background: "#f1f5f9",
                    padding: "10px 16px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    color: "#475569",
                  }}
                >
                  {locale === "bn" ? "অর্ডারকৃত পণ্যসমূহ" : "Ordered Items"}
                </div>
                <div style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {detailsModalOrder.rawItems?.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.88rem",
                        paddingBottom: 6,
                        borderBottom: "1px dashed #f1f5f9",
                      }}
                    >
                      <span>
                        <strong>{it.name}</strong> × {it.qty}
                      </span>
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>৳{it.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: "0.86rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>{locale === "bn" ? "পণ্যের মূল্য (Subtotal):" : "Subtotal:"}</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    ৳{(detailsModalOrder.subtotal || detailsModalOrder.total - 60).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b" }}>
                  <span>{locale === "bn" ? "ডেলিভারি চার্জ:" : "Delivery Fee:"}</span>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>
                    ৳{(detailsModalOrder.deliveryFee || 60).toLocaleString()}
                  </span>
                </div>
                {detailsModalOrder.discount && detailsModalOrder.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#059669" }}>
                    <span>{locale === "bn" ? "কুপন ডিসকাউন্ট:" : "Discount:"}</span>
                    <span style={{ fontWeight: 700 }}>-৳{detailsModalOrder.discount}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTop: "1px solid #e2e8f0",
                    fontWeight: 900,
                    fontSize: "1.05rem",
                    color: "#059669",
                  }}
                >
                  <span>{locale === "bn" ? "সর্বমোট পরিশোধিত বিল:" : "Total Paid Amount:"}</span>
                  <span>৳{detailsModalOrder.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery & Address Information */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  padding: "14px 16px",
                  borderRadius: 14,
                  fontSize: "0.85rem",
                  color: "#334155",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div>
                  <strong>{locale === "bn" ? "ডেলিভারি ঠিকানা:" : "Delivery Address:"}</strong>{" "}
                  {detailsModalOrder.deliveryAddress}
                </div>
                <div>
                  <strong>{locale === "bn" ? "ডেলিভারি স্লট:" : "Delivery Slot:"}</strong>{" "}
                  {detailsModalOrder.deliverySlot || "স্ট্যান্ডার্ড ডেলিভারি"}
                </div>
                <div>
                  <strong>{locale === "bn" ? "পেমেন্ট মাধ্যম:" : "Payment Method:"}</strong>{" "}
                  {detailsModalOrder.paymentMethod || "bKash"} ({detailsModalOrder.paymentStatus || "PAID"})
                </div>
                {detailsModalOrder.deliveryOtp && (
                  <div style={{ color: "#059669", fontWeight: 800 }}>
                    🔐 {locale === "bn" ? "ডেলিভারি ওটিপি (OTP):" : "Delivery OTP:"}{" "}
                    <span style={{ background: "#ecfdf5", padding: "2px 8px", borderRadius: 6 }}>
                      {detailsModalOrder.deliveryOtp}
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    handleReorder(detailsModalOrder);
                    setDetailsModalOrder(null);
                  }}
                  className={styles.btnPrimary}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <RotateCcw size={15} />
                  <span>{locale === "bn" ? "পণ্যগুলো আবার অর্ডার করুন" : "Order Again"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className={styles.btnSecondary}
                  title="Print receipt"
                >
                  <Printer size={15} />
                  <span>{locale === "bn" ? "ইনভয়েস প্রিন্ট" : "Print"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Live Tracking Modal (GPS map, rider chat, call) ── */}
      {activeTrackingOrder && (
        <CustomerLiveTrackingModal
          isOpen={true}
          onClose={() => setActiveTrackingOrder(null)}
          orderId={activeTrackingOrder.id}
          orderNumber={activeTrackingOrder.orderNumber || activeTrackingOrder.id}
          deliveryAddress={activeTrackingOrder.deliveryAddress || "বাড়ি #৪২, রোড #৭/এ, ধানমন্ডি, ঢাকা"}
          total={activeTrackingOrder.total}
        />
      )}

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className={styles.toastFeedback}>
          <span>{toastMessage}</span>
          <Link
            href="/cart"
            style={{
              color: "#34d399",
              marginLeft: 8,
              textDecoration: "underline",
              fontWeight: 800,
            }}
          >
            {locale === "bn" ? "কার্ট দেখুন" : "View Cart"}
          </Link>
        </div>
      )}
    </main>
  );
}
