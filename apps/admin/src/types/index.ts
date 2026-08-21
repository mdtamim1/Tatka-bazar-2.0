// =============================================================================
// Tatka Bazar — Admin Types & Models
// =============================================================================

export type AdminRole =
  | "SUPER_ADMIN"
  | "MANAGER"
  | "INVENTORY_STAFF"
  | "SUPPORT_STAFF"
  | "DELIVERY_COORDINATOR";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastLogin: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface SubOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  itemsCount: number;
  subtotal: number;
  status: OrderStatus;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryArea: string;
  deliverySlot: string;
  totalAmount: number;
  paymentMethod: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD";
  paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
  status: OrderStatus;
  createdAt: string;
  assignedRiderId?: string;
  assignedRiderName?: string;
  subOrders: SubOrder[];
  internalNotes?: string;
}

export interface AdminProduct {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  sku: string;
  categorySlug: string;
  categoryName: string;
  vendorId: string;
  vendorName: string;
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
  isPublished: boolean;
  expiryDate?: string;
  rating: number;
}

export interface AdminCategory {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  icon: string;
  itemCount: number;
  commissionRate: number; // %
  subcategories: {
    slug: string;
    nameBn: string;
    nameEn: string;
  }[];
}

export interface AdminVendor {
  id: string;
  nameBn: string;
  nameEn: string;
  slug: string;
  contactName: string;
  phone: string;
  email: string;
  tradeLicense: string;
  location: string;
  status: "APPROVED" | "PENDING" | "SUSPENDED";
  commissionRate: number; // %
  totalSales: number;
  payableBalance: number;
  totalProducts: number;
  joinedDate: string;
  rating: number;
}

export interface AdminB2BAccount {
  id: string;
  companyName: string;
  tradeLicense: string;
  contactPerson: string;
  phone: string;
  email: string;
  categoryNeeded: string;
  monthlyVolume: string;
  creditLimit: number;
  status: "APPROVED" | "PENDING" | "REJECTED";
  appliedDate: string;
  notes?: string;
}

export interface AdminRider {
  id: string;
  name: string;
  phone: string;
  email: string;
  nid: string;
  vehicleType: "MOTORCYCLE" | "BICYCLE" | "VAN";
  assignedHubId: string;
  assignedHubName: string;
  status: "ACTIVE" | "PENDING" | "OFFLINE" | "SUSPENDED";
  activeDeliveriesCount: number;
  totalDeliveriesCompleted: number;
  rating: number;
  balancePayable: number;
}

export interface AdminBranch {
  id: string;
  nameBn: string;
  nameEn: string;
  area: string;
  address: string;
  phone: string;
  deliveryFee: number;
  eta: string;
  isActive: boolean;
  managerName: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FLAT";
  value: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

export interface AdminReview {
  id: string;
  productName: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  actorRole: AdminRole;
  action: string;
  module: string;
  targetId: string;
  details: string;
  timestamp: string;
}
