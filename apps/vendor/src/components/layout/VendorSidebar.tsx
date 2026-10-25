"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  PackageSearch,
  Warehouse,
  BarChart3,
  Tag,
  Handshake,
  Users,
  Wallet,
  Star,
  User,
  Settings,
  Palmtree,
  X,
  Lock,
  History,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface VendorSidebarProps {
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
  roles: string[];
  lockedFor?: string[];
  children?: NavItem[];
}

export default function VendorSidebar({ onClose }: VendorSidebarProps) {
  const pathname = usePathname();
  const {
    language,
    currentRole,
    profile,
    orders,
    refundDisputes,
    toggleVacationMode,
    dutyStatus,
  } = useVendorStore();

  const t = translations[language];
  const isBn = language === "bn";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    orders: pathname.startsWith("/orders"),
  });

  const toggleGroup = (key: string) =>
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));

  // Live badge counts
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;
  const pendingDisputesCount = refundDisputes.filter(
    (d) => d.status === "PENDING"
  ).length;

  // ─────────────────────── NAV STRUCTURE ───────────────────────
  const navGroups: {
    groupLabel?: string;
    items: NavItem[];
  }[] = [
    {
      items: [
        {
          label: isBn ? "ড্যাশবোর্ড" : "Dashboard",
          href: "/",
          icon: LayoutDashboard,
          roles: ["OWNER", "MANAGER", "STAFF"],
        },
      ],
    },
    {
      groupLabel: isBn ? "অর্ডার পরিচালনা" : "Orders",
      items: [
        {
          label: isBn ? "লাইভ অর্ডার" : "Live Orders",
          href: "/orders",
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: "bg-[#00D68F] text-black font-extrabold",
          roles: ["OWNER", "MANAGER", "STAFF"],
        },
        {
          label: isBn ? "অর্ডার ইতিহাস" : "Order History",
          href: "/orders/history",
          icon: History,
          roles: ["OWNER", "MANAGER", "STAFF"],
        },
      ],
    },
    {
      groupLabel: isBn ? "পণ্য ও স্টক" : "Products & Stock",
      items: [
        {
          label: isBn ? "পণ্য ক্যাটালগ" : "Products",
          href: "/products",
          icon: PackageSearch,
          roles: ["OWNER", "MANAGER", "STAFF"],
        },
        {
          label: isBn ? "ইনভেন্টরি / স্টক" : "Inventory",
          href: "/inventory",
          icon: Warehouse,
          roles: ["OWNER", "MANAGER"],
          lockedFor: ["STAFF"],
        },
      ],
    },
    {
      groupLabel: isBn ? "বিক্রয় ও আয়" : "Sales & Revenue",
      items: [
        {
          label: isBn ? "সেটেলমেন্ট" : "Settlements",
          href: "/settlements",
          icon: Wallet,
          roles: ["OWNER"],
          lockedFor: ["MANAGER", "STAFF"],
        },
        {
          label: isBn ? "অ্যানালিটিক্স" : "Analytics",
          href: "/analytics",
          icon: BarChart3,
          roles: ["OWNER", "MANAGER"],
          lockedFor: ["STAFF"],
        },
        {
          label: isBn ? "কুপন ও ছাড়" : "Promotions",
          href: "/promotions",
          icon: Tag,
          roles: ["OWNER", "MANAGER"],
          lockedFor: ["STAFF"],
        },
        {
          label: isBn ? "হোলসেল / B2B" : "Wholesale",
          href: "/wholesale",
          icon: Handshake,
          roles: ["OWNER"],
          lockedFor: ["MANAGER", "STAFF"],
        },
      ],
    },
    {
      groupLabel: isBn ? "দোকান পরিচালনা" : "Store Management",
      items: [
        {
          label: isBn ? "রিভিউ ও অভিযোগ" : "Reviews",
          href: "/reviews",
          icon: Star,
          badge: pendingDisputesCount > 0 ? pendingDisputesCount : undefined,
          badgeColor: "bg-rose-500 text-white font-bold",
          roles: ["OWNER", "MANAGER"],
        },
        {
          label: isBn ? "স্টাফ ম্যানেজমেন্ট" : "Staff",
          href: "/staff",
          icon: Users,
          roles: ["OWNER"],
          lockedFor: ["MANAGER", "STAFF"],
        },
        {
          label: isBn ? "প্রোফাইল" : "Profile",
          href: "/profile",
          icon: User,
          roles: ["OWNER", "MANAGER", "STAFF"],
        },
        {
          label: isBn ? "সেটিংস" : "Settings",
          href: "/settings",
          icon: Settings,
          roles: ["OWNER", "MANAGER"],
          lockedFor: ["STAFF"],
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col w-64 bg-[#08111E] border-r border-[rgba(255,255,255,0.08)] h-full select-none shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[rgba(255,255,255,0.06)] bg-[#050810]/60 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00D68F] to-[#00B87A] flex items-center justify-center text-white font-black shadow-md shadow-[#00D68F]/30 text-lg">
            🏪
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-[#F0F6FF]">
                {t.appName}
              </span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 rounded-full bg-[rgba(0,214,143,0.15)] text-[#00D68F] border border-[rgba(0,214,143,0.3)]">
                Vendor
              </span>
            </div>
            <p className="text-[10px] text-[#00D68F] font-semibold">
              {isBn ? "ভেন্ডর অপারেশন কনসোল" : "Operations Console"}
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Store Identity Card */}
      <div className="p-3.5 mx-3 my-3 rounded-2xl bg-[#0F1E32]/90 border border-[rgba(255,255,255,0.07)] shadow-lg flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-[#F0F6FF] truncate">
              {isBn ? (profile.storeNameBn || profile.storeName) : profile.storeName}
            </h4>
            <p className="text-[10.5px] text-[#A8C0D8]/70 truncate mt-0.5">
              {profile.address?.split(",")[1]?.trim() || "ধানমন্ডি, ঢাকা"}
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)] text-[11px]">
          <div className="flex items-center gap-1.5 text-[#00D68F] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#00D68F] animate-pulse" />
            <span>★ {profile.rating}</span>
            <span className="text-slate-400 text-[10px] font-normal">
              ({isBn ? "ভেরিফাইড" : "Verified"})
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              dutyStatus === "STORE_OPEN"
                ? "bg-[rgba(0,214,143,0.12)] text-[#00D68F] border-[rgba(0,214,143,0.3)]"
                : dutyStatus === "BUSY"
                ? "bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border-[rgba(245,158,11,0.3)]"
                : "bg-[rgba(239,68,68,0.12)] text-[#FCA5A5] border-[rgba(239,68,68,0.3)]"
            }`}
          >
            {dutyStatus === "STORE_OPEN" ? "খোলা" : dutyStatus === "BUSY" ? "ব্যস্ত" : "বন্ধ"}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 scrollbar-none">
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? "pt-1.5" : ""}>
            {group.groupLabel && (
              <p className="px-3 pt-1 pb-1 text-[9.5px] font-extrabold uppercase tracking-widest text-[#3E5A78]">
                {group.groupLabel}
              </p>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const isAllowed = item.roles.includes(currentRole);
              const isLocked = item.lockedFor?.includes(currentRole);
              const Icon = item.icon;

              if (isLocked) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 opacity-50 cursor-not-allowed"
                    title={`${item.label} (${t.accessRestricted})`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-slate-600" />
                      <span>{item.label}</span>
                    </div>
                    <Lock size={12} className="text-slate-600" />
                  </div>
                );
              }

              if (!isAllowed) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[rgba(0,214,143,0.12)] text-[#00D68F] shadow-sm border border-[rgba(0,214,143,0.3)]"
                      : "text-[#A8C0D8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={isActive ? "text-[#00D68F]" : "text-[#5E7A96]"}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${item.badgeColor}`}>
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Vacation Mode & Footer */}
      <div className="p-3.5 border-t border-[rgba(255,255,255,0.06)] bg-[#050810]/50 space-y-2 flex-shrink-0">
        <button
          onClick={toggleVacationMode}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all border ${
            profile.vacationMode
              ? "bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.35)] text-[#F59E0B] font-bold"
              : "bg-[#0F1E32]/60 border-[rgba(255,255,255,0.07)] text-[#A8C0D8] hover:text-white hover:border-[rgba(0,214,143,0.3)]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Palmtree
              size={14}
              className={profile.vacationMode ? "text-[#F59E0B]" : "text-[#5E7A96]"}
            />
            <span className="text-[11px] font-bold">{t.vacationModeTitle}</span>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              profile.vacationMode ? "bg-[#F59E0B]" : "bg-slate-600"
            }`}
          />
        </button>
        <div className="text-[10px] text-[#3E5A78] text-center font-medium">
          Tatka Bazar • Vendor Partner
        </div>
      </div>
    </div>
  );
}
