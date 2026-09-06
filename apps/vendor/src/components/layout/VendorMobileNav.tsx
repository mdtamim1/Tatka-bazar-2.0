"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  History,
  Wallet,
  Settings,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface VendorMobileNavProps {
  onOpenNotifications?: () => void;
  onOpenRoleModal?: () => void;
}

export default function VendorMobileNav({}: VendorMobileNavProps) {
  const pathname = usePathname();
  const { language, orders } = useVendorStore();
  const t = translations[language];

  const pendingOrders = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;

  const tabs = [
    {
      label: t.navDashboard,
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: t.navOrders,
      href: "/orders",
      icon: ShoppingBag,
      badge: pendingOrders > 0 ? pendingOrders : undefined,
    },
    {
      label: t.navHistory,
      href: "/orders/history",
      icon: History,
    },
    {
      label: t.navSettlements,
      href: "/settlements",
      icon: Wallet,
    },
    {
      label: t.navSettings,
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 lg:hidden z-40 px-2 py-1 select-none shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[48px] rounded-xl transition-all relative ${
                isActive
                  ? "text-emerald-700 font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-emerald-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 truncate max-w-[70px]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
