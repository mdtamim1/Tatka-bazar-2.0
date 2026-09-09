"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  VendorRole,
  VendorProfile,
  Product,
  Order,
  OrderStatus,
  StockAdjustmentLog,
  CommissionLedgerEntry,
  PayoutRequest,
  Review,
  RefundDispute,
  StaffAccount,
  StaffActivityLog,
  WholesaleBuyer,
  Coupon,
  NotificationItem,
  StockAdjustmentReason,
  PayoutMethod,
  WithdrawRequest,
  SettlementRequest,
} from "@/types/vendor";
import { Language } from "@/utils/translations";
import { audioAlert } from "@/utils/audioAlert";
import { broadcastSyncEvent, dispatchOrderToRiders } from "@/lib/sync";

interface VendorState {
  // Localization & Role
  language: Language;
  currentRole: VendorRole;
  soundEnabled: boolean;

  // Profile & Status
  profile: VendorProfile;
  dutyStatus: "STORE_OPEN" | "BUSY" | "STORE_CLOSED";
  incomingOrderAlert: Order | null;
  chatOrder: Order | null;

  // Data Collections
  products: Product[];
  orders: Order[];
  stockLogs: StockAdjustmentLog[];
  commissionLedger: CommissionLedgerEntry[];
  payouts: PayoutRequest[];
  reviews: Review[];
  refundDisputes: RefundDispute[];
  staffAccounts: StaffAccount[];
  staffLogs: StaffActivityLog[];
  wholesaleBuyers: WholesaleBuyer[];
  coupons: Coupon[];
  notifications: NotificationItem[];
  orderHistory: Order[];
  withdrawRequests: WithdrawRequest[];
  settlementRequests: SettlementRequest[];

  // Rider Live Tracking
  trackingOrder: Order | null;
  setTrackingOrder: (order: Order | null) => void;

  // Multi-Vendor Claim Lockout
  claimLockAlert: { isOpen: boolean; message: string; claimedByStoreName: string } | null;
  setClaimLockAlert: (alert: { isOpen: boolean; message: string; claimedByStoreName: string } | null) => void;

  // 12-Hour Operational Shift
  shiftStartedAt: string;
  resetShiftQueue: () => void;

  // Action Methods
  setLanguage: (lang: Language) => void;
  setRole: (role: VendorRole) => void;
  toggleSound: () => void;
  toggleVacationMode: () => void;
  setDutyStatus: (status: "STORE_OPEN" | "BUSY" | "STORE_CLOSED") => void;
  setIncomingOrderAlert: (order: Order | null) => void;
  setChatOrder: (order: Order | null) => void;
  acceptOrder: (orderId: string) => void;
  declineOrder: (orderId: string) => void;
  updateProfile: (updates: Partial<VendorProfile>) => void;

  // Order Operations
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderReturned: (orderId: string, reason?: string) => void;
  reconcileItemWeight: (orderId: string, itemId: string, actualWeight: number) => void;
  toggleItemPacked: (orderId: string, itemId: string) => void;
  markAllItemsPacked: (orderId: string) => void;
  simulateIncomingOrder: () => void;
  simulateAreaDispatchOrder: () => void;
  simulateRemoteClaim: (orderId: string) => void;
  syncRiderDispatch: (tasks: any[]) => void;

  // Product Operations
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkAdjustStock: (productIds: string[], delta: number) => void;
  bulkTogglePublish: (productIds: string[], isPublished: boolean) => void;

  // Inventory Operations
  adjustStock: (
    productId: string,
    newQty: number,
    reason: StockAdjustmentReason,
    notes?: string
  ) => void;

  // Financial Operations
  requestPayout: (amount: number, method: PayoutMethod, account: string) => void;

  // Withdrawal System
  requestWithdraw: (amount: number, method: PayoutMethod, account: string) => void;
  requestSettlement: (orderIds: string[], orderDisplayIds: string[], totalAmount: number) => void;
  approveWithdrawSimulate: (requestId: string) => void;
  approveSettlementSimulate: (requestId: string) => void;
  verifyWithdrawOTP: (requestId: string, otp: string) => boolean;
  verifySettlementOTP: (requestId: string, otp: string) => boolean;

