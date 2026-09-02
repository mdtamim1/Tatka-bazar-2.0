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
  mapQuery: string;
  deliverySlot: string; // e.g. "Morning (07:00 - 09:00 AM)"
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
  totalEarnings: number; // ৳ per delivery commission
  cashInHandToDeposit: number;
}
