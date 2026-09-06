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
  History,
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
    dutyStatus,
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
      badgeColor: "bg-emerald-600 text-white font-bold",
      roles: ["OWNER", "MANAGER", "STAFF"],
    },
    {
      label: t.navHistory,
      href: "/orders/history",
      icon: History,
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
      badgeColor: "bg-amber-500 text-white font-bold",
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
      badgeColor: "bg-rose-500 text-white font-bold",
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
    <div className="flex flex-col w-64 bg-white border-r border-slate-200/80 h-full select-none shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200/80 bg-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/25">
            <Store size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                {t.appName}
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Vendor
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              {language === "bn" ? "ভেন্ডর অপারেশন কনসোল" : "Operations Console"}
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Store Identity Card */}
      <div className="p-3.5 mx-3 my-3 rounded-2xl bg-[#F8FAF8] border border-emerald-100/90 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {language === "bn" ? profile.storeNameBn : profile.storeName}
            </h4>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {profile.address.split(",")[1]?.trim() || "ধানমন্ডি, ঢাকা"}
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-emerald-100/80 text-[11px]">
          <div className="flex items-center gap-1 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>★ {profile.rating}</span>
            <span className="text-slate-400 text-[10px] font-normal">
              ({language === "bn" ? "ভেরিফাইড" : "Verified"})
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              dutyStatus === "STORE_OPEN"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : dutyStatus === "BUSY"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {dutyStatus === "STORE_OPEN"
              ? "খোলা"
              : dutyStatus === "BUSY"
              ? "ব্যস্ত"
              : "বন্ধ"}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isAllowed = item.roles.includes(currentRole);
          const isLocked = item.lockedFor?.includes(currentRole);

          const IconComponent = item.icon;

          if (isLocked) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-400 opacity-60 cursor-not-allowed"
                title={`${item.label} (${t.accessRestricted})`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent size={17} className="text-slate-400" />
                  <span>{item.label}</span>
                </div>
                <Lock size={13} className="text-slate-400" />
              </div>
            );
          }

          if (!isAllowed) return null;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-[#F8FAF8]"
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  size={18}
                  className={isActive ? "text-emerald-700" : "text-slate-400"}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Vacation Mode & Quick Utility Footer */}
      <div className="p-3.5 border-t border-slate-200/80 bg-[#FBFBF9] space-y-2">
        <button
          onClick={toggleVacationMode}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all border ${
            profile.vacationMode
              ? "bg-amber-50 border-amber-200 text-amber-800 font-bold"
              : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Palmtree
              size={15}
              className={profile.vacationMode ? "text-amber-500" : "text-slate-400"}
            />
            <span className="text-[11px] font-bold">{t.vacationModeTitle}</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              profile.vacationMode ? "bg-amber-500" : "bg-slate-300"
            }`}
          />
        </button>

        <div className="text-[10px] text-slate-400 text-center font-medium">
          Tatka Bazar v2.4 • Vendor Console
        </div>
      </div>
    </div>
  );
}
