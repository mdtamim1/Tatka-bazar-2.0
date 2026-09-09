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
  WithdrawRequest,
  SettlementRequest,
} from "@/types/vendor";
import { Language } from "@/utils/translations";
import { audioAlert } from "@/utils/audioAlert";
import { broadcastSyncEvent, dispatchOrderToRiders } from "@/lib/sync";

interface VendorState {
  // Localization & Role
  language: Language;
  currentRole: VendorRole;
  soundEnabled: boolean;

  // Profile & Status
  profile: VendorProfile;
  dutyStatus: "STORE_OPEN" | "BUSY" | "STORE_CLOSED";
  incomingOrderAlert: Order | null;
  chatOrder: Order | null;

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
  orderHistory: Order[];
  withdrawRequests: WithdrawRequest[];
  settlementRequests: SettlementRequest[];

  // Rider Live Tracking
  trackingOrder: Order | null;
  setTrackingOrder: (order: Order | null) => void;

  // Multi-Vendor Claim Lockout
  claimLockAlert: { isOpen: boolean; message: string; claimedByStoreName: string } | null;
  setClaimLockAlert: (alert: { isOpen: boolean; message: string; claimedByStoreName: string } | null) => void;

  // 12-Hour Operational Shift
  shiftStartedAt: string;
  resetShiftQueue: () => void;

  // Action Methods
  setLanguage: (lang: Language) => void;
  setRole: (role: VendorRole) => void;
  toggleSound: () => void;
  toggleVacationMode: () => void;
  setDutyStatus: (status: "STORE_OPEN" | "BUSY" | "STORE_CLOSED") => void;
  setIncomingOrderAlert: (order: Order | null) => void;
  setChatOrder: (order: Order | null) => void;
  acceptOrder: (orderId: string) => void;
  declineOrder: (orderId: string) => void;
  updateProfile: (updates: Partial<VendorProfile>) => void;

  // Order Operations
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderReturned: (orderId: string, reason?: string) => void;
  reconcileItemWeight: (orderId: string, itemId: string, actualWeight: number) => void;
  toggleItemPacked: (orderId: string, itemId: string) => void;
  markAllItemsPacked: (orderId: string) => void;
  simulateIncomingOrder: () => void;
  simulateAreaDispatchOrder: () => void;
  simulateRemoteClaim: (orderId: string) => void;
  syncRiderDispatch: (tasks: any[]) => void;

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

  // Withdrawal System
  requestWithdraw: (amount: number, method: PayoutMethod, account: string) => void;
  requestSettlement: (orderIds: string[], orderDisplayIds: string[], totalAmount: number) => void;
  approveWithdrawSimulate: (requestId: string) => void;
  approveSettlementSimulate: (requestId: string) => void;
  verifyWithdrawOTP: (requestId: string, otp: string) => boolean;
  verifySettlementOTP: (requestId: string, otp: string) => boolean;

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

  // Full Portal Reset
  fullResetVendorStore: () => void;
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
const initialOrders: Order[] = [];

const initialOrderHistory: Order[] = [];

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
      dutyStatus: "STORE_OPEN",
      incomingOrderAlert: null,
      chatOrder: null,
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
      orderHistory: initialOrderHistory,
      withdrawRequests: [],
      settlementRequests: [],

      trackingOrder: null,
      setTrackingOrder: (order) => set({ trackingOrder: order }),

      claimLockAlert: null,
      setClaimLockAlert: (alert) => set({ claimLockAlert: alert }),

      shiftStartedAt: new Date().toISOString(),
      resetShiftQueue: () => {
        set((state) => {
          const newHistory = [...state.orders, ...state.orderHistory].filter(
            (o, idx, arr) => arr.findIndex((x) => x.id === o.id) === idx
          );
          const activeOnly = state.orders.filter(
            (o) =>
              o.status === "PENDING" ||
              o.status === "PROCESSING" ||
              o.status === "READY_FOR_PICKUP"
          );
          return {
            orders: activeOnly,
            orderHistory: newHistory,
            shiftStartedAt: new Date().toISOString(),
          };
        });
        audioAlert.playSuccessSound();
      },

      setLanguage: (lang: Language) => set({ language: lang }),
      setRole: (role: VendorRole) => set({ currentRole: role }),

      toggleSound: () => {
        const next = !get().soundEnabled;
        audioAlert.setSoundEnabled(next);
        set({ soundEnabled: next });
      },

