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

export type StaffKYCStatus = "PENDING_KYC" | "SUBMITTED" | "VERIFIED" | "REJECTED";

export interface StaffKYC {
  nidNumber: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  presentAddress: string;
  permanentAddress: string;
  district: string;
  thana: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface StaffDailySession {
  loginTime?: string;
  logoutTime?: string;
  activeMinutesToday: number;
  lastActiveDate: string;
  isCurrentlyOnline: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  kycStatus: StaffKYCStatus;
  avatar?: string;
  phone?: string;
  address?: string;
  department?: string;
  assignedBranch?: string;
  joinedDate: string;
  invitedAt: string;
  invitedBy: string;
  lastLogin?: string;
  ordersCollectedToday: number;
  ordersCollectedLast30Days: number;
  ordersCollectedLifetime: number;
  dailySession: StaffDailySession;
  kyc?: StaffKYC;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "VENDOR_ASSIGNED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface OrderItem {
  id: string;
  name: string;
  sku?: string;
  size?: string;
  price: number;
  quantity: number;
}

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

export interface OrderHistoryEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: "ORDER_SYNC" | "STAFF_ASSIGNED" | "STAFF_REASSIGNED" | "STATUS_UPDATE" | "NOTE_ADDED" | "VENDOR_SHIFT" | string;
  details: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  storeName?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  email?: string;
  deliveryArea: string;
  deliveryZone?: string;
  deliverySlot: string;
  courier?: string;
  assignedModerator?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedStaffAvatar?: string;
  district?: string;
  thana?: string;
  areaNeighborhood?: string;
  customerNote?: string;
  shopNote?: string;
  items?: OrderItem[];
  subtotalAmount?: number;
  deliveryCharge?: number;
  couponCode?: string;
  discountAmount?: number;
  paidAmount?: number;
  memoTransactionNo?: string;
  totalAmount: number;
  paymentMethod: "BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD" | string;
  paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
  status: OrderStatus;
  createdAt: string;
  confirmedAt?: string;
  assignedRiderId?: string;
  assignedRiderName?: string;
  riderAvatar?: string;
  riderPhone?: string;
  riderTrackingStatus?: string;
  riderNotes?: Array<{ id?: string; note: string; riderName?: string; createdAt?: string }>;
  riderNote?: string;
  riderCustomerConversation?: Array<{ time: string; sender: "RIDER" | "CUSTOMER" | "SYSTEM"; message: string }>;
  assignedVendorId?: string;
  assignedVendorName?: string;
  vendorOwnerName?: string;
  vendorPhone?: string;
  vendorAvatar?: string;
  vendorParcelsToday?: number;
  vendorPendingOrders?: number;
  vendorHandoverAt?: string;
  vendorRiderTimeline?: Array<{ time: string; sender: "VENDOR" | "RIDER" | "SYSTEM"; message: string }>;
  canceledBy?: "ADMIN" | "CUSTOMER" | "VENDOR" | "RIDER";
  canceledReason?: string;
  orderHistory?: OrderHistoryEntry[];
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
  ownerName?: string;
  phone: string;
  email: string;
  tradeLicense: string;
  location: string;
  area: string;
  district?: string;
  thana?: string;
  city: string;
  status: "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED";
  commissionRate: number; // %
  totalSales: number;
  payableBalance: number;
  totalProducts: number;
  joinedDate: string;
  rating: number;
  activeOrders: number;
  parcelsToday?: number;
  pendingOrdersCount?: number;
  logo?: string;
  avatar?: string;
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
