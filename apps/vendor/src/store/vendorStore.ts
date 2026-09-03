"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  VendorRole,
  VendorProfile,
  Product,
  Order,
  OrderStatus,
  StockAdjustmentLog,
  CommissionLedgerEntry,
  PayoutRequest,
  Review,
  RefundDispute,
  StaffAccount,
  StaffActivityLog,
  WholesaleBuyer,
  Coupon,
  NotificationItem,
  StockAdjustmentReason,
  PayoutMethod,
} from "@/types/vendor";
import { Language } from "@/utils/translations";
import { audioAlert } from "@/utils/audioAlert";

interface VendorState {
  // Localization & Role
  language: Language;
  currentRole: VendorRole;
  soundEnabled: boolean;

  // Profile & Status
  profile: VendorProfile;

  // Data Collections
  products: Product[];
  orders: Order[];
  stockLogs: StockAdjustmentLog[];
  commissionLedger: CommissionLedgerEntry[];
  payouts: PayoutRequest[];
  reviews: Review[];
  refundDisputes: RefundDispute[];
  staffAccounts: StaffAccount[];
  staffLogs: StaffActivityLog[];
  wholesaleBuyers: WholesaleBuyer[];
  coupons: Coupon[];
  notifications: NotificationItem[];

  // Action Methods
  setLanguage: (lang: Language) => void;
  setRole: (role: VendorRole) => void;
  toggleSound: () => void;
  toggleVacationMode: () => void;
  updateProfile: (updates: Partial<VendorProfile>) => void;

  // Order Operations
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  reconcileItemWeight: (orderId: string, itemId: string, actualWeight: number) => void;
  toggleItemPacked: (orderId: string, itemId: string) => void;
  markAllItemsPacked: (orderId: string) => void;
  simulateIncomingOrder: () => void;

  // Product Operations
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkAdjustStock: (productIds: string[], delta: number) => void;
  bulkTogglePublish: (productIds: string[], isPublished: boolean) => void;

  // Inventory Operations
  adjustStock: (
    productId: string,
    newQty: number,
    reason: StockAdjustmentReason,
    notes?: string
  ) => void;

  // Financial Operations
  requestPayout: (amount: number, method: PayoutMethod, account: string) => void;

  // Reviews & Disputes
  replyToReview: (reviewId: string, message: string) => void;
  resolveRefundDispute: (
    disputeId: string,
    status: "APPROVED" | "REJECTED" | "ESCALATED",
    notes?: string
  ) => void;

