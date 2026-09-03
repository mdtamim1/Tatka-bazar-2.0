import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RiderProfile,
  DeliveryOrder,
  DailyShiftSummary,
  WalletTransaction,
  AchievementBadge,
  LeaderboardRider,
  DeliveryStatus,
} from "@/types/rider";
import { audioAlert } from "@/utils/audioAlert";
import { Locale } from "@/utils/translations";

interface RiderStoreState {
  // Profile & Duty
  rider: RiderProfile;
  locale: Locale;
  theme: "dark" | "light";
  soundMuted: boolean;
  sosActive: boolean;

  // Deliveries
  deliveries: DeliveryOrder[];
  offeredOrder: DeliveryOrder | null;
  offerCountdown: number;
  activeDeliveryId: string | null;

  // Financials
  dailySummary: DailyShiftSummary;
  walletBalance: number;
  transactions: WalletTransaction[];

  // Gamification & Social
  badges: AchievementBadge[];
  leaderboard: LeaderboardRider[];

  // Actions
  setLocale: (locale: Locale) => void;
  setTheme: (theme: "dark" | "light") => void;
  toggleSoundMuted: () => void;
  toggleDuty: () => void;
  setKycStatus: (status: "PENDING_REVIEW" | "APPROVED" | "REJECTED") => void;

  // Order Lifecycle
  acceptOfferedOrder: () => void;
  rejectOfferedOrder: () => void;
  decrementOfferCountdown: () => void;
  triggerSimulatedOrder: () => void;
  setActiveDeliveryId: (id: string | null) => void;
  updateOrderStatus: (orderId: string, status: DeliveryStatus, notes?: string) => void;
  completeDelivery: (orderId: string, signatureData?: string, otp?: string) => void;
  failDelivery: (orderId: string, reason: string) => void;

  // Financial Actions
  collectDigitalCod: (orderId: string, paymentRef: string) => void;
  depositCashToHub: () => void;
  withdrawFunds: (amount: number, provider: "BKASH" | "NAGAD", number: string) => boolean;

  // Emergency
  triggerSos: () => void;
  cancelSos: () => void;
}

const INITIAL_RIDER: RiderProfile = {
  id: "rider-dhaka-802",
  name: "Karim Molla (করিম মোল্লা)",
  phone: "+880 1701-998877",
  email: "karim.rider@tatkabazar.com",
  nid: "19942691234567890",
  vehicleType: "MOTORCYCLE",
  vehicleRegNumber: "DHAKA METRO-HA 48-9120",
  assignedHubId: "hub-dhanmondi",
  assignedHubName: "Dhanmondi Express Hub (ধানমন্ডি এক্সপ্রেস হাব)",
  rating: 4.95,
  totalDeliveriesCompleted: 154,
  acceptanceRate: 98.6,
  onTimeRate: 99.2,
  isOnline: true,
  tier: "GOLD",
  streakDays: 6,
  kycStatus: "APPROVED",
  payoutNumber: "01701998877",
  payoutProvider: "BKASH",
};