  // Reviews & Disputes
  replyToReview: (reviewId: string, message: string) => void;
  resolveRefundDispute: (
    disputeId: string,
    status: "APPROVED" | "REJECTED" | "ESCALATED",
    notes?: string
  ) => void;

  // Staff Sub-Accounts
  addStaff: (staff: Omit<StaffAccount, "id" | "createdAt" | "lastActive">) => void;
  toggleStaffStatus: (staffId: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Full Portal Reset
  fullResetVendorStore: () => void;
}

// Default Clean Vendor State
const initialProfile: VendorProfile = {
  id: "",
  storeName: "",
  storeNameBn: "",
  slug: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  category: "",
  tradeLicense: "",
  tinBin: "",
  nidNumber: "",
  payoutMethod: "BKASH",
  payoutAccount: "",
  status: "PENDING",
  tier: "STANDARD",
  rating: 5.0,
  commissionRate: 10,
  vacationMode: false,
  autoHideZeroStock: true,
  operatingHours: { open: "08:00", close: "22:00" },
  deliveryZones: [],
  logoUrl: "",
  bannerUrl: "",
};

const initialProducts: Product[] = [];
const initialOrders: Order[] = [];
const initialOrderHistory: Order[] = [];
const initialStockLogs: StockAdjustmentLog[] = [];
const initialCommissionLedger: CommissionLedgerEntry[] = [];
const initialPayouts: PayoutRequest[] = [];
const initialReviews: Review[] = [];
const initialRefundDisputes: RefundDispute[] = [];
const initialStaffAccounts: StaffAccount[] = [];
const initialStaffLogs: StaffActivityLog[] = [];
const initialWholesaleBuyers: WholesaleBuyer[] = [];
const initialCoupons: Coupon[] = [];
const initialNotifications: NotificationItem[] = [];
if (typeof window !== "undefined") {
  try {
    if (!localStorage.getItem("tatka-vendor-reset-v3")) {
      localStorage.removeItem("tatka-vendor-store-v2");
      localStorage.removeItem("tatka-vendor-store-v1");
      localStorage.removeItem("tatka-vendor-store");
      localStorage.setItem("tatka-vendor-reset-v3", "done");
    }
  } catch {}
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set, get) => ({
      language: "bn", // Default to Bengali as requested by Bangladeshi merchants
      currentRole: "OWNER",
      soundEnabled: true,
      dutyStatus: "STORE_OPEN",
      incomingOrderAlert: null,
      chatOrder: null,
      profile: initialProfile,
      products: initialProducts,
      orders: initialOrders,
      stockLogs: initialStockLogs,
      commissionLedger: initialCommissionLedger,
      payouts: initialPayouts,
      reviews: initialReviews,
      refundDisputes: initialRefundDisputes,
      staffAccounts: initialStaffAccounts,
      staffLogs: initialStaffLogs,
      wholesaleBuyers: initialWholesaleBuyers,
      coupons: initialCoupons,
      notifications: initialNotifications,
      orderHistory: initialOrderHistory,
      withdrawRequests: [],
      settlementRequests: [],

      trackingOrder: null,
      setTrackingOrder: (order) => set({ trackingOrder: order }),

      claimLockAlert: null,
      setClaimLockAlert: (alert) => set({ claimLockAlert: alert }),

      shiftStartedAt: new Date().toISOString(),
      resetShiftQueue: () => {
        set((state) => {
          const newHistory = [...state.orders, ...state.orderHistory].filter(
            (o, idx, arr) => arr.findIndex((x) => x.id === o.id) === idx
          );
          const activeOnly = state.orders.filter(
            (o) =>
              o.status === "PENDING" ||
              o.status === "PROCESSING" ||
              o.status === "READY_FOR_PICKUP"
          );
          return {
            orders: activeOnly,
            orderHistory: newHistory,
            shiftStartedAt: new Date().toISOString(),
          };
        });
        audioAlert.playSuccessSound();
      },

      setLanguage: (lang: Language) => set({ language: lang }),
      setRole: (role: VendorRole) => set({ currentRole: role }),

      toggleSound: () => {
        const next = !get().soundEnabled;
        audioAlert.setSoundEnabled(next);
        set({ soundEnabled: next });
      },

      setDutyStatus: (status) => {
        set({ dutyStatus: status });
        if (typeof window !== "undefined") {
          localStorage.setItem("tatka_vendor_duty", status);
          window.dispatchEvent(
            new CustomEvent("tatka_vendor_duty_change", { detail: { status } })
          );
        }
      },

      setIncomingOrderAlert: (order) => set({ incomingOrderAlert: order }),
      setChatOrder: (order) => set({ chatOrder: order }),

      acceptOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        const storeName = get().profile.storeNameBn || get().profile.storeName;

        get().updateOrderStatus(orderId, "PROCESSING");
        set({ incomingOrderAlert: null, claimLockAlert: null });

        // Broadcast claim event so any competing vendor modals close with lockout
        broadcastSyncEvent({
          type: "VENDOR_CLAIM_ORDER",
          orderId: orderId,
          claimedByVendorId: get().profile.id,
          claimedByStoreName: storeName,
          amount: order?.grossTotal,
        });

        audioAlert.playSuccessSound();
      },

      declineOrder: (orderId) => {
        get().updateOrderStatus(orderId, "CANCELLED");
        set({ incomingOrderAlert: null, claimLockAlert: null });
      },

      markOrderReturned: (orderId, reason = "গ্রাহক দরজায় অনুপস্থিত ছিলেন") => {
        set((state) => {
          const updatedOrders = state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: "RETURNED" as OrderStatus,
                  returnReason: reason,
                  returnedAt: new Date().toISOString(),
                }
              : o
          );
          const target = updatedOrders.find((o) => o.id === orderId);
          let updatedHistory = state.orderHistory;
          if (target) {
            const histIndex = updatedHistory.findIndex((h) => h.id === orderId);
            if (histIndex >= 0) {
              updatedHistory = [...updatedHistory];
              updatedHistory[histIndex] = target;
            } else {
              updatedHistory = [target, ...updatedHistory];
            }
          }
          return { orders: updatedOrders, orderHistory: updatedHistory };
        });