  // Staff Sub-Accounts
  addStaff: (staff: Omit<StaffAccount, "id" | "createdAt" | "lastActive">) => void;
  toggleStaffStatus: (staffId: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

// Initial Mock Seed Data
const initialProfile: VendorProfile = {
  id: "vnd-dhaka-089",
  storeName: "Green Farm Groceries & Organics",
  storeNameBn: "সবুজ খামার গ্রোসারি ও অর্গানিক",
  slug: "green-farm-dhanmondi",
  ownerName: "Rafiqul Islam",
  phone: "+8801711223344",
  email: "support@greenfarm.tatkabazar.com",
  address: "House 42, Road 9/A, Dhanmondi, Dhaka 1209",
  category: "Fresh Produce, Dairy & Groceries",
  tradeLicense: "TRAD/DSCC/019283/2024",
  tinBin: "TIN-893019284102 / BIN-002910381",
  nidNumber: "1988269123849102",
  payoutMethod: "BKASH",
  payoutAccount: "+8801711223344 (Merchant)",
  status: "APPROVED",
  tier: "TRUSTED",
  rating: 4.88,
  commissionRate: 10,
  vacationMode: false,
  autoHideZeroStock: true,
  operatingHours: { open: "07:00", close: "22:00" },
  deliveryZones: ["Dhanmondi", "Kalabagan", "Mohammadpur", "Panthapath", "Lalmatia"],
  logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&h=150&fit=crop",
  bannerUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&h=300&fit=crop",
};

const initialProducts: Product[] = [
  {
    id: "prod-1",
    vendorId: "vnd-dhaka-089",
    name: "Fresh Deshi Beef (Bone-in)",
    nameBn: "হাড়সহ দেশি তাজা গরুর মাংস",
    category: "MEAT",
    pricingType: "WEIGHT_BASED",
    pricePerUnit: 820,
    comparePrice: 850,
    unit: "KG",
    sku: "BEEF-DESHI-01",
    stockQty: 35,
    lowStockThreshold: 10,
    isPublished: true,
    isWholesaleEligible: true,
    wholesaleMinQty: 20,
    wholesaleTiers: [
      { minQty: 20, maxQty: 49, unitPrice: 780, discountPercent: 5 },
      { minQty: 50, unitPrice: 750, discountPercent: 8.5 },
    ],
    imageUrl: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&fit=crop",
    description: "100% grass-fed local halal beef freshly prepared every morning.",
    descriptionBn: "প্রতিদিন সকালে প্রস্তুতকৃত সম্পূর্ণ খাঁটি দেশি ঘাস খাওয়া গরুর মাংস।",
    createdAt: "2026-08-10T08:00:00Z",
    updatedAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "prod-2",
    vendorId: "vnd-dhaka-089",
    name: "Padma River Fresh Ilish / Hilsa (1kg+)",
    nameBn: "পদ্মার তাজা বড় ইলিশ মাছ (১ কেজি+)",
    category: "FISH",
    pricingType: "WEIGHT_BASED",
    pricePerUnit: 1650,
    comparePrice: 1750,
    unit: "KG",
    sku: "FISH-ILISH-02",
    stockQty: 8,
    lowStockThreshold: 5,
    isPublished: true,
    isWholesaleEligible: true,
    wholesaleMinQty: 10,
    imageUrl: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400&fit=crop",
    description: "Authentic Chandpur Padma river fresh Hilsa fish packed in ice.",
    descriptionBn: "চাঁদপুরের পদ্মার তাজা বড় রুপালি ইলিশ, বরফে সংরক্ষিত।",
    createdAt: "2026-08-15T09:00:00Z",
    updatedAt: "2026-09-03T07:30:00Z",
  },
  {
    id: "prod-3",
    vendorId: "vnd-dhaka-089",
    name: "Organic Red Spinach (Lal Shak)",
    nameBn: "তাজা লাল শাক আঁটি",
    category: "VEGETABLES",
    pricingType: "FIXED",
    pricePerUnit: 25,
    comparePrice: 30,
    unit: "PACK",
    sku: "VEG-LAL-03",
    stockQty: 45,
    lowStockThreshold: 15,
    isPublished: true,
    isWholesaleEligible: false,
    imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&fit=crop",
    description: "Pesticide-free fresh farm-picked red spinach bunch.",
    descriptionBn: "বিষমুক্ত তাজা খামারের লাল শাকের আঁটি।",
    createdAt: "2026-08-20T06:00:00Z",
    updatedAt: "2026-09-03T06:00:00Z",
  },
  {
    id: "prod-4",
    vendorId: "vnd-dhaka-089",
    name: "Deshi Round Ripe Tomatoes",
    nameBn: "দেশি পাকা গোল টমেটো",
    category: "VEGETABLES",
    pricingType: "WEIGHT_BASED",
    pricePerUnit: 75,
    comparePrice: 85,
    unit: "KG",
    sku: "VEG-TOMATO-04",
    stockQty: 80,
    lowStockThreshold: 20,
    isPublished: true,
    isWholesaleEligible: true,
    wholesaleMinQty: 50,
    wholesaleTiers: [
      { minQty: 50, unitPrice: 65, discountPercent: 13.3 },
    ],
    imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&fit=crop",
    description: "Juicy locally harvested vine-ripened red tomatoes.",
    descriptionBn: "গাছপাকা রসালো দেশি লাল টমেটো।",
    createdAt: "2026-08-22T07:00:00Z",
    updatedAt: "2026-09-02T11:00:00Z",
  },
  {
    id: "prod-5",
    vendorId: "vnd-dhaka-089",
    name: "Hot Green Chilli (Kacha Morich)",
    nameBn: "তাজা কাঁচা মরিচ",
    category: "SPICES",
    pricingType: "WEIGHT_BASED",
    pricePerUnit: 160,
    comparePrice: 180,
    unit: "KG",
    sku: "SPICE-CHILLI-05",
    stockQty: 4, // Critical low stock alert
    lowStockThreshold: 10,
    isPublished: true,
    isWholesaleEligible: false,
    imageUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400&fit=crop",
    description: "Spicy fresh green chillies directly sourced from Bogura farms.",
    descriptionBn: "বগুড়ার খামার থেকে সরাসরি সংগৃহীত ঝাল কাঁচা মরিচ।",
    createdAt: "2026-08-25T08:00:00Z",
    updatedAt: "2026-09-03T11:00:00Z",
  },
  {
    id: "prod-6",
    vendorId: "vnd-dhaka-089",
    name: "Teer Fortified Soyabean Oil 5L",
    nameBn: "তীর ফর্টিফাইড সয়াবিন তেল ৫ লিটার",
    category: "GROCERY",
    pricingType: "FIXED",
    pricePerUnit: 840,
    comparePrice: 875,
    unit: "PACK",
    sku: "GROC-TEER-5L",
    stockQty: 28,
    lowStockThreshold: 8,
    isPublished: true,
    isWholesaleEligible: true,
    wholesaleMinQty: 10,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&fit=crop",
    description: "Premium Vitamin A enriched pure soyabean cooking oil.",
    descriptionBn: "ভিটামিন এ সমৃদ্ধ খাঁটি সয়াবিন রান্নার তেল।",
    createdAt: "2026-08-12T10:00:00Z",
    updatedAt: "2026-09-01T15:00:00Z",
  },
  {
    id: "prod-7",
    vendorId: "vnd-dhaka-089",
    name: "Shahi Nazirshail Premium Rice 25kg",
    nameBn: "শাহী নাজিরশাইল চাল ২৫ কেজি বস্তা",
    category: "GROCERY",
    pricingType: "FIXED",
    pricePerUnit: 2150,
    comparePrice: 2250,
    unit: "PACK",
    sku: "GROC-RICE-25KG",
    stockQty: 18,
    lowStockThreshold: 5,
    isPublished: true,
    isWholesaleEligible: true,
    wholesaleMinQty: 10,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&fit=crop",
    description: "Aromatic long-grain polished Dinajpur Nazirshail rice.",
    descriptionBn: "দিনাজপুরের সুগন্ধযুক্ত সরু চকচকে নাজিরশাইল চাল।",
    createdAt: "2026-08-18T09:00:00Z",
    updatedAt: "2026-09-02T16:00:00Z",
  },
  {
    id: "prod-8",
    vendorId: "vnd-dhaka-089",
    name: "Fresh Deshi Brown Farm Eggs (1 Dozen)",
    nameBn: "দেশি লাল মুরগির ডিম (১ ডজন)",
    category: "DAIRY",
    pricingType: "FIXED",
    pricePerUnit: 150,
    comparePrice: 160,
    unit: "PACK",
    sku: "DAIRY-EGG-12",
    stockQty: 65,
    lowStockThreshold: 20,
    isPublished: true,
    isWholesaleEligible: false,
    imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&fit=crop",
    description: "Daily fresh graded brown country farm chicken eggs.",
    descriptionBn: "প্রতিদিনের তাজা খামারের লাল ডিম, ১২ পিস ক্রাফট বক্সে।",
    createdAt: "2026-08-20T08:00:00Z",
    updatedAt: "2026-09-03T06:00:00Z",
  },
  {
    id: "prod-9",
    vendorId: "vnd-dhaka-089",
    name: "Rajshahi Sweet Amrapali Mango",
    nameBn: "রাজশাহীর মিষ্টি আম্রপালি আম",
    category: "FRUITS",
    pricingType: "WEIGHT_BASED",
    pricePerUnit: 130,
    comparePrice: 150,
    unit: "KG",
    sku: "FRUIT-AMRA-09",
    stockQty: 3, // Low stock
    lowStockThreshold: 15,
    isPublished: true,
    isWholesaleEligible: true,
    wholesaleMinQty: 25,
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&fit=crop",
    description: "Naturally ripened chemical-free sweet mangoes from Rajshahi orchards.",
    descriptionBn: "কার্বাইডমুক্ত সম্পূর্ণ প্রাকৃতিকভাবে পাকা মিষ্টি আম্রপালি আম।",
    createdAt: "2026-08-28T10:00:00Z",
    updatedAt: "2026-09-03T09:00:00Z",
  },
  {
    id: "prod-10",
    vendorId: "vnd-dhaka-089",
    name: "Fresh Deshi Ginger (Ada)",
    nameBn: "দেশি তাজা আদা",
    category: "SPICES",
    pricingType: "WEIGHT_BASED",
    pricePerUnit: 240,
    comparePrice: 260,
    unit: "KG",
    sku: "SPICE-GINGER-10",
    stockQty: 0, // Out of stock
    lowStockThreshold: 10,
    isPublished: false,
    isWholesaleEligible: false,
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&fit=crop",
    description: "Strong pungent fresh local ginger roots.",
    descriptionBn: "ঝাঁঝালো তাজা দেশি আদা।",
    createdAt: "2026-08-29T11:00:00Z",
    updatedAt: "2026-09-03T12:00:00Z",
  },
];

const initialOrders: Order[] = [
  {
    id: "ord-8492",
    displayId: "TB-8492",
    customerName: "Dr. Farhana Ahmed",
    customerPhone: "+8801819876543",
    customerAddress: "Apartment 5B, Road 11/A, Dhanmondi",
    deliveryZone: "Dhanmondi",
    createdAt: "2026-09-03T11:42:00Z",
    status: "RECEIVED",
    urgent: true,
    grossTotal: 1075,
    commissionRate: 10,
    commissionAmount: 107.5,
    netTotal: 967.5,
    paymentMethod: "BKASH",
    paymentStatus: "PAID",
    assignedAt: "2026-09-03T11:43:00Z",
    notes: "Please pack meat in double thermal bag with ice.",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Fresh Deshi Beef (Bone-in)",
        productNameBn: "হাড়সহ দেশি তাজা গরুর মাংস",
        category: "MEAT",
        pricingType: "WEIGHT_BASED",
        unit: "KG",
        unitPrice: 820,
        quantity: 1,
        weightOrdered: 1.0, // Customer ordered 1 kg
        weightActual: undefined, // Needs weighing!
        finalPrice: 820,
        packed: false,
      },
      {
        id: "item-2",
        productId: "prod-3",
        productName: "Organic Red Spinach (Lal Shak)",
        productNameBn: "তাজা লাল শাক আঁটি",
        category: "VEGETABLES",
        pricingType: "FIXED",
        unit: "PACK",
        unitPrice: 25,
        quantity: 3,
        finalPrice: 75,
        packed: false,
      },
      {
        id: "item-3",
        productId: "prod-5",
        productName: "Hot Green Chilli (Kacha Morich)",
        productNameBn: "তাজা কাঁচা মরিচ",
        category: "SPICES",
        pricingType: "WEIGHT_BASED",
        unit: "KG",
        unitPrice: 160,
        quantity: 1,
        weightOrdered: 0.25,
        weightActual: undefined,
        finalPrice: 40,
        packed: false,
      },
      {
        id: "item-4",
        productId: "prod-8",
        productName: "Fresh Deshi Brown Farm Eggs (1 Dozen)",
        productNameBn: "দেশি লাল মুরগির ডিম (১ ডজন)",
        category: "DAIRY",
        pricingType: "FIXED",
        unit: "PACK",
        unitPrice: 150,
        quantity: 1,
        finalPrice: 150,
        packed: false,
      },
    ],
  },
  {
    id: "ord-8488",
    displayId: "TB-8488",
    customerName: "Mahmudur Rahman",
    customerPhone: "+8801715987123",
    customerAddress: "House 14, Lake Circus, Kalabagan",
    deliveryZone: "Kalabagan",
    createdAt: "2026-09-03T11:20:00Z",
    status: "PREPARING",
    grossTotal: 2135,
    commissionRate: 10,
    commissionAmount: 213.5,
    netTotal: 1921.5,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "PENDING",
    assignedAt: "2026-09-03T11:21:00Z",
    notes: "Cut Hilsa into medium curry pieces please.",
    items: [
      {
        id: "item-5",
        productId: "prod-2",
        productName: "Padma River Fresh Ilish / Hilsa (1kg+)",
        productNameBn: "পদ্মার তাজা বড় ইলিশ মাছ (১ কেজি+)",
        category: "FISH",
        pricingType: "WEIGHT_BASED",
        unit: "KG",
        unitPrice: 1650,
        quantity: 1,
        weightOrdered: 1.2,
        weightActual: 1.22, // Already weighed 1.22 kg
        finalPrice: 2013,
        packed: true,
      },
      {
        id: "item-6",
        productId: "prod-4",
        productName: "Deshi Round Ripe Tomatoes",
        productNameBn: "দেশি পাকা গোল টমেটো",
        category: "VEGETABLES",
        pricingType: "WEIGHT_BASED",
        unit: "KG",
        unitPrice: 75,
        quantity: 1,
        weightOrdered: 1.5,
        weightActual: undefined, // Needs weighing
        finalPrice: 112.5,
        packed: false,
      },
      {
        id: "item-7",
        productId: "prod-3",
        productName: "Organic Red Spinach (Lal Shak)",
        productNameBn: "তাজা লাল শাক আঁটি",
        category: "VEGETABLES",
        pricingType: "FIXED",
        unit: "PACK",
        unitPrice: 25,
        quantity: 2,
        finalPrice: 50,
        packed: true,
      },
    ],
  },
  {
    id: "ord-8481",
    displayId: "TB-8481",
    customerName: "Syeda Anika Tabassum",
    customerPhone: "+8801912345678",
    customerAddress: "Block D, Lalmatia, Dhaka",
    deliveryZone: "Lalmatia",
    createdAt: "2026-09-03T10:45:00Z",
    status: "READY_FOR_PICKUP",
    grossTotal: 1830,
    commissionRate: 10,
    commissionAmount: 183.0,
    netTotal: 1647.0,
    paymentMethod: "BKASH",
    paymentStatus: "PAID",
    assignedAt: "2026-09-03T10:46:00Z",
    readyAt: "2026-09-03T11:05:00Z",
    riderId: "rider-104",
    riderName: "Kabir Hossain (Rider #104)",
    riderPhone: "+8801733445566",
    items: [
      {
        id: "item-8",
        productId: "prod-6",
        productName: "Teer Fortified Soyabean Oil 5L",
        productNameBn: "তীর ফর্টিফাইড সয়াবিন তেল ৫ লিটার",
        category: "GROCERY",
        pricingType: "FIXED",
        unit: "PACK",
        unitPrice: 840,
        quantity: 1,
        finalPrice: 840,
        packed: true,
      },
      {
        id: "item-9",
        productId: "prod-7",
        productName: "Shahi Nazirshail Premium Rice 25kg",
        productNameBn: "শাহী নাজিরশাইল চাল ২৫ কেজি বস্তা",
        category: "GROCERY",
        pricingType: "FIXED",
        unit: "PACK",
        unitPrice: 2150,
        quantity: 1,
        finalPrice: 2150,
        packed: true,
      },
    ],
  },
  {
    id: "ord-8475",
    displayId: "TB-8475",
    customerName: "Kazi Nabil",
    customerPhone: "+8801712984512",
    customerAddress: "Road 27 (Old), Dhanmondi",
    deliveryZone: "Dhanmondi",
    createdAt: "2026-09-03T09:15:00Z",
    status: "COMPLETED",
    grossTotal: 1450,
    commissionRate: 10,
    commissionAmount: 145.0,
    netTotal: 1305.0,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    assignedAt: "2026-09-03T09:16:00Z",
    readyAt: "2026-09-03T09:30:00Z",
    completedAt: "2026-09-03T10:05:00Z",
    riderName: "Shahin Alam",
    riderPhone: "+8801822334455",
    items: [
      {
        id: "item-10",
        productId: "prod-1",
        productName: "Fresh Deshi Beef (Bone-in)",
        productNameBn: "হাড়সহ দেশি তাজা গরুর মাংস",
        category: "MEAT",
        pricingType: "WEIGHT_BASED",
        unit: "KG",
        unitPrice: 820,
        quantity: 1,
        weightOrdered: 1.5,
        weightActual: 1.52,
        finalPrice: 1246.4,
        packed: true,
      },
      {
        id: "item-11",
        productId: "prod-4",
        productName: "Deshi Round Ripe Tomatoes",
        productNameBn: "দেশি পাকা গোল টমেটো",
        category: "VEGETABLES",
        pricingType: "WEIGHT_BASED",
        unit: "KG",
        unitPrice: 75,
        quantity: 1,
        weightOrdered: 2.0,
        weightActual: 2.05,
        finalPrice: 153.75,
        packed: true,
      },
    ],
  },
  {
    id: "ord-8469",
    displayId: "TB-8469",
    customerName: "Tanzimul Haque",
    customerPhone: "+8801552345678",
    customerAddress: "Japan Garden City, Mohammadpur",
    deliveryZone: "Mohammadpur",
    createdAt: "2026-09-02T16:30:00Z",
    status: "COMPLETED",
    grossTotal: 3450,
    commissionRate: 10,
    commissionAmount: 345.0,
    netTotal: 3105.0,
    paymentMethod: "BKASH",
    paymentStatus: "PAID",
    assignedAt: "2026-09-02T16:32:00Z",
    completedAt: "2026-09-02T17:40:00Z",
    items: [
      {
        id: "item-12",
        productId: "prod-2",
        productName: "Padma River Fresh Ilish / Hilsa (1kg+)",
        productNameBn: "পদ্মার তাজা বড় ইলিশ মাছ (১ কেজি+)",
        category: "FISH",
        pricingType: "WEIGHT_BASED",
        unit: "KG",
        unitPrice: 1650,
        quantity: 2,
        weightOrdered: 2.0,
        weightActual: 2.08,
        finalPrice: 3432,
        packed: true,
      },
    ],
  },
];