const INITIAL_DELIVERIES: DeliveryOrder[] = [
  {
    id: "del-tb-9284",
    orderNumber: "TB-928410",
    customerName: "Rafiqul Islam (রফিকুল ইসলাম)",
    customerPhone: "+880 1711-223344",
    customerMaskedPhone: "+880 1711-•••344",
    deliveryAddress: "Flat 4B, House 28, Road 7/A, Dhanmondi R/A, Dhaka",
    deliveryArea: "Dhanmondi",
    deliverySlot: "Morning (07:30 - 09:30 AM)",
    hubName: "Dhanmondi Express Hub",
    hubAddress: "House 12, Road 4, Dhanmondi, Dhaka",
    coordinates: { lat: 23.7465, lng: 90.3753 },
    hubCoordinates: { lat: 23.7412, lng: 90.3789 },
    distanceKm: 2.1,
    estimatedMinutes: 14,
    monsoonBufferMinutes: 10,
    items: [
      { id: "it-1", nameEn: "Fresh Padma River Hilsa", nameBn: "তাজা পদ্মার ইলিশ", weight: "1.2 kg", quantity: 1, isPerishable: true },
      { id: "it-2", nameEn: "Organic Desi Tomatoes", nameBn: "দেশি লাল টমেটো", weight: "1 kg", quantity: 1, isPerishable: true },
      { id: "it-3", nameEn: "Fresh Red Spinach", nameBn: "তাজা লাল শাক", weight: "500 g", quantity: 2, isPerishable: true },
    ],
    isCod: true,
    codAmountToCollect: 1850,
    codCollected: false,
    status: "EN_ROUTE",
    assignedAt: "Today, 08:15 AM",
    pickedAt: "Today, 08:32 AM",
    notes: "Directly ring the bell on 4th floor. Perishable fresh fish inside insulated box.",
    earningFare: {
      baseFare: 65,
      distanceBonus: 25,
      monsoonBonus: 30,
      tip: 30,
      totalEarnings: 150,
    },
  },
  {
    id: "del-tb-9285",
    orderNumber: "TB-928415",
    batchId: "batch-dhanmondi-north",
    customerName: "Sultana Jahan (সুলতানা জাহান)",
    customerPhone: "+880 1822-445566",
    customerMaskedPhone: "+880 1822-•••566",
    deliveryAddress: "Apartment 3A, House 14, Road 2, Kalabagan, Dhaka",
    deliveryArea: "Kalabagan",
    deliverySlot: "Morning (07:30 - 09:30 AM)",
    hubName: "Dhanmondi Express Hub",
    hubAddress: "House 12, Road 4, Dhanmondi, Dhaka",
    coordinates: { lat: 23.7512, lng: 90.3842 },
    hubCoordinates: { lat: 23.7412, lng: 90.3789 },
    distanceKm: 1.8,
    estimatedMinutes: 12,
    monsoonBufferMinutes: 8,
    items: [
      { id: "it-4", nameEn: "Desi Bottle Gourd", nameBn: "কচি দেশি লাউ", weight: "1 pc", quantity: 1, isPerishable: true },
      { id: "it-5", nameEn: "Pure Desi Cow Milk Ghee", nameBn: "খাঁটি দেশি গাওয়া ঘি", weight: "400 g", quantity: 1, isPerishable: false },
      { id: "it-6", nameEn: "Bogura Shahi Curd", nameBn: "বগুড়ার শাহী মিষ্টি দই", weight: "1 pot", quantity: 1, isPerishable: true },
    ],
    isCod: false,
    codAmountToCollect: 0,
    codCollected: true,
    status: "PICKED_UP_FROM_HUB",
    assignedAt: "Today, 08:18 AM",
    pickedAt: "Today, 08:32 AM",
    notes: "Prepaid via bKash. Leave with building security if unattended.",
    earningFare: {
      baseFare: 65,
      distanceBonus: 20,
      monsoonBonus: 25,
      tip: 0,
      totalEarnings: 110,
    },
  },
  {
    id: "del-tb-9279",
    orderNumber: "TB-928390",
    customerName: "Tanzim Ahmed (তানজিম আহমেদ)",
    customerPhone: "+880 1911-338899",
    customerMaskedPhone: "+880 1911-•••899",
    deliveryAddress: "House 55, Road 9/A, Dhanmondi, Dhaka",
    deliveryArea: "Dhanmondi",
    deliverySlot: "Dawn Express (06:30 - 08:00 AM)",
    hubName: "Dhanmondi Express Hub",
    hubAddress: "House 12, Road 4, Dhanmondi, Dhaka",
    coordinates: { lat: 23.749, lng: 90.371 },
    hubCoordinates: { lat: 23.7412, lng: 90.3789 },
    distanceKm: 2.4,
    estimatedMinutes: 15,
    monsoonBufferMinutes: 0,
    items: [
      { id: "it-7", nameEn: "Farm Fresh Broiler Whole", nameBn: "ফার্ম ফ্রেশ ব্রয়লার মুরগি", weight: "1.4 kg", quantity: 1, isPerishable: true },
    ],
    isCod: true,
    codAmountToCollect: 480,
    codCollected: true,
    status: "DELIVERED",
    assignedAt: "Today, 06:45 AM",
    pickedAt: "Today, 07:05 AM",
    deliveredAt: "Today, 07:35 AM",
    podOtp: "4921",
    notes: "Delivered smoothly at apartment door.",
    earningFare: {
      baseFare: 60,
      distanceBonus: 25,
      monsoonBonus: 0,
      tip: 20,
      totalEarnings: 105,
    },
  },
];

const INITIAL_SUMMARY: DailyShiftSummary = {
  shiftDate: "3 September 2026",
  onlineDurationMinutes: 195,
  completedCount: 5,
  activeCount: 2,
  failedCount: 0,
  todayEarnings: 685,
  todayCodCollected: 3200,
  codInHandToDeposit: 3200,
  dailyGoalTarget: 8,
  dailyBonusAmount: 250,
};

