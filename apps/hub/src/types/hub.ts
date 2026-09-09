// ============================================================
// Tatka Bazar Hub — Shared Type Definitions
// ============================================================

export type HubRole = "SUPER_ADMIN" | "OPS_MANAGER" | "SUPPORT_AGENT" | "VIEWER";

export interface HubTeamMember {
  id: string;
  name: string;
  nameBn: string;
  email: string;
  password: string; // hashed in production; plaintext for mock
  role: HubRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatar?: string;
}

export interface HubSession {
  token: string;
  memberId: string;
  role: HubRole;
  name: string;
  email: string;
  expiresAt: string;
}

export interface HubActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: "RIDER" | "VENDOR" | "DISPATCH" | "SYSTEM" | "TEAM";
  targetId?: string;
  targetName?: string;
  details?: string;
  timestamp: string;
}

// ─── Rider Types ────────────────────────────────────────────

export type RiderStatus = "ACTIVE" | "SUSPENDED" | "PENDING_KYC" | "INACTIVE";
export type RiderTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
export type KycStatus = "NOT_SUBMITTED" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type DutyStatus = "ONLINE" | "OFFLINE";

export interface HubRider {
  id: string;
  name: string;
  nameBn?: string;
  email: string;
  phone: string;
  vehicleType: "MOTORCYCLE" | "BICYCLE" | "CAR";
  vehicleNumber: string;
  zone: string;
  status: RiderStatus;
  tier: RiderTier;
  kycStatus: KycStatus;
  kycRejectionReason?: string;
  kycSubmittedAt?: string;
  kycApprovedAt?: string;
  balance: number;
  totalEarned: number;
  totalDeliveries: number;
  dutyStatus: DutyStatus;
  lastSeenAt?: string;
  lastGpsLat?: number;
  lastGpsLng?: number;
  paymentMethod?: "BKASH" | "NAGAD" | "ROCKET";
  paymentAccount?: string;
  nidNumber?: string;
  dateOfBirth?: string;
  presentAddress?: string;
  permanentAddress?: string;
  fatherName?: string;
  motherName?: string;
  joinedAt: string;
  suspendedAt?: string;
  suspendReason?: string;
  rating?: number;
  totalRatings?: number;
  // Location — set by Hub during KYC approval
  district?: string;
  thana?: string;
  bazar?: string;
  locationSetAt?: string;
}

export interface RiderDepositRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  lastFour: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface RiderWithdrawalRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  amount: number;
  paymentMethod: string;
  paymentAccount: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING";
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
}

export interface BalanceAdjustment {
  id: string;
  riderId: string;
  type: "ADD" | "DEDUCT";
  amount: number;
  reason: string;
  doneBy: string;
  timestamp: string;
}

// ─── Vendor Types ────────────────────────────────────────────

export type VendorStatus = "ACTIVE" | "SUSPENDED" | "PENDING" | "PENDING_APPROVAL" | "REJECTED";

export type VendorTier = "STANDARD" | "TRUSTED" | "PREMIUM";

export interface HubVendor {
  id: string;
  storeName: string;
  storeNameBn: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  deliveryZones: string[];
  category: string;
  commissionRate: number;
  status: VendorStatus;
  tier: VendorTier;
  rating: number;
  totalOrders: number;
  totalRevenue: number;
  settlementBalance: number;
  vacationMode: boolean;
  joinedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  suspendedAt?: string;
  suspendReason?: string;
  rejectionReason?: string;
  tradeLicense?: string;
  tinBin?: string;
  payoutMethod?: "BKASH" | "NAGAD" | "BANK";
  payoutAccount?: string;
  // Location — set by Hub during approval
  district?: string;
  thana?: string;
  bazar?: string;
  locationSetAt?: string;
}

export interface VendorSettlementRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorPhone: string;
  amount: number;
  payoutMethod: string;
  payoutAccount: string;
  ordersCount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSING";
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
}

// ─── Dispatch Types ────────────────────────────────────────────

export interface DispatchTask {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryZone?: string;
  vendorName: string;
  vendorPhone?: string;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  earnings: number;
  paymentStatus: "COD" | "PAID";
  status: "READY_FOR_PICKUP" | "ASSIGNED" | "ON_THE_WAY" | "DELIVERED" | "RETURNED";
  claimed: boolean;
  claimedBy?: {
    riderId: string;
    riderName: string;
    riderPhone: string;
    riderVehicle: string;
    claimedAt: string;
  };
  riderName?: string;
  riderPhone?: string;
  createdAt: string;
  pickedAt?: string;
  deliveredAt?: string;
  returnedAt?: string;
}

// ─── Notification ────────────────────────────────────────────

export interface HubBroadcast {
  id: string;
  title: string;
  body: string;
  targetType: "ALL_RIDERS" | "ALL_VENDORS" | "SPECIFIC_RIDER" | "SPECIFIC_VENDOR" | "ALL";
  targetId?: string;
  targetName?: string;
  sentBy: string;
  sentAt: string;
  deliveredCount?: number;
}

// ─── Config ────────────────────────────────────────────

export interface HubConfig {
  defaultDeliveryFee: number;
  defaultCommissionRate: number;
  riderVercelUrl: string;
  vendorVercelUrl: string;
  adminVercelUrl?: string;
  storefrontVercelUrl?: string;
  riderLocalUrl: string;
  vendorLocalUrl: string;
  maintenanceMode: boolean;
}
