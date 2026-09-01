"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Lock, Mail, Phone, MapPin, Package, Tag,
  Headphones, LogOut, CheckCircle2, ChevronRight,
  Truck, ArrowUpRight, Plus, Trash2, Copy, Heart,
  ShoppingCart, ShieldCheck, KeyRound, CreditCard, Smartphone,
  Camera, RefreshCw, Sparkles, PhoneCall, MessageSquare
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import styles from "./page.module.css";

type AccountTab =
  | "personal"
  | "orders"
  | "addresses"
  | "wishlist"
  | "cart"
  | "payments"
  | "offers"
  | "support"
  | "password";

interface CustomerProfile {
  firstName: string;
  lastName: string;
  email: string;
  primaryPhone: string;
  secondaryPhone: string;
  gender: string;
  dob: string;
  city: string;
}

interface SavedAddress {
  id: string;
  type: "Home" | "Office" | "Other";
  title: string;
  address: string;
  thana: string;
  phone: string;
  isDefault: boolean;
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const { locale, formatPrice } = useLanguage();
  const {
    items,
    wishlistIds,
    toggleWishlist,
    moveWishlistToCart,
    addItem,
    removeItem,
    getGrandTotal,
    openCart
  } = useCartStore();

  const [activeTab, setActiveTab] = useState<AccountTab>("personal");
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile Information
  const [profile, setProfile] = useState<CustomerProfile>({
    firstName: "Leslie",
    lastName: "Cooper",
    email: "leslie.cooper@tatkabazar.com",
    primaryPhone: "+880 1712-345678",
    secondaryPhone: "+880 1819-876543",
    gender: "Female",
    dob: "1995-06-12",
    city: "Dhaka",
  });

