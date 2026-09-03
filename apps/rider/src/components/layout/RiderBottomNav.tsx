"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PackageCheck, Navigation, Wallet, UserCheck } from "lucide-react";
import { useRiderStore } from "@/store/riderStore";
import { translations } from "@/utils/translations";

export default function RiderBottomNav() {
  const pathname = usePathname();
  const { locale, deliveries, dailySummary } = useRiderStore();
  const t = translations[locale];

  const activeDeliveriesCount = deliveries.filter(
    (d) => d.status === "ASSIGNED" || d.status === "ACCEPTED" || d.status === "PICKED_UP_FROM_HUB" || d.status === "EN_ROUTE" || d.status === "ARRIVED"
  ).length;

  const navItems = [
    {
      href: "/",
      label: t.navDashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      href: "/tasks",
      label: t.navTasks,
      icon: PackageCheck,
      badge: activeDeliveriesCount > 0 ? activeDeliveriesCount : null,
    },
    {
      href: "/map",
      label: t.navMap,
      icon: Navigation,
      badge: null,
    },
    {
      href: "/wallet",
      label: t.navWallet,
      icon: Wallet,
      badge: dailySummary.codInHandToDeposit > 0 ? `৳${Math.round(dailySummary.codInHandToDeposit / 1000)}k` : null,
    },
    {
      href: "/profile",
      label: t.navProfile,
      icon: UserCheck,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#0F1C13]/95 backdrop-blur-md border-t border-brand-500/20 safe-bottom">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full relative transition-all duration-200 ${
                isActive
                  ? "text-brand-400 font-semibold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.8]"
                  }`}
                />
                {item.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-harvest-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[62px]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-0.5 bg-brand-400 rounded-full shadow-glow-brand" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
