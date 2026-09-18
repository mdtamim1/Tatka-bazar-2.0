"use client";

import { useEffect } from "react";
import { deviceBridge } from "../lib/deviceBridge";

/**
 * React hook to keep screen awake during map navigation / active delivery
 * @param enabled Whether wake lock should currently be held
 */
export function useWakeLock(enabled: boolean = true) {
  useEffect(() => {
    if (enabled) {
      deviceBridge.requestWakeLock();
    } else {
      deviceBridge.releaseWakeLock();
    }

    return () => {
      deviceBridge.releaseWakeLock();
    };
  }, [enabled]);
}
