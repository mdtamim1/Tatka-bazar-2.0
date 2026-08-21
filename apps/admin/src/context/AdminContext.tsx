"use client";

import React, { createContext, useContext, useState } from "react";
import {
  AdminUser,
  AdminRole,
  AdminOrder,
  AdminProduct,
  AdminVendor,
  AdminB2BAccount,
  AdminRider,
  AdminBranch,
  AdminCoupon,
  AdminReview,
  AuditLogEntry,
  OrderStatus,
} from "@/types";
import {
  INITIAL_ADMIN_USER,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_VENDORS,
  INITIAL_B2B_ACCOUNTS,
  INITIAL_RIDERS,
  INITIAL_BRANCHES,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
  INITIAL_AUDIT_LOGS,
} from "@/lib/admin-data";

interface AdminContextType {
  currentUser: AdminUser;
  setCurrentRole: (role: AdminRole) => void;
  
  // Orders
  orders: AdminOrder[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignRiderToOrder: (orderId: string, riderId: string, riderName: string) => void;
  updateOrder: (orderId: string, updates: Partial<AdminOrder>) => void;
  createOrder: (data: Omit<AdminOrder, "id" | "createdAt" | "subOrders">) => void;
  
  // Products
  products: AdminProduct[];
  addProduct: (product: Omit<AdminProduct, "id">) => void;
  updateProduct: (id: string, product: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  toggleProductPublish: (id: string) => void;
  
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
  addRider: (rider: Omit<AdminRider, "id" | "activeDeliveriesCount" | "totalDeliveriesCompleted" | "rating" | "balancePayable">) => void;
  
  // Branches
  branches: AdminBranch[];
  addBranch: (branch: Omit<AdminBranch, "id">) => void;
  
  // Coupons
  coupons: AdminCoupon[];
  addCoupon: (coupon: Omit<AdminCoupon, "id" | "usedCount">) => void;
  
  // Reviews
  reviews: AdminReview[];
  moderateReview: (id: string, status: "APPROVED" | "REJECTED") => void;
  
  // Audit Logs
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, module: string, targetId: string, details: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AdminUser>(INITIAL_ADMIN_USER);
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [products, setProducts] = useState<AdminProduct[]>(INITIAL_PRODUCTS);
  const [vendors, setVendors] = useState<AdminVendor[]>(INITIAL_VENDORS);
  const [b2bAccounts, setB2bAccounts] = useState<AdminB2BAccount[]>(INITIAL_B2B_ACCOUNTS);
  const [riders, setRiders] = useState<AdminRider[]>(INITIAL_RIDERS);
  const [branches, setBranches] = useState<AdminBranch[]>(INITIAL_BRANCHES);
  const [coupons, setCoupons] = useState<AdminCoupon[]>(INITIAL_COUPONS);
  const [reviews, setReviews] = useState<AdminReview[]>(INITIAL_REVIEWS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  const addAuditLog = (action: string, module: string, targetId: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      module,
      targetId,
      details,
      timestamp: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const setCurrentRole = (role: AdminRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
    addAuditLog("ROLE_SWITCH", "System", currentUser.id, `Role switched to ${role}`);
  };

  // Orders Handlers
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord))
    );
    addAuditLog("ORDER_STATUS_UPDATE", "Orders", orderId, `Order status updated to ${status}`);
  };