const initialStockLogs: StockAdjustmentLog[] = [
  {
    id: "log-1",
    productId: "prod-1",
    productName: "Fresh Deshi Beef (Bone-in)",
    productNameBn: "হাড়সহ দেশি তাজা গরুর মাংস",
    previousQty: 15,
    newQty: 35,
    delta: 20,
    reason: "RESTOCK",
    adjustedBy: "Rafiqul Islam",
    adjustedByRole: "OWNER",
    timestamp: "2026-09-03T07:15:00Z",
    notes: "Morning slaughterhouse delivery batch #DF-88",
  },
  {
    id: "log-2",
    productId: "prod-5",
    productName: "Hot Green Chilli (Kacha Morich)",
    productNameBn: "তাজা কাঁচা মরিচ",
    previousQty: 7,
    newQty: 4,
    delta: -3,
    reason: "DAMAGED",
    adjustedBy: "Rakib Ahmed",
    adjustedByRole: "STAFF",
    timestamp: "2026-09-03T09:40:00Z",
    notes: "Discarded wilted stems from humid shelf",
  },
  {
    id: "log-3",
    productId: "prod-4",
    productName: "Deshi Round Ripe Tomatoes",
    productNameBn: "দেশি পাকা গোল টমেটো",
    previousQty: 85,
    newQty: 80,
    delta: -5,
    reason: "RECOUNT_AUDIT",
    adjustedBy: "Kamrul Hasan",
    adjustedByRole: "MANAGER",
    timestamp: "2026-09-02T18:00:00Z",
    notes: "End-of-day physical crate verification",
  },
];

