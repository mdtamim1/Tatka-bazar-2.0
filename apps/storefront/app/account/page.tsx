"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  ChevronRight,
  Package,
  Clock,
  Truck,
  MessageSquareQuote,
  TimerReset,
  History,
  MapPin,
  Headphones,
  Info,
  ArrowLeft,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  ShoppingCart,
  Navigation,
  FileText,
  RotateCcw,
  Sparkles,
  Phone,
  Gift,
  ShieldCheck,
  Globe,
  Bell,
  Check,
  Printer
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import { CustomerLiveTrackingModal } from "@/components/account/CustomerLiveTrackingModal";
import styles from "./page.module.css";

interface CustomerUser {
  name: string;
  emailOrPhone: string;
  vipTier?: string;
}

interface SavedAddress {
  id: string;
  type: "Home" | "Office" | "Other";
  address: string;
  phone: string;
  isDefault: boolean;
}

interface OrderItem {
  name: string;
  qty: string;
  price: number;
}

interface CustomerOrder {
  id: string;
  date: string;
  status: "Pending" | "Processing" | "Shipped" | "Review" | "Preorder";
  total: number;
  items: string;
  rawItems: OrderItem[];
  rider?: {
    name: string;
    phone: string;
    rating: string;
  };
  deliveryOtp?: string;
  canTrack?: boolean;
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const { locale, toggleLocale, formatPrice } = useLanguage();
  const {
    wishlistIds,
    openWishlist,
    removeFromWishlist,
    addItem,
    applyCoupon
  } = useCartStore();

  // User profile state
  const [user, setUser] = useState<CustomerUser>({
    name: "Ahmed Hammad",
    emailOrPhone: "ahmed.hammad@gmail.com",
    vipTier: "VIP Member",
  });

  const [mounted, setMounted] = useState(false);
  const [showSettingsView, setShowSettingsView] = useState(false);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    | "orders"
    | "addresses"
    | "coupons"
    | "points"
    | "wishlist"
    | "browsingHistory"
    | "support"
    | "accountSettings"
    | "country"
    | "currency"
    | "notifications"
    | "privacy"
    | "invoice"
    | null
  >(null);

  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("All");
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Live Tracking Modal State
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<CustomerOrder | null>(null);

  // Active invoice order state
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<CustomerOrder | null>(null);

  // Loyalty Points
  const [points, setPoints] = useState<number>(55);

  // Country & Currency Preferences
  const [selectedCountry, setSelectedCountry] = useState<string>("Bangladesh");
  const [selectedCurrency, setSelectedCurrency] = useState<string>("BDT (৳)");

  // Notification toggles
  const [notifications, setNotifications] = useState({
    sms: true,
    push: true,
    promoEmail: false,
  });

