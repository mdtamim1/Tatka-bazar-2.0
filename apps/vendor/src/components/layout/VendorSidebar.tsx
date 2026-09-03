"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  PackageCheck,
  Building2,
  Wallet,
  TrendingUp,
  Tag,
  MessageSquareDiff,
  Users,
  Settings,
  ShieldCheck,
  Palmtree,
  Store,
  X,
  Lock,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface VendorSidebarProps {
  onClose?: () => void;
}

export default function VendorSidebar({ onClose }: VendorSidebarProps) {
  const pathname = usePathname();
  const {
    language,
    currentRole,
    profile,
    orders,
    products,
    refundDisputes,
    toggleVacationMode,
  } = useVendorStore();

  const t = translations[language];

  // Live badge counts
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;

  const lowStockCount = products.filter(
    (p) => p.stockQty <= p.lowStockThreshold
  ).length;

  const pendingDisputesCount = refundDisputes.filter(
    (d) => d.status === "PENDING"
  ).length;

  // Role permissions checking
  // Staff: orders, inventory, products
  // Manager: orders, inventory, products, wholesale, analytics, reviews, promotions
  // Owner: all
  const navItems = [
    {
      label: t.navDashboard,
      href: "/",
      icon: LayoutDashboard,
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
    {
      label: t.navOrders,
      href: "/orders",
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeColor: "bg-emerald-500 text-black font-semibold",
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
    {
      label: t.navProducts,
      href: "/products",
      icon: Layers,
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
    {
      label: t.navInventory,
      href: "/inventory",
      icon: PackageCheck,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: "bg-amber-500 text-black font-semibold",
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
    {
      label: t.navWholesale,
      href: "/wholesale",
      icon: Building2,
      roles: ["OWNER", "MANAGER"],
    },
    {
      label: t.navSettlements,
      href: "/settlements",
      icon: Wallet,
      roles: ["OWNER"],
      lockedFor: ["MANAGER", "STAFF"],
    },
    {
      label: t.navAnalytics,
      href: "/analytics",
      icon: TrendingUp,
      roles: ["OWNER", "MANAGER"],
      lockedFor: ["STAFF"],
    },
    {
      label: t.navPromotions,
      href: "/promotions",
      icon: Tag,
      roles: ["OWNER", "MANAGER"],
    },
    {
      label: t.navReviews,
      href: "/reviews",
      icon: MessageSquareDiff,
      badge: pendingDisputesCount > 0 ? pendingDisputesCount : undefined,
      badgeColor: "bg-rose-500 text-white font-semibold",
      roles: ["OWNER", "MANAGER"],
    },
    {
      label: t.navStaff,
      href: "/staff",
      icon: Users,
      roles: ["OWNER"],
      lockedFor: ["MANAGER", "STAFF"],
    },
    {
      label: t.navSettings,
      href: "/settings",
      icon: Settings,
      roles: ["OWNER"],
      lockedFor: ["MANAGER", "STAFF"],
    },
    {
      label: t.navOnboarding,
      href: "/onboarding",
      icon: ShieldCheck,
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
  ];

  return (
    <div className="flex flex-col w-64 bg-[#111C20] border-r border-[#20333B] h-full select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[#20333B]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <Store size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                {t.appName}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Vendor
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {language === "bn" ? "ভেন্ডর অপারেশন" : "Operations Console"}
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Store Identity Card */}
      <div className="p-3 mx-3 my-3 rounded-lg bg-[#152227] border border-[#20333B]">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-200 truncate">
              {language === "bn" ? profile.storeNameBn : profile.storeName}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {profile.address.split(",")[1]?.trim() || "Dhanmondi, Dhaka"}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between pt-2 border-t border-[#20333B]/60 text-[11px]">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>⭐ {profile.rating}</span>
            <span className="text-slate-500 text-[10px]">
              ({language === "bn" ? "বিশ্বস্ত" : "Trusted"})
            </span>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              profile.vacationMode
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            }`}
          >
            {profile.vacationMode ? t.statusVacation : t.statusOnline}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isAllowed = item.roles.includes(currentRole);
          const isLocked = item.lockedFor?.includes(currentRole);

          const IconComponent = item.icon;

          if (isLocked) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-slate-500 opacity-50 cursor-not-allowed"
                title={`${item.label} (${t.accessRestricted})`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent size={17} className="text-slate-600" />
                  <span>{item.label}</span>
                </div>
                <Lock size={13} className="text-slate-600" />
              </div>
            );
          }

          if (!isAllowed) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-300 hover:text-white hover:bg-[#152227]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <IconComponent
                  size={17}
                  className={isActive ? "text-emerald-400" : "text-slate-400"}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Vacation Mode & Quick Utility Footer */}
      <div className="p-3 border-t border-[#20333B] bg-[#0E171B] space-y-2">
        <button
          onClick={toggleVacationMode}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors border ${
            profile.vacationMode
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "bg-[#152227] border-[#20333B] text-slate-300 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Palmtree size={14} className={profile.vacationMode ? "text-amber-400" : "text-slate-400"} />
            <span className="text-[11px] font-medium">{t.vacationModeTitle}</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              profile.vacationMode ? "bg-amber-400" : "bg-slate-600"
            }`}
          />
        </button>

        <div className="text-[10px] text-slate-500 text-center">
          Tatka Bazar v2.4 • Vendor Console
        </div>
      </div>
    </div>
  );
}
