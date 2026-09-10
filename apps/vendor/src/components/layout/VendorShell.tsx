"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
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
import VendorSuspendedModal from "@/components/common/VendorSuspendedModal";
import { useVendorSessionGuard } from "@/hooks/useVendorSessionGuard";

export default function VendorShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
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
    updateOrderStatus,
  } = useVendorStore();

  // Real-time Session Guard (Auto-detects Hub suspension and triggers auto-logout)
  const { isSuspended, suspendReason, suspendedAt, handleLogout } = useVendorSessionGuard(
    profile?.id || "",
    profile?.storeName || profile?.storeNameBn
  );

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
        audioAlert.playNewOrderChime();
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
      } else if (payload.type === "RIDER_PICKED_UP" || payload.type === "RIDER_DELIVERED") {
        if (payload.orderId) {
          updateOrderStatus(payload.orderId, "COMPLETED");
          audioAlert.playSuccessSound();
        }
      }
    });

    return () => unsubscribe();
  }, [profile.id, setClaimLockAlert, updateOrderStatus]);

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
    <div className="app-shell">
      {/* Top Header Bar + Duty Switch Bar (Rider Portal Style) */}
      <VendorHeader
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Operational Surface */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Bottom Navigation (Fixed on all screens, Rider Portal Style) */}
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

      {/* ── Unclosable Real-time Vendor Suspension Modal ── */}
      <VendorSuspendedModal
        isOpen={isSuspended}
        storeName={profile?.storeName || profile?.storeNameBn}
        reason={suspendReason}
        suspendedAt={suspendedAt}
        onLogout={handleLogout}
      />
    </div>
  );
}
