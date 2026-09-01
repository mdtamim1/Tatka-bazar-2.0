"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Lock, Mail, Phone, MapPin, Package, Tag,
  Headphones, LogOut, CheckCircle2, ChevronRight,
  Truck, ArrowUpRight, Search, Plus, Trash2, Edit3,
  Copy, ExternalLink, ShieldCheck, AlertCircle, Calendar,
  Sparkles, RefreshCw, FileText, MessageSquare, PhoneCall,
  Clock, ShieldAlert
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/lib/cart-store";
import { PRODUCTS } from "@/lib/catalog";
import styles from "./page.module.css";

type AccountTab = "profile" | "orders" | "addresses" | "offers" | "support";

interface CustomerProfile {
  name: string;
  email: string; // LOCKED
  primaryPhone: string; // LOCKED
  secondaryPhone: string; // EDITABLE
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

interface SupportTicket {
  id: string;
  issueType: string;
  orderNumber: string;
  status: "CALL_QUEUED" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  notes: string;
}

export default function CustomerAccountPage() {
  const router = useRouter();
  const { locale, formatPrice } = useLanguage();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"ALL" | "IN_PROGRESS" | "DELIVERED" | "RETURNS">("ALL");

  // Profile State (Email & Primary Phone are permanent / locked)
  const [profile, setProfile] = useState<CustomerProfile>({
    name: "রাফিক আহমেদ (Rafiq Ahmed)",
    email: "rafiq.ahmed@tatkabazar.com",
    primaryPhone: "+880 1712-345678",
    secondaryPhone: "+880 1819-876543",
    gender: "Male",
    dob: "1994-08-15",
    city: "Dhaka",
  });

  // Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: "addr-1",
      type: "Home",
      title: "বাসার ঠিকানা (Home)",
      address: "House 42, Road 7/A, Dhanmondi R/A",
      thana: "Dhanmondi, Dhaka",
      phone: "+880 1712-345678",
      isDefault: true,
    },
    {
      id: "addr-2",
      type: "Office",
      title: "অফিস (Work)",
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
    isDefault: false,
  });

  // Active Support Tickets
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "TK-9842",
      issueType: "ডেলিভারি আপডেট ও রাইডার লোকেশন",
      orderNumber: "TB-9847562",
      status: "CALL_QUEUED",
      createdAt: "আজ দুপুর ২:১৫",
      notes: "রাইডার কল রিকোয়েস্ট — ৫ মিনিটের মধ্যে কল যাবে",
    },
  ]);

  const [ticketForm, setTicketForm] = useState({
    issueType: "ডেলিভারি বিলম্ব / রাইডার ট্র্যাকিং",
    orderNumber: "TB-9847562",
    notes: "",
  });
  const [ticketSubmittedMsg, setTicketSubmittedMsg] = useState<string | null>(null);

  // Orders State (Matching reference mockup exactly!)
  const orders = [
    {
      id: "ord-1",
      orderNumber: "WEB-9847562",
      placedDate: "Dec 12, 2024",
      placedDateBn: "১২ ডিসেম্বর ২০২৪",
      total: 1935,
      status: "IN_TRANSIT", // IN_TRANSIT | DELIVERED | PREPARING | CANCELLED
      statusLabel: "In Transit",
      statusLabelBn: "পথে রয়েছে (In Transit)",
      etaHeading: "Arriving Today by 4:30 PM",
      etaHeadingBn: "আজ বিকাল ৪:৩০ এর মধ্যে পৌঁছাবে",
      etaSub: "Your package is on its way with Fresh Delivery Rider",
      etaSubBn: "আপনার অর্গানিক বাজার রাইডার ডেলিভারির উদ্দেশ্যে রওনা হয়েছে",
      trackingId: "TB-9847562",
      items: [
        {
          id: PRODUCTS[0]?.id ?? "p1",
          nameBn: PRODUCTS[0]?.nameBn ?? "পদ্মার তাজা রূপালি ইলিশ (১ কেজি)",
          nameEn: PRODUCTS[0]?.nameEn ?? "Fresh Padma River Hilsa Fish (1kg size)",
          variant: "১ কেজি • তাজা প্রিমিয়াম সাইজ",
          price: 1450,
          image: PRODUCTS[0]?.images[0] ?? "https://images.unsplash.com/photo-1544943910-4c1dc44a0b27?w=600&auto=format&fit=crop&q=80",
          productRef: PRODUCTS[0],
        },
        {
          id: PRODUCTS[1]?.id ?? "p2",
          nameBn: PRODUCTS[1]?.nameBn ?? "তাজা দেশি রুই মাছ (কেটে পরিষ্কার করা)",
          nameEn: PRODUCTS[1]?.nameEn ?? "Fresh Local Rui Fish (Cleaned & Cut)",
          variant: "১ কেজি • পিস করা",
          price: 485,
          image: PRODUCTS[1]?.images[0] ?? "https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&auto=format&fit=crop&q=80",
          productRef: PRODUCTS[1],
        },
      ],
    },
    {
      id: "ord-2",
      orderNumber: "WEB-9284105",
      placedDate: "Dec 08, 2024",
      placedDateBn: "৮ ডিসেম্বর ২০২৪",
      total: 820,
      status: "DELIVERED",
      statusLabel: "Delivered",
      statusLabelBn: "ডেলিভারি সম্পন্ন",
      etaHeading: "Delivered on Dec 08, 2024 at 11:20 AM",
      etaHeadingBn: "৮ ডিসেম্বর সকাল ১১:২০ এ ডেলিভারি সম্পন্ন হয়েছে",
      etaSub: "Package handed over directly to customer at Dhanmondi",
      etaSubBn: "গ্রাহকের হাতে সফলভাবে হস্তান্তর করা হয়েছে",
      trackingId: "TB-9284105",
      items: [
        {
          id: PRODUCTS[2]?.id ?? "p3",
          nameBn: PRODUCTS[2]?.nameBn ?? "লাল পাকা দেশি গোল টমেটো (১ কেজি)",
          nameEn: PRODUCTS[2]?.nameEn ?? "Organic Farm Fresh Round Tomatoes",
          variant: "২ কেজি • ফার্ম ফ্রেশ",
          price: 130,
          image: PRODUCTS[2]?.images[0] ?? "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
          productRef: PRODUCTS[2],
        },
        {
          id: PRODUCTS[3]?.id ?? "p4",
          nameBn: PRODUCTS[3]?.nameBn ?? "তাজা দেশি ফুলকপি (মাঝারি ২ পিস)",
          nameEn: PRODUCTS[3]?.nameEn ?? "Fresh Organic Cauliflower",
          variant: "২ পিস • কীটনাশকমুক্ত",
          price: 90,
          image: PRODUCTS[3]?.images[0] ?? "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600&auto=format&fit=crop&q=80",
          productRef: PRODUCTS[3],
        },
      ],
    },
  ];

  // Filtered Orders
  const filteredOrders = orders.filter(ord => {
    if (orderStatusFilter === "IN_PROGRESS" && ord.status !== "IN_TRANSIT" && ord.status !== "PREPARING") return false;
    if (orderStatusFilter === "DELIVERED" && ord.status !== "DELIVERED") return false;
    if (orderStatusFilter === "RETURNS" && ord.status !== "CANCELLED") return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = ord.orderNumber.toLowerCase().includes(q);
      const matchItem = ord.items.some(it => it.nameEn.toLowerCase().includes(q) || it.nameBn.toLowerCase().includes(q));
      return matchNum || matchItem;
    }
    return true;
  });

  // Vouchers
  const vouchers = [
    {
      code: "TATKA100",
      discount: "৳১০০ ছাড়",
      discountEn: "৳100 OFF",
      desc: "প্রথম ৩টি অর্ডারে ৳১০০ ফ্ল্যাট ছাড় (ন্যূনতম অর্ডার ৳৭০০)",
      validity: "মেয়াদ: ৩১ ডিসেম্বর ২০২৬ পর্যন্ত",
    },
    {
      code: "FREESHIP",
      discount: "ফ্রি ডেলিভারি",
      discountEn: "Free Delivery",
      desc: "৳৫০০ বা তার বেশি অর্ডারে পুরো ঢাকা জুড়ে ফ্রি হোম ডেলিভারি",
      validity: "মেয়াদ: আনলিমিটেড",
    },
    {
      code: "VEGGIE20",
      discount: "২০% ছাড়",
      discountEn: "20% OFF",
      desc: "যেকোনো তাজা শাকসবজি ও সালাদ আইটেমে সর্বোচ্চ ৳১৫০ পর্যন্ত ২০% ছাড়",
      validity: "মেয়াদ: এই সপ্তাহান্তে",
    },
    {
      code: "BKASH10",
      discount: "১০% ক্যাশব্যাক",
      discountEn: "10% Cashback",
      desc: "বিকাশ দিয়ে অনলাইন পেমেন্ট করলেই ১০% ইনস্ট্যান্ট ক্যাশব্যাক",
      validity: "মেয়াদ: বিকাশ ক্যাম্পেইন চলাকালীন",
    },
  ];

  function copyCode(code: string) {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(code);
      setTimeout(() => setCopiedCoupon(null), 2000);
    }
  }

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSuccessMsg("প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
    setTimeout(() => setProfileSuccessMsg(null), 3000);
  }

  function handleAddAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newAddr.address || !newAddr.title) return;
    const item: SavedAddress = {
      id: "addr-" + Date.now(),
      type: newAddr.type,
      title: newAddr.title,
      address: newAddr.address,
      thana: newAddr.thana,
      phone: newAddr.phone || profile.primaryPhone,
      isDefault: newAddr.isDefault || addresses.length === 0,
    };
    if (item.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(item));
    } else {
      setAddresses(prev => [...prev, item]);
    }
    setShowAddAddressModal(false);
    setNewAddr({ type: "Home", title: "", address: "", thana: "Dhanmondi, Dhaka", phone: "", isDefault: false });
  }

  function handleDeleteAddress(id: string) {
    setAddresses(prev => prev.filter(a => a.id !== id));
  }

  function handleSetDefaultAddress(id: string) {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  }

  function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newTk: SupportTicket = {
      id: "TK-" + Math.floor(1000 + Math.random() * 9000),
      issueType: ticketForm.issueType,
      orderNumber: ticketForm.orderNumber,
      status: "CALL_QUEUED",
      createdAt: "এইমাত্র",
      notes: ticketForm.notes || "কাস্টমার লাইভ সাপোর্ট রিকোয়েস্ট",
    };
    setTickets(prev => [newTk, ...prev]);
    setTicketSubmittedMsg(`কল রিকোয়েস্ট জমা হয়েছে! আমাদের সাপোর্ট টিম ৫-১০ মিনিটের মধ্যে আপনার নম্বর ${profile.primaryPhone}-এ কল করবে।`);
    setTicketForm({ issueType: "ডেলিভারি বিলম্ব / রাইডার ট্র্যাকিং", orderNumber: "TB-9847562", notes: "" });
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("tatka_token");
    }
    router.push("/login");
  }

  function handleReorder(product: any) {
    if (product) {
      addItem(product, 1, (product.baseUnit || "kg") as any, product.basePrice, 1);
      alert(`"${product.nameBn}" কার্টে যুক্ত করা হয়েছে!`);
    }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">হোম</Link>
          <ChevronRight size={14} />
          <span>আমার অ্যাকাউন্ট</span>
        </div>

        {/* Top Banner Profile Summary */}
        <div className={styles.topBanner}>
          <div className={styles.profileInfo}>
            <div className={styles.avatar}>
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 className={styles.userName}>
                <span>{profile.name}</span>
                <span className={styles.memberBadge}>🌟 গোল্ড মেম্বার</span>
              </h1>
              <div className={styles.userMeta}>
                <span className={styles.metaItem}>
                  <Mail size={13} style={{ color: "#10D876" }} />
                  <span>{profile.email}</span>
                </span>
                <span className={styles.metaItem}>
                  <Phone size={13} style={{ color: "#10D876" }} />
                  <span>{profile.primaryPhone}</span>
                </span>
                <span className={styles.metaItem}>
                  <MapPin size={13} style={{ color: "#10D876" }} />
                  <span>{profile.city}, বাংলাদেশ</span>
                </span>
              </div>
            </div>
          </div>

          <div className={styles.topBannerStats}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>৪৫০</div>
              <div className={styles.statLabel}>তাতকা গ্রিন পয়েন্ট</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>১২ টি</div>
              <div className={styles.statLabel}>মোট সম্পন্ন বাজার</div>
            </div>
          </div>
        </div>

        {/* Account Grid Layout */}
        <div className={styles.accountLayout}>

          {/* Left Navigation Rail */}
          <aside className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${activeTab === "profile" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <div className={styles.navItemLeft}>
                <User size={18} />
                <span>প্রোফাইল সেটিংস</span>
              </div>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === "orders" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <div className={styles.navItemLeft}>
                <Package size={18} />
                <span>অর্ডার হিস্ট্রি ও ট্র্যাকিং</span>
              </div>
              <span className={styles.navBadge}>১ টি লাইভ</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === "addresses" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("addresses")}
            >
              <div className={styles.navItemLeft}>
                <MapPin size={18} />
                <span>সংরক্ষিত ঠিকানা</span>
              </div>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === "offers" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("offers")}
            >
              <div className={styles.navItemLeft}>
                <Tag size={18} />
                <span>অফার ও ভাউচার</span>
              </div>
              <span className={styles.navBadge}>৪ টি</span>
            </button>

            <button
              className={`${styles.navItem} ${activeTab === "support" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("support")}
            >
              <div className={styles.navItemLeft}>
                <Headphones size={18} />
                <span>লাইভ সাপোর্ট ও কল</span>
              </div>
            </button>

            <div className={styles.navDivider} />

            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={18} />
              <span>লগআউট করুন</span>
            </button>
          </aside>

          {/* Main Content Area */}
          <main className={styles.contentArea}>

            {/* 1 ── PROFILE & SECURITY TAB */}
            {activeTab === "profile" && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>প্রোফাইল ও নিরাপত্তা</h2>
                  <p className={styles.sectionSubtitle}>
                    আপনার ব্যক্তিগত তথ্য আপডেট করুন। অ্যাকাউন্টের সর্বোচ্চ নিরাপত্তার জন্য ইমেইল ও প্রাইমারি মোবাইল নম্বর লক করা থাকে।
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className={styles.successBanner} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "rgba(16,216,118,0.12)", border: "1px solid rgba(16,216,118,0.3)", borderRadius: "8px", color: "#86efac", marginBottom: "18px", fontSize: "0.85rem" }}>
                    <CheckCircle2 size={16} />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile}>
                  <div className={styles.formGrid}>
                    
                    {/* Full Name */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>পুরো নাম (Full Name)</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className={styles.inputControl}
                        required
                      />
                    </div>

                    {/* Email (LOCKED) */}
                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldLabelRow}>
                        <label className={styles.fieldLabel}>ইমেইল এড্রেস</label>
                        <span className={styles.lockedTag}>
                          <Lock size={11} />
                          <span>পরিবর্তনযোগ্য নয়</span>
                        </span>
                      </div>
                      <input
                        type="email"
                        value={profile.email}
                        readOnly
                        disabled
                        className={`${styles.inputControl} ${styles.inputControlLocked}`}
                      />
                      <span className={styles.helperText}>🔒 সিকিউরিটি পলিসির কারণে ইমেইল পরিবর্তন করা যাবে না।</span>
                    </div>

                    {/* Primary Mobile (LOCKED ONCE ADDED) */}
                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldLabelRow}>
                        <label className={styles.fieldLabel}>প্রাইমারি মোবাইল নম্বর</label>
                        <span className={styles.verifiedTag}>
                          <ShieldCheck size={12} />
                          <span>ভেরিফাইড প্রাইমারি</span>
                        </span>
                      </div>
                      <input
                        type="tel"
                        value={profile.primaryPhone}
                        readOnly
                        disabled
                        className={`${styles.inputControl} ${styles.inputControlLocked}`}
                      />
                      <span className={styles.helperText}>অর্ডার কনফার্মেশন ও ওটিপি এই নম্বরে পাঠানো হয়।</span>
                    </div>

                    {/* Secondary / Optional Mobile (EDITABLE) */}
                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldLabelRow}>
                        <label className={styles.fieldLabel}>বিকল্প মোবাইল নম্বর (ঐচ্ছিক)</label>
                        <span style={{ fontSize: "0.72rem", color: "#10D876", fontWeight: 600 }}>এডিট করা যাবে</span>
                      </div>
                      <input
                        type="tel"
                        value={profile.secondaryPhone}
                        onChange={e => setProfile({ ...profile, secondaryPhone: e.target.value })}
                        placeholder="+880 1XXXXXXXXX"
                        className={styles.inputControl}
                      />
                      <span className={styles.helperText}>রাইডার আপনাকে মূল নম্বরে না পেলে এই নম্বরে যোগাযোগ করবে।</span>
                    </div>

                    {/* Gender */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>লিঙ্গ (Gender)</label>
                      <select
                        value={profile.gender}
                        onChange={e => setProfile({ ...profile, gender: e.target.value })}
                        className={styles.inputControl}
                      >
                        <option value="Male">পুরুষ (Male)</option>
                        <option value="Female">মহিলা (Female)</option>
                        <option value="Other">অন্যান্য (Other)</option>
                      </select>
                    </div>

                    {/* Date of Birth */}
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>জন্মতারিখ (Date of Birth)</label>
                      <input
                        type="date"
                        value={profile.dob}
                        onChange={e => setProfile({ ...profile, dob: e.target.value })}
                        className={styles.inputControl}
                      />
                    </div>

                    {/* City */}
                    <div className={`${styles.fieldGroup} ${styles.formFieldFull}`}>
                      <label className={styles.fieldLabel}>বর্তমান শহর (City)</label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={e => setProfile({ ...profile, city: e.target.value })}
                        className={styles.inputControl}
                      />
                    </div>

                  </div>

                  <div className={styles.actionBtnRow}>
                    <button type="submit" className={styles.primarySaveBtn}>
                      <span>পরিবর্তন সংরক্ষণ করুন</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2 ── ORDERS & TRACKING TAB (Matching Sample Screenshot) */}
            {activeTab === "orders" && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Your Orders</h2>
                  <p className={styles.sectionSubtitle}>
                    Track, return, or buy items again
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className={styles.ordersTopBar}>
                  <div className={styles.orderFilterTabs}>
                    <button
                      className={`${styles.filterTabBtn} ${orderStatusFilter === "ALL" ? styles.filterTabBtnActive : ""}`}
                      onClick={() => setOrderStatusFilter("ALL")}
                    >
                      All Orders
                    </button>
                    <button
                      className={`${styles.filterTabBtn} ${orderStatusFilter === "IN_PROGRESS" ? styles.filterTabBtnActive : ""}`}
                      onClick={() => setOrderStatusFilter("IN_PROGRESS")}
                    >
                      In Progress
                    </button>
                    <button
                      className={`${styles.filterTabBtn} ${orderStatusFilter === "DELIVERED" ? styles.filterTabBtnActive : ""}`}
                      onClick={() => setOrderStatusFilter("DELIVERED")}
                    >
                      Delivered
                    </button>
                    <button
                      className={`${styles.filterTabBtn} ${orderStatusFilter === "RETURNS" ? styles.filterTabBtnActive : ""}`}
                      onClick={() => setOrderStatusFilter("RETURNS")}
                    >
                      Returns
                    </button>
                  </div>

                  <div className={styles.searchOrderWrapper}>
                    <Search size={15} className={styles.searchOrderIcon} />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      className={styles.searchOrderInput}
                    />
                  </div>
                </div>

                {/* Orders List */}
                <div className={styles.orderList}>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <div key={order.id} className={styles.orderCard}>
                        
                        {/* Order Card Top Bar */}
                        <div className={styles.orderCardHeader}>
                          <div className={styles.orderMetaGrid}>
                            <div className={styles.orderMetaCol}>
                              <span className={styles.metaColLabel}>Order placed</span>
                              <span className={styles.metaColValue}>{order.placedDate}</span>
                            </div>
                            <div className={styles.orderMetaCol}>
                              <span className={styles.metaColLabel}>Order number</span>
                              <span className={styles.metaColValue}>{order.orderNumber}</span>
                            </div>
                            <div className={styles.orderMetaCol}>
                              <span className={styles.metaColLabel}>Total</span>
                              <span className={styles.metaColValue}>৳{order.total.toLocaleString("en-BD")}</span>
                            </div>
                          </div>

                          <div>
                            <span className={`${styles.orderStatusPill} ${
                              order.status === "IN_TRANSIT"
                                ? styles.statusInTransit
                                : order.status === "DELIVERED"
                                ? styles.statusDelivered
                                : styles.statusPreparing
                            }`}>
                              ● {order.statusLabel}
                            </span>
                          </div>
                        </div>

                        {/* Order ETA Row with Live Track link */}
                        <div className={styles.orderEtaRow}>
                          <div className={styles.etaLeft}>
                            <div className={styles.truckIconBox}>
                              <Truck size={20} />
                            </div>
                            <div>
                              <h4 className={styles.etaHeading}>{order.etaHeading}</h4>
                              <p className={styles.etaSubtitle}>{order.etaSub}</p>
                            </div>
                          </div>

                          <Link href={`/track/${order.trackingId}`} className={styles.trackLinkBtn}>
                            <span>Track</span>
                            <ArrowUpRight size={14} />
                          </Link>
                        </div>

                        {/* Order Item Rows */}
                        <div className={styles.orderItemsList}>
                          {order.items.map(item => (
                            <div key={item.id} className={styles.orderItemRow}>
                              <div className={styles.itemMain}>
                                <img
                                  src={item.image}
                                  alt={item.nameEn}
                                  className={styles.itemImg}
                                />
                                <div>
                                  <h5 className={styles.itemTitle}>{item.nameBn}</h5>
                                  <span className={styles.itemVariant}>{item.variant}</span>
                                </div>
                              </div>

                              <div className={styles.itemRight}>
                                <span className={styles.itemPrice}>৳{item.price.toLocaleString("en-BD")}</span>
                                <button
                                  type="button"
                                  onClick={() => handleReorder(item.productRef)}
                                  className={styles.buyAgainBtn}
                                >
                                  <RefreshCw size={13} />
                                  <span>Buy Again</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
                      <Package size={36} style={{ marginBottom: "10px", opacity: 0.5 }} />
                      <p>কোনো অর্ডার খুঁজে পাওয়া যায়নি।</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3 ── SAVED ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className={styles.sectionCard}>
                <div className={styles.addressHeaderRow}>
                  <div>
                    <h2 className={styles.sectionTitle}>সংরক্ষিত ডেলিভারি ঠিকানা</h2>
                    <p className={styles.sectionSubtitle}>
                      চেকআউটের সময় দ্রুত ডেলিভারির জন্য আপনার বাসা ও অফিসের ঠিকানা সেভ করে রাখুন।
                    </p>
                  </div>
                  <button
                    className={styles.addAddressBtn}
                    onClick={() => setShowAddAddressModal(true)}
                  >
                    <Plus size={15} />
                    <span>নতুন ঠিকানা যোগ করুন</span>
                  </button>
                </div>

                {/* Add Address Form Box */}
                {showAddAddressModal && (
                  <form onSubmit={handleAddAddressSubmit} style={{ background: "#141b26", padding: "20px", borderRadius: "12px", border: "1px solid rgba(16,216,118,0.3)", marginBottom: "24px" }}>
                    <h4 style={{ margin: "0 0 16px 0", color: "#10D876", fontSize: "1rem" }}>নতুন ঠিকানা ফর্ম</h4>
                    <div className={styles.formGrid}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>ঠিকানার নাম (যেমন: হোম / অফিস)</label>
                        <input
                          type="text"
                          required
                          placeholder="আমার বাসা"
                          value={newAddr.title}
                          onChange={e => setNewAddr({ ...newAddr, title: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>টাইপ</label>
                        <select
                          value={newAddr.type}
                          onChange={e => setNewAddr({ ...newAddr, type: e.target.value as any })}
                          className={styles.inputControl}
                        >
                          <option value="Home">Home (বাসা)</option>
                          <option value="Office">Office (অফিস)</option>
                          <option value="Other">Other (অন্যান্য)</option>
                        </select>
                      </div>
                      <div className={`${styles.fieldGroup} ${styles.formFieldFull}`}>
                        <label className={styles.fieldLabel}>সম্পূর্ণ ঠিকানা (রোড, বাড়ি, ফ্ল্যাট নম্বর)</label>
                        <input
                          type="text"
                          required
                          placeholder="বাড়ি নং ১২, রোড নং ৪, ব্লক বি"
                          value={newAddr.address}
                          onChange={e => setNewAddr({ ...newAddr, address: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>থানা / এলাকা</label>
                        <input
                          type="text"
                          required
                          placeholder="Dhanmondi, Dhaka"
                          value={newAddr.thana}
                          onChange={e => setNewAddr({ ...newAddr, thana: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel}>যোগাযোগ নম্বর (Delivery Phone)</label>
                        <input
                          type="tel"
                          placeholder={profile.primaryPhone}
                          value={newAddr.phone}
                          onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })}
                          className={styles.inputControl}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressModal(false)}
                        className={styles.addrActionBtn}
                        style={{ padding: "8px 16px" }}
                      >
                        বাতিল
                      </button>
                      <button type="submit" className={styles.primarySaveBtn}>
                        ঠিকানা সেভ করুন
                      </button>
                    </div>
                  </form>
                )}

                {/* Address Cards Grid */}
                <div className={styles.addressGrid}>
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      className={`${styles.addressCard} ${addr.isDefault ? styles.addressCardDefault : ""}`}
                    >
                      <div className={styles.addressCardTop}>
                        <span className={styles.addressTypeBadge}>{addr.type}</span>
                        {addr.isDefault && (
                          <span className={styles.defaultAddressTag}>✓ ডিফল্ট ঠিকানা</span>
                        )}
                      </div>

                      <div>
                        <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", color: "#ffffff" }}>{addr.title}</h4>
                        <p className={styles.addressText}>{addr.address}, {addr.thana}</p>
                        <p className={styles.addressPhone}>📞 {addr.phone}</p>
                      </div>

                      <div className={styles.addressActions}>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className={styles.addrActionBtn}
                          >
                            ডিফল্ট করুন
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className={styles.addrActionBtn}
                          style={{ color: "#f87171" }}
                        >
                          <Trash2 size={12} style={{ display: "inline", marginRight: "4px" }} />
                          মুছুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4 ── OFFERS & VOUCHERS TAB */}
            {activeTab === "offers" && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>অফার, ভাউচার ও গ্রিন রিওয়ার্ডস</h2>
                  <p className={styles.sectionSubtitle}>
                    আপনার অ্যাকাউন্টের জন্য সক্রিয় কুপন ও ক্যাশব্যাক পয়েন্ট চেক করুন।
                  </p>
                </div>

                {/* Wallet / Points Card */}
                <div className={styles.walletBox}>
                  <div className={styles.walletLeft}>
                    <div className={styles.walletIcon}>
                      <Sparkles size={26} />
                    </div>
                    <div>
                      <h3 className={styles.walletTitle}>তাতকা গ্রিন রিওয়ার্ডস ওয়ালেট</h3>
                      <p className={styles.walletSub}>প্রতিটি অর্ডারে পয়েন্ট অর্জন করুন এবং পরবর্তী বাজারে ডিসকাউন্ট নিন।</p>
                    </div>
                  </div>
                  <div className={styles.walletBalance}>
                    <div className={styles.balanceNum}>৪৫০ পয়েন্ট</div>
                    <div className={styles.balanceEquiv}>৳৪৫ ডিসকাউন্ট সমমূল্য</div>
                  </div>
                </div>

                {/* Available Vouchers Grid */}
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#ffffff", margin: "24px 0 14px 0" }}>
                  আপনার সক্রিয় কুপনসমূহ ({vouchers.length})
                </h3>

                <div className={styles.voucherGrid}>
                  {vouchers.map(v => (
                    <div key={v.code} className={styles.voucherCard}>
                      <div className={styles.voucherTop}>
                        <div>
                          <div className={styles.voucherDiscount}>{v.discount}</div>
                          <p className={styles.voucherDesc}>{v.desc}</p>
                          <div className={styles.voucherValidity}>{v.validity}</div>
                        </div>
                      </div>

                      <div className={styles.voucherBottom}>
                        <span className={styles.couponCodeBadge}>{v.code}</span>
                        <button
                          type="button"
                          className={styles.copyCouponBtn}
                          onClick={() => copyCode(v.code)}
                        >
                          {copiedCoupon === v.code ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>কপি হয়েছে!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>কপি করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5 ── LIVE SUPPORT & INSTANT CALLBACK TAB */}
            {activeTab === "support" && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>লাইভ সাপোর্ট ও ইনস্ট্যান্ট কল রিকোয়েস্ট</h2>
                  <p className={styles.sectionSubtitle}>
                    যেকোনো সমস্যা হলে ফর্মটি পূরণ করুন — আমাদের কাস্টমার সাপোর্ট টিম সরাসরি ৫-১০ মিনিটের মধ্যে আপনাকে কল করবে।
                  </p>
                </div>

                {/* Active Support Tickets Banner */}
                {ticketSubmittedMsg && (
                  <div className={styles.activeTicketBanner}>
                    <div className={styles.ticketPulseIcon}>
                      <PhoneCall size={18} />
                    </div>
                    <div>
                      <h4 className={styles.ticketTitle}>কল রিকোয়েস্ট গৃহীত হয়েছে</h4>
                      <p className={styles.ticketSub}>{ticketSubmittedMsg}</p>
                    </div>
                  </div>
                )}

                <div className={styles.supportGrid}>
                  
                  {/* Left Form: Request Callback */}
                  <div className={styles.supportFormBox}>
                    <h3 style={{ margin: "0 0 16px 0", fontSize: "1.05rem", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                      <PhoneCall size={18} color="#10D876" />
                      <span>ইনস্ট্যান্ট সাপোর্ট কল রিকোয়েস্ট</span>
                    </h3>

                    <form onSubmit={handleTicketSubmit}>
                      <div className={styles.formGrid}>
                        
                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>সমস্যার ধরন (Issue Type)</label>
                          <select
                            value={ticketForm.issueType}
                            onChange={e => setTicketForm({ ...ticketForm, issueType: e.target.value })}
                            className={styles.inputControl}
                          >
                            <option value="ডেলিভারি বিলম্ব / রাইডার ট্র্যাকিং">🚚 ডেলিভারি বিলম্ব / রাইডার অবস্থান</option>
                            <option value="পণ্যের মান / ড্যামেজ আইটেম">🥦 পণ্যের মান / ড্যামেজ আইটেম</option>
                            <option value="আইটেম মিসিং / ভুল পণ্য">📦 আইটেম মিসিং / ভুল পণ্য</option>
                            <option value="পেমেন্ট / রিফান্ড সমস্যা">💳 পেমেন্ট / রিফান্ড সমস্যা</option>
                            <option value="অন্যান্য সাধারণ জিজ্ঞাসা">❓ অন্যান্য সাধারণ জিজ্ঞাসা</option>
                          </select>
                        </div>

                        <div className={styles.fieldGroup}>
                          <label className={styles.fieldLabel}>অর্ডার নম্বর নির্বাচন করুন</label>
                          <select
                            value={ticketForm.orderNumber}
                            onChange={e => setTicketForm({ ...ticketForm, orderNumber: e.target.value })}
                            className={styles.inputControl}
                          >
                            <option value="TB-9847562">WEB-9847562 (In Transit - ৳1,935)</option>
                            <option value="TB-9284105">WEB-9284105 (Delivered - ৳820)</option>
                            <option value="GENERAL">অর্ডারের সাথে সম্পর্কিত নয়</option>
                          </select>
                        </div>

                        <div className={`${styles.fieldGroup} ${styles.formFieldFull}`}>
                          <label className={styles.fieldLabel}>বিস্তারিত বার্তা (Message / Issue description)</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="আপনার সমস্যার কথা সংক্ষেপে লিখুন (যেমন: রাইডার ঠিকানায় পৌঁছাতে পারছে না)..."
                            value={ticketForm.notes}
                            onChange={e => setTicketForm({ ...ticketForm, notes: e.target.value })}
                            className={styles.inputControl}
                            style={{ height: "auto", padding: "10px 14px" }}
                          />
                        </div>

                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", flexWrap: "wrap", gap: "10px" }}>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                          কল যাবে: <strong style={{ color: "#ffffff" }}>{profile.primaryPhone}</strong>
                        </span>
                        <button type="submit" className={styles.primarySaveBtn}>
                          <PhoneCall size={15} />
                          <span>আমাকে এখনই কল করুন</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Direct Help Channels */}
                  <div className={styles.supportDirectBox}>
                    <div className={styles.directCard}>
                      <h4 className={styles.directCardTitle}>জরুরি হটলাইন</h4>
                      <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>
                        সরাসরি আমাদের কাস্টমার কেয়ার ম্যানেজারের সাথে কথা বলতে কল করুন।
                      </p>
                      <a href="tel:09612828520" className={styles.contactBtn}>
                        <Phone size={15} color="#10D876" />
                        <span>০৯৬১২-তাতকা-০ (09612-828520)</span>
                      </a>
                    </div>

                    <div className={styles.directCard}>
                      <h4 className={styles.directCardTitle}>হোয়াটসঅ্যাপ সাপোর্ট</h4>
                      <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: 0 }}>
                        পণ্য বা রসিদের ছবি পাঠিয়ে তাৎক্ষণিক সমাধান পেতে চ্যাট করুন।
                      </p>
                      <a
                        href="https://wa.me/8801700000000"
                        target="_blank"
                        rel="noreferrer"
                        className={`${styles.contactBtn} ${styles.whatsappBtn}`}
                      >
                        <MessageSquare size={15} />
                        <span>WhatsApp-এ মেসেজ দিন</span>
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}