        broadcastSyncEvent({
          type: "ORDER_RETURNED",
          orderId: orderId,
          message: reason,
        });

        audioAlert.playSuccessSound();
      },

      toggleVacationMode: () => {
        const current = get().profile.vacationMode;
        set((state) => ({
          profile: { ...state.profile, vacationMode: !current },
        }));
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      updateOrderStatus: (orderId: string, newStatus: OrderStatus) => {
        set((state) => {
          const updatedOrders = state.orders.map((o) => {
            if (o.id !== orderId) return o;
            const updated = { ...o, status: newStatus };
            if (newStatus === "READY_FOR_PICKUP") {
              updated.readyAt = new Date().toISOString();
            } else if (newStatus === "COMPLETED") {
              updated.completedAt = new Date().toISOString();
            } else if (newStatus === "RETURNED") {
              updated.returnedAt = new Date().toISOString();
            }
            return updated;
          });

          // If transitioning to COMPLETED, add to commission ledger
          const target = updatedOrders.find((o) => o.id === orderId);
          let updatedLedger = state.commissionLedger;
          if (newStatus === "COMPLETED" && target) {
            const exists = state.commissionLedger.some((c) => c.orderId === orderId);
            if (!exists) {
              const newEntry: CommissionLedgerEntry = {
                id: `com-${target.displayId}`,
                orderId: target.id,
                displayId: target.displayId,
                date: new Date().toISOString().split("T")[0],
                grossAmount: target.grossTotal,
                commissionRate: target.commissionRate,
                commissionAmount: target.commissionAmount,
                netPayable: target.netTotal,
                settlementStatus: "PENDING",
              };
              updatedLedger = [newEntry, ...state.commissionLedger];
            }
          }

          if (newStatus === "READY_FOR_PICKUP" && target) {
            broadcastSyncEvent({
              type: "ORDER_READY_FOR_PICKUP",
              orderId: target.id,
              deliveryZone: target.deliveryZone,
              riderName: target.riderName || "",
              riderPhone: target.riderPhone || "",
            });

            // Cross-app live dispatch to Rider Portal (Vercel & Localhost)
            const dispatchPayload = {
              id: target.id,
              orderNumber: target.displayId,
              customerName: target.customerName.replace(/\[.*?\]/g, "").trim(),
              customerPhone: target.customerPhone.includes("01") ? target.customerPhone.replace(/\[.*?\]/g, "").trim() : "",
              deliveryAddress: `${target.deliveryZone}, ঢাকা`,
              deliveryZone: target.deliveryZone,
              vendorName: state.profile.storeNameBn || state.profile.storeName || "ভেন্ডর",
              itemCount: target.items.reduce((s, i) => s + (i.quantity || 1), 0),
              subtotal: target.grossTotal,
              deliveryFee: 60,
              total: target.grossTotal + 60,
              earnings: 50,
              paymentStatus: target.paymentStatus || "COD",
              paymentMethod: target.paymentMethod || "CASH_ON_DELIVERY",
              items: target.items.map((it) => ({
                name: it.productNameBn || it.productName,
                qty: it.quantity,
                price: it.finalPrice || it.unitPrice,
                total: (it.finalPrice || it.unitPrice) * it.quantity,
              })),
              createdAt: new Date().toISOString(),
              status: "READY_FOR_PICKUP",
            };

            dispatchOrderToRiders(dispatchPayload);

            // Auto-pickup simulation:
            // When rider arrives and takes parcel, status automatically changes to COMPLETED
            setTimeout(() => {
              const currentOrder = get().orders.find((o) => o.id === target.id);
              if (currentOrder && currentOrder.status === "READY_FOR_PICKUP") {
                get().updateOrderStatus(target.id, "COMPLETED");
                broadcastSyncEvent({
                  type: "RIDER_PICKED_UP",
                  orderId: target.id,
                });
              }
            }, 18000);
          }

          let updatedHistory = state.orderHistory;
          if (target) {
            const histIndex = updatedHistory.findIndex((h) => h.id === orderId);
            if (histIndex >= 0) {
              updatedHistory = [...updatedHistory];
              updatedHistory[histIndex] = target;
            } else {
              updatedHistory = [target, ...updatedHistory];
            }
          }

          return { orders: updatedOrders, commissionLedger: updatedLedger, orderHistory: updatedHistory };
        });
        audioAlert.playSuccessSound();
      },

      reconcileItemWeight: (orderId: string, itemId: string, actualWeight: number) => {
        set((state) => {
          const updatedOrders = state.orders.map((order) => {
            if (order.id !== orderId) return order;

            const updatedItems = order.items.map((item) => {
              if (item.id !== itemId) return item;
              // Recalculate item price based on rate and actual scale weight
              const finalPrice = Math.round(item.unitPrice * actualWeight * 100) / 100;
              return {
                ...item,
                weightActual: actualWeight,
                finalPrice,
                packed: true,
              };
            });

            // Recompute gross & net
            const grossTotal = updatedItems.reduce((acc, i) => acc + i.finalPrice, 0);
            const commissionAmount = Math.round(grossTotal * (order.commissionRate / 100) * 100) / 100;
            const netTotal = Math.round((grossTotal - commissionAmount) * 100) / 100;

            return {
              ...order,
              items: updatedItems,
              grossTotal,
              commissionAmount,
              netTotal,
            };
          });

          return { orders: updatedOrders };
        });
        audioAlert.playSuccessSound();
      },

      toggleItemPacked: (orderId: string, itemId: string) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              items: o.items.map((it) =>
                it.id === itemId ? { ...it, packed: !it.packed } : it
              ),
            };
          }),
        }));
      },

      markAllItemsPacked: (orderId: string) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            return {
              ...o,
              items: o.items.map((it) => ({ ...it, packed: true })),
            };
          }),
        }));
        audioAlert.playSuccessSound();
      },

      simulateIncomingOrder: () => {
        // Safe sound chime only — no fake demo order created
        audioAlert.playNewOrderChime();
      },

      simulateAreaDispatchOrder: () => {
        // Safe stub — no fake demo order created
      },

      simulateRemoteClaim: (_orderId: string) => {},

      syncRiderDispatch: (tasks: any[]) => {
        if (!Array.isArray(tasks) || tasks.length === 0) return;
        set((state) => {
          let changed = false;
          const updatedOrders = state.orders.map((order) => {
            const matchingTask = tasks.find(
              (t: any) =>
                t.id === order.id ||
                t.orderNumber === order.displayId ||
                t.id === order.displayId ||
                t.orderNumber === order.id
            );
            if (!matchingTask) return order;

            const riderName = matchingTask.riderName || matchingTask.claimedBy?.riderName;
            const riderPhone = matchingTask.riderPhone || matchingTask.claimedBy?.riderPhone;
            const riderVehicle = matchingTask.riderVehicle || matchingTask.claimedBy?.riderVehicle;
            const taskStatus = matchingTask.status;

            // ─── Status Mapping (Rider dispatch status → Vendor order status) ───
            // When rider picks up parcel (ON_THE_WAY, PICKED_UP, DELIVERED, or pickedUpFromStore),
            // it automatically transitions to COMPLETED in the vendor portal!
            let newStatus = order.status;
            if (taskStatus === "DELIVERED" && order.status !== "COMPLETED") {
              newStatus = "COMPLETED";
            } else if (taskStatus === "RETURNED" && order.status !== "RETURNED") {
              newStatus = "RETURNED";
            } else if (
              (taskStatus === "ON_THE_WAY" ||
                taskStatus === "PICKED_UP" ||
                matchingTask.pickedUpFromStore) &&
              order.status !== "COMPLETED"
            ) {
              newStatus = "COMPLETED";
            }

            const finalRiderName = riderName || order.riderName || undefined;
            const finalRiderPhone = riderPhone || order.riderPhone || undefined;
            const finalRiderVehicle = riderVehicle || order.riderVehicle || undefined;

            if (
              order.riderName !== finalRiderName ||
              order.riderPhone !== finalRiderPhone ||
              order.riderVehicle !== finalRiderVehicle ||
              order.status !== newStatus
            ) {
              changed = true;
              return {
                ...order,
                riderName: finalRiderName,
                riderPhone: finalRiderPhone,
                riderVehicle: finalRiderVehicle,
                status: newStatus,
                completedAt: newStatus === "COMPLETED" ? (order.completedAt || new Date().toISOString()) : order.completedAt,
              };
            }
            return order;
          });

          // If any order transitioned to COMPLETED, add to commission ledger
          let updatedLedger = state.commissionLedger;
          updatedOrders.forEach((o) => {
            if (o.status === "COMPLETED") {
              const exists = updatedLedger.some((c) => c.orderId === o.id);
              if (!exists) {
                const newEntry: CommissionLedgerEntry = {
                  id: `com-${o.displayId}`,
                  orderId: o.id,
                  displayId: o.displayId,
                  date: new Date().toISOString().split("T")[0],
                  grossAmount: o.grossTotal,
                  commissionRate: o.commissionRate,
                  commissionAmount: o.commissionAmount,
                  netPayable: o.netTotal,
                  settlementStatus: "PENDING",
                };
                updatedLedger = [newEntry, ...updatedLedger];
              }
            }
          });

          return changed ? { orders: updatedOrders, commissionLedger: updatedLedger } : state;
        });
      },

      addProduct: (productData) => {
        const id = `prod-${Date.now()}`;
        const newProduct: Product = {
          ...productData,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          products: [newProduct, ...state.products],
        }));
        audioAlert.playSuccessSound();
      },

      updateProduct: (id: string, updates: Partial<Product>) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProduct: (id: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      bulkAdjustStock: (productIds: string[], delta: number) => {
        const now = new Date().toISOString();
        set((state) => {
          const newLogs: StockAdjustmentLog[] = [];
          const updatedProducts = state.products.map((p) => {
            if (!productIds.includes(p.id)) return p;
            const newQty = Math.max(0, p.stockQty + delta);
            newLogs.push({
              id: `log-${Date.now()}-${p.id}`,
              productId: p.id,
              productName: p.name,
              productNameBn: p.nameBn,
              previousQty: p.stockQty,
              newQty,
              delta,
              reason: delta > 0 ? "RESTOCK" : "RECOUNT_AUDIT",
              adjustedBy: state.currentRole === "OWNER" ? "Rafiqul Islam" : "Staff Member",
              adjustedByRole: state.currentRole,
              timestamp: now,
              notes: "Bulk inventory adjustment action",
            });
            return { ...p, stockQty: newQty, updatedAt: now };
          });

          return {
            products: updatedProducts,
            stockLogs: [...newLogs, ...state.stockLogs],
          };
        });
        audioAlert.playSuccessSound();
      },

      bulkTogglePublish: (productIds: string[], isPublished: boolean) => {
        set((state) => ({
          products: state.products.map((p) =>
            productIds.includes(p.id) ? { ...p, isPublished } : p
          ),
        }));
      },

      adjustStock: (
        productId: string,
        newQty: number,
        reason: StockAdjustmentReason,
        notes?: string
      ) => {
        const target = get().products.find((p) => p.id === productId);
        if (!target) return;

        const delta = newQty - target.stockQty;
        const now = new Date().toISOString();

        const logEntry: StockAdjustmentLog = {
          id: `log-${Date.now()}`,
          productId: target.id,
          productName: target.name,
          productNameBn: target.nameBn,
          previousQty: target.stockQty,
          newQty,
          delta,
          reason,
          adjustedBy: get().currentRole === "OWNER" ? "Rafiqul Islam" : "Staff Member",
          adjustedByRole: get().currentRole,
          timestamp: now,
          notes,
        };

        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stockQty: newQty, updatedAt: now } : p
          ),
          stockLogs: [logEntry, ...state.stockLogs],
        }));
        audioAlert.playSuccessSound();
      },

      requestPayout: (amount: number, method: PayoutMethod, account: string) => {
        const newPayout: PayoutRequest = {
          id: `pay-${Date.now().toString().slice(-4)}`,
          amount,
          method,
          accountDetails: account,
          status: "REQUESTED",
          requestedAt: new Date().toISOString(),
        };

        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: "Payout Request Submitted",
          titleBn: "টাকা তোলার আবেদন দাখিল হয়েছে",
          message: `Requested ৳${amount.toLocaleString()} via ${method}.`,
          messageBn: `৳${amount.toLocaleString()} তোলার আবেদন গ্রহণ করা হয়েছে (${method})।`,
          type: "PAYOUT",
          timestamp: new Date().toISOString(),
          read: false,
          link: "/settlements",
        };

        set((state) => ({
          payouts: [newPayout, ...state.payouts],
          notifications: [newNotif, ...state.notifications],
        }));
        audioAlert.playSuccessSound();
      },

      replyToReview: (reviewId: string, message: string) => {
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  vendorReply: {
                    message,
                    repliedAt: new Date().toISOString(),
                  },
                }
              : r
          ),
        }));
        audioAlert.playSuccessSound();
      },

      resolveRefundDispute: (
        disputeId: string,
        status: "APPROVED" | "REJECTED" | "ESCALATED",
        notes?: string
      ) => {
        set((state) => ({
          refundDisputes: state.refundDisputes.map((d) =>
            d.id === disputeId
              ? {
                  ...d,
                  status,
                  escalatedToAdmin: status === "ESCALATED",
                  resolutionNotes: notes,
                }
              : d
          ),
        }));
        audioAlert.playSuccessSound();
      },

      addStaff: (staffData) => {
        const newStaff: StaffAccount = {
          ...staffData,
          id: `stf-${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastActive: "Just now",
        };
        set((state) => ({
          staffAccounts: [newStaff, ...state.staffAccounts],
        }));
        audioAlert.playSuccessSound();
      },

      toggleStaffStatus: (staffId: string) => {
        set((state) => ({
          staffAccounts: state.staffAccounts.map((s) =>
            s.id === staffId ? { ...s, isActive: !s.isActive } : s
          ),
        }));
      },

      markNotificationRead: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      fullResetVendorStore: () => {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("tatka-vendor-store");
            localStorage.removeItem("tatka-vendor-store-v1");
            localStorage.removeItem("tatka-vendor-store-v2");
            localStorage.removeItem("tatka_vendor_storage");
            localStorage.removeItem("tatka_dispatch_tasks");
          } catch {}
        }
        set(() => ({
          language: "bn",
          currentRole: "OWNER",
          soundEnabled: true,
          dutyStatus: "STORE_OPEN",
          incomingOrderAlert: null,
          chatOrder: null,
          trackingOrder: null,
          claimLockAlert: null,
          profile: initialProfile,
          products: initialProducts,
          orders: initialOrders,
          orderHistory: [],
          stockLogs: initialStockLogs,
          commissionLedger: initialCommissionLedger,
          payouts: initialPayouts,
          reviews: initialReviews,
          refundDisputes: initialRefundDisputes,
          staffAccounts: initialStaffAccounts,
          staffLogs: initialStaffLogs,
          wholesaleBuyers: initialWholesaleBuyers,
          coupons: initialCoupons,
          notifications: initialNotifications,
          shiftStartedAt: new Date().toISOString(),
          withdrawRequests: [],
          settlementRequests: [],
        }));
      },

      /* ─── Withdrawal System Actions ─────────────────────────────── */

      requestWithdraw: (amount, method, account) => {
        const id = `wd-${Date.now()}`;
        const newReq: WithdrawRequest = {
          id,
          amount,
          method,
          accountDetails: account,
          status: "PENDING",
          requestedAt: new Date().toISOString(),
        };
        set((state) => ({
          withdrawRequests: [newReq, ...state.withdrawRequests],
        }));
      },

      requestSettlement: (orderIds, orderDisplayIds, totalAmount) => {
        const id = `st-${Date.now()}`;
        const newReq: SettlementRequest = {
          id,
          orderIds,
          orderDisplayIds,
          totalAmount,
          status: "PENDING",
          requestedAt: new Date().toISOString(),
        };
        // Mark selected ledger entries as PROCESSING
        set((state) => ({
          settlementRequests: [newReq, ...state.settlementRequests],
          commissionLedger: state.commissionLedger.map((c) =>
            orderIds.includes(c.orderId)
              ? { ...c, settlementStatus: "PROCESSING" as const }
              : c
          ),
        }));
      },

      approveWithdrawSimulate: (_requestId) => {
        return "";
      },

      approveSettlementSimulate: (_requestId) => {
        return "";
      },

      verifyWithdrawOTP: (requestId, otp) => {
        const req = get().withdrawRequests.find((r) => r.id === requestId);
        if (!req || req.otp !== otp) return false;
        set((state) => ({
          withdrawRequests: state.withdrawRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: "COMPLETED" as const, completedAt: new Date().toISOString() }
              : r
          ),
        }));
        audioAlert.playSuccessSound();
        return true;
      },

      verifySettlementOTP: (requestId, otp) => {
        const req = get().settlementRequests.find((r) => r.id === requestId);
        if (!req || req.otp !== otp) return false;
        // Mark as completed and settle ledger entries
        set((state) => ({
          settlementRequests: state.settlementRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: "COMPLETED" as const, completedAt: new Date().toISOString() }
              : r
          ),
          commissionLedger: state.commissionLedger.map((c) => {
            const settled = req.orderIds.includes(c.orderId);
            return settled
              ? { ...c, settlementStatus: "SETTLED" as const, settlementBatchId: requestId }
              : c;
          }),
        }));
        audioAlert.playSuccessSound();
        return true;
      },
    }),
    {
      name: "tatka-vendor-store-v3",
      partialize: (state) => ({
        language: state.language,
        currentRole: state.currentRole,
        soundEnabled: state.soundEnabled,
        profile: state.profile,
        products: state.products,
        orders: state.orders,
        stockLogs: state.stockLogs,
        commissionLedger: state.commissionLedger,
        payouts: state.payouts,
        reviews: state.reviews,
        refundDisputes: state.refundDisputes,
        staffAccounts: state.staffAccounts,
        staffLogs: state.staffLogs,
        wholesaleBuyers: state.wholesaleBuyers,
        coupons: state.coupons,
        notifications: state.notifications,
      }),
    }
  )
);