  // Saved Addresses
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: "addr-1",
      type: "Home",
      title: "Home (বাসার ঠিকানা)",
      address: "House 42, Road 7/A, Dhanmondi R/A",
      thana: "Dhanmondi, Dhaka",
      phone: "+880 1712-345678",
      isDefault: true,
    },
    {
      id: "addr-2",
      type: "Office",
      title: "Work (অফিস)",
      address: "Level 8, Tower 71, Gulshan-2",
      thana: "Gulshan, Dhaka",
      phone: "+880 1819-876543",
      isDefault: false,
    },
  ]);

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    type: "Home" as "Home" | "Office" | "Other",
    title: "",
    address: "",
    thana: "Dhanmondi, Dhaka",
    phone: "",
  });

  // Password Change State
  const [passwordState, setPasswordState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Support Ticket State
  const [ticketNotes, setTicketNotes] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Orders State
  const orders = [
    {
      id: "ord-1",
      orderNumber: "WEB-9847562",
      placedDate: "Dec 12, 2024",
      total: 1935,
      status: "In Transit",
      isInTransit: true,
      etaHeading: "Arriving Today by 4:30 PM",
      trackingId: "TB-9847562",
      items: [
        {
          id: PRODUCTS[0]?.id || "p1",
          name: PRODUCTS[0]?.nameBn || "পদ্মার তাজা রূপালি ইলিশ (১ কেজি)",
          variant: "১ কেজি • তাজা প্রিমিয়াম সাইজ",
          price: 1450,
          image: PRODUCTS[0]?.images[0] || "https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=600&auto=format&fit=crop&q=80",
          productRef: PRODUCTS[0],
        },
        {
          id: PRODUCTS[1]?.id || "p2",
          name: PRODUCTS[1]?.nameBn || "তাজা দেশি রুই মাছ (কেটে পরিষ্কার করা)",
          variant: "১ কেজি • পিস করা",
          price: 485,
          image: PRODUCTS[1]?.images[0] || "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80",
          productRef: PRODUCTS[1],
        },
      ],
    },
    {
      id: "ord-2",
      orderNumber: "WEB-9284105",
      placedDate: "Dec 08, 2024",
      total: 820,
      status: "Delivered",
      isInTransit: false,
      etaHeading: "Delivered on Dec 08, 2024",
      trackingId: "TB-9284105",
      items: [
        {
          id: PRODUCTS[2]?.id || "p3",
          name: PRODUCTS[2]?.nameBn || "লাল পাকা দেশি গোল টমেটো (২ কেজি)",
          variant: "২ কেজি • ফার্ম ফ্রেশ",
          price: 130,
          image: PRODUCTS[2]?.images[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
          productRef: PRODUCTS[2],
        },
      ],
    },
  ];

  // Coupons
  const vouchers = [
    { code: "TATKA100", discount: "৳১০০ ছাড়", desc: "প্রথম ৩টি অর্ডারে ৳১০০ ফ্ল্যাট ছাড় (মিনিমাম ৳৭০০)" },
    { code: "FREESHIP", discount: "ফ্রি ডেলিভারি", desc: "৳৫০০ বা তার বেশি অর্ডারে পুরো ঢাকা জুড়ে ফ্রি ডেলিভারি" },
    { code: "VEGGIE20", discount: "২০% ছাড়", desc: "তাজা শাকসবজিতে সর্বোচ্চ ৳১৫০ পর্যন্ত ২০% ছাড়" },
  ];

  // Wishlist Products
  const wishlistProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("Changes saved successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setSuccessMessage("Password updated successfully!");
    setPasswordState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.address || !newAddr.title) return;
    const item: SavedAddress = {
      id: "addr-" + Date.now(),
      type: newAddr.type,
      title: newAddr.title,
      address: newAddr.address,
      thana: newAddr.thana,
      phone: newAddr.phone || profile.primaryPhone,
      isDefault: addresses.length === 0,
    };
    setAddresses((prev) => [...prev, item]);
    setShowAddAddressModal(false);
    setNewAddr({ type: "Home", title: "", address: "", thana: "Dhanmondi, Dhaka", phone: "" });
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleReorder = (prod: any) => {
    if (prod) {
      addItem(prod, 1, (prod.baseUnit || "kg") as any, prod.basePrice, 1);
      alert(`"${prod.nameBn || prod.nameEn}" added to cart!`);
    }
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSuccess(`Support request received! Our team will call ${profile.primaryPhone} within 5 minutes.`);
    setTicketNotes("");
    setTimeout(() => setTicketSuccess(null), 5000);
  };

  const copyCouponCode = (code: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      setTimeout(() => setCopiedCoupon(null), 2000);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tatka_token");
    }
    router.push("/login");
  };

  return (
    <div className={styles.pageWrapper}>
      
      {/* ── Top Header Banner (Matching Dribbble Screenshot) ── */}
      <div className={styles.topHeaderBanner}>
        <div className={styles.container}>
          <h1 className={styles.bannerTitle}>My Account</h1>
          <div className={styles.bannerBreadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <span>My Account</span>
          </div>
        </div>
      </div>

      {/* ── Main White Container Card ── */}
      <div className={styles.container}>
        <div className={styles.mainCard}>
          <div className={styles.accountLayout}>

            {/* ── Left Sidebar Navigation Menu ── */}
            <aside className={styles.sidebarNav}>
              
              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "personal" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("personal")}
              >
                <span>Personal Information</span>
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "orders" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <span>My Orders</span>
                <span className={styles.navBadge}>১ টি লাইভ</span>
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "addresses" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("addresses")}
              >
                <span>Manage Address</span>
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "wishlist" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("wishlist")}
              >
                <span>Wishlist</span>
                {wishlistIds.length > 0 && (
                  <span className={styles.navBadge}>{wishlistIds.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "cart" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("cart")}
              >
                <span>My Cart</span>
                {items.length > 0 && (
                  <span className={styles.navBadge}>{items.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "payments" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("payments")}
              >
                <span>Payment Method</span>
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "offers" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("offers")}
              >
                <span>Offers & Vouchers</span>
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "support" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("support")}
              >
                <span>Live Support & Call</span>
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${activeTab === "password" ? styles.navButtonActive : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <span>Password Manager</span>
              </button>

              <button
                type="button"
                className={`${styles.navButton} ${styles.navLogout}`}
                onClick={handleLogout}
              >
                <span>Logout</span>
              </button>
            </aside>

            {/* ── Right Content Area ── */}
            <main className={styles.contentArea}>

              {/* Success Notification */}
              {successMessage && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", color: "#166534", marginBottom: "20px", fontSize: "0.88rem", fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* 1 ── PERSONAL INFORMATION TAB (Exact Dribbble layout) */}
              {activeTab === "personal" && (
                <div>
                  {/* Avatar with Camera/Edit Badge */}
                  <div className={styles.avatarWrapper}>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                      alt={profile.firstName}
                      className={styles.avatarImage}
                    />
                    <div className={styles.avatarEditBadge} title="Change Photo">
                      <Camera size={14} />
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit}>
                    <div className={styles.formGrid}>
                      
                      {/* First Name */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>First Name *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      {/* Last Name */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>Last Name *</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      {/* Email (Locked for Security) */}
                      <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.inputLabel}>
                          <span>Email *</span>
                          <span className={styles.lockedNotice}>🔒 Security Locked</span>
                        </label>
                        <input
                          type="email"
                          readOnly
                          disabled
                          value={profile.email}
                          className={`${styles.inputControl} ${styles.inputControlLocked}`}
                        />
                      </div>

                      {/* Phone (Primary Locked) */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>Phone *</span>
                          <span style={{ fontSize: "0.72rem", color: "#007A48", fontWeight: 700 }}>✓ Verified Primary</span>
                        </label>
                        <input
                          type="tel"
                          readOnly
                          disabled
                          value={profile.primaryPhone}
                          className={`${styles.inputControl} ${styles.inputControlLocked}`}
                        />
                      </div>

                      {/* Secondary Phone (Editable) */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>Secondary Phone (Optional)</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="+880 1XXXXXXXXX"
                          value={profile.secondaryPhone}
                          onChange={(e) => setProfile({ ...profile, secondaryPhone: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      {/* Gender */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>Gender *</span>
                        </label>
                        <select
                          value={profile.gender}
                          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                          className={styles.inputControl}
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* City */}
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>
                          <span>City / Division *</span>
                        </label>
                        <input
                          type="text"
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                    </div>

                    <button type="submit" className={styles.saveChangesBtn}>
                      <span>Update Changes</span>
                    </button>
                  </form>
                </div>
              )}

              {/* 2 ── MY ORDERS TAB */}
              {activeTab === "orders" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>My Orders</h3>
                    <p className={styles.sectionSubtitle}>Track your live deliveries and view past orders</p>
                  </div>

                  {orders.map((ord) => (
                    <div key={ord.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div className={styles.orderMetaGroup}>
                          <div>
                            <div className={styles.orderMetaLabel}>Order Placed</div>
                            <div className={styles.orderMetaValue}>{ord.placedDate}</div>
                          </div>
                          <div>
                            <div className={styles.orderMetaLabel}>Order Number</div>
                            <div className={styles.orderMetaValue}>{ord.orderNumber}</div>
                          </div>
                          <div>
                            <div className={styles.orderMetaLabel}>Total</div>
                            <div className={styles.orderMetaValue}>৳{ord.total.toLocaleString("en-BD")}</div>
                          </div>
                        </div>

                        <span className={`${styles.statusPill} ${ord.isInTransit ? styles.statusInTransit : ""}`}>
                          ● {ord.status}
                        </span>
                      </div>

                      {/* Live Tracking Banner */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", margin: "14px 0", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <Truck size={18} color="#007A48" />
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{ord.etaHeading}</span>
                        </div>
                        <Link href={`/track/${ord.trackingId}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.82rem", fontWeight: 700, color: "#007A48", textDecoration: "none" }}>
                          <span>Track</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>

                      {/* Items */}
                      {ord.items.map((it) => (
                        <div key={it.id} className={styles.orderItemRow}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <img src={it.image} alt={it.name} className={styles.itemImg} />
                            <div>
                              <h5 style={{ margin: "0 0 2px 0", fontSize: "0.88rem", fontWeight: 700, color: "#0f172a" }}>{it.name}</h5>
                              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{it.variant}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                            <span style={{ fontWeight: 800, fontSize: "0.92rem", color: "#0f172a" }}>৳{it.price.toLocaleString("en-BD")}</span>
                            <button
                              type="button"
                              onClick={() => handleReorder(it.productRef)}
                              style={{ padding: "6px 12px", borderRadius: "6px", background: "#f1f5f9", border: "1px solid #cbd5e1", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              <RefreshCw size={12} />
                              <span>Buy Again</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* 3 ── MANAGE ADDRESS TAB */}
              {activeTab === "addresses" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                      <h3 className={styles.sectionTitle}>Manage Address</h3>
                      <p className={styles.sectionSubtitle}>Save home and office addresses for faster delivery</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddAddressModal(true)}
                      style={{ padding: "9px 18px", borderRadius: "8px", background: "#007A48", color: "#ffffff", border: "none", fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                      <Plus size={15} />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {showAddAddressModal && (
                    <form onSubmit={handleAddAddressSubmit} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
                      <h4 style={{ margin: "0 0 14px 0", fontSize: "0.95rem", color: "#0f172a" }}>New Address Form</h4>
                      <div className={styles.formGrid}>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Address Title (e.g. My Home / Office)</label>
                          <input
                            type="text"
                            required
                            placeholder="My Home"
                            value={newAddr.title}
                            onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                            className={styles.inputControl}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Type</label>
                          <select
                            value={newAddr.type}
                            onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value as any })}
                            className={styles.inputControl}
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                          <label className={styles.inputLabel}>Full Street Address</label>
                          <input
                            type="text"
                            required
                            placeholder="House 12, Road 4, Flat B2"
                            value={newAddr.address}
                            onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                            className={styles.inputControl}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "14px" }}>
                        <button type="button" onClick={() => setShowAddAddressModal(false)} style={{ padding: "8px 16px", borderRadius: "6px", background: "none", border: "1px solid #cbd5e1", cursor: "pointer" }}>Cancel</button>
                        <button type="submit" className={styles.saveChangesBtn} style={{ marginTop: 0, padding: "8px 20px" }}>Save Address</button>
                      </div>
                    </form>
                  )}

                  <div className={styles.addressGrid}>
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ""}`}>
                        <div>
                          <span className={styles.addressBadge}>{addr.type}</span>
                          <h4 style={{ margin: "10px 0 4px 0", fontSize: "0.95rem", color: "#0f172a" }}>{addr.title}</h4>
                          <p className={styles.addressText}>{addr.address}, {addr.thana}</p>
                          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "6px 0 0 0" }}>📞 {addr.phone}</p>
                        </div>

                        <div style={{ display: "flex", gap: "10px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                          {!addr.isDefault && (
                            <button type="button" onClick={() => handleSetDefaultAddress(addr.id)} style={{ fontSize: "0.78rem", fontWeight: 700, color: "#007A48", background: "none", border: "none", cursor: "pointer" }}>Set as Default</button>
                          )}
                          <button type="button" onClick={() => handleDeleteAddress(addr.id)} style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ef4444", background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4 ── WISHLIST TAB (Added as requested) */}
              {activeTab === "wishlist" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>My Wishlist ({wishlistProducts.length})</h3>
                    <p className={styles.sectionSubtitle}>Your saved farm-fresh favorites</p>
                  </div>

                  {wishlistProducts.length > 0 ? (
                    <div className={styles.wishlistGrid}>
                      {wishlistProducts.map((p) => (
                        <div key={p.id} className={styles.wishlistCard}>
                          <img src={p.images[0]} alt={p.nameEn} className={styles.wishlistImg} />
                          <div>
                            <h4 className={styles.wishlistTitle}>{locale === "bn" ? p.nameBn : p.nameEn}</h4>
                            <div className={styles.wishlistPrice}>{formatPrice(p.basePrice)}</div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                moveWishlistToCart(p, true);
                              }}
                              className={styles.moveToCartBtn}
                            >
                              <ShoppingCart size={14} />
                              <span>Move to Cart</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(p.id)}
                              style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", padding: "4px" }}
                            >
                              Remove from Wishlist
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                      <Heart size={40} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
                      <p>Your wishlist is currently empty.</p>
                      <Link href="/" style={{ color: "#007A48", fontWeight: 700, textDecoration: "none" }}>Browse Fresh Products →</Link>
                    </div>
                  )}
                </div>
              )}

              {/* 5 ── MY CART TAB (Added as requested) */}
              {activeTab === "cart" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>My Shopping Cart ({items.length})</h3>
                    <p className={styles.sectionSubtitle}>View and manage items in your cart</p>
                  </div>

                  {items.length > 0 ? (
                    <div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                        {items.map((it) => (
                          <div key={it.id} className={styles.orderItemRow} style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img src={it.product?.images?.[0]} alt={it.product?.nameEn} className={styles.itemImg} />
                              <div>
                                <h4 style={{ margin: "0 0 2px 0", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{locale === "bn" ? it.product?.nameBn : it.product?.nameEn}</h4>
                                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{it.selectedWeight} {it.selectedUnit} × {it.quantity}</span>
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                              <span style={{ fontWeight: 800, fontSize: "1rem", color: "#007A48" }}>{formatPrice(it.unitPrice * it.quantity)}</span>
                              <button type="button" onClick={() => removeItem(it.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={15} /></button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#0f172a", borderRadius: "14px", color: "#ffffff", marginBottom: "20px" }}>
                        <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>Total Amount:</span>
                        <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#10D876" }}>{formatPrice(getGrandTotal())}</span>
                      </div>

                      <Link href="/checkout" style={{ display: "block", textAlign: "center", width: "100%", padding: "14px 0", borderRadius: "10px", background: "#007A48", color: "#ffffff", fontWeight: 800, textDecoration: "none", fontSize: "0.95rem" }}>
                        Proceed to Checkout →
                      </Link>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
                      <ShoppingCart size={40} style={{ margin: "0 auto 12px auto", opacity: 0.4 }} />
                      <p>Your cart is empty.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 6 ── PAYMENT METHOD TAB */}
              {activeTab === "payments" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Payment Method</h3>
                    <p className={styles.sectionSubtitle}>Manage your connected wallets and payment options</p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", border: "1.5px solid #e2e8f0", borderRadius: "14px", background: "#ffffff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Smartphone size={20} color="#e11d48" />
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>bKash Wallet</div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Connected with {profile.primaryPhone}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "#f0fdf4", color: "#166534" }}>Active</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", border: "1.5px solid #e2e8f0", borderRadius: "14px", background: "#ffffff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <CreditCard size={20} color="#007A48" />
                        <div>
                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>Cash on Delivery</div>
                          <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Pay at your doorstep after inspecting items</div>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", background: "#f0fdf4", color: "#166534" }}>Enabled</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 7 ── OFFERS & VOUCHERS TAB */}
              {activeTab === "offers" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Offers & Vouchers</h3>
                    <p className={styles.sectionSubtitle}>Active discount coupons and rewards wallet</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                    {vouchers.map((v) => (
                      <div key={v.code} style={{ border: "1.5px dashed #007A48", borderRadius: "14px", padding: "18px", background: "#f0fdf4" }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#007A48", marginBottom: "4px" }}>{v.discount}</div>
                        <p style={{ fontSize: "0.8rem", color: "#475569", margin: "0 0 12px 0", lineHeight: 1.4 }}>{v.desc}</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 800, fontSize: "0.88rem", background: "#ffffff", padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>{v.code}</span>
                          <button
                            type="button"
                            onClick={() => copyCouponCode(v.code)}
                            style={{ background: "#007A48", color: "#ffffff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            {copiedCoupon === v.code ? "Copied!" : "Copy Code"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8 ── LIVE SUPPORT & CALLBACK TAB */}
              {activeTab === "support" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Live Support & Instant Callback</h3>
                    <p className={styles.sectionSubtitle}>Request an immediate callback from our support manager</p>
                  </div>

                  {ticketSuccess && (
                    <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", color: "#166534", marginBottom: "18px", fontSize: "0.88rem" }}>
                      {ticketSuccess}
                    </div>
                  )}

                  <form onSubmit={handleTicketSubmit} style={{ background: "#f8fafc", padding: "20px", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Describe Your Issue / Question</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="e.g. Need delivery time change for order WEB-9847562..."
                        value={ticketNotes}
                        onChange={(e) => setTicketNotes(e.target.value)}
                        className={styles.inputControl}
                        style={{ height: "auto" }}
                      />
                    </div>
                    <button type="submit" className={styles.saveChangesBtn} style={{ marginTop: "14px" }}>
                      <PhoneCall size={15} />
                      <span>Request Instant Callback ({profile.primaryPhone})</span>
                    </button>
                  </form>

                  <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                    <a href="tel:09612828520" style={{ flex: 1, minWidth: "200px", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff", textDecoration: "none", color: "#0f172a", display: "flex", alignItems: "center", gap: "10px" }}>
                      <Phone size={18} color="#007A48" />
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>Emergency Hotline</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>09612-828520</div>
                      </div>
                    </a>

                    <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: "200px", padding: "14px", borderRadius: "10px", border: "1px solid #22c55e", background: "#f0fdf4", textDecoration: "none", color: "#166534", display: "flex", alignItems: "center", gap: "10px" }}>
                      <MessageSquare size={18} color="#22c55e" />
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>WhatsApp Chat</div>
                        <div style={{ fontSize: "0.75rem", color: "#15803d" }}>Direct WhatsApp Live Support</div>
                      </div>
                    </a>
                  </div>
                </div>
              )}

              {/* 9 ── PASSWORD MANAGER TAB */}
              {activeTab === "password" && (
                <div>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Password & Security</h3>
                    <p className={styles.sectionSubtitle}>Change your account login password</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit}>
                    <div className={styles.formGrid}>
                      <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label className={styles.inputLabel}>Current Password *</label>
                        <input
                          type="password"
                          required
                          value={passwordState.currentPassword}
                          onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>New Password *</label>
                        <input
                          type="password"
                          required
                          value={passwordState.newPassword}
                          onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Confirm New Password *</label>
                        <input
                          type="password"
                          required
                          value={passwordState.confirmPassword}
                          onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>
                    </div>

                    <button type="submit" className={styles.saveChangesBtn}>
                      <KeyRound size={15} />
                      <span>Update Password</span>
                    </button>
                  </form>
                </div>
              )}

            </main>
          </div>
        </div>
      </div>

    </div>
  );
}