const initialCommissionLedger: CommissionLedgerEntry[] = [
  {
    id: "com-8475",
    orderId: "ord-8475",
    displayId: "TB-8475",
    date: "2026-09-03",
    grossAmount: 1450,
    commissionRate: 10,
    commissionAmount: 145.0,
    netPayable: 1305.0,
    settlementStatus: "PENDING",
  },
  {
    id: "com-8469",
    orderId: "ord-8469",
    displayId: "TB-8469",
    date: "2026-09-02",
    grossAmount: 3450,
    commissionRate: 10,
    commissionAmount: 345.0,
    netPayable: 3105.0,
    settlementStatus: "PENDING",
  },
  {
    id: "com-8450",
    orderId: "ord-8450",
    displayId: "TB-8450",
    date: "2026-09-01",
    grossAmount: 5200,
    commissionRate: 10,
    commissionAmount: 520.0,
    netPayable: 4680.0,
    settlementStatus: "SETTLED",
    settlementBatchId: "BATCH-AUG-W4",
  },
  {
    id: "com-8441",
    orderId: "ord-8441",
    displayId: "TB-8441",
    date: "2026-08-31",
    grossAmount: 6800,
    commissionRate: 10,
    commissionAmount: 680.0,
    netPayable: 6120.0,
    settlementStatus: "SETTLED",
    settlementBatchId: "BATCH-AUG-W4",
  },
];

