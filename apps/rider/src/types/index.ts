// =============================================================================
// Tatka Bazar — Delivery Rider Companion Domain Types
// =============================================================================

export type RiderVehicle = "MOTORCYCLE" | "BICYCLE" | "VAN";

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  nid: string;
  vehicleType: RiderVehicle;
  assignedHubId: string;
  assignedHubName: string;
  rating: number;
  totalDeliveriesCompleted: number;
  isOnline: boolean;
  activeDeliveriesCount: number;
}

export type DeliveryStatus =
  | "ASSIGNED"
  | "PICKED_UP_FROM_HUB"
  | "EN_ROUTE"
  | "DELIVERED"
  | "FAILED";

export interface DeliveryItemSummary {
  nameBn: string;
  nameEn: string;
  weight: string;
  quantity: number;
}

export interface RiderDeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryArea: string;
  mapQuery: string; // e.g. "House 27, Road 8/A, Dhanmondi, Dhaka"
  deliverySlot: string; // e.g. "তাজা সকাল (০৭:০০ - ০৯:০০)"
  items: DeliveryItemSummary[];
  isCod: boolean;
  codAmountToCollect: number; // ৳
  codCollected: boolean;
  status: DeliveryStatus;
  failureReason?: string | undefined;
  notes?: string | undefined;
  assignedAt: string;
  deliveredAt?: string | undefined;
}

export interface DailySummary {
  date: string;
  completedCount: number;
  failedCount: number;
  totalCodCollected: number;
  riderEarnings: number;
  hubCashDepositStatus: "PENDING" | "DEPOSITED";
}
