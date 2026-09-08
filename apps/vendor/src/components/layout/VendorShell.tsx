"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import VendorSidebar from "./VendorSidebar";
import VendorHeader from "./VendorHeader";
import VendorMobileNav from "./VendorMobileNav";
import NotificationDrawer from "@/components/common/NotificationDrawer";
import RoleSwitcherModal from "@/components/common/RoleSwitcherModal";
import KeyboardShortcutsModal from "@/components/common/KeyboardShortcutsModal";
import IncomingOrderModal from "@/components/common/IncomingOrderModal";
import RiderChatModal from "@/components/common/RiderChatModal";
import VendorOrderTrackModal from "@/components/common/VendorOrderTrackModal";
import { useVendorStore } from "@/store/vendorStore";
import { subscribeSyncEvent } from "@/lib/sync";
import { audioAlert } from "@/utils/audioAlert";

export default function VendorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Live store values
  const {
    profile,
    incomingOrderAlert,
    claimLockAlert,
    setClaimLockAlert,
    acceptOrder,
    declineOrder,
    chatOrder,
    setChatOrder,
    trackingOrder,
    setTrackingOrder,
    simulateIncomingOrder,
  } = useVendorStore();

  // Keyboard shortcut listener ('?' for shortcuts modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cross-app sync listener (receives events from storefront, rider, or admin)
  useEffect(() => {
    const unsubscribe = subscribeSyncEvent((payload) => {
      if (payload.type === "NEW_ORDER" || payload.type === "ADMIN_DISPATCH_TO_ZONE") {
        simulateIncomingOrder();
      } else if (payload.type === "VENDOR_CLAIM_ORDER") {
        if (payload.claimedByVendorId && payload.claimedByVendorId !== profile.id) {
          setClaimLockAlert({
            isOpen: true,
            message: `অর্ডারটি ইতিমধ্যে অন্য ভেন্ডর (${payload.claimedByStoreName || "অন্য দোকান"}) গ্রহণ করেছেন!`,
            claimedByStoreName: payload.claimedByStoreName || "অন্য দোকান",
          });
        }
      } else if (payload.type === "ORDER_CLAIMED_BY_ANOTHER") {
        setClaimLockAlert({
          isOpen: true,
          message: payload.message || "অর্ডারটি ইতিমধ্যে অন্য ভেন্ডর গ্রহণ করেছেন!",
          claimedByStoreName: payload.claimedByStoreName || "অন্য দোকান",
        });
      } else if (payload.type === "PAYOUT_APPROVED") {
        audioAlert.playSuccessSound();
      }
    });

    return () => unsubscribe();
  }, [simulateIncomingOrder, profile.id, setClaimLockAlert]);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/register" ||
    pathname === "/onboarding";

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#050810] text-[#F0F6FF]">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#050810] text-[#F0F6FF]">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <VendorSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#08111E] border-r border-[rgba(255,255,255,0.08)] shadow-2xl">
            <VendorSidebar onClose={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Operational Surface */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#050810]">
        {/* Top Header Bar + Duty Switch Bar */}
        <VendorHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenNotifications={() => setIsNotificationOpen(true)}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 relative overflow-y-auto pb-24 lg:pb-12 bg-[#050810]">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Rider Portal Style) */}
      <VendorMobileNav
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
      />

      {/* Global Modals & Drawers */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* ── Incoming Order Alert Modal with 45s Countdown, Chime & Claim Lockout ── */}
      <IncomingOrderModal
        order={incomingOrderAlert}
        onAccept={acceptOrder}
        onDecline={declineOrder}
        isClaimedByOther={Boolean(claimLockAlert?.isOpen)}
        claimedByStoreName={claimLockAlert?.claimedByStoreName}
      />

      {/* ── Live Rider-Vendor Chat Modal ── */}
      <RiderChatModal
        isOpen={Boolean(chatOrder)}
        onClose={() => setChatOrder(null)}
        orderNumber={chatOrder?.displayId}
        riderName={chatOrder?.riderName}
        riderPhone={chatOrder?.riderPhone}
      />

      {/* ── Live Rider Order Tracking Modal ── */}
      <VendorOrderTrackModal
        isOpen={Boolean(trackingOrder)}
        order={trackingOrder}
        onClose={() => setTrackingOrder(null)}
        onOpenChat={(ord) => setChatOrder(ord)}
      />
    </div>
  );
}