const initialPayouts: PayoutRequest[] = [
  {
    id: "pay-104",
    amount: 10800,
    method: "BKASH",
    accountDetails: "+8801711223344 (Merchant)",
    status: "COMPLETED",
    requestedAt: "2026-09-01T10:00:00Z",
    processedAt: "2026-09-01T14:30:00Z",
    referenceTxn: "BKH920491039",
  },
  {
    id: "pay-103",
    amount: 15400,
    method: "BANK_TRANSFER",
    accountDetails: "BRAC Bank Dhanmondi Br. A/C #15012039120",
    status: "COMPLETED",
    requestedAt: "2026-08-25T11:00:00Z",
    processedAt: "2026-08-26T12:15:00Z",
    referenceTxn: "BRAC-TXN-0019283",
  },
];

const initialReviews: Review[] = [
  {
    id: "rev-1",
    productId: "prod-1",
    productName: "Fresh Deshi Beef (Bone-in)",
    productNameBn: "হাড়সহ দেশি তাজা গরুর মাংস",
    customerName: "Salma Begum",
    rating: 5,
    comment: "Extremely fresh beef! Properly cut and fat was very clean. Will definitely buy regularly.",
    date: "2026-09-02",
    verifiedPurchase: true,
    vendorReply: {
      message: "Thank you Salma Apa! We prepare our beef fresh each morning directly from the farm.",
      repliedAt: "2026-09-02T14:00:00Z",
    },
  },
  {
    id: "rev-2",
    productId: "prod-2",
    productName: "Padma River Fresh Ilish / Hilsa (1kg+)",
    productNameBn: "পদ্মার তাজা বড় ইলিশ মাছ (১ কেজি+)",
    customerName: "Ashraful Islam",
    rating: 5,
    comment: "Authentic Padma river Ilish with great aroma and perfect fat content.",
    date: "2026-09-01",
    verifiedPurchase: true,
  },
  {
    id: "rev-3",
    productId: "prod-4",
    productName: "Deshi Round Ripe Tomatoes",
    productNameBn: "দেশি পাকা গোল টমেটো",
    customerName: "Nasir Uddin",
    rating: 3,
    comment: "A couple of tomatoes were slightly over-soft at the bottom of the bag.",
    date: "2026-08-30",
    verifiedPurchase: true,
    vendorReply: {
      message: "We apologize Nasir Bhai. We have instructed our packers to use ventilated paper separator trays.",
      repliedAt: "2026-08-30T18:00:00Z",
    },
  },
];

