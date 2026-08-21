// =============================================================================
// Tatka Bazar — Vendor Portal Domain Types
// =============================================================================

export interface VendorProfile {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  contactName: string;
  phone: string;
  email: string;
  tradeLicense: string;
  location: string;
  commissionRate: number; // %
  rating: number;
  reviewsCount: number;
  banner: string;
  logo: string;
  taglineBn: string;
  taglineEn: string;
  descriptionBn: string;
  descriptionEn: string;
  verified: boolean;
  status: "APPROVED" | "PENDING" | "SUSPENDED";
}

export type ProductApprovalStatus = "APPROVED" | "PENDING_APPROVAL" | "REJECTED";

export interface VendorProduct {
  id: string;
  vendorId: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  sku: string;
  categorySlug: string;
  categoryName: string;
  basePrice: number;
  comparePrice?: number;
  baseUnit: "kg" | "g" | "piece" | "packet" | "liter";
  pricingType: "variableWeight" | "fixed" | "pack";
  tieredPricing?: {
    minQty: number;
    pricePerUnit: number;
  }[];
  stock: number;
  lowStockAlert: number;
  images: string[];
  isOrganic: boolean;
  status: ProductApprovalStatus;
  rating: number;
}

export type FulfillmentStatus =
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "PICKED_UP_BY_RIDER"
  | "DELIVERED";

export interface OrderItemSlice {
  productId: string;
  nameBn: string;
  nameEn: string;
  weight: number;
  unit: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface VendorSubOrder {
  id: string;
  vendorId: string;
  masterOrderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  deliverySlot: string;
  items: OrderItemSlice[];
  subtotal: number;
  commissionDeducted: number; // e.g. 10%
  netEarnings: number; // subtotal - commission
  status: FulfillmentStatus;
  createdAt: string;
  assignedRiderName?: string;
  assignedRiderPhone?: string;
  specialNotes?: string;
}

export interface VendorPayoutRecord {
  id: string;
  vendorId: string;
  date: string;
  amount: number;
  method: "bKash" | "Bank Transfer" | "Nagad";
  accountDetails: string;
  status: "COMPLETED" | "PROCESSING" | "SCHEDULED";
  referenceNo: string;
}

export interface VendorReview {
  id: string;
  vendorId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  productName: string;
}
