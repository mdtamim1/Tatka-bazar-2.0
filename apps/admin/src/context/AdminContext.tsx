"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

import {
  AdminUser, AdminRole, AdminOrder, AdminProduct, AdminCategory,
  AdminVendor, AdminB2BAccount, AdminRider, AdminBranch, AdminCoupon,
  AdminReview, AuditLogEntry, OrderStatus, StaffMember, AdminCustomer,
} from "@/types";

import {
  INITIAL_ADMIN_USER, INITIAL_ORDERS, INITIAL_PRODUCTS, INITIAL_VENDORS,
  INITIAL_B2B_ACCOUNTS, INITIAL_RIDERS, INITIAL_BRANCHES, INITIAL_COUPONS,
  INITIAL_REVIEWS, INITIAL_AUDIT_LOGS, INITIAL_STAFF, INITIAL_CUSTOMERS,
  INITIAL_CATEGORIES,
} from "@/lib/admin-data";

// ── Context Type ─────────────────────────────────────────────────────────────

interface AdminContextType {
  currentUser: AdminUser;
  setCurrentRole: (role: AdminRole) => void;

  // Orders
  orders: AdminOrder[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  confirmOrder: (orderId: string) => void;
  assignVendorToOrder: (orderId: string, vendorId: string, vendorName: string) => void;
  assignRiderToOrder: (orderId: string, riderId: string, riderName: string) => void;
  updateOrder: (orderId: string, updates: Partial<AdminOrder>) => void;
  createOrder: (data: Omit<AdminOrder, "id" | "createdAt" | "subOrders">) => void;
  cancelOrder: (orderId: string) => void;

  // Products
  products: AdminProduct[];
  addProduct: (product: Omit<AdminProduct, "id">) => void;
  updateProduct: (id: string, product: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductPublish: (id: string) => void;

  // Categories
  categories: AdminCategory[];
  updateCategory: (id: string, updates: Partial<AdminCategory>) => void;

  // Vendors
  vendors: AdminVendor[];
  approveVendor: (id: string) => void;
  suspendVendor: (id: string) => void;
  settleVendorPayout: (id: string, amount: number) => void;

  // B2B
  b2bAccounts: AdminB2BAccount[];
  approveB2BAccount: (id: string, creditLimit: number) => void;
  rejectB2BAccount: (id: string) => void;

  // Riders
  riders: AdminRider[];
  approveRider: (id: string) => void;
  addRider: (rider: Omit<AdminRider, "id" | "activeDeliveriesCount" | "totalDeliveriesCompleted" | "rating" | "balancePayable" | "totalEarned">) => void;

  // Branches
  branches: AdminBranch[];
  addBranch: (branch: Omit<AdminBranch, "id">) => void;
  updateBranch: (id: string, updates: Partial<AdminBranch>) => void;

  // Coupons
  coupons: AdminCoupon[];
  addCoupon: (coupon: Omit<AdminCoupon, "id" | "usedCount">) => void;
  toggleCoupon: (id: string) => void;

  // Reviews
  reviews: AdminReview[];
  moderateReview: (id: string, status: "APPROVED" | "REJECTED") => void;

  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, module: string, targetId: string, details: string) => void;

  // Staff
  staff: StaffMember[];
  inviteStaff: (data: { email: string; name: string; role: AdminRole; phone?: string; address?: string; department?: string; avatar?: string }) => void;
  updateStaffRole: (id: string, role: AdminRole) => void;
  suspendStaff: (id: string) => void;
  activateStaff: (id: string) => void;
  toggleStaffStatus: (id: string) => void;
  removeStaff: (id: string) => void;
  approveStaffKYC: (id: string) => void;
  rejectStaffKYC: (id: string, reason: string) => void;
  updateStaffProfile: (id: string, updates: Partial<StaffMember>) => void;

  // Customers
  customers: AdminCustomer[];

  // New Order Alert
  newOrderAlert: { orderNumber: string; customerName: string; totalAmount: number; area: string } | null;
  dismissAlert: () => void;
  playTestSound: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AdminUser>(INITIAL_ADMIN_USER);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<AdminCategory[]>(INITIAL_CATEGORIES);
  const [vendors, setVendors] = useState<AdminVendor[]>(INITIAL_VENDORS);
  const [b2bAccounts, setB2bAccounts] = useState<AdminB2BAccount[]>(INITIAL_B2B_ACCOUNTS);
  const [riders, setRiders] = useState<AdminRider[]>(INITIAL_RIDERS);
  const [branches, setBranches] = useState<AdminBranch[]>(INITIAL_BRANCHES);
  const [coupons, setCoupons] = useState<AdminCoupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<AdminReview[]>(INITIAL_REVIEWS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [customers, setCustomers] = useState<AdminCustomer[]>(INITIAL_CUSTOMERS);
  const [knownOrderIds, setKnownOrderIds] = useState<Set<string>>(
    new Set(INITIAL_ORDERS.map((o) => o.id))
  );
  const [newOrderAlert, setNewOrderAlert] = useState<{
    orderNumber: string; customerName: string; totalAmount: number; area: string;
  } | null>(null);

  // ── Live API polling & cross-app real-time synchronization ───────────────
  useEffect(() => {
    let isMounted = true;

    async function loadLiveData() {
      try {
        const [ordRes, riderRes, vendorRes] = await Promise.allSettled([
          fetch("/api/orders")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .catch(() => fetch(`${API_BASE}/api/orders`).then((r) => r.json())),
          fetch(`${API_BASE}/api/riders`).then((r) => r.json()),
          fetch(`${API_BASE}/api/vendors`).then((r) => r.json()),
        ]);

        let freshOrders: AdminOrder[] = [];

        if (ordRes.status === "fulfilled" && ordRes.value?.success && Array.isArray(ordRes.value.data)) {
          freshOrders = ordRes.value.data;
        }

        // Secondary fallback to /api/dispatch?all=true if /api/orders is empty
        if (freshOrders.length === 0) {
          try {
            const dispRes = await fetch("/api/dispatch?all=true");
            if (dispRes.ok) {
              const dispJson = await dispRes.json();
              if (dispJson.success && Array.isArray(dispJson.data) && dispJson.data.length > 0) {
                freshOrders = dispJson.data.map((t: any) => ({
                  id: t.id,
                  orderNumber: t.orderNumber || `TB-${t.id.replace(/\D/g, "") || "1000"}`,
                  storeName: "Tatka Bazar",
                  customerName: t.customerName || "সম্মানিত গ্রাহক",
                  customerPhone: t.customerPhone || "01700000000",
                  customerAddress: t.deliveryAddress || "Dhaka",
                  deliveryArea: t.deliveryZone || "Dhaka",
                  deliverySlot: "Standard Delivery",
                  totalAmount: Number(t.total || 0),
                  subtotalAmount: Number(t.subtotal || t.total || 0),
                  deliveryCharge: Number(t.deliveryFee || 60),
                  paymentMethod: "COD",
                  paymentStatus: "PENDING",
                  status: t.status === "READY_FOR_PICKUP" ? "SHIPPED" : t.status === "OUT_FOR_DELIVERY" ? "OUT_FOR_DELIVERY" : "PENDING",
                  createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Today",
                  assignedModerator: "Super Admin (Default)",
                  assignedVendorName: t.vendorName,
                  source: "STOREFRONT",
                  items: Array.isArray(t.items) ? t.items : [],
                  subOrders: [],
                  orderHistory: [],
                }));
              }
            }
          } catch {}
        }

        if (freshOrders.length > 0 && isMounted) {
          setKnownOrderIds((prevKnown) => new Set([...prevKnown, ...freshOrders.map((o) => o.id)]));
          setOrders((prev) => {
            const dbIds = new Set(freshOrders.map(f => f.id));
            const dbNumbers = new Set(freshOrders.map(f => f.orderNumber));
            const remaining = prev.filter(p => !dbIds.has(p.id) && !dbNumbers.has(p.orderNumber));
            return [...freshOrders, ...remaining];
          });
        }

        if (riderRes.status === "fulfilled" && riderRes.value?.success && riderRes.value.data?.length > 0 && isMounted) {
          setRiders(riderRes.value.data);
        }
        if (vendorRes.status === "fulfilled" && vendorRes.value?.success && vendorRes.value.data?.length > 0 && isMounted) {
          setVendors(vendorRes.value.data);
        }
      } catch {
        // Fallback to mock data — silent
      }
    }

    loadLiveData();
    const interval = setInterval(loadLiveData, 6000);

    // Cross-tab real-time listener (immediate sync when customer orders in another tab)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && typeof window.BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("tatka_vendor_realtime_sync_channel");
        bc.onmessage = () => { loadLiveData(); };
      }
    } catch {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "tatka_sync_broadcast" || e.key === "tatka_customer_orders") {
        loadLiveData();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (bc) bc.close();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, []);

  const dismissAlert = () => setNewOrderAlert(null);
  const playTestSound = () => {};

  // ── Audit Log ────────────────────────────────────────────────────────────
  const addAuditLog = useCallback((action: string, module: string, targetId: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      module,
      targetId,
      details,
      timestamp: new Date().toLocaleString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      }),
    };
    setAuditLogs((prev) => [newLog, ...prev].slice(0, 500));
  }, [currentUser]);

  const setCurrentRole = (role: AdminRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    addAuditLog("ROLE_SWITCH", "System", currentUser.id, `Role switched to ${role}`);
  };

  // ── Order Actions ────────────────────────────────────────────────────────

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    addAuditLog("ORDER_STATUS_UPDATE", "Orders", orderId, `Status updated to ${status}`);
    fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }, [addAuditLog]);

  const confirmOrder = useCallback((orderId: string) => {
    const ts = new Date().toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    setOrders((prev) => prev.map((o) =>
      o.id === orderId ? { ...o, status: "CONFIRMED", confirmedAt: ts } : o
    ));
    addAuditLog("ORDER_CONFIRM", "Dispatch", orderId, "Order confirmed by admin — ready for vendor assignment");
    fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONFIRMED" }),
    }).catch(() => {});
  }, [addAuditLog]);

  const assignVendorToOrder = useCallback((orderId: string, vendorId: string, vendorName: string) => {
    setOrders((prev) => prev.map((o) =>
      o.id === orderId
        ? { ...o, status: "VENDOR_ASSIGNED", assignedVendorId: vendorId, assignedVendorName: vendorName }
        : o
    ));
    addAuditLog("VENDOR_ASSIGNMENT", "Dispatch", orderId, `Assigned to vendor: ${vendorName}`);
    fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "VENDOR_ASSIGNED", assignedVendorId: vendorId }),
    }).catch(() => {});
  }, [addAuditLog]);

  const assignRiderToOrder = useCallback((orderId: string, riderId: string, riderName: string) => {
    setOrders((prev) => prev.map((o) =>
      o.id === orderId
        ? { ...o, assignedRiderId: riderId, assignedRiderName: riderName, status: "OUT_FOR_DELIVERY" }
        : o
    ));
    addAuditLog("RIDER_ASSIGNMENT", "Dispatch", orderId, `Assigned to rider: ${riderName}`);
    fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedRiderId: riderId, status: "OUT_FOR_DELIVERY" }),
    }).catch(() => {});
  }, [addAuditLog]);

  const updateOrder = useCallback((orderId: string, updates: Partial<AdminOrder>) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, ...updates } : o));
    addAuditLog("ORDER_UPDATE", "Orders", orderId, "Order details updated");
    fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
  }, [addAuditLog]);

  const createOrder = useCallback((data: Omit<AdminOrder, "id" | "createdAt" | "subOrders">) => {
    const ts = new Date().toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const newOrder: AdminOrder = {
      ...data,
      id: `ord-${Date.now()}`,
      createdAt: ts,
      subOrders: [],
    };
    setOrders((prev) => [newOrder, ...prev]);
    addAuditLog("ORDER_CREATE", "Orders", newOrder.id, `New order created: ${newOrder.orderNumber}`);
    fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  }, [addAuditLog]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: "CANCELLED" } : o));
    addAuditLog("ORDER_CANCEL", "Orders", orderId, "Order cancelled by admin");
    fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    }).catch(() => {});
  }, [addAuditLog]);

  // ── Product Actions ──────────────────────────────────────────────────────

  const addProduct = (productData: Omit<AdminProduct, "id">) => {
    const newProd: AdminProduct = { ...productData, id: `prod-${Date.now()}` };
    setProducts((prev) => [newProd, ...prev]);
    addAuditLog("PRODUCT_CREATE", "Products", newProd.id, `Created: ${newProd.nameEn} (${newProd.sku})`);
  };

  const updateProduct = (id: string, productData: Partial<AdminProduct>) => {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, ...productData } : p));
    addAuditLog("PRODUCT_UPDATE", "Products", id, `Updated product ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog("PRODUCT_DELETE", "Products", id, `Deleted product ID: ${id}`);
  };

  const toggleProductPublish = (id: string) => {
    setProducts((prev) => prev.map((p) =>
      p.id === id ? { ...p, isPublished: !p.isPublished } : p
    ));
    addAuditLog("PRODUCT_VISIBILITY", "Products", id, `Toggled product visibility`);
  };

  // ── Category Actions ─────────────────────────────────────────────────────
  const updateCategory = (id: string, updates: Partial<AdminCategory>) => {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, ...updates } : c));
    addAuditLog("CATEGORY_UPDATE", "Categories", id, `Updated category`);
  };

  // ── Vendor Actions ───────────────────────────────────────────────────────

  const approveVendor = (id: string) => {
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: "APPROVED" } : v));
    addAuditLog("VENDOR_APPROVE", "Vendors", id, `Approved vendor ID: ${id}`);
  };

  const suspendVendor = (id: string) => {
    setVendors((prev) => prev.map((v) => v.id === id ? { ...v, status: "SUSPENDED" } : v));
    addAuditLog("VENDOR_SUSPEND", "Vendors", id, `Suspended vendor ID: ${id}`);
  };

  const settleVendorPayout = (id: string, amount: number) => {
    setVendors((prev) => prev.map((v) =>
      v.id === id ? { ...v, payableBalance: Math.max(0, v.payableBalance - amount) } : v
    ));
    addAuditLog("VENDOR_PAYOUT", "Vendors", id, `Settled ৳${amount} payout`);
  };

  // ── B2B Actions ──────────────────────────────────────────────────────────

  const approveB2BAccount = (id: string, creditLimit: number) => {
    setB2bAccounts((prev) => prev.map((b) =>
      b.id === id ? { ...b, status: "APPROVED", creditLimit } : b
    ));
    addAuditLog("B2B_APPROVE", "B2B", id, `Approved B2B with credit ৳${creditLimit}`);
  };

  const rejectB2BAccount = (id: string) => {
    setB2bAccounts((prev) => prev.map((b) => b.id === id ? { ...b, status: "REJECTED" } : b));
    addAuditLog("B2B_REJECT", "B2B", id, `Rejected B2B application`);
  };

  // ── Rider Actions ────────────────────────────────────────────────────────

  const approveRider = (id: string) => {
    setRiders((prev) => prev.map((r) => r.id === id ? { ...r, status: "ACTIVE", kycStatus: "APPROVED" } : r));
    addAuditLog("RIDER_APPROVE", "Riders", id, `Approved rider ID: ${id}`);
  };

  const addRider = (riderData: any) => {
    const newRider: AdminRider = {
      ...riderData,
      id: `rider-${Date.now()}`,
      activeDeliveriesCount: 0,
      totalDeliveriesCompleted: 0,
      rating: 0,
      balancePayable: 0,
      totalEarned: 0,
      kycStatus: "PENDING",
    };
    setRiders((prev) => [newRider, ...prev]);
    addAuditLog("RIDER_CREATE", "Riders", newRider.id, `Created rider: ${newRider.name}`);
  };

  // ── Branch Actions ───────────────────────────────────────────────────────

  const addBranch = (branchData: Omit<AdminBranch, "id">) => {
    const newBranch: AdminBranch = { ...branchData, id: `branch-${Date.now()}` };
    setBranches((prev) => [...prev, newBranch]);
    addAuditLog("BRANCH_CREATE", "Branches", newBranch.id, `Created branch: ${newBranch.nameEn}`);
  };

  const updateBranch = (id: string, updates: Partial<AdminBranch>) => {
    setBranches((prev) => prev.map((b) => b.id === id ? { ...b, ...updates } : b));
    addAuditLog("BRANCH_UPDATE", "Branches", id, `Updated branch`);
  };

  // ── Coupon Actions ───────────────────────────────────────────────────────

  const addCoupon = (couponData: Omit<AdminCoupon, "id" | "usedCount">) => {
    const newCoupon: AdminCoupon = { ...couponData, id: `coup-${Date.now()}`, usedCount: 0 };
    setCoupons((prev) => [newCoupon, ...prev]);
    addAuditLog("COUPON_CREATE", "Marketing", newCoupon.id, `Created coupon: ${newCoupon.code}`);
  };

  const toggleCoupon = (id: string) => {
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c));
    addAuditLog("COUPON_TOGGLE", "Marketing", id, `Toggled coupon status`);
  };

  // ── Review Actions ───────────────────────────────────────────────────────

  const moderateReview = (id: string, status: "APPROVED" | "REJECTED") => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    addAuditLog("REVIEW_MODERATION", "Reviews", id, `Moderated review: ${status}`);
  };

  // ── Staff Actions ────────────────────────────────────────────────────────

  const inviteStaff = (data: { email: string; name: string; role: AdminRole; phone?: string; address?: string; department?: string; avatar?: string }) => {
    const today = new Date().toISOString().slice(0, 10);
    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      status: "PENDING",
      kycStatus: "SUBMITTED",
      avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.address ? { address: data.address } : {}),
      ...(data.department ? { department: data.department } : { department: "Operations" }),
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      invitedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      invitedBy: currentUser.name,
      ordersCollectedToday: 0,
      ordersCollectedLast30Days: 0,
      ordersCollectedLifetime: 0,
      dailySession: {
        loginTime: "Awaiting Approval",
        logoutTime: "Inactive",
        activeMinutesToday: 0,
        lastActiveDate: today,
        isCurrentlyOnline: false,
      },
      kyc: {
        nidNumber: "Pending Verification",
        presentAddress: data.address || "Pending Verification",
        permanentAddress: data.address || "Pending Verification",
        district: "Dhaka",
        thana: "Central",
        emergencyContactName: "Not Specified",
        emergencyContactPhone: data.phone || "01700000000",
        submittedAt: new Date().toLocaleString("en-GB"),
      },
    };
    setStaff((prev) => [newMember, ...prev]);
    addAuditLog("STAFF_INVITE", "Staff", newMember.id, `Invited ${data.name} as ${data.role}`);
  };

  const updateStaffRole = (id: string, role: AdminRole) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, role } : s));
    addAuditLog("STAFF_ROLE_UPDATE", "Staff", id, `Updated staff role to ${role}`);
  };

  const suspendStaff = (id: string) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, status: "SUSPENDED" } : s));
    addAuditLog("STAFF_SUSPEND", "Staff", id, `Suspended staff member`);
  };

  const activateStaff = (id: string) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, status: "ACTIVE" } : s));
    addAuditLog("STAFF_ACTIVATE", "Staff", id, `Reactivated staff member`);
  };

  const toggleStaffStatus = (id: string) => {
    setStaff((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const nextStatus = s.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      addAuditLog("STAFF_TOGGLE_STATUS", "Staff", id, `Staff status changed to ${nextStatus}`);
      return { ...s, status: nextStatus };
    }));
  };

  const approveStaffKYC = (id: string) => {
    setStaff((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      addAuditLog("STAFF_KYC_APPROVE", "Staff", id, `Approved KYC for ${s.name}. Role access unlocked.`);
      return {
        ...s,
        kycStatus: "VERIFIED",
        status: "ACTIVE",
        ...(s.kyc ? { kyc: { ...s.kyc, verifiedAt: new Date().toLocaleString("en-GB") } } : {}),
      };
    }));
  };

  const rejectStaffKYC = (id: string, reason: string) => {
    setStaff((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      addAuditLog("STAFF_KYC_REJECT", "Staff", id, `Rejected KYC for ${s.name}: ${reason}`);
      return {
        ...s,
        kycStatus: "REJECTED",
        ...(s.kyc ? { kyc: { ...s.kyc, rejectionReason: reason } } : {}),
      };
    }));
  };

  const updateStaffProfile = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => s.id === id ? { ...s, ...updates } : s));
    addAuditLog("STAFF_PROFILE_UPDATE", "Staff", id, `Updated staff profile`);
  };

  const removeStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    addAuditLog("STAFF_REMOVE", "Staff", id, `Removed staff member`);
  };

  // ── Provider Value ───────────────────────────────────────────────────────

  return (
    <AdminContext.Provider value={{
      currentUser, setCurrentRole,
      orders, updateOrderStatus, confirmOrder, assignVendorToOrder,
      assignRiderToOrder, updateOrder, createOrder, cancelOrder,
      products, addProduct, updateProduct, deleteProduct, toggleProductPublish,
      categories, updateCategory,
      vendors, approveVendor, suspendVendor, settleVendorPayout,
      b2bAccounts, approveB2BAccount, rejectB2BAccount,
      riders, approveRider, addRider,
      branches, addBranch, updateBranch,
      coupons, addCoupon, toggleCoupon,
      reviews, moderateReview,
      auditLogs, addAuditLog,
      staff, inviteStaff, updateStaffRole, suspendStaff, activateStaff, toggleStaffStatus, removeStaff,
      approveStaffKYC, rejectStaffKYC, updateStaffProfile,
      customers,
      newOrderAlert, dismissAlert, playTestSound,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within an AdminProvider");
  return context;
}