const initialRefundDisputes: RefundDispute[] = [
  {
    id: "disp-1",
    orderId: "ord-8461",
    displayId: "TB-8461",
    customerName: "Rezaul Karim",
    reason: "2 rotten tomatoes in 1kg pack",
    requestedAmount: 40,
    status: "PENDING",
    createdAt: "2026-09-03T08:30:00Z",
  },
];

const initialStaffAccounts: StaffAccount[] = [
  {
    id: "stf-1",
    name: "Kamrul Hasan",
    phone: "+8801712000111",
    role: "MANAGER",
    pin: "4421",
    isActive: true,
    createdAt: "2026-06-01T10:00:00Z",
    lastActive: "2026-09-03T11:30:00Z",
  },
  {
    id: "stf-2",
    name: "Rakib Ahmed",
    phone: "+8801819000222",
    role: "STAFF",
    pin: "8890",
    isActive: true,
    createdAt: "2026-07-15T10:00:00Z",
    lastActive: "2026-09-03T11:40:00Z",
  },
];

const initialStaffLogs: StaffActivityLog[] = [
  {
    id: "slog-1",
    staffId: "stf-2",
    staffName: "Rakib Ahmed",
    action: "Packed Order #TB-8488",
    actionBn: "অর্ডার #TB-8488 প্যাক সম্পন্ন",
    timestamp: "2026-09-03T11:25:00Z",
    details: "Weighed Hilsa (1.22 kg) and Lal Shak (2 packs)",
  },
  {
    id: "slog-2",
    staffId: "stf-1",
    staffName: "Kamrul Hasan",
    action: "Stock recount on Tomatoes",
    actionBn: "টমেটো স্টক অডিট সম্পন্ন",
    timestamp: "2026-09-02T18:00:00Z",
    details: "Adjusted -5 kg due to crate count variance",
  },
];

const initialWholesaleBuyers: WholesaleBuyer[] = [
  {
    id: "b2b-1",
    businessName: "Kacchi Bhai Restaurant (Dhanmondi Br.)",
    contactPerson: "Chef Jahangir",
    phone: "+8801730998877",
    creditLimit: 50000,
    outstandingBalance: 14200,
    paymentTerms: "NET_15",
    status: "ACTIVE",
  },
  {
    id: "b2b-2",
    businessName: "Grand Palace Catering & Events",
    contactPerson: "Sultan Mahmud",
    phone: "+8801819445566",
    creditLimit: 100000,
    outstandingBalance: 42000,
    paymentTerms: "NET_30",
    status: "ACTIVE",
  },
];

const initialCoupons: Coupon[] = [
  {
    id: "cpn-1",
    code: "TATKAFRESH10",
    discountType: "PERCENT",
    discountValue: 10,
    minOrderAmount: 1000,
    usageLimit: 200,
    usedCount: 74,
    startDate: "2026-09-01",
    endDate: "2026-09-15",
    isActive: true,
  },
  {
    id: "cpn-2",
    code: "VEGGIELOVE",
    discountType: "FLAT",
    discountValue: 50,
    minOrderAmount: 500,
    usageLimit: 100,
    usedCount: 38,
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    isActive: true,
  },
];

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Assigned Order #TB-8492",
    titleBn: "নতুন বরাদ্দকৃত অর্ডার #TB-8492",
    message: "Admin assigned perishable order requiring weighing (Beef, Green Chilli).",
    messageBn: "অ্যাডমিন নতুন অর্ডার বরাদ্দ করেছে: গরুর মাংস ও মরিচ ওজন করা প্রয়োজন।",
    type: "ORDER",
    timestamp: "2026-09-03T11:42:00Z",
    read: false,
    link: "/orders",
  },
  {
    id: "notif-2",
    title: "Critical Low Stock Alert",
    titleBn: "কম স্টকের জরুরি সতর্কতা",
    message: "Hot Green Chilli has only 4 kg remaining (Threshold: 10 kg).",
    messageBn: "কাঁচা মরিচ মাত্র ৪ কেজি অবশিষ্ট রয়েছে (সীমা: ১০ কেজি)।",
    type: "STOCK",
    timestamp: "2026-09-03T11:00:00Z",
    read: false,
    link: "/inventory",
  },
  {
    id: "notif-3",
    title: "Settlement Payout Completed",
    titleBn: "সেটেলমেন্ট পেমেন্ট সম্পন্ন",
    message: "BDT ৳10,800 sent to your bKash merchant account.",
    messageBn: "আপনার বিকাশ মার্চেন্ট অ্যাকাউন্টে ১০,৮০০ টাকা পাঠানো হয়েছে।",
    type: "PAYOUT",
    timestamp: "2026-09-01T14:30:00Z",
    read: true,
    link: "/settlements",
  },
];

