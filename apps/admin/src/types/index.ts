// =============================================================================
// Tatka Bazar — Admin Types & Models (Complete v3.0)
// =============================================================================

export type AdminRole =
  | "SUPER_ADMIN"
  | "MANAGER"
  | "INVENTORY_STAFF"
  | "SUPPORT_STAFF"
  | "DELIVERY_COORDINATOR"
  | "FINANCE";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  lastLogin: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  lastLogin?: string;
  invitedAt: string;
  invitedBy: string;
  phone?: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "VENDOR_ASSIGNED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface SubOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorArea: string;
  itemsCount: number;
  subtotal: number;
  status: OrderStatus;
  assignedAt?: string;
  acceptedAt?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryArea: string;
  deliveryZone?: string;
  deliverySlot: string;
  totalAmount: number;
  paymentMethod: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD";
  paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
  status: OrderStatus;
  createdAt: string;
  confirmedAt?: string;
  assignedRiderId?: string;
  assignedRiderName?: string;
  assignedVendorId?: string;
  assignedVendorName?: string;
  subOrders: SubOrder[];
  internalNotes?: string;
  source: "STOREFRONT" | "ADMIN_MANUAL" | "B2B" | "APP";
}

export interface AdminProduct {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  descriptionBn?: string;
  descriptionEn?: string;
  sku: string;
  categorySlug: string;
  categoryName: string;
  subcategorySlug?: string;
  vendorId: string;
  vendorName: string;
  basePrice: number;
  comparePrice?: number;
  baseUnit: "kg" | "g" | "piece" | "packet" | "liter" | "dozen";
  pricingType: "variableWeight" | "fixed" | "pack";
  weightOptions?: {
    value: number;
    unit: string;
    labelEn: string;
    multiplier: number;
    popular?: boolean;
  }[];
  tieredPricing?: {
    minQty: number;
    pricePerUnit: number;
    discountPercent?: number;
    labelEn: string;
  }[];
  stock: number;
  lowStockAlert: number;
  images: string[];
  isOrganic: boolean;
  isFeatured: boolean;
  isDailyBazar?: boolean;
  isPublished: boolean;
  flashDiscount?: number;
  originEn?: string;
  freshnessGuaranteeEn?: string;
  nutritionInfo?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
  };
  storageTipsEn?: string;
  expiryDate?: string;
  rating: number;
  reviewsCount?: number;
}

export interface AdminCategory {
  id: string;
  slug: string;
  nameBn: string;
  nameEn: string;
  icon: string;
  image?: string;
  itemCount: number;
  commissionRate: number; // %
  isActive: boolean;
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
  area: string;
  city: string;
  status: "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED";
  commissionRate: number; // %
  totalSales: number;
  payableBalance: number;
  totalProducts: number;
  joinedDate: string;
  rating: number;
  activeOrders: number;
  logo?: string;
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
  area: string;
  status: "ACTIVE" | "PENDING" | "OFFLINE" | "SUSPENDED" | "BUSY";
  kycStatus: "APPROVED" | "PENDING" | "REJECTED" | "SUBMITTED";
  activeDeliveriesCount: number;
  totalDeliveriesCompleted: number;
  rating: number;
  balancePayable: number;
  totalEarned: number;
  joinedDate: string;
  photoUrl?: string;
}

export interface AdminBranch {
  id: string;
  nameBn: string;
  nameEn: string;
  area: string;
  city: string;
  address: string;
  phone: string;
  deliveryFee: number;
  eta: string;
  isActive: boolean;
  managerName: string;
  coverageZones: string[];
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
  applicableCategories?: string[];
}

export interface AdminReview {
  id: string;
  productName: string;
  productSlug: string;
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
  ipAddress?: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastOrderDate?: string;
  area?: string;
  status: "ACTIVE" | "SUSPENDED";
}

export interface DeliveryZoneVendor {
  vendorId: string;
  vendorName: string;
  area: string;
  activeOrders: number;
  rating: number;
  status: "APPROVED" | "PENDING" | "SUSPENDED";
  logo?: string;
}

export interface AdminReport {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  topVendors: { name: string; orders: number; revenue: number }[];
  ordersByStatus: Record<string, number>;
  revenueByDay: { date: string; amount: number }[];
}