const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx-101",
    type: "DELIVERY_EARNING",
    amount: 150,
    status: "COMPLETED",
    timestamp: "Today, 07:35 AM",
    referenceId: "TB-928390",
    note: "Delivery fare + Monsoon incentive + Tip",
  },
  {
    id: "tx-100",
    type: "WITHDRAWAL",
    amount: 1200,
    status: "COMPLETED",
    timestamp: "Yesterday, 09:15 PM",
    referenceId: "WTH-BKASH-891",
    note: "Instant payout to bKash 01701-998877",
    paymentMethod: "BKASH",
  },
  {
    id: "tx-99",
    type: "BONUS",
    amount: 250,
    status: "COMPLETED",
    timestamp: "Yesterday, 08:00 PM",
    referenceId: "BONUS-DAILY-GOAL",
    note: "Completed daily target 8/8 deliveries",
  },
];

const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: "badge-monsoon",
    titleEn: "Monsoon Hero",
    titleBn: "বর্ষার যোদ্ধা",
    descriptionEn: "Delivered 20 orders during heavy Dhaka rain without delay",
    descriptionBn: "ঢাকায় বৃষ্টির মধ্যেও সময়মতো ২০টি অর্ডার ডেলিভারি দিয়েছেন",
    iconName: "CloudRain",
    isUnlocked: true,
    unlockedAt: "Aug 2026",
    progressPercentage: 100,
  },
  {
    id: "badge-century",
    titleEn: "100 Club Deliveries",
    titleBn: "শততম ডেলিভারি ক্লাব",
    descriptionEn: "Successfully fulfilled 100 fresh grocery parcels",
    descriptionBn: "১০০টি ফ্রেশ বাজার সফলভাবে ডেলিভারি সম্পন্ন করেছেন",
    iconName: "Award",
    isUnlocked: true,
    unlockedAt: "Jul 2026",
    progressPercentage: 100,
  },
  {
    id: "badge-5star",
    titleEn: "5-Star Perfectionist",
    titleBn: "৫-স্টার পারফেকশনিস্ট",
    descriptionEn: "Maintained a 4.9+ rating for 30 consecutive days",
    descriptionBn: "টানা ৩০ দিন ৪.৯ রেটিং বজায় রেখেছেন",
    iconName: "Star",
    isUnlocked: true,
    unlockedAt: "Aug 2026",
    progressPercentage: 100,
  },
  {
    id: "badge-early-bird",
    titleEn: "Dawn Patrol",
    titleBn: "ভোরের পাখি",
    descriptionEn: "Complete 15 Dawn Express deliveries before 08:00 AM",
    descriptionBn: "সকাল ৮টার আগে ১৫টি ভোর এক্সপ্রেস ডেলিভারি",
    iconName: "Sunrise",
    isUnlocked: false,
    progressPercentage: 80,
  },
];

const INITIAL_LEADERBOARD: LeaderboardRider[] = [
  { rank: 1, riderName: "Sabbir Hossain (সাব্বির)", area: "Gulshan", completedThisWeek: 68, rating: 4.98, tier: "PLATINUM", isCurrentRider: false },
  { rank: 2, riderName: "Karim Molla (আপনি - করিম)", area: "Dhanmondi", completedThisWeek: 64, rating: 4.95, tier: "GOLD", isCurrentRider: true },
  { rank: 3, riderName: "Al-Amin Sheikh (আল-আমিন)", area: "Uttara", completedThisWeek: 59, rating: 4.92, tier: "GOLD", isCurrentRider: false },
  { rank: 4, riderName: "Nazmul Haque (নাজমুল)", area: "Mirpur", completedThisWeek: 55, rating: 4.88, tier: "SILVER", isCurrentRider: false },
  { rank: 5, riderName: "Biplob Barua (বিপ্লব)", area: "Mohakhali", completedThisWeek: 52, rating: 4.90, tier: "SILVER", isCurrentRider: false },
];