export const useVendorStore = create<VendorState>()(
  persist(
    (set, get) => ({
      language: "bn", // Default to Bengali as requested by Bangladeshi merchants
      currentRole: "OWNER",
      soundEnabled: true,
      profile: initialProfile,
      products: initialProducts,
      orders: initialOrders,
      stockLogs: initialStockLogs,
      commissionLedger: initialCommissionLedger,
      payouts: initialPayouts,
      reviews: initialReviews,
      refundDisputes: initialRefundDisputes,
      staffAccounts: initialStaffAccounts,
      staffLogs: initialStaffLogs,
      wholesaleBuyers: initialWholesaleBuyers,
      coupons: initialCoupons,
      notifications: initialNotifications,

      setLanguage: (lang: Language) => set({ language: lang }),
      setRole: (role: VendorRole) => set({ currentRole: role }),

      toggleSound: () => {
        const next = !get().soundEnabled;
        audioAlert.setSoundEnabled(next);
        set({ soundEnabled: next });
      },

      toggleVacationMode: () => {
        const current = get().profile.vacationMode;
        set((state) => ({
          profile: { ...state.profile, vacationMode: !current },
        }));
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      updateOrderStatus: (orderId: string, newStatus: OrderStatus) => {
        set((state) => {
          const updatedOrders = state.orders.map((o) => {
            if (o.id !== orderId) return o;
            const updated = { ...o, status: newStatus };
            if (newStatus === "READY_FOR_PICKUP") {
              updated.readyAt = new Date().toISOString();
            } else if (newStatus === "COMPLETED") {
              updated.completedAt = new Date().toISOString();
            }
            return updated;
          });

          // If transitioning to COMPLETED, add to commission ledger
          const target = updatedOrders.find((o) => o.id === orderId);
          let updatedLedger = state.commissionLedger;
          if (newStatus === "COMPLETED" && target) {
            const exists = state.commissionLedger.some((c) => c.orderId === orderId);
            if (!exists) {
              const newEntry: CommissionLedgerEntry = {
                id: `com-${target.displayId}`,
                orderId: target.id,
                displayId: target.displayId,
                date: new Date().toISOString().split("T")[0],
                grossAmount: target.grossTotal,
                commissionRate: target.commissionRate,
                commissionAmount: target.commissionAmount,
                netPayable: target.netTotal,
                settlementStatus: "PENDING",
              };
              updatedLedger = [newEntry, ...state.commissionLedger];
            }
          }

          return { orders: updatedOrders, commissionLedger: updatedLedger };
        });
        audioAlert.playSuccessSound();
      },

      reconcileItemWeight: (orderId: string, itemId: string, actualWeight: number) => {
        set((state) => {
          const updatedOrders = state.orders.map((order) => {
            if (order.id !== orderId) return order;

            const updatedItems = order.items.map((item) => {
              if (item.id !== itemId) return item;
              // Recalculate item price based on rate and actual scale weight
              const finalPrice = Math.round(item.unitPrice * actualWeight * 100) / 100;
              return {
                ...item,
                weightActual: actualWeight,
                finalPrice,
                packed: true,
              };
            });

            // Recompute gross & net
            const grossTotal = updatedItems.reduce((acc, i) => acc + i.finalPrice, 0);
            const commissionAmount = Math.round(grossTotal * (order.commissionRate / 100) * 100) / 100;
            const netTotal = Math.round((grossTotal - commissionAmount) * 100) / 100;

            return {
              ...order,
              items: updatedItems,
              grossTotal,
              commissionAmount,
              netTotal,
            };
          });

          return { orders: updatedOrders };
        });
        audioAlert.playSuccessSound();
      },

      toggleItemPacked: (orderId: string, itemId: string) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              items: o.items.map((it) =>
                it.id === itemId ? { ...it, packed: !it.packed } : it
              ),
            };
          }),
        }));
      },

      markAllItemsPacked: (orderId: string) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              items: o.items.map((it) => ({ ...it, packed: true })),
            };
          }),
        }));
        audioAlert.playSuccessSound();
      },

      simulateIncomingOrder: () => {
        const orderNum = Math.floor(8500 + Math.random() * 900);
        const newOrder: Order = {
          id: `ord-${orderNum}`,
          displayId: `TB-${orderNum}`,
          customerName: "Kazi Tanjila",
          customerPhone: "+8801729871122",
          customerAddress: "Flat 4A, Road 2, Dhanmondi R/A",
          deliveryZone: "Dhanmondi",
          createdAt: new Date().toISOString(),
          status: "RECEIVED",
          urgent: true,
          grossTotal: 1350,
          commissionRate: 10,
          commissionAmount: 135.0,
          netTotal: 1215.0,
          paymentMethod: "BKASH",
          paymentStatus: "PAID",
          assignedAt: new Date().toISOString(),
          notes: "Need fresh cut vegetables urgently please.",
          items: [
            {
              id: `item-${Date.now()}-1`,
              productId: "prod-1",
              productName: "Fresh Deshi Beef (Bone-in)",
              productNameBn: "হাড়সহ দেশি তাজা গরুর মাংস",
              category: "MEAT",
              pricingType: "WEIGHT_BASED",
              unit: "KG",
              unitPrice: 820,
              quantity: 1,
              weightOrdered: 1.0,
              finalPrice: 820,
              packed: false,
            },
            {
              id: `item-${Date.now()}-2`,
              productId: "prod-4",
              productName: "Deshi Round Ripe Tomatoes",
              productNameBn: "দেশি পাকা গোল টমেটো",
              category: "VEGETABLES",
              pricingType: "WEIGHT_BASED",
              unit: "KG",
              unitPrice: 75,
              quantity: 1,
              weightOrdered: 2.0,
              finalPrice: 150,
              packed: false,
            },
            {
              id: `item-${Date.now()}-3`,
              productId: "prod-8",
              productName: "Fresh Deshi Brown Farm Eggs (1 Dozen)",
              productNameBn: "দেশি লাল মুরগির ডিম (১ ডজন)",
              category: "DAIRY",
              pricingType: "FIXED",
              unit: "PACK",
              unitPrice: 150,
              quantity: 1,
              finalPrice: 150,
              packed: false,
            },
          ],
        };

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: `New Order Assigned #${newOrder.displayId}`,
          titleBn: `নতুন অর্ডার বরাদ্দ #${newOrder.displayId}`,
          message: `Admin routed fresh grocery items for preparation (৳${newOrder.grossTotal}).`,
          messageBn: `অ্যাডমিন তাজা পণ্যের নতুন অর্ডার বরাদ্দ করেছে (৳${newOrder.grossTotal})।`,
          type: "ORDER",
          timestamp: new Date().toISOString(),
          read: false,
          link: "/orders",
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          notifications: [newNotif, ...state.notifications],
        }));

        audioAlert.playNewOrderChime();
      },

      addProduct: (productData) => {
        const id = `prod-${Date.now()}`;
        const newProduct: Product = {
          ...productData,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          products: [newProduct, ...state.products],
        }));
        audioAlert.playSuccessSound();
      },

      updateProduct: (id: string, updates: Partial<Product>) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProduct: (id: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      bulkAdjustStock: (productIds: string[], delta: number) => {
        const now = new Date().toISOString();
        set((state) => {
          const newLogs: StockAdjustmentLog[] = [];
          const updatedProducts = state.products.map((p) => {
            if (!productIds.includes(p.id)) return p;
            const newQty = Math.max(0, p.stockQty + delta);
            newLogs.push({
              id: `log-${Date.now()}-${p.id}`,
              productId: p.id,
              productName: p.name,
              productNameBn: p.nameBn,
              previousQty: p.stockQty,
              newQty,
              delta,
              reason: delta > 0 ? "RESTOCK" : "RECOUNT_AUDIT",
              adjustedBy: state.currentRole === "OWNER" ? "Rafiqul Islam" : "Staff Member",
              adjustedByRole: state.currentRole,
              timestamp: now,
              notes: "Bulk inventory adjustment action",
            });
            return { ...p, stockQty: newQty, updatedAt: now };
          });

          return {
            products: updatedProducts,
            stockLogs: [...newLogs, ...state.stockLogs],
          };
        });
        audioAlert.playSuccessSound();
      },

      bulkTogglePublish: (productIds: string[], isPublished: boolean) => {
        set((state) => ({
          products: state.products.map((p) =>
            productIds.includes(p.id) ? { ...p, isPublished } : p
          ),
        }));
      },

      adjustStock: (
        productId: string,
        newQty: number,
        reason: StockAdjustmentReason,
        notes?: string
      ) => {
        const target = get().products.find((p) => p.id === productId);
        if (!target) return;

        const delta = newQty - target.stockQty;
        const now = new Date().toISOString();

        const logEntry: StockAdjustmentLog = {
          id: `log-${Date.now()}`,
          productId: target.id,
          productName: target.name,
          productNameBn: target.nameBn,
          previousQty: target.stockQty,
          newQty,
          delta,
          reason,
          adjustedBy: get().currentRole === "OWNER" ? "Rafiqul Islam" : "Staff Member",
          adjustedByRole: get().currentRole,
          timestamp: now,
          notes,
        };

        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stockQty: newQty, updatedAt: now } : p
          ),
          stockLogs: [logEntry, ...state.stockLogs],
        }));
        audioAlert.playSuccessSound();
      },

      requestPayout: (amount: number, method: PayoutMethod, account: string) => {
        const newPayout: PayoutRequest = {
          id: `pay-${Date.now().toString().slice(-4)}`,
          amount,
          method,
          accountDetails: account,
          status: "REQUESTED",
          requestedAt: new Date().toISOString(),
        };

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: "Payout Request Submitted",
          titleBn: "টাকা তোলার আবেদন দাখিল হয়েছে",
          message: `Requested ৳${amount.toLocaleString()} via ${method}.`,
          messageBn: `৳${amount.toLocaleString()} তোলার আবেদন গ্রহণ করা হয়েছে (${method})।`,
          type: "PAYOUT",
          timestamp: new Date().toISOString(),
          read: false,
          link: "/settlements",
        };

        set((state) => ({
          payouts: [newPayout, ...state.payouts],
          notifications: [newNotif, ...state.notifications],
        }));
        audioAlert.playSuccessSound();
      },

      replyToReview: (reviewId: string, message: string) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  vendorReply: {
                    message,
                    repliedAt: new Date().toISOString(),
                  },
                }
              : r
          ),
        }));
        audioAlert.playSuccessSound();
      },

      resolveRefundDispute: (
        disputeId: string,
        status: "APPROVED" | "REJECTED" | "ESCALATED",
        notes?: string
      ) => {
        set((state) => ({
          refundDisputes: state.refundDisputes.map((d) =>
            d.id === disputeId
              ? {
                  ...d,
                  status,
                  escalatedToAdmin: status === "ESCALATED",
                  resolutionNotes: notes,
                }
              : d
          ),
        }));
        audioAlert.playSuccessSound();
      },

      addStaff: (staffData) => {
        const newStaff: StaffAccount = {
          ...staffData,
          id: `stf-${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastActive: "Just now",
        };
        set((state) => ({
          staffAccounts: [newStaff, ...state.staffAccounts],
        }));
        audioAlert.playSuccessSound();
      },

      toggleStaffStatus: (staffId: string) => {
        set((state) => ({
          staffAccounts: state.staffAccounts.map((s) =>
            s.id === staffId ? { ...s, isActive: !s.isActive } : s
          ),
        }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },
    }),
    {
      name: "tatka-vendor-store-v1",
      partialize: (state) => ({
        language: state.language,
        currentRole: state.currentRole,
        soundEnabled: state.soundEnabled,
        profile: state.profile,
        products: state.products,
        orders: state.orders,
        stockLogs: state.stockLogs,
        commissionLedger: state.commissionLedger,
        payouts: state.payouts,
        reviews: state.reviews,
        refundDisputes: state.refundDisputes,
        staffAccounts: state.staffAccounts,
        staffLogs: state.staffLogs,
        wholesaleBuyers: state.wholesaleBuyers,
        coupons: state.coupons,
        notifications: state.notifications,
      }),
    }
  )
);
