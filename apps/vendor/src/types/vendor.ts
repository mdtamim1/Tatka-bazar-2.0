export type VendorRole = "OWNER" | "MANAGER" | "STAFF";

export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type VendorTier = "STANDARD" | "TRUSTED" | "PREMIUM";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "HANDED_TO_RIDER"
  | "COMPLETED"
  | "RETURNED"
  | "CANCELLED"
  // Legacy aliases for backward-compatibility
  | "RECEIVED"
  | "PREPARING";

export type PricingType = "FIXED" | "WEIGHT_BASED";

export type WeightUnit = "KG" | "GRAM_100" | "PIECE" | "PACK" | "LITRE";

export type ProductCategory =
  | "VEGETABLES"
  | "FRUITS"
  | "FISH"
  | "MEAT"
  | "GROCERY"
  | "DAIRY"
  | "SPICES"
  | "ORGANIC";

export interface ProductVariant {
  id: string;
  name: string;
  nameBn: string;
  priceModifier: number;
  stockQty: number;
}

export interface WholesaleTier {
  minQty: number;
  maxQty?: number;
  unitPrice: number;
  discountPercent: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  nameBn: string;
  category: ProductCategory;
  pricingType: PricingType;
  pricePerUnit: number;
  comparePrice?: number;
  unit: WeightUnit;
  sku: string;
  stockQty: number;
  lowStockThreshold: number;
  isPublished: boolean;
  isWholesaleEligible: boolean;
  wholesaleMinQty?: number;
  wholesaleTiers?: WholesaleTier[];
  imageUrl: string;
  description: string;
  descriptionBn: string;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productNameBn: string;
  category: ProductCategory;
  pricingType: PricingType;
  unit: WeightUnit;
  unitPrice: number;
  quantity: number;
  weightOrdered?: number; // In kg, e.g. 1.0 kg for meat/produce
  weightActual?: number; // In kg, actual weighed amount e.g. 1.05 kg
  finalPrice: number;
  packed: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  displayId: string; // e.g. TB-8492
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryZone: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  grossTotal: number;
  commissionRate: number; // 10%
  commissionAmount: number;
  netTotal: number;
  paymentMethod: "CASH_ON_DELIVERY" | "BKASH" | "NAGAD" | "CARD";
  paymentStatus: "PENDING" | "PAID";
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderVehicle?: string;
  assignedAt: string;
  readyAt?: string;
  completedAt?: string;
  isB2B?: boolean;
  notes?: string;
  urgent?: boolean;
  // Area-wise competitive dispatch & claim
  claimedByVendorId?: string;
  claimedByStoreName?: string;
  claimedAt?: string;
  isClaimedByOther?: boolean;
  // Rider Live Tracking
  riderLatitude?: number;
  riderLongitude?: number;
  riderDistanceKm?: number;
  riderEtaMinutes?: number;
  riderCurrentLocationName?: string;
  // Returns
  returnReason?: string;
  returnedAt?: string;
  // 12-Hour Active Shift Window
  shiftCreatedAt?: string;
}

export type StockAdjustmentReason =
  | "RESTOCK"
  | "DAMAGED"
  | "RECOUNT_AUDIT"
  | "CUSTOMER_RETURN"
  | "EXPIRED";

export interface StockAdjustmentLog {
  id: string;
  productId: string;
  productName: string;
  productNameBn: string;
  previousQty: number;
  newQty: number;
  delta: number;
  reason: StockAdjustmentReason;
  adjustedBy: string;
  adjustedByRole: VendorRole;
  timestamp: string;
  notes?: string;
}

export interface CommissionLedgerEntry {
  id: string;
  orderId: string;
  displayId: string;
  date: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netPayable: number;
  settlementStatus: "PENDING" | "SETTLED" | "PROCESSING";
  settlementBatchId?: string;
}

export type PayoutMethod = "BKASH" | "NAGAD" | "BANK_TRANSFER";
export type PayoutStatus = "REQUESTED" | "PROCESSING" | "COMPLETED" | "REJECTED";

export interface PayoutRequest {
  id: string;
  amount: number;
  method: PayoutMethod;
  accountDetails: string;
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
  referenceTxn?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productNameBn: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  vendorReply?: {
    message: string;
    repliedAt: string;
  };
}

export interface RefundDispute {
  id: string;
  orderId: string;
  displayId: string;
  customerName: string;
  reason: string;
  requestedAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ESCALATED";
  escalatedToAdmin?: boolean;
  createdAt: string;
  resolutionNotes?: string;
}

export interface StaffAccount {
  id: string;
  name: string;
  phone: string;
  role: VendorRole;
  pin: string;
  isActive: boolean;
  createdAt: string;
  lastActive: string;
}

export interface StaffActivityLog {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  actionBn: string;
  timestamp: string;
  details: string;
}

export interface WholesaleBuyer {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  creditLimit: number;
  outstandingBalance: number;
  paymentTerms: "NET_15" | "NET_30" | "IMMEDIATE";
  status: "ACTIVE" | "BLOCKED";
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface VendorProfile {
  id: string;
  storeName: string;
  storeNameBn: string;
  slug: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  tradeLicense: string;
  tinBin: string;
  nidNumber: string;
  payoutMethod: PayoutMethod;
  payoutAccount: string;
  status: VendorStatus;
  tier: VendorTier;
  rating: number;
  commissionRate: number;
  vacationMode: boolean;
  autoHideZeroStock: boolean;
  operatingHours: {
    open: string;
    close: string;
  };
  deliveryZones: string[];
  logoUrl: string;
  bannerUrl: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  presentAddress?: string;
  permanentAddress?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  photoUrl?: string;
  kycStatus?: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
}

export interface NotificationItem {
  id: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  type: "ORDER" | "STOCK" | "PAYOUT" | "REVIEW" | "SYSTEM";
  timestamp: string;
  read: boolean;
  link?: string;
}

/* ─── Withdrawal System ────────────────────────────────────────── */

export type WithdrawStatus =
  | "PENDING"       // vendor submitted request
  | "APPROVED"      // admin approved, OTP not yet sent
  | "OTP_SENT"      // OTP generated, rider dispatched
  | "COMPLETED"     // OTP verified, cash delivered
  | "REJECTED";     // admin rejected

export interface WithdrawRequest {
  id: string;
  amount: number;
  method: PayoutMethod;
  accountDetails: string;
  status: WithdrawStatus;
  requestedAt: string;
  otp?: string;            // 6-digit OTP (generated on approval)
  riderId?: string;
  riderName?: string;
  completedAt?: string;
  rejectionNote?: string;
}

export type SettlementStatus =
  | "PENDING"          // vendor submitted with selected orders
  | "RIDER_DISPATCHED" // admin sent rider to collect
  | "OTP_SENT"         // rider has OTP, about to verify
  | "COMPLETED"        // cash received & confirmed
  | "REJECTED";

export interface SettlementRequest {
  id: string;
  orderIds: string[];
  orderDisplayIds: string[];
  totalAmount: number;
  status: SettlementStatus;
  requestedAt: string;
  otp?: string;
  riderId?: string;
  riderName?: string;
  completedAt?: string;
}