  const assignRiderToOrder = (orderId: string, riderId: string, riderName: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, assignedRiderId: riderId, assignedRiderName: riderName, status: "OUT_FOR_DELIVERY" }
          : ord
      )
    );
    addAuditLog("RIDER_ASSIGNMENT", "Orders", orderId, `Assigned order to rider: ${riderName}`);
  };

  const updateOrder = (orderId: string, updates: Partial<AdminOrder>) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord))
    );
    addAuditLog("ORDER_UPDATE", "Orders", orderId, `Order details updated`);
  };

  const createOrder = (data: Omit<AdminOrder, "id" | "createdAt" | "subOrders">) => {
    const ts = new Date().toLocaleString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const newOrder: AdminOrder = {
      ...data,
      id: `ord-${Date.now()}`,
      createdAt: ts,
      subOrders: [],
    };
    setOrders((prev) => [newOrder, ...prev]);
    addAuditLog("ORDER_CREATE", "Orders", newOrder.id, `New order created: ${newOrder.orderNumber}`);
  };

  // Products Handlers
  const addProduct = (productData: Omit<AdminProduct, "id">) => {
    const newProd: AdminProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProd, ...prev]);
    addAuditLog("PRODUCT_CREATE", "Products", newProd.id, `Created product: ${newProd.nameEn} (${newProd.sku})`);
  };

  const updateProduct = (id: string, productData: Partial<AdminProduct>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    );
    addAuditLog("PRODUCT_UPDATE", "Products", id, `Updated product details for ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog("PRODUCT_DELETE", "Products", id, `Deleted product ID: ${id}`);
  };

  const toggleProductPublish = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPublished: !p.isPublished } : p))
    );
    addAuditLog("PRODUCT_VISIBILITY", "Products", id, `Toggled product visibility status`);
  };

  // Vendors Handlers
  const approveVendor = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "APPROVED" } : v))
    );
    addAuditLog("VENDOR_APPROVE", "Vendors", id, `Approved vendor application ID: ${id}`);
  };

  const suspendVendor = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: "SUSPENDED" } : v))
    );
    addAuditLog("VENDOR_SUSPEND", "Vendors", id, `Suspended vendor ID: ${id}`);
  };

  const settleVendorPayout = (id: string, amount: number) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, payableBalance: Math.max(0, v.payableBalance - amount) }
          : v
      )
    );
    addAuditLog("VENDOR_PAYOUT", "Vendors", id, `Settled payout of ৳${amount} for vendor`);
  };

  // B2B Handlers
  const approveB2BAccount = (id: string, creditLimit: number) => {
    setB2bAccounts((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "APPROVED", creditLimit } : b
      )
    );
    addAuditLog("B2B_APPROVE", "B2B", id, `Approved B2B Account with credit limit ৳${creditLimit}`);
  };

  const rejectB2BAccount = (id: string) => {
    setB2bAccounts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "REJECTED" } : b))
    );
    addAuditLog("B2B_REJECT", "B2B", id, `Rejected B2B Account application`);
  };

  // Riders Handlers
  const approveRider = (id: string) => {
    setRiders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "ACTIVE" } : r))
    );
    addAuditLog("RIDER_APPROVE", "Riders", id, `Approved rider account ID: ${id}`);
  };

  const addRider = (riderData: any) => {
    const newRider: AdminRider = {
      ...riderData,
      id: `rider-${Date.now()}`,
      activeDeliveriesCount: 0,
      totalDeliveriesCompleted: 0,
      rating: 5.0,
      balancePayable: 0,
    };
    setRiders((prev) => [newRider, ...prev]);
    addAuditLog("RIDER_CREATE", "Riders", newRider.id, `Created rider: ${newRider.name}`);
  };

  // Branches Handlers
  const addBranch = (branchData: Omit<AdminBranch, "id">) => {
    const newBranch: AdminBranch = {
      ...branchData,
      id: `branch-${Date.now()}`,
    };
    setBranches((prev) => [...prev, newBranch]);
    addAuditLog("BRANCH_CREATE", "Branches", newBranch.id, `Created fulfillment branch: ${newBranch.nameEn}`);
  };

  // Coupons Handlers
  const addCoupon = (couponData: Omit<AdminCoupon, "id" | "usedCount">) => {
    const newCoupon: AdminCoupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      usedCount: 0,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    addAuditLog("COUPON_CREATE", "Marketing", newCoupon.id, `Created promo coupon: ${newCoupon.code}`);
  };

  // Reviews Handlers
  const moderateReview = (id: string, status: "APPROVED" | "REJECTED") => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    addAuditLog("REVIEW_MODERATION", "Reviews", id, `Moderated review status: ${status}`);
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        setCurrentRole,
        orders,
        updateOrderStatus,
        assignRiderToOrder,
        updateOrder,
        createOrder,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductPublish,
        vendors,
        approveVendor,
        suspendVendor,
        settleVendorPayout,
        b2bAccounts,
        approveB2BAccount,
        rejectB2BAccount,
        riders,
        approveRider,
        addRider,
        branches,
        addBranch,
        coupons,
        addCoupon,
        reviews,
        moderateReview,
        auditLogs,
        addAuditLog,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