      setDutyStatus: (status) => {
        set({ dutyStatus: status });
        if (typeof window !== "undefined") {
          localStorage.setItem("tatka_vendor_duty", status);
          window.dispatchEvent(
            new CustomEvent("tatka_vendor_duty_change", { detail: { status } })
          );
        }
      },

      setIncomingOrderAlert: (order) => set({ incomingOrderAlert: order }),
      setChatOrder: (order) => set({ chatOrder: order }),

      acceptOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        const storeName = get().profile.storeNameBn || get().profile.storeName;

        get().updateOrderStatus(orderId, "PROCESSING");
        set({ incomingOrderAlert: null, claimLockAlert: null });

        // Broadcast claim event so any competing vendor modals close with lockout
        broadcastSyncEvent({
          type: "VENDOR_CLAIM_ORDER",
          orderId: orderId,
          claimedByVendorId: get().profile.id,
          claimedByStoreName: storeName,
          amount: order?.grossTotal,
        });

        audioAlert.playSuccessSound();
      },

      declineOrder: (orderId) => {
        get().updateOrderStatus(orderId, "CANCELLED");
        set({ incomingOrderAlert: null, claimLockAlert: null });
      },

      markOrderReturned: (orderId, reason = "গ্রাহক দরজায় অনুপস্থিত ছিলেন") => {
        set((state) => {
          const updatedOrders = state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "RETURNED" as OrderStatus,
                  returnReason: reason,
                  returnedAt: new Date().toISOString(),
                }
              : o
          );
          const target = updatedOrders.find((o) => o.id === orderId);
          let updatedHistory = state.orderHistory;
          if (target) {
            const histIndex = updatedHistory.findIndex((h) => h.id === orderId);
            if (histIndex >= 0) {
              updatedHistory = [...updatedHistory];
              updatedHistory[histIndex] = target;
            } else {
              updatedHistory = [target, ...updatedHistory];
            }
          }
          return { orders: updatedOrders, orderHistory: updatedHistory };
        });

        broadcastSyncEvent({
          type: "ORDER_RETURNED",
          orderId: orderId,
          message: reason,
        });

        audioAlert.playSuccessSound();
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
              if (!updated.riderId) {
                updated.riderId = "rider-demo-01";
                updated.riderName = "তামীম ইকবাল (রাইডার #১০১)";
                updated.riderPhone = "01700000001";
                updated.riderVehicle = "মোটরসাইকেল (ঢাকা মেট্রো-হ-৪৫-১২৩৪)";
                updated.riderLatitude = 23.7925;
                updated.riderLongitude = 90.4078;
                updated.riderEtaMinutes = 10;
                updated.riderDistanceKm = 1.4;
                updated.riderCurrentLocationName = "মিরপুর-১০ গোলচত্বর";
              }
            } else if (newStatus === "COMPLETED") {
              updated.completedAt = new Date().toISOString();
            } else if (newStatus === "RETURNED") {
              updated.returnedAt = new Date().toISOString();
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

          if (newStatus === "READY_FOR_PICKUP" && target) {
            broadcastSyncEvent({
              type: "ORDER_READY_FOR_PICKUP",
              orderId: target.id,
              deliveryZone: target.deliveryZone,
              riderName: target.riderName || "তামীম ইকবাল (রাইডার #১০১)",
              riderPhone: target.riderPhone || "01700000001",
            });

            // Cross-app live dispatch to Rider Portal (Vercel & Localhost)
            const dispatchPayload = {
              id: target.id,
              orderNumber: target.displayId,
              customerName: target.customerName.replace(/\[.*?\]/g, "").trim(),
              customerPhone: target.customerPhone.includes("01") ? target.customerPhone.replace(/\[.*?\]/g, "").trim() : "01729-458921",
              deliveryAddress: `${target.deliveryZone}, ঢাকা`,
              deliveryZone: target.deliveryZone,
              vendorName: state.profile.storeNameBn || state.profile.storeName || "সবুজ খামার গ্রোসারি",
              itemCount: target.items.reduce((s, i) => s + (i.quantity || 1), 0),
              subtotal: target.grossTotal,
              deliveryFee: 60,
              total: target.grossTotal + 60,
              earnings: 50,
              paymentStatus: target.paymentStatus || "COD",
              paymentMethod: target.paymentMethod || "CASH_ON_DELIVERY",
              items: target.items.map((it) => ({
                name: it.productNameBn || it.productName,
                qty: it.quantity,
                price: it.finalPrice || it.unitPrice,
                total: (it.finalPrice || it.unitPrice) * it.quantity,
              })),
              createdAt: new Date().toISOString(),
              status: "READY_FOR_PICKUP",
            };

            dispatchOrderToRiders(dispatchPayload);

            // Auto-pickup simulation:
            // When rider arrives and takes parcel, status automatically changes to COMPLETED
            setTimeout(() => {
              const currentOrder = get().orders.find((o) => o.id === target.id);
              if (currentOrder && currentOrder.status === "READY_FOR_PICKUP") {
                get().updateOrderStatus(target.id, "COMPLETED");
                broadcastSyncEvent({
                  type: "RIDER_PICKED_UP",
                  orderId: target.id,
                });
              }
            }, 18000);
          }

          let updatedHistory = state.orderHistory;
          if (target) {
            const histIndex = updatedHistory.findIndex((h) => h.id === orderId);
            if (histIndex >= 0) {
              updatedHistory = [...updatedHistory];
              updatedHistory[histIndex] = target;
            } else {
              updatedHistory = [target, ...updatedHistory];
            }
          }

          return { orders: updatedOrders, commissionLedger: updatedLedger, orderHistory: updatedHistory };
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
        // Safe sound chime only — no fake demo order created
        audioAlert.playNewOrderChime();
      },

      simulateAreaDispatchOrder: () => {
        // Safe stub — no fake demo order created
      },

      simulateRemoteClaim: (orderId: string) => {
        const competingStores = [
          "আল-মদিনা ফ্রেশ স্টোর (মিরপুর)",
          "মালেক ব্রাদার্স গ্রোসারি",
          "তাজা কিচেন অ্যান্ড মিট মার্ট",
          "সোনার বাংলা ডেইরি অ্যান্ড ভেজিটেবল",
        ];
        const claimedStore = competingStores[Math.floor(Math.random() * competingStores.length)];

        set((state) => ({
          claimLockAlert: {
            isOpen: true,
            message: `অর্ডারটি ইতিমধ্যে অন্য ভেন্ডর (${claimedStore}) গ্রহণ করেছেন!`,
            claimedByStoreName: claimedStore,
          },
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, isClaimedByOther: true, claimedByStoreName: claimedStore }
              : o
          ),
        }));
      },

      syncRiderDispatch: (tasks: any[]) => {
        if (!Array.isArray(tasks) || tasks.length === 0) return;
        set((state) => {
          let changed = false;
          const updatedOrders = state.orders.map((order) => {
            const matchingTask = tasks.find(
              (t: any) =>
                t.id === order.id ||
                t.orderNumber === order.displayId ||
                t.id === order.displayId ||
                t.orderNumber === order.id
            );
            if (!matchingTask) return order;

            const riderName = matchingTask.riderName || matchingTask.claimedBy?.riderName;
            const riderPhone = matchingTask.riderPhone || matchingTask.claimedBy?.riderPhone;
            const riderVehicle = matchingTask.riderVehicle || matchingTask.claimedBy?.riderVehicle;
            const taskStatus = matchingTask.status;

            // ─── Status Mapping (Rider dispatch status → Vendor order status) ───
            // When rider picks up parcel (ON_THE_WAY, PICKED_UP, DELIVERED, or pickedUpFromStore),
            // it automatically transitions to COMPLETED in the vendor portal!
            let newStatus = order.status;
            if (taskStatus === "DELIVERED" && order.status !== "COMPLETED") {
              newStatus = "COMPLETED";
            } else if (taskStatus === "RETURNED" && order.status !== "RETURNED") {
              newStatus = "RETURNED";
            } else if (
              (taskStatus === "ON_THE_WAY" ||
                taskStatus === "PICKED_UP" ||
                matchingTask.pickedUpFromStore) &&
              order.status !== "COMPLETED"
            ) {
              newStatus = "COMPLETED";
            }

            const finalRiderName = riderName || order.riderName || undefined;
            const finalRiderPhone = riderPhone || order.riderPhone || undefined;
            const finalRiderVehicle = riderVehicle || order.riderVehicle || undefined;

            if (
              order.riderName !== finalRiderName ||
              order.riderPhone !== finalRiderPhone ||
              order.riderVehicle !== finalRiderVehicle ||
              order.status !== newStatus
            ) {
              changed = true;
              return {
                ...order,
                riderName: finalRiderName,
                riderPhone: finalRiderPhone,
                riderVehicle: finalRiderVehicle,
                status: newStatus,
                completedAt: newStatus === "COMPLETED" ? (order.completedAt || new Date().toISOString()) : order.completedAt,
              };
            }
            return order;
          });

          // If any order transitioned to COMPLETED, add to commission ledger
          let updatedLedger = state.commissionLedger;
          updatedOrders.forEach((o) => {
            if (o.status === "COMPLETED") {
              const exists = updatedLedger.some((c) => c.orderId === o.id);
              if (!exists) {
                const newEntry: CommissionLedgerEntry = {
                  id: `com-${o.displayId}`,
                  orderId: o.id,
                  displayId: o.displayId,
                  date: new Date().toISOString().split("T")[0],
                  grossAmount: o.grossTotal,
                  commissionRate: o.commissionRate,
                  commissionAmount: o.commissionAmount,
                  netPayable: o.netTotal,
                  settlementStatus: "PENDING",
                };
                updatedLedger = [newEntry, ...updatedLedger];
              }
            }
          });

          return changed ? { orders: updatedOrders, commissionLedger: updatedLedger } : state;
        });
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

      fullResetVendorStore: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("tatka-vendor-store");
            localStorage.removeItem("tatka-vendor-store-v1");
            localStorage.removeItem("tatka-vendor-store-v2");
            localStorage.removeItem("tatka_vendor_storage");
            localStorage.removeItem("tatka_dispatch_tasks");
          } catch {}
        }
        set(() => ({
          language: "bn",
          currentRole: "OWNER",
          soundEnabled: true,
          dutyStatus: "STORE_OPEN",
          incomingOrderAlert: null,
          chatOrder: null,
          trackingOrder: null,
          claimLockAlert: null,
          profile: initialProfile,
          products: initialProducts,
          orders: initialOrders,
          orderHistory: [],
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
          shiftStartedAt: new Date().toISOString(),
          withdrawRequests: [],
          settlementRequests: [],
        }));
      },

      /* ─── Withdrawal System Actions ─────────────────────────────── */

      requestWithdraw: (amount, method, account) => {
        const id = `wd-${Date.now()}`;
        const newReq: WithdrawRequest = {
          id,
          amount,
          method,
          accountDetails: account,
          status: "PENDING",
          requestedAt: new Date().toISOString(),
        };
        set((state) => ({
          withdrawRequests: [newReq, ...state.withdrawRequests],
        }));
      },

      requestSettlement: (orderIds, orderDisplayIds, totalAmount) => {
        const id = `st-${Date.now()}`;
        const newReq: SettlementRequest = {
          id,
          orderIds,
          orderDisplayIds,
          totalAmount,
          status: "PENDING",
          requestedAt: new Date().toISOString(),
        };
        // Mark selected ledger entries as PROCESSING
        set((state) => ({
          settlementRequests: [newReq, ...state.settlementRequests],
          commissionLedger: state.commissionLedger.map((c) =>
            orderIds.includes(c.orderId)
              ? { ...c, settlementStatus: "PROCESSING" as const }
              : c
          ),
        }));
      },

      approveWithdrawSimulate: (requestId) => {
        // Simulate admin approval + OTP generation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        set((state) => ({
          withdrawRequests: state.withdrawRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: "OTP_SENT" as const, otp, riderName: "রাইডার সাকিব" }
              : r
          ),
        }));
        return otp;
      },

      approveSettlementSimulate: (requestId) => {
        // Simulate admin dispatching rider + OTP generation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        set((state) => ({
          settlementRequests: state.settlementRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: "OTP_SENT" as const, otp, riderName: "রাইডার সাকিব" }
              : r
          ),
        }));
        return otp;
      },

      verifyWithdrawOTP: (requestId, otp) => {
        const req = get().withdrawRequests.find((r) => r.id === requestId);
        if (!req || req.otp !== otp) return false;
        set((state) => ({
          withdrawRequests: state.withdrawRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: "COMPLETED" as const, completedAt: new Date().toISOString() }
              : r
          ),
        }));
        audioAlert.playSuccessSound();
        return true;
      },

      verifySettlementOTP: (requestId, otp) => {
        const req = get().settlementRequests.find((r) => r.id === requestId);
        if (!req || req.otp !== otp) return false;
        // Mark as completed and settle ledger entries
        set((state) => ({
          settlementRequests: state.settlementRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: "COMPLETED" as const, completedAt: new Date().toISOString() }
              : r
          ),
          commissionLedger: state.commissionLedger.map((c) => {
            const settled = req.orderIds.includes(c.orderId);
            return settled
              ? { ...c, settlementStatus: "SETTLED" as const, settlementBatchId: requestId }
              : c;
          }),
        }));
        audioAlert.playSuccessSound();
        return true;
      },
    }),
    {
      name: "tatka-vendor-store-v2",
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
