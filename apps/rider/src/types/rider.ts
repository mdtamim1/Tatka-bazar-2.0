// =============================================================================
// TATKA BAZAR — Rider Portal Domain Types
// =============================================================================

export type VehicleType = "MOTORCYCLE" | "BICYCLE" | "VAN";

export type RiderTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  nid: string;
  vehicleType: VehicleType;
  vehicleRegNumber: string;
  assignedHubId: string;
  assignedHubName: string;
  rating: number;
  totalDeliveriesCompleted: number;
  acceptanceRate: number; // percentage, e.g. 98.5
  onTimeRate: number; // percentage, e.g. 99.1
  isOnline: boolean;
  tier: RiderTier;
  streakDays: number;
  kycStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  payoutNumber: string;
  payoutProvider: "BKASH" | "NAGAD";
  avatarUrl?: string;
}

export type DeliveryStatus =
  | "OFFERED"
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKED_UP_FROM_HUB"
  | "EN_ROUTE"
  | "ARRIVED"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED";

export interface DeliveryItem {
  id: string;
  nameBn: string;
  nameEn: string;
  weight: string;
  quantity: number;
  isPerishable: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  batchId?: string;
  customerName: string;
  customerPhone: string;
  customerMaskedPhone: string;
  deliveryAddress: string;
  deliveryArea: string; // e.g. "Dhanmondi", "Gulshan", "Uttara"
  deliverySlot: string; // e.g. "Morning (07:00 - 09:00 AM)"
  hubName: string;
  hubAddress: string;
  coordinates: Coordinates;
  hubCoordinates: Coordinates;
  distanceKm: number;
  estimatedMinutes: number;
  monsoonBufferMinutes: number;
  items: DeliveryItem[];
  isCod: boolean;
  codAmountToCollect: number; // in BDT (৳)
  codCollected: boolean;
  status: DeliveryStatus;
  notes?: string;
  assignedAt: string;
  pickedAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  customerSignature?: string; // base64 canvas data
  podOtp?: string; // 4-digit proof of delivery OTP
  earningFare: {
    baseFare: number;
    distanceBonus: number;
    monsoonBonus: number;
    tip: number;
    totalEarnings: number;
  };
}

export interface DailyShiftSummary {
  shiftDate: string;
  onlineDurationMinutes: number;
  completedCount: number;
  activeCount: number;
  failedCount: number;
  todayEarnings: number;
  todayCodCollected: number;
  codInHandToDeposit: number;
  dailyGoalTarget: number; // e.g. 12
  dailyBonusAmount: number; // e.g. 250
}

export interface WalletTransaction {
  id: string;
  type: "DELIVERY_EARNING" | "BONUS" | "WITHDRAWAL" | "COD_DEPOSIT";
  amount: number;
  status: "COMPLETED" | "PENDING" | "PROCESSING";
  timestamp: string;
  referenceId: string;
  note: string;
  paymentMethod?: "BKASH" | "NAGAD" | "CASH_HUB";
}

export interface AchievementBadge {
  id: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  iconName: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  progressPercentage: number;
}

export interface LeaderboardRider {
  rank: number;
  riderName: string;
  area: string;
  completedThisWeek: number;
  rating: number;
  tier: RiderTier;
  isCurrentRider: boolean;
}

export interface NotificationItem {
  id: string;
  titleEn: string;
  titleBn: string;
  bodyEn: string;
  bodyBn: string;
  type: "ORDER" | "EARNING" | "SAFETY" | "SYSTEM";
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}