export const useRiderStore = create<RiderStoreState>()(
  persist(
    (set, get) => ({
      rider: INITIAL_RIDER,
      locale: "en",
      theme: "dark",
      soundMuted: false,
      sosActive: false,

      deliveries: INITIAL_DELIVERIES,
      offeredOrder: null,
      offerCountdown: 40,
      activeDeliveryId: "del-tb-9284",

      dailySummary: INITIAL_SUMMARY,
      walletBalance: 2450,
      transactions: INITIAL_TRANSACTIONS,

      badges: INITIAL_BADGES,
      leaderboard: INITIAL_LEADERBOARD,

      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      toggleSoundMuted: () => {
        const next = !get().soundMuted;
        audioAlert.setMuted(next);
        set({ soundMuted: next });
      },

      toggleDuty: () => {
        const nextDuty = !get().rider.isOnline;
        set((state) => ({
          rider: { ...state.rider, isOnline: nextDuty },
        }));
        if (nextDuty) {
          audioAlert.playSuccessChime();
        }
      },

      setKycStatus: (status) =>
        set((state) => ({
          rider: { ...state.rider, kycStatus: status },
        })),

      acceptOfferedOrder: () => {
        const order = get().offeredOrder;
        if (!order) return;

        const acceptedOrder: DeliveryOrder = {
          ...order,
          status: "ACCEPTED",
          assignedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        };

        audioAlert.playSuccessChime();
        set((state) => ({
          deliveries: [acceptedOrder, ...state.deliveries],
          offeredOrder: null,
          offerCountdown: 40,
          activeDeliveryId: acceptedOrder.id,
          dailySummary: {
            ...state.dailySummary,
            activeCount: state.dailySummary.activeCount + 1,
          },
        }));
      },

      rejectOfferedOrder: () => {
        set({ offeredOrder: null, offerCountdown: 40 });
      },

      decrementOfferCountdown: () => {
        const cur = get().offerCountdown;
        if (cur <= 1) {
          set({ offeredOrder: null, offerCountdown: 40 });
        } else {
          set({ offerCountdown: cur - 1 });
        }
      },

      triggerSimulatedOrder: () => {
        const simulatedOffer: DeliveryOrder = {
          id: `del-sim-${Date.now().toString().slice(-4)}`,
          orderNumber: `TB-${Math.floor(100000 + Math.random() * 900000)}`,
          customerName: "Mahmudur Rahman (মাহমুদুর রহমান)",
          customerPhone: "+880 1715-992211",
          customerMaskedPhone: "+880 1715-•••211",
          deliveryAddress: "Flat 2B, House 19, Road 11/A, Dhanmondi, Dhaka",
          deliveryArea: "Dhanmondi",
          deliverySlot: "Express 45-Min Drop",
          hubName: "Dhanmondi Express Hub",
          hubAddress: "House 12, Road 4, Dhanmondi, Dhaka",
          coordinates: { lat: 23.753, lng: 90.373 },
          hubCoordinates: { lat: 23.7412, lng: 90.3789 },
          distanceKm: 1.6,
          estimatedMinutes: 11,
          monsoonBufferMinutes: 8,
          items: [
            { id: "it-s1", nameEn: "Organic Desi Eggs (12 pcs)", nameBn: "দেশি মুরগির ডিম (১২টি)", weight: "1 dozen", quantity: 1, isPerishable: true },
            { id: "it-s2", nameEn: "Fresh Shahi Corriander Leaves", nameBn: "তাজা ধনেপাতা", weight: "250 g", quantity: 1, isPerishable: true },
          ],
          isCod: true,
          codAmountToCollect: 380,
          codCollected: false,
          status: "OFFERED",
          assignedAt: "Just now",
          earningFare: {
            baseFare: 60,
            distanceBonus: 15,
            monsoonBonus: 25,
            tip: 0,
            totalEarnings: 100,
          },
        };

        audioAlert.playOrderAssignedSound();
        set({
          offeredOrder: simulatedOffer,
          offerCountdown: 40,
        });
      },

      setActiveDeliveryId: (id) => set({ activeDeliveryId: id }),

      updateOrderStatus: (orderId, status, notes) => {
        audioAlert.playSuccessChime();
        set((state) => ({
          deliveries: state.deliveries.map((d) =>
            d.id === orderId
              ? {
                  ...d,
                  status,
                  notes: notes || d.notes,
                  pickedAt: status === "PICKED_UP_FROM_HUB" ? "Just now" : d.pickedAt,
                }
              : d
          ),
        }));
      },

      completeDelivery: (orderId, signatureData, otp) => {
        const order = get().deliveries.find((d) => d.id === orderId);
        if (!order) return;

        audioAlert.playSuccessChime();
        const fareEarnings = order.earningFare.totalEarnings;
        const codCollectedAmount = order.isCod ? order.codAmountToCollect : 0;

        const newTx: WalletTransaction = {
          id: `tx-del-${Date.now()}`,
          type: "DELIVERY_EARNING",
          amount: fareEarnings,
          status: "COMPLETED",
          timestamp: "Just now",
          referenceId: order.orderNumber,
          note: `Completed delivery: ${order.orderNumber} (${order.deliveryArea})`,
        };

        set((state) => ({
          deliveries: state.deliveries.map((d) =>
            d.id === orderId
              ? {
                  ...d,
                  status: "DELIVERED",
                  deliveredAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                  codCollected: order.isCod ? true : d.codCollected,
                  customerSignature: signatureData || d.customerSignature,
                  podOtp: otp || d.podOtp,
                }
              : d
          ),
          walletBalance: state.walletBalance + fareEarnings,
          transactions: [newTx, ...state.transactions],
          dailySummary: {
            ...state.dailySummary,
            completedCount: state.dailySummary.completedCount + 1,
            activeCount: Math.max(0, state.dailySummary.activeCount - 1),
            todayEarnings: state.dailySummary.todayEarnings + fareEarnings,
            todayCodCollected: state.dailySummary.todayCodCollected + codCollectedAmount,
            codInHandToDeposit: state.dailySummary.codInHandToDeposit + codCollectedAmount,
          },
          rider: {
            ...state.rider,
            totalDeliveriesCompleted: state.rider.totalDeliveriesCompleted + 1,
          },
        }));
      },

      failDelivery: (orderId, reason) => {
        set((state) => ({
          deliveries: state.deliveries.map((d) =>
            d.id === orderId
              ? {
                  ...d,
                  status: "FAILED",
                  failureReason: reason,
                }
              : d
          ),
          dailySummary: {
            ...state.dailySummary,
            failedCount: state.dailySummary.failedCount + 1,
            activeCount: Math.max(0, state.dailySummary.activeCount - 1),
          },
        }));
      },

      collectDigitalCod: (orderId, paymentRef) => {
        const order = get().deliveries.find((d) => d.id === orderId);
        if (!order) return;

        audioAlert.playSuccessChime();
        set((state) => ({
          deliveries: state.deliveries.map((d) =>
            d.id === orderId
              ? {
                  ...d,
                  isCod: false,
                  codCollected: true,
                  notes: `${d.notes || ""} | Paid digitally via ${paymentRef}`,
                }
              : d
          ),
        }));
      },

      depositCashToHub: () => {
        const inHand = get().dailySummary.codInHandToDeposit;
        if (inHand <= 0) return;

        audioAlert.playSuccessChime();
        const tx: WalletTransaction = {
          id: `tx-dep-${Date.now()}`,
          type: "COD_DEPOSIT",
          amount: inHand,
          status: "COMPLETED",
          timestamp: "Just now",
          referenceId: `DEP-HUB-${Math.floor(1000 + Math.random() * 9000)}`,
          note: "Deposited COD cash to Dhanmondi Express Hub cashier",
          paymentMethod: "CASH_HUB",
        };

        set((state) => ({
          dailySummary: {
            ...state.dailySummary,
            codInHandToDeposit: 0,
          },
          transactions: [tx, ...state.transactions],
        }));
      },

      withdrawFunds: (amount, provider, number) => {
        const balance = get().walletBalance;
        if (amount <= 0 || amount > balance) return false;

        audioAlert.playSuccessChime();
        const tx: WalletTransaction = {
          id: `tx-wth-${Date.now()}`,
          type: "WITHDRAWAL",
          amount: amount,
          status: "COMPLETED",
          timestamp: "Just now",
          referenceId: `WTH-${provider}-${Math.floor(10000 + Math.random() * 90000)}`,
          note: `Instant withdrawal to ${provider} (${number})`,
          paymentMethod: provider,
        };

        set((state) => ({
          walletBalance: state.walletBalance - amount,
          transactions: [tx, ...state.transactions],
        }));
        return true;
      },

      triggerSos: () => {
        audioAlert.playEmergencyBeep();
        set({ sosActive: true });
      },

      cancelSos: () => {
        set({ sosActive: false });
      },
    }),
    {
      name: "tatka-rider-portal-storage",
      partialize: (state) => ({
        rider: state.rider,
        locale: state.locale,
        theme: state.theme,
        soundMuted: state.soundMuted,
        walletBalance: state.walletBalance,
        dailySummary: state.dailySummary,
        deliveries: state.deliveries,
      }),
    }
  )
);
