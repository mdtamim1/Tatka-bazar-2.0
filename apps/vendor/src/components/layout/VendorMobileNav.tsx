"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  PackageCheck,
  UserCheck,
} from "lucide-react";
import { useVendorStore } from "@/store/vendorStore";
import { translations } from "@/utils/translations";

interface VendorMobileNavProps {
  onOpenNotifications: () => void;
  onOpenRoleModal: () => void;
}

export default function VendorMobileNav({
  onOpenRoleModal,
}: VendorMobileNavProps) {
  const pathname = usePathname();
  const { language, orders, products } = useVendorStore();
  const t = translations[language];

  const pendingOrders = orders.filter(
    (o) => o.status === "RECEIVED" || o.status === "PREPARING"
  ).length;

  const lowStock = products.filter(
    (p) => p.stockQty <= p.lowStockThreshold
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
      label: t.navProducts,
      href: "/products",
      icon: Layers,
    },
    {
      label: t.navInventory,
      href: "/inventory",
      icon: PackageCheck,
      badge: lowStock > 0 ? lowStock : undefined,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-[#111C20] border-t border-[#20333B] lg:hidden z-40 px-2 py-1 select-none">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[48px] rounded-lg transition-colors relative ${
                isActive
                  ? "text-emerald-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon size={19} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-emerald-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
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

        {/* Role switcher button on mobile */}
        <button
          onClick={onOpenRoleModal}
          className="flex flex-col items-center justify-center py-2 px-3 min-w-[64px] min-h-[48px] rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <UserCheck size={19} />
          <span className="text-[10px] mt-1">{t.switchRole}</span>
        </button>
      </div>
    </nav>
  );
}