  // Saved Addresses State (CRUD)
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    { id: "1", type: "Home", address: "House 42, Road 7/A, Dhanmondi, Dhaka", phone: "+880 1712-345678", isDefault: true },
    { id: "2", type: "Office", address: "Level 8, Tower 71, Gulshan-2, Dhaka", phone: "+880 1819-876543", isDefault: false },
  ]);
  const [newAddrType, setNewAddrType] = useState<"Home" | "Office" | "Other">("Home");
  const [newAddrText, setNewAddrText] = useState("");
  const [newAddrPhone, setNewAddrPhone] = useState("+880 1712-345678");

  // Orders State with Live Tracking capability
  const [orders, setOrders] = useState<CustomerOrder[]>([
    {
      id: "TB-8942",
      date: "আজকে, দুপুর ২:১৫",
      status: "Processing",
      total: 1530,
      items: "তাজা ইলিশ মাছ (১ কেজি) ও অর্গানিক পালং শাক",
      rawItems: [
        { name: "তাজা পদ্মা ইলিশ", qty: "১ কেজি", price: 1350 },
        { name: "অর্গানিক পালং শাক", qty: "১ আঁটি", price: 60 },
        { name: "ডেলিভারি চার্জ", qty: "এক্সপ্রেস", price: 120 }
      ],
      rider: { name: "করিম মিয়া (Platinum Rider)", phone: "+880 1711-223344", rating: "4.9 ★" },
      deliveryOtp: "4826",
      canTrack: true,
    },
    {
      id: "TB-8921",
      date: "গতকাল, বিকাল ৫:০০",
      status: "Shipped",
      total: 820,
      items: "ফার্ম ফ্রেশ ডিম (১ ডজন) ও অর্গানিক খাঁটি দুধ",
      rawItems: [
        { name: "দেশি ফার্ম ডিম", qty: "১ ডজন", price: 160 },
        { name: "অর্গানিক খাঁটি তরল দুধ", qty: "২ লিটার", price: 220 },
        { name: "খাঁটি গাওয়া ঘি", qty: "২৫০ গ্রাম", price: 380 },
        { name: "ডেলিভারি চার্জ", qty: "নরমাল", price: 60 }
      ],
      rider: { name: "করিম মিয়া (Platinum Rider)", phone: "+880 1711-223344", rating: "4.9 ★" },
      deliveryOtp: "4826",
      canTrack: true,
    },
    {
      id: "TB-8890",
      date: "২ দিন আগে",
      status: "Pending",
      total: 2450,
      items: "প্রিমিয়াম বাসমতি চাল ও খাঁটি সরিষার তেল",
      rawItems: [
        { name: "প্রিমিয়াম বাসমতি চাল", qty: "৫ কেজি", price: 1850 },
        { name: "ঘানি ভাঙা সরিষার তেল", qty: "১ লিটার", price: 540 },
        { name: "ডেলিভারি চার্জ", qty: "নরমাল", price: 60 }
      ],
      canTrack: false,
    },
    {
      id: "TB-8812",
      date: "০২ সেপ্টেম্বর",
      status: "Review",
      total: 1200,
      items: "সুন্দরবনের খাঁটি মধু ও সিজনাল ড্রাগন ফল",
      rawItems: [
        { name: "সুন্দরবনের প্রাকৃতিক মধু", qty: "৫০০ গ্রাম", price: 750 },
        { name: "লাল ড্রাগন ফল", qty: "১ কেজি", price: 390 },
        { name: "ডেলিভারি চার্জ", qty: "নরমাল", price: 60 }
      ],
      canTrack: false,
    },
    {
      id: "TB-8740",
      date: "২৮ আগস্ট",
      status: "Preorder",
      total: 3500,
      items: "চাঁদপুরের স্পেশাল নদীর রূপচাঁদা ও বড় বাগদা চিংড়ি",
      rawItems: [
        { name: "নদীর ফ্রেশ রূপচাঁদা", qty: "১ কেজি", price: 1800 },
        { name: "বড় গলদা/বাগদা চিংড়ি", qty: "১ কেজি", price: 1640 },
        { name: "ডেলিভারি চার্জ", qty: "নরমাল", price: 60 }
      ],
      canTrack: false,
    }
  ]);

  // Load persisted user & settings
  useEffect(() => {
    setMounted(true);
    const rawUser = localStorage.getItem("tatka_user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed.name) setUser(parsed);
      } catch {}
    }

    const savedAddrs = localStorage.getItem("tatka_saved_addresses");
    if (savedAddrs) {
      try {
        const parsed = JSON.parse(savedAddrs);
        if (Array.isArray(parsed) && parsed.length > 0) setAddresses(parsed);
      } catch {}
    }

    const savedPoints = localStorage.getItem("tatka_loyalty_points");
    if (savedPoints) {
      setPoints(Number(savedPoints) || 55);
    }
  }, []);

  function triggerFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3200);
  }

  function handleLogout() {
    if (confirm(locale === "bn" ? "আপনি কি নিশ্চিত যে লগআউট করতে চান?" : "Are you sure you want to log out?")) {
      localStorage.removeItem("tatka_token");
      localStorage.removeItem("tatka_user");
      triggerFeedback(locale === "bn" ? "সফলভাবে লগআউট হয়েছে" : "You have been logged out.");
      setTimeout(() => {
        router.push("/login");
      }, 500);
    }
  }

  function handleAddToCart(p: any) {
    addItem(
      p,
      1,
      (p.baseUnit || "kg") as any,
      p.price || p.basePrice || 100,
      1
    );
    triggerFeedback(
      locale === "bn"
        ? `"${p.nameBn || p.nameEn}" কার্টে যোগ করা হয়েছে!`
        : `Added "${p.nameEn || p.nameBn}" to your cart!`
    );
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    triggerFeedback(locale === "bn" ? `কুপন কোড "${code}" কপি করা হয়েছে!` : `Coupon code "${code}" copied!`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  }

  function handleApplyCoupon(code: string) {
    const res = applyCoupon(code);
    if (res.success) {
      triggerFeedback(locale === "bn" ? `🎉 কুপন "${code}" সফলভাবে অ্যাপ্লাই করা হয়েছে!` : `🎉 Coupon "${code}" applied successfully!`);
    } else {
      triggerFeedback(locale === "bn" ? `⚠️ ${res.message}` : `⚠️ ${res.message}`);
    }
  }

  function handleRedeemPoints() {
    if (points < 50) {
      triggerFeedback(locale === "bn" ? "আপনার পর্যাপ্ত পয়েন্ট নেই (ন্যূনতম ৫০ পয়েন্ট লাগবে)!" : "Not enough points (minimum 50 required)!");
      return;
    }
    const newBal = points - 50;
    setPoints(newBal);
    localStorage.setItem("tatka_loyalty_points", String(newBal));
    const voucherCode = "TATKA-REDEEM-50";
    navigator.clipboard.writeText(voucherCode);
    applyCoupon(voucherCode);
    triggerFeedback(locale === "bn" ? "🎉 ৫০ পয়েন্ট রিডিম করে ৳৫০ ভাউচার যোগ করা হয়েছে!" : "🎉 50 points redeemed for ৳50 voucher!");
  }

  // Address CRUD actions
  function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    const newAddr: SavedAddress = {
      id: String(Date.now()),
      type: newAddrType,
      address: newAddrText.trim(),
      phone: newAddrPhone.trim() || "+880 1712-345678",
      isDefault: addresses.length === 0,
    };
    const updated = [...addresses, newAddr];
    setAddresses(updated);
    localStorage.setItem("tatka_saved_addresses", JSON.stringify(updated));
    setNewAddrText("");
    triggerFeedback(locale === "bn" ? "নতুন ঠিকানা সফলভাবে যোগ করা হয়েছে!" : "New address added successfully!");
  }

  function handleSetDefaultAddress(id: string) {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setAddresses(updated);
    localStorage.setItem("tatka_saved_addresses", JSON.stringify(updated));
    triggerFeedback(locale === "bn" ? "ডিফল্ট ঠিকানা আপডেট করা হয়েছে" : "Default address updated");
  }

  function handleDeleteAddress(id: string) {
    if (addresses.length <= 1) {
      triggerFeedback(locale === "bn" ? "কমপক্ষে একটি ঠিকানা থাকা প্রয়োজন" : "At least one address must be kept");
      return;
    }
    const updated = addresses.filter((a) => a.id !== id);
    if (!updated.some((a) => a.isDefault) && updated.length > 0 && updated[0]) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    localStorage.setItem("tatka_saved_addresses", JSON.stringify(updated));
    triggerFeedback(locale === "bn" ? "ঠিকানা মুছে ফেলা হয়েছে" : "Address removed");
  }

  // Reorder action
  function handleReorder(ord: CustomerOrder) {
    // Add sample items to cart
    const sampleProduct = PRODUCTS[0];
    if (sampleProduct) {
      addItem(sampleProduct, 1, (sampleProduct.baseUnit || "kg") as any, sampleProduct.basePrice, 1);
    }
    triggerFeedback(locale === "bn" ? `অর্ডার #${ord.id} এর পণ্যগুলো কার্টে যোগ করা হয়েছে!` : `Items from order #${ord.id} added to cart!`);
  }

  // Filtered orders
  const filteredOrders =
    selectedOrderStatus === "All"
      ? orders
      : orders.filter((o) => o.status.toLowerCase() === selectedOrderStatus.toLowerCase());

  // Wishlisted products
  const wishlistProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  // Hot sale products
  const hotSaleProducts = PRODUCTS.slice(0, 4);

  // Browsing history demo products
  const browsingHistoryProducts = PRODUCTS.slice(0, 5);

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Feedback Notification */}
      {feedback && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0f172a",
            color: "#ffffff",
            padding: "10px 24px",
            borderRadius: 999,
            fontSize: ".85rem",
            fontWeight: 700,
            zIndex: 9999,
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            animation: "fadeIn .2s ease-out",
          }}
        >
          <span>✨</span>
          <span>{feedback}</span>
        </div>
      )}

      <div className={styles.accountContainer}>
        {!showSettingsView ? (
          /* ===================================================================
              SCREEN 1: MAIN ECOMMERCE PROFILE
              =================================================================== */
          <div className={styles.profileView}>
          {/* Orange-Red Gradient Header Card (Image 1) */}
          <div className={styles.gradientHeader}>
            <div className={styles.headerTop}>
              <div className={styles.userInfo}>
                <div className={styles.avatarCircle}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className={styles.userName}>{user.name}</h1>
                  <div className={styles.vipPill}>
                    <span>⭐</span>
                    <span>{user.vipTier || "VIP Member"}</span>
                  </div>
                </div>
              </div>

              {/* Settings Gear Icon (Image 1) */}
              <button
                id="profile-settings-gear-btn"
                type="button"
                className={styles.settingsGearBtn}
                onClick={() => setShowSettingsView(true)}
                title={locale === "bn" ? "সেটিংস খুলুন" : "Open Settings"}
                aria-label="Open Settings"
              >
                <Settings size={18} />
                <span className={styles.settingsBtnText}>
                  {locale === "bn" ? "সেটিংস" : "Settings"}
                </span>
              </button>
            </div>

            {/* 3 Stats Row (Wishlist, Coupons, Points) */}
            <div className={styles.statsRow}>
              {/* Wishlist Stat */}
              <div
                id="stat-wishlist-btn"
                className={styles.statCol}
                onClick={() => setActiveModal("wishlist")}
                title={locale === "bn" ? "উইশলিস্ট দেখুন" : "View Wishlist"}
              >
                <div className={styles.statNum}>
                  {mounted ? wishlistIds.length || 3 : 3}
                </div>
                <div className={styles.statLabel}>
                  {locale === "bn" ? "উইশলিস্ট" : "Wishlist"}
                </div>
              </div>

              {/* Coupons Stat */}
              <div
                id="stat-coupons-btn"
                className={styles.statCol}
                onClick={() => setActiveModal("coupons")}
                title={locale === "bn" ? "কুপনসমূহ দেখুন" : "View Coupons"}
              >
                <div className={styles.statNum}>10</div>
                <div className={styles.statLabel}>
                  {locale === "bn" ? "কুপন" : "Coupons"}
                </div>
              </div>

              {/* Points Stat */}
              <div
                id="stat-points-btn"
                className={styles.statCol}
                onClick={() => setActiveModal("points")}
                title={locale === "bn" ? "লয়্যালটি পয়েন্ট দেখুন" : "View Loyalty Points"}
              >
                <div className={styles.statNum}>{points}</div>
                <div className={styles.statLabel}>
                  {locale === "bn" ? "পয়েন্ট" : "Points"}
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className={styles.contentBody}>
            {/* ── My Orders Section (Image 1) ── */}
            <div className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {locale === "bn" ? "আমার অর্ডারসমূহ" : "My Orders"}
                </h2>
                <button
                  id="orders-view-all-btn"
                  type="button"
                  className={styles.viewAllLink}
                  onClick={() => {
                    setSelectedOrderStatus("All");
                    setActiveModal("orders");
                  }}
                >
                  <span>{locale === "bn" ? "সব দেখুন" : "View All"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* 5 Order Status Icons matching Image 1 */}
              <div className={styles.orderStatusGrid}>
                {/* 1. Pending */}
                <button
                  id="order-pending-btn"
                  type="button"
                  className={styles.statusItem}
                  onClick={() => {
                    setSelectedOrderStatus("Pending");
                    setActiveModal("orders");
                  }}
                >
                  <div className={styles.statusIconBox} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706" }}>
                    <Clock size={22} />
                    <span className={styles.statusBadge}>1</span>
                  </div>
                  <span className={styles.statusLabel}>{locale === "bn" ? "পেন্ডিং" : "Pending"}</span>
                </button>

                {/* 2. Processing */}
                <button
                  id="order-processing-btn"
                  type="button"
                  className={styles.statusItem}
                  onClick={() => {
                    setSelectedOrderStatus("Processing");
                    setActiveModal("orders");
                  }}
                >
                  <div className={styles.statusIconBox} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#2563eb" }}>
                    <Package size={22} />
                    <span className={styles.statusBadge}>2</span>
                  </div>
                  <span className={styles.statusLabel}>{locale === "bn" ? "প্রসেসিং" : "Processing"}</span>
                </button>

                {/* 3. Shipped */}
                <button
                  id="order-shipped-btn"
                  type="button"
                  className={styles.statusItem}
                  onClick={() => {
                    setSelectedOrderStatus("Shipped");
                    setActiveModal("orders");
                  }}
                >
                  <div className={styles.statusIconBox} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>
                    <Truck size={22} />
                    <span className={styles.statusBadge}>1</span>
                  </div>
                  <span className={styles.statusLabel}>{locale === "bn" ? "শিপড" : "Shipped"}</span>
                </button>

                {/* 4. Review */}
                <button
                  id="order-review-btn"
                  type="button"
                  className={styles.statusItem}
                  onClick={() => {
                    setSelectedOrderStatus("Review");
                    setActiveModal("orders");
                  }}
                >
                  <div className={styles.statusIconBox} style={{ background: "rgba(168, 85, 247, 0.1)", color: "#7c3aed" }}>
                    <MessageSquareQuote size={22} />
                    <span className={styles.statusBadge}>3</span>
                  </div>
                  <span className={styles.statusLabel}>{locale === "bn" ? "রিভিউ" : "Review"}</span>
                </button>

                {/* 5. Preorder */}
                <button
                  id="order-preorder-btn"
                  type="button"
                  className={styles.statusItem}
                  onClick={() => {
                    setSelectedOrderStatus("Preorder");
                    setActiveModal("orders");
                  }}
                >
                  <div className={styles.statusIconBox} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#dc2626" }}>
                    <TimerReset size={22} />
                  </div>
                  <span className={styles.statusLabel}>{locale === "bn" ? "প্রি-অর্ডার" : "Preorder"}</span>
                </button>
              </div>
            </div>

            {/* ── Services Section (Image 1: Browsing History, Address, Support, About Us) ── */}
            <div className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {locale === "bn" ? "সার্ভিস ও সুবিধাসমূহ" : "Services"}
                </h2>
              </div>

              <div className={styles.servicesGrid}>
                {/* 1. Browsing History */}
                <button
                  id="service-history-btn"
                  type="button"
                  className={styles.serviceItem}
                  onClick={() => setActiveModal("browsingHistory")}
                >
                  <div className={styles.serviceIconBox} style={{ background: "#fee2e2", color: "#ef4444" }}>
                    <History size={20} />
                  </div>
                  <span className={styles.serviceLabel}>
                    {locale === "bn" ? "ব্রাউজিং হিস্ট্রি" : "Browsing History"}
                  </span>
                </button>

                {/* 2. Address */}
                <button
                  id="service-address-btn"
                  type="button"
                  className={styles.serviceItem}
                  onClick={() => setActiveModal("addresses")}
                >
                  <div className={styles.serviceIconBox} style={{ background: "#ffedd5", color: "#ea580c" }}>
                    <MapPin size={20} />
                  </div>
                  <span className={styles.serviceLabel}>
                    {locale === "bn" ? "সংরক্ষিত ঠিকানা" : "Address"}
                  </span>
                </button>

                {/* 3. Support */}
                <button
                  id="service-support-btn"
                  type="button"
                  className={styles.serviceItem}
                  onClick={() => setActiveModal("support")}
                >
                  <div className={styles.serviceIconBox} style={{ background: "#e0f2fe", color: "#0284c7" }}>
                    <Headphones size={20} />
                  </div>
                  <span className={styles.serviceLabel}>
                    {locale === "bn" ? "গ্রাহক সেবা" : "Support"}
                  </span>
                </button>

                {/* 4. About Us */}
                <Link href="/about" className={styles.serviceItem} style={{ textDecoration: "none" }}>
                  <div className={styles.serviceIconBox} style={{ background: "#fef3c7", color: "#d97706" }}>
                    <Info size={20} />
                  </div>
                  <span className={styles.serviceLabel}>
                    {locale === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
                  </span>
                </Link>
              </div>
            </div>

            {/* ── Hot Sale Section (Image 1: Product Grid) ── */}
            <div className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  {locale === "bn" ? "হট সেল অফার" : "Hot Sale"}
                </h2>
                <Link href="/shop" className={styles.viewAllLink}>
                  <span>{locale === "bn" ? "সব পণ্য" : "Shop All"}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              <div className={styles.hotSaleGrid}>
                {hotSaleProducts.map((p) => (
                  <div key={p.id} className={styles.hotSaleCard}>
                    <div className={styles.hotSaleImgBox}>
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.nameEn}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span>🛒</span>
                      )}
                    </div>
                    <div className={styles.hotSaleTitle}>
                      {locale === "bn" ? p.nameBn : p.nameEn}
                    </div>
                    <div className={styles.hotSaleBottom}>
                      <span className={styles.hotSalePrice}>
                        {formatPrice(p.basePrice)}
                      </span>
                      <button
                        type="button"
                        className={styles.addToCartBtn}
                        onClick={() => handleAddToCart(p)}
                        title={locale === "bn" ? "কার্টে যোগ করুন" : "Add to cart"}
                        aria-label="Add to cart"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        ) : (
        /* ===================================================================
            SCREEN 2: SETTINGS SCREEN (Image 1 Right Screen)
            =================================================================== */
        <div className={styles.settingsView}>
          {/* Header with Back Arrow (< Settings) */}
          <div className={styles.settingsHeader}>
            <button
              id="settings-back-btn"
              type="button"
              className={styles.backArrowBtn}
              onClick={() => setShowSettingsView(false)}
              aria-label="Back to Profile"
            >
              <ArrowLeft size={18} />
              <span className={styles.backBtnText}>
                {locale === "bn" ? "প্রোফাইলে ফিরুন" : "Back to Profile"}
              </span>
            </button>
            <h2 className={styles.settingsTitle}>
              {locale === "bn" ? "সেটিংস" : "Settings"}
            </h2>
          </div>

          {/* Menu Items matching Image 1 */}
          <div className={styles.settingsList}>
            {/* 1. Account Settings */}
            <button
              id="menu-account-settings-btn"
              type="button"
              className={styles.settingsItem}
              onClick={() => setActiveModal("accountSettings")}
            >
              <span className={styles.settingsItemLabel}>
                {locale === "bn" ? "অ্যাকাউন্ট সেটিংস" : "Account Settings"}
              </span>
              <div className={styles.settingsItemRight}>
                <ChevronRight size={16} />
              </div>
            </button>

            {/* 2. Address Book */}
            <button
              id="menu-address-book-btn"
              type="button"
              className={styles.settingsItem}
              onClick={() => setActiveModal("addresses")}
            >
              <span className={styles.settingsItemLabel}>
                {locale === "bn" ? "ঠিকানা বুক (Address Book)" : "Address Book"}
              </span>
              <div className={styles.settingsItemRight}>
                <ChevronRight size={16} />
              </div>
            </button>

            {/* 3. Country */}
            <button
              id="menu-country-btn"
              type="button"
              className={styles.settingsItem}
              onClick={() => setActiveModal("country")}
            >
              <span className={styles.settingsItemLabel}>
                {locale === "bn" ? "দেশ (Country)" : "Country"}
              </span>
              <div className={styles.settingsItemRight}>
                <span>{selectedCountry}</span>
                <ChevronRight size={16} />
              </div>
            </button>

            {/* 4. Currency */}
            <button
              id="menu-currency-btn"
              type="button"
              className={styles.settingsItem}
              onClick={() => setActiveModal("currency")}
            >
              <span className={styles.settingsItemLabel}>
                {locale === "bn" ? "মুদ্রা (Currency)" : "Currency"}
              </span>
              <div className={styles.settingsItemRight}>
                <span>{selectedCurrency}</span>
                <ChevronRight size={16} />
              </div>
            </button>

            {/* 5. Language */}
            <button
              id="menu-toggle-language-btn"
              type="button"
              className={styles.settingsItem}
              onClick={() => {
                toggleLocale();
                triggerFeedback(
                  locale === "bn" ? "Language switched to English" : "ভাষা পরিবর্তন করা হয়েছে বাংলায়"
                );
              }}
            >
              <span className={styles.settingsItemLabel}>
                {locale === "bn" ? "ভাষা (Language)" : "Language"}
              </span>
              <div className={styles.settingsItemRight}>
                <span>{locale === "bn" ? "বাংলা" : "English"}</span>
                <ChevronRight size={16} />
              </div>
            </button>

            {/* 6. Notification Settings */}
            <button
              id="menu-notification-settings-btn"
              type="button"
              className={styles.settingsItem}
              onClick={() => setActiveModal("notifications")}
            >
              <span className={styles.settingsItemLabel}>
                {locale === "bn" ? "নোটিফিকেশন সেটিংস" : "Notification Settings"}
              </span>
              <div className={styles.settingsItemRight}>
                <ChevronRight size={16} />
              </div>
            </button>

            {/* 7. Privacy Policy */}
            <button
              id="menu-privacy-btn"
              type="button"
              className={styles.settingsItem}
              onClick={() => setActiveModal("privacy")}
            >
              <span className={styles.settingsItemLabel}>
                {locale === "bn" ? "প্রাইভেসি ও শর্তাবলী" : "Privacy Policy"}
              </span>
              <div className={styles.settingsItemRight}>
                <ChevronRight size={16} />
              </div>
            </button>
          </div>

          {/* Red Log Out Button (Image 1 Bottom) */}
          <div className={styles.settingsFooter}>
            <button
              id="logout-btn"
              type="button"
              className={styles.logOutBtn}
              onClick={handleLogout}
            >
              <LogOut size={18} />
              <span>{locale === "bn" ? "লগ আউট করুন" : "Log Out"}</span>
            </button>
          </div>
        </div>
        )}
      </div>

      {/* ===================================================================
          LIVE TRACKING MODAL (GPS Navigation, Route Map & Rider Chat)
          =================================================================== */}
      {activeTrackingOrder && (
        <CustomerLiveTrackingModal
          isOpen={!!activeTrackingOrder}
          onClose={() => setActiveTrackingOrder(null)}
          orderId={activeTrackingOrder.id}
          orderNumber={activeTrackingOrder.id}
          deliveryAddress={addresses.find((a) => a.isDefault)?.address || "House 42, Road 7/A, Dhanmondi, Dhaka"}
          total={activeTrackingOrder.total}
        />
      )}

      {/* ===================================================================
          MODAL 1: ORDERS LIST & STATUS TABS (Live Tracking Buttons Included)
          =================================================================== */}
      {activeModal === "orders" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBoxWide} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {locale === "bn" ? "আমার অর্ডারসমূহ" : "My Orders"} ({selectedOrderStatus})
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, marginBottom: 12 }}>
              {["All", "Pending", "Processing", "Shipped", "Review", "Preorder"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedOrderStatus(st)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "none",
                    background: selectedOrderStatus === st ? "#ff5722" : "#f1f5f9",
                    color: selectedOrderStatus === st ? "#ffffff" : "#64748b",
                    fontSize: ".75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all .15s",
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: ".88rem" }}>
                  {locale === "bn" ? `"${selectedOrderStatus}" ক্যাটাগরিতে কোনো অর্ডার পাওয়া যায়নি` : `No orders found in ${selectedOrderStatus}.`}
                </div>
              ) : (
                filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 800, color: "#0f172a", fontSize: ".92rem" }}>
                            #{ord.id}
                          </span>
                          <span style={{ fontSize: ".74rem", color: "#64748b" }}>• {ord.date}</span>
                        </div>
                        <div style={{ fontSize: ".8rem", color: "#475569", marginTop: 4, lineHeight: 1.4 }}>
                          {ord.items}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: ".7rem",
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 8,
                          background:
                            ord.status === "Shipped" || ord.status === "Processing"
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(255, 87, 34, 0.12)",
                          color:
                            ord.status === "Shipped" || ord.status === "Processing" ? "#059669" : "#ff5722",
                        }}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px dashed #e2e8f0",
                        paddingTop: 10,
                        marginTop: 4,
                      }}
                    >
                      <div style={{ fontSize: ".88rem", fontWeight: 800, color: "#0f172a" }}>
                        মোট: <span style={{ color: "#ff5722" }}>৳ {ord.total.toLocaleString()}</span>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        {/* Live Tracking Button for Active Orders */}
                        {ord.canTrack && (
                          <button
                            id={`live-track-btn-${ord.id}`}
                            type="button"
                            className={styles.trackBtn}
                            onClick={() => setActiveTrackingOrder(ord)}
                          >
                            <Navigation size={13} />
                            <span>{locale === "bn" ? "লাইভ ট্র্যাক" : "Live Track"}</span>
                          </button>
                        )}

                        {/* Invoice Button */}
                        <button
                          type="button"
                          className={styles.outlineBtn}
                          onClick={() => {
                            setActiveInvoiceOrder(ord);
                            setActiveModal("invoice");
                          }}
                          title={locale === "bn" ? "ইনভয়েস রশিদ দেখুন" : "View Invoice"}
                        >
                          <FileText size={13} />
                          <span>{locale === "bn" ? "ইনভয়েস" : "Invoice"}</span>
                        </button>

                        {/* Reorder Button */}
                        <button
                          type="button"
                          className={styles.reorderBtn}
                          onClick={() => handleReorder(ord)}
                          title={locale === "bn" ? "পুনরায় অর্ডার করুন" : "Reorder"}
                        >
                          <RotateCcw size={13} />
                          <span>{locale === "bn" ? "রি-অর্ডার" : "Reorder"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: INVOICE RECEIPT MODAL
          =================================================================== */}
      {activeModal === "invoice" && activeInvoiceOrder && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal("orders")}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText size={20} color="#ff5722" />
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "অর্ডার ক্যাশ মেমো / ইনভয়েস" : "Order Invoice"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal("orders")}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: "#f8fafc", padding: 14, borderRadius: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem" }}>
                <span style={{ color: "#64748b" }}>ইনভয়েস নম্বর:</span>
                <span style={{ fontWeight: 800 }}>INV-{activeInvoiceOrder.id}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", marginTop: 4 }}>
                <span style={{ color: "#64748b" }}>তারিখ ও সময়:</span>
                <span>{activeInvoiceOrder.date}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", marginTop: 4 }}>
                <span style={{ color: "#64748b" }}>গ্রাহকের নাম:</span>
                <span style={{ fontWeight: 700 }}>{user.name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".8rem", marginTop: 4 }}>
                <span style={{ color: "#64748b" }}>ডেলিভারি ঠিকানা:</span>
                <span style={{ textAlign: "right", maxWidth: "60%" }}>
                  {addresses.find((a) => a.isDefault)?.address || "ধানমন্ডি, ঢাকা"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
                পণ্যের বিবরণ:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {activeInvoiceOrder.rawItems.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: ".8rem",
                      padding: "6px 0",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <span>
                      {it.name} <span style={{ color: "#94a3b8" }}>({it.qty})</span>
                    </span>
                    <span style={{ fontWeight: 700 }}>৳ {it.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 10,
                  borderTop: "2px dashed #cbd5e1",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: ".95rem",
                  fontWeight: 900,
                  color: "#0f172a",
                }}
              >
                <span>মোট প্রদেয় বিল:</span>
                <span style={{ color: "#ff5722" }}>৳ {activeInvoiceOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: 10,
                  background: "#0f172a",
                  color: "#ffffff",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: 700,
                  fontSize: ".82rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Printer size={15} />
                <span>প্রিন্ট / ডাউনলোড</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("orders")}
                style={{
                  padding: "10px 16px",
                  background: "#f1f5f9",
                  color: "#475569",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: 700,
                  fontSize: ".82rem",
                  cursor: "pointer",
                }}
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: WISHLIST MODAL WITH LIVE CART INTEGRATION
          =================================================================== */}
      {activeModal === "wishlist" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBoxWide} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>❤️</span>
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "আমার পছন্দের তালিকা (উইশলিস্ট)" : "My Wishlist"} ({wishlistProducts.length})
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            {wishlistProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "36px 16px" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🤍</div>
                <div style={{ fontSize: ".92rem", fontWeight: 700, color: "#334155" }}>
                  {locale === "bn" ? "আপনার উইশলিস্টে কোনো পণ্য নেই" : "Your wishlist is empty"}
                </div>
                <div style={{ fontSize: ".8rem", color: "#94a3b8", marginTop: 4 }}>
                  {locale === "bn" ? "পণ্য ব্রাউজ করে হৃদয়ে ট্যাপ করে সেভ করুন" : "Browse products and tap heart to save"}
                </div>
                <Link
                  href="/shop"
                  onClick={() => setActiveModal(null)}
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    padding: "10px 20px",
                    background: "#ff5722",
                    color: "#ffffff",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: ".82rem",
                  }}
                >
                  {locale === "bn" ? "পণ্য কেনাকাটা শুরু করুন" : "Start Shopping"}
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {wishlistProducts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: 10,
                      background: "#f8fafc",
                      borderRadius: 14,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: 10,
                        overflow: "hidden",
                        flexShrink: 0,
                        background: "#ffffff",
                      }}
                    >
                      {p.images && p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.nameEn}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span>🛒</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: ".86rem", fontWeight: 700, color: "#0f172a" }}>
                        {locale === "bn" ? p.nameBn : p.nameEn}
                      </div>
                      <div style={{ fontSize: ".8rem", fontWeight: 800, color: "#ff5722", marginTop: 2 }}>
                        {formatPrice(p.basePrice)}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(p)}
                        style={{
                          background: "#0f172a",
                          color: "#ffffff",
                          border: "none",
                          padding: "7px 12px",
                          borderRadius: 8,
                          fontSize: ".75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <ShoppingCart size={13} />
                        <span>{locale === "bn" ? "কার্টে নিন" : "Add to Cart"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeFromWishlist(p.id);
                          triggerFeedback(locale === "bn" ? "উইশলিস্ট থেকে সরানো হয়েছে" : "Removed from wishlist");
                        }}
                        style={{
                          background: "#fee2e2",
                          color: "#ef4444",
                          border: "none",
                          padding: "7px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                        title={locale === "bn" ? "মুছে ফেলুন" : "Remove"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    wishlistProducts.forEach((p) => {
                      addItem(p, 1, (p.baseUnit || "kg") as any, p.basePrice, 1);
                    });
                    triggerFeedback(locale === "bn" ? "সবগুলো পণ্য কার্টে যোগ করা হয়েছে!" : "All wishlist items added to cart!");
                  }}
                  style={{
                    marginTop: 10,
                    padding: 12,
                    background: "linear-gradient(135deg, #ff5722 0%, #ff8a3d 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: ".86rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>{locale === "bn" ? "সবগুলো পণ্য এক ক্লিকে কার্টে নিন" : "Move All to Cart"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: COUPONS & DISCOUNTS (1-Click Apply to Cart)
          =================================================================== */}
      {activeModal === "coupons" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🎟️</span>
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "উপলব্ধ কুপন ও ভাউচার (১০)" : "Available Coupons (10)"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { code: "WELCOME10", discount: "১০% ছাড় যেকোনো অর্ডারে", min: "ন্যূনতম ৳ ৩০০ অর্ডার" },
                { code: "TATKA50", discount: "৳ ৫০ ফ্ল্যাট ক্যাশব্যাক ডিসকাউন্ট", min: "ন্যূনতম ৳ ৫০০ অর্ডার" },
                { code: "TATKA10", discount: "১০% স্পেশাল ছাড় সব তাজা শাকসবজিতে", min: "ন্যূনতম ৳ ৫০০ অর্ডার" },
                { code: "FREESHIP", discount: "ফ্রি হোম ডেলিভারি", min: "ন্যূনতম ৳ ৮০০ অর্ডার" },
                { code: "EIDVIBES", discount: "৳ ১৫০ ঈদ স্পেশাল মাংস ও মাছ অফার", min: "ন্যূনতম ৳ ১৫০০ অর্ডার" },
                { code: "WELCOME50", discount: "৳ ৫০ প্রথম অর্ডার ওয়েলকাম গিফট", min: "যেকোনো নতুন অর্ডারে" },
              ].map((c) => (
                <div
                  key={c.code}
                  style={{
                    border: "1.5px dashed #cbd5e1",
                    borderRadius: 14,
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#f8fafc",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900, color: "#ff5722", fontSize: ".92rem", letterSpacing: 1 }}>
                      {c.code}
                    </div>
                    <div style={{ fontSize: ".76rem", color: "#475569", marginTop: 2 }}>
                      {c.discount}
                    </div>
                    <div style={{ fontSize: ".68rem", color: "#94a3b8" }}>{c.min}</div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(c.code)}
                      style={{
                        background: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        padding: "5px 10px",
                        borderRadius: 6,
                        fontSize: ".7rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {locale === "bn" ? "কার্টে অ্যাপ্লাই" : "Apply"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyCode(c.code)}
                      style={{
                        background: copiedCoupon === c.code ? "#0f172a" : "#e2e8f0",
                        color: copiedCoupon === c.code ? "#ffffff" : "#475569",
                        border: "none",
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: ".68rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      {copiedCoupon === c.code ? (
                        <>
                          <CheckCircle2 size={11} />
                          <span>কপিকৃত</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>কপি কোড</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 5: LOYALTY REWARD POINTS (55 Points & Redeem Voucher)
          =================================================================== */}
      {activeModal === "points" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={20} color="#f59e0b" />
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "লয়্যালটি রিওয়ার্ড পয়েন্ট" : "Loyalty Reward Points"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* Points Balance Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                borderRadius: 16,
                padding: "20px 18px",
                color: "#ffffff",
                textAlign: "center",
                marginBottom: 16,
                boxShadow: "0 6px 18px rgba(217, 119, 6, 0.25)",
              }}
            >
              <div style={{ fontSize: ".82rem", fontWeight: 700, opacity: 0.9 }}>
                {locale === "bn" ? "আপনার মোট অর্জিত পয়েন্ট" : "Current Points Balance"}
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 900, lineHeight: 1.2, margin: "6px 0" }}>
                {points}
              </div>
              <div style={{ fontSize: ".76rem", opacity: 0.95 }}>
                {locale === "bn"
                  ? `নগদ সমমূল্য: ৳${points} (১ পয়েন্ট = ৳১ ডিসকাউন্ট)`
                  : `Equivalent Cash Value: ৳${points} (1 Point = ৳1)`}
              </div>
            </div>

            {/* Redeem Action */}
            <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14, border: "1px solid #e2e8f0", marginBottom: 16 }}>
              <div style={{ fontSize: ".84rem", fontWeight: 800, color: "#0f172a" }}>
                {locale === "bn" ? "ভাউচারে রূপান্তর করুন" : "Redeem Points for Voucher"}
              </div>
              <div style={{ fontSize: ".75rem", color: "#64748b", marginTop: 2, marginBottom: 10 }}>
                {locale === "bn"
                  ? "৫০ পয়েন্ট খরচ করে পান ৳৫০ মূল্যের ইনস্ট্যান্ট কেনাকাটা ভাউচার"
                  : "Redeem 50 points to get an instant ৳50 off discount coupon."}
              </div>
              <button
                type="button"
                onClick={handleRedeemPoints}
                disabled={points < 50}
                style={{
                  width: "100%",
                  padding: 11,
                  background: points >= 50 ? "#0f172a" : "#cbd5e1",
                  color: "#ffffff",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: 800,
                  fontSize: ".82rem",
                  cursor: points >= 50 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Gift size={15} />
                <span>{locale === "bn" ? "৫০ পয়েন্ট রিডিম করে ৳৫০ ভাউচার নিন" : "Redeem 50 Points for ৳50 Voucher"}</span>
              </button>
            </div>

            {/* Points History Log */}
            <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
              {locale === "bn" ? "পয়েন্ট অর্জনের হিস্ট্রি:" : "Points Activity History:"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  fontSize: ".76rem",
                }}
              >
                <span>অর্ডার #TB-8921 ডেলিভারি বোনাস</span>
                <span style={{ fontWeight: 800, color: "#059669" }}>+৩০ পয়েন্ট</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 8,
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  fontSize: ".76rem",
                }}
              >
                <span>নতুন সদস্য সাইনআপ ওয়েলকাম গিফট</span>
                <span style={{ fontWeight: 800, color: "#059669" }}>+২৫ পয়েন্ট</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 6: BROWSING HISTORY MODAL
          =================================================================== */}
      {activeModal === "browsingHistory" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBoxWide} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <History size={20} color="#ef4444" />
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "সাম্প্রতিক ব্রাউজিং হিস্ট্রি" : "Recent Browsing History"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {browsingHistoryProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 10,
                    background: "#f8fafc",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 10,
                      overflow: "hidden",
                      flexShrink: 0,
                      background: "#ffffff",
                    }}
                  >
                    {p.images && p.images[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.nameEn}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span>🛒</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: ".86rem", fontWeight: 700, color: "#0f172a" }}>
                      {locale === "bn" ? p.nameBn : p.nameEn}
                    </div>
                    <div style={{ fontSize: ".8rem", fontWeight: 800, color: "#ff5722", marginTop: 2 }}>
                      {formatPrice(p.basePrice)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    style={{
                      background: "#0f172a",
                      color: "#ffffff",
                      border: "none",
                      padding: "7px 12px",
                      borderRadius: 8,
                      fontSize: ".75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <ShoppingCart size={13} />
                    <span>{locale === "bn" ? "কার্টে নিন" : "Add"}</span>
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  triggerFeedback(locale === "bn" ? "ব্রাউজিং হিস্ট্রি সফলভাবে খালি করা হয়েছে" : "Browsing history cleared");
                  setActiveModal(null);
                }}
                style={{
                  marginTop: 6,
                  padding: 10,
                  background: "#f1f5f9",
                  color: "#64748b",
                  border: "none",
                  borderRadius: 10,
                  fontSize: ".8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {locale === "bn" ? "হিস্ট্রি খালি করুন" : "Clear History"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 7: ADDRESS BOOK (Full CRUD)
          =================================================================== */}
      {activeModal === "addresses" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={20} color="#ff5722" />
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "সংরক্ষিত ঠিকানা তালিকা" : "Saved Addresses"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            {/* List of addresses */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {addresses.map((a) => (
                <div
                  key={a.id}
                  style={{
                    background: a.isDefault ? "rgba(255,87,34,0.04)" : "#f8fafc",
                    border: a.isDefault ? "1.5px solid #ff5722" : "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: ".82rem", color: "#0f172a" }}>
                      📍 {a.type}
                    </span>
                    {a.isDefault ? (
                      <span style={{ fontSize: ".68rem", color: "#ff5722", fontWeight: 800, background: "#ffedd5", padding: "2px 8px", borderRadius: 999 }}>
                        {locale === "bn" ? "ডিফল্ট ঠিকানা" : "Default"}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(a.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#059669",
                          fontSize: ".72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {locale === "bn" ? "ডিফল্ট করুন" : "Set Default"}
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: ".78rem", color: "#475569", marginTop: 4 }}>
                    {a.address}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <div style={{ fontSize: ".72rem", color: "#94a3b8" }}>
                      📞 {a.phone}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(a.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        padding: 4,
                      }}
                      title="Delete address"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new address form */}
            <form onSubmit={handleAddAddress} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#0f172a" }}>
                {locale === "bn" ? "নতুন ঠিকানা যোগ করুন:" : "Add New Address:"}
              </div>

              {/* Type picker */}
              <div style={{ display: "flex", gap: 6 }}>
                {(["Home", "Office", "Other"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewAddrType(t)}
                    style={{
                      flex: 1,
                      padding: "6px",
                      borderRadius: 8,
                      border: newAddrType === t ? "1.5px solid #ff5722" : "1px solid #cbd5e1",
                      background: newAddrType === t ? "#fff7ed" : "#ffffff",
                      color: newAddrType === t ? "#ff5722" : "#64748b",
                      fontSize: ".75rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t === "Home" ? "🏠 বাড়ি" : t === "Office" ? "🏢 অফিস" : "📍 অন্য"}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder={locale === "bn" ? "পূর্ণ ঠিকানা (উদা: রোড ৫, সেক্টর ৩, উত্তরা)" : "Full address (e.g. Sector 3, Uttara)"}
                value={newAddrText}
                onChange={(e) => setNewAddrText(e.target.value)}
                required
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: ".82rem",
                  outline: "none",
                }}
              />

              <input
                type="text"
                placeholder={locale === "bn" ? "যোগাযোগের ফোন নম্বর" : "Contact Phone"}
                value={newAddrPhone}
                onChange={(e) => setNewAddrPhone(e.target.value)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  fontSize: ".82rem",
                  outline: "none",
                }}
              />

              <button
                type="submit"
                style={{
                  padding: "10px",
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  fontSize: ".84rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                {locale === "bn" ? "ঠিকানা সংরক্ষণ করুন" : "Save Address"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 8: CUSTOMER SUPPORT & FAQ
          =================================================================== */}
      {activeModal === "support" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Headphones size={20} color="#0284c7" />
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "গ্রাহক সহায়তা কেন্দ্র" : "Customer Support"}
                </h3>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a
                href="tel:+8801700000000"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  background: "#f8fafc",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  textDecoration: "none",
                  color: "#0f172a",
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: 24 }}>📞</span>
                <div>
                  <div style={{ fontSize: ".88rem" }}>
                    {locale === "bn" ? "সরাসরি হটলাইন কল" : "Direct Hotline"}
                  </div>
                  <div style={{ fontSize: ".76rem", color: "#64748b" }}>
                    +880 1700-000000 (সকাল ৯টা - রাত ১০টা)
                  </div>
                </div>
              </a>

              <a
                href="https://wa.me/8801700000000?text=Hello%20Tatka%20Bazar%20Support"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  background: "#ecfdf5",
                  borderRadius: 14,
                  border: "1px solid #a7f3d0",
                  textDecoration: "none",
                  color: "#065f46",
                  fontWeight: 700,
                }}
              >
                <span style={{ fontSize: 24 }}>💬</span>
                <div>
                  <div style={{ fontSize: ".88rem" }}>
                    {locale === "bn" ? "হোয়াটসঅ্যাপ চ্যাট সহায়তা" : "WhatsApp Support"}
                  </div>
                  <div style={{ fontSize: ".76rem", color: "#047857" }}>
                    {locale === "bn" ? "তাৎক্ষণিক প্রতিনিধির সাথে কথা বলুন" : "Instant chat with support executive"}
                  </div>
                </div>
              </a>

              {/* FAQs Accordion */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
                  {locale === "bn" ? "সাধারণ জিজ্ঞাসা (FAQ):" : "Frequently Asked Questions:"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: ".78rem" }}>
                  <div style={{ background: "#f8fafc", padding: 10, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>
                      ❓ ডেলিভারি পেতে কত সময় লাগে?
                    </div>
                    <div style={{ color: "#64748b", marginTop: 3 }}>
                      এক্সপ্রেস অর্ডারে ৩০-৪৫ মিনিট এবং সাধারণ অর্ডারে সর্বোচ্চ ২ ঘণ্টার মধ্যে হোম ডেলিভারি নিশ্চিত করা হয়।
                    </div>
                  </div>
                  <div style={{ background: "#f8fafc", padding: 10, borderRadius: 10, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontWeight: 700, color: "#0f172a" }}>
                      ❓ পচা বা নষ্ট পণ্য পেলে রিফান্ড পাওয়া যাবে?
                    </div>
                    <div style={{ color: "#64748b", marginTop: 3 }}>
                      অবশ্যই! ডেলিভারির সময় রাইডারের উপস্থিতিতে চেক করে পণ্য অপছন্দ হলে সাথে সাথে ১০০% ফ্রি রিটার্ন ও রিফান্ড প্রযোজ্য।
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 9: ACCOUNT SETTINGS
          =================================================================== */}
      {activeModal === "accountSettings" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {locale === "bn" ? "অ্যাকাউন্ট তথ্য সম্পাদনা" : "Account Settings"}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveModal(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  {locale === "bn" ? "পূর্ণ নাম" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: ".88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  {locale === "bn" ? "ইমেইল অথবা মোবাইল নম্বর" : "Email or Phone"}
                </label>
                <input
                  type="text"
                  value={user.emailOrPhone}
                  onChange={(e) => setUser({ ...user, emailOrPhone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #cbd5e1",
                    fontSize: ".88rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: ".78rem", fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  {locale === "bn" ? "মেম্বারশিপ পদবী" : "Membership Tier"}
                </label>
                <div style={{ padding: "8px 12px", background: "#fef3c7", borderRadius: 10, color: "#78350f", fontWeight: 800, fontSize: ".82rem" }}>
                  ⭐ {user.vipTier || "VIP Member"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("tatka_user", JSON.stringify(user));
                  triggerFeedback(locale === "bn" ? "অ্যাকাউন্টের তথ্য সংরক্ষণ করা হয়েছে!" : "Account profile updated!");
                  setActiveModal(null);
                }}
                style={{
                  padding: 12,
                  background: "#0f172a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: ".9rem",
                  cursor: "pointer",
                  marginTop: 6,
                }}
              >
                {locale === "bn" ? "তথ্য সংরক্ষণ করুন" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 10: COUNTRY SELECTOR
          =================================================================== */}
      {activeModal === "country" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Globe size={20} color="#ff5722" />
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "দেশ নির্বাচন করুন" : "Select Country"}
                </h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: "Bangladesh", flag: "🇧🇩", local: "বাংলাদেশ" },
                { name: "India", flag: "🇮🇳", local: "ভারত" },
                { name: "United Arab Emirates", flag: "🇦🇪", local: "সংযুক্ত আরব আমিরাত" },
                { name: "United States", flag: "🇺🇸", local: "যুক্তরাষ্ট্র" },
              ].map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(c.name);
                    triggerFeedback(locale === "bn" ? `দেশ নির্বাচন করা হয়েছে: ${c.local}` : `Country set to ${c.name}`);
                    setActiveModal(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderRadius: 12,
                    border: selectedCountry === c.name ? "2px solid #ff5722" : "1px solid #e2e8f0",
                    background: selectedCountry === c.name ? "rgba(255,87,34,0.06)" : "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{c.flag}</span>
                    <span style={{ fontWeight: 700, color: "#0f172a", fontSize: ".88rem" }}>{c.name}</span>
                  </div>
                  {selectedCountry === c.name && <Check size={16} color="#ff5722" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 11: CURRENCY SELECTOR
          =================================================================== */}
      {activeModal === "currency" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {locale === "bn" ? "মুদ্রা নির্বাচন করুন" : "Select Currency"}
              </h3>
              <button type="button" className={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "BDT (৳) - Bangladeshi Taka", value: "BDT (৳)" },
                { label: "USD ($) - US Dollar", value: "USD ($)" },
                { label: "EUR (€) - Euro", value: "EUR (€)" },
              ].map((cur) => (
                <button
                  key={cur.value}
                  type="button"
                  onClick={() => {
                    setSelectedCurrency(cur.value);
                    triggerFeedback(locale === "bn" ? `কারেন্সি সেট করা হয়েছে: ${cur.value}` : `Currency set to ${cur.value}`);
                    setActiveModal(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderRadius: 12,
                    border: selectedCurrency === cur.value ? "2px solid #ff5722" : "1px solid #e2e8f0",
                    background: selectedCurrency === cur.value ? "rgba(255,87,34,0.06)" : "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#0f172a", fontSize: ".88rem" }}>{cur.label}</span>
                  {selectedCurrency === cur.value && <Check size={16} color="#ff5722" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 12: NOTIFICATION SETTINGS (SMS, Push, Offers)
          =================================================================== */}
      {activeModal === "notifications" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={20} color="#ff5722" />
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "নোটিফিকেশন পছন্দসমূহ" : "Notification Settings"}
                </h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Toggle 1 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: ".86rem", fontWeight: 700, color: "#0f172a" }}>
                    {locale === "bn" ? "অর্ডার স্ট্যাটাস SMS" : "Order Status SMS"}
                  </div>
                  <div style={{ fontSize: ".74rem", color: "#64748b" }}>
                    {locale === "bn" ? "অর্ডার নিশ্চিত ও ডেলিভারির তাৎক্ষণিক SMS" : "Instant SMS for order confirmation and dispatch"}
                  </div>
                </div>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => {
                      setNotifications({ ...notifications, sms: e.target.checked });
                      triggerFeedback(locale === "bn" ? "নোটিফিকেশন পছন্দ আপডেট হয়েছে" : "Preferences updated");
                    }}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              {/* Toggle 2 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: ".86rem", fontWeight: 700, color: "#0f172a" }}>
                    {locale === "bn" ? "লাইভ জিপিএস ট্র্যাকিং নোটিফিকেশন" : "Live GPS Push Alerts"}
                  </div>
                  <div style={{ fontSize: ".74rem", color: "#64748b" }}>
                    {locale === "bn" ? "রাইডার আপনার ঠিকানায় আসার পুশ নোটিফিকেশন" : "Real-time alert when rider is approaching your home"}
                  </div>
                </div>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => {
                      setNotifications({ ...notifications, push: e.target.checked });
                      triggerFeedback(locale === "bn" ? "নোটিফিকেশন পছন্দ আপডেট হয়েছে" : "Preferences updated");
                    }}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              {/* Toggle 3 */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: ".86rem", fontWeight: 700, color: "#0f172a" }}>
                    {locale === "bn" ? "অফার ও ডিসকাউন্ট ইমেইল" : "Promotional Email Newsletter"}
                  </div>
                  <div style={{ fontSize: ".74rem", color: "#64748b" }}>
                    {locale === "bn" ? "সাপ্তাহিক স্পেশাল ডিসকাউন্ট ও কুপন নোটিস" : "Weekly special fresh discounts and holiday coupons"}
                  </div>
                </div>
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    checked={notifications.promoEmail}
                    onChange={(e) => {
                      setNotifications({ ...notifications, promoEmail: e.target.checked });
                      triggerFeedback(locale === "bn" ? "নোটিফিকেশন পছন্দ আপডেট হয়েছে" : "Preferences updated");
                    }}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 13: PRIVACY POLICY & CONSUMER PROTECTION
          =================================================================== */}
      {activeModal === "privacy" && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={20} color="#10b981" />
                <h3 className={styles.modalTitle}>
                  {locale === "bn" ? "প্রাইভেসি পলিসি ও নিরাপত্তা" : "Privacy Policy"}
                </h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={() => setActiveModal(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: ".8rem", color: "#475569", lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: "#0f172a" }}>১. তথ্যের গোপনীয়তা:</strong> আপনার মোবাইল নম্বর, নাম এবং ডেলিভারি ঠিকানা সম্পূর্ণ এনক্রিপ্টেড ডাটাবেজে সংরক্ষিত থাকে। কোনো তৃতীয় পক্ষের সাথে তা শেয়ার করা হয় না।
              </div>
              <div>
                <strong style={{ color: "#0f172a" }}>২. লাইভ রাইডার ট্র্যাক ও নিরাপত্তা:</strong> রাইডার শুধুমাত্র অর্ডার সক্রিয় থাকা অবস্থায় সরাসরি যোগাযোগের অনুমোদন পান। অর্ডার সম্পন্ন হওয়ার পর যোগাযোগের চ্যানেল বন্ধ হয়ে যায়।
              </div>
              <div>
                <strong style={{ color: "#0f172a" }}>৩. ১০০% ফ্রেশ গ্যারান্টি:</strong> পচা বা খারাপ পণ্য প্রাপ্তির ক্ষেত্রে তাৎক্ষণিক ফ্রি এক্সচেঞ্জ অথবা পূর্ণ ক্যাশব্যাক রিফান্ড প্রদান করা হয়।
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
