"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { subscribeSyncEvent } from "@/lib/sync";
import { audioAlert } from "@/utils/audioAlert";

interface VendorSuspensionState {
  isSuspended: boolean;
  reason?: string | undefined;
  suspendedAt?: string | undefined;
}

export function useVendorSessionGuard(vendorId: string, storeName?: string) {
  const router = useRouter();
  const [suspension, setSuspension] = useState<VendorSuspensionState>({ isSuspended: false });
  const hasTriggeredRef = useRef(false);

  const triggerSuspension = useCallback(
    (reason?: string, suspendedAt?: string) => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;

      try {
        audioAlert.playAlertSound();
      } catch {}

      setSuspension({
        isSuspended: true,
        reason: reason || "Hub অ্যাডমিন কর্তৃক আপনার ভেন্ডর শপ সাময়িকভাবে স্থগিত (Suspended) করা হয়েছে।",
        suspendedAt: suspendedAt || new Date().toISOString(),
      });
    },
    []
  );

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("vendor_token");
      localStorage.removeItem("vendor_user");
    } catch {}

    const reasonParam = encodeURIComponent(
      suspension.reason || "অ্যাকাউন্ট স্থগিত করা হয়েছে"
    );
    router.replace(`/login?reason=suspended&message=${reasonParam}`);
  }, [router, suspension.reason]);

  // 1. Listen to real-time sync broadcast events
  useEffect(() => {
    const unsubscribe = subscribeSyncEvent((payload) => {
      if (payload.type === "VENDOR_SUSPENDED") {
        if (!payload.vendorId || payload.vendorId === vendorId || vendorId === "vnd-dhaka-089") {
          triggerSuspension(payload.suspendReason, payload.suspendedAt);
        }
      }
    });

    return () => unsubscribe();
  }, [vendorId, triggerSuspension]);

  // 2. Periodic status check (heartbeat guard every 10 seconds)
  useEffect(() => {
    if (!vendorId || suspension.isSuspended) return;

    let isMounted = true;

    async function checkStatus() {
      // 1. Local vendor server events
      try {
        const localRes = await fetch(`/api/sync/events?vendorId=${encodeURIComponent(vendorId)}`);
        if (localRes.ok) {
          const json = await localRes.json();
          if (json.isSuspended && isMounted) {
            triggerSuspension(json.data?.suspendReason, json.data?.suspendedAt);
            return;
          }
        }
      } catch {}

      // 2. Check Hub public status (Vercel Hub cloud first, then local)
      const hubBases = [
        process.env.NEXT_PUBLIC_HUB_URL || "https://hub-gamma-umber.vercel.app",
        "http://localhost:3004",
      ];
      for (const base of hubBases) {
        try {
          const hubUrl = `${base}/api/public/status?type=vendor&id=${encodeURIComponent(vendorId)}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const hubRes = await fetch(hubUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (hubRes.ok) {
            const hubJson = await hubRes.json();
            if (hubJson.success && hubJson.data?.isSuspended && isMounted) {
              triggerSuspension(hubJson.data.suspendReason, hubJson.data.suspendedAt);
              break;
            }
          }
        } catch {}
      }
    }

    const initialTimer = setTimeout(checkStatus, 2000);
    const interval = setInterval(checkStatus, 10000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [vendorId, suspension.isSuspended, triggerSuspension]);

  return {
    isSuspended: suspension.isSuspended,
    suspendReason: suspension.reason,
    suspendedAt: suspension.suspendedAt,
    handleLogout,
  };
}
