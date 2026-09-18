// ============================================================
// Tatka Rider — Universal Device & Hardware Bridge
// Seamlessly bridges Web PWA APIs with Capacitor Native Android
// ============================================================

export type VibrationPattern = "ORDER_INCOMING" | "SUCCESS" | "WARNING" | "CLICK";

class DeviceBridge {
  private wakeLockSentinel: any = null;
  private isWakeLockRequested = false;
  private visibilityListenerAttached = false;

  /**
   * Check if running inside native Android / iOS Capacitor Shell
   */
  public isNative(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean((window as any).Capacitor?.isNativePlatform?.());
  }

  /**
   * Check if running as an installed PWA (standalone display mode)
   */
  public isPwa(): boolean {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    );
  }

  // ---------------------------------------------------------------------------
  // 1. Screen Wake Lock (Keeps display on while rider navigates map)
  // ---------------------------------------------------------------------------

  /**
   * Request Screen Wake Lock so screen doesn't turn off during delivery navigation
   */
  public async requestWakeLock(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    this.isWakeLockRequested = true;

    // Attach visibility change listener to re-acquire wake lock if tab is switched back
    if (!this.visibilityListenerAttached && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", async () => {
        if (document.visibilityState === "visible" && this.isWakeLockRequested) {
          await this.acquireWakeLockInternal();
        }
      });
      this.visibilityListenerAttached = true;
    }

    return this.acquireWakeLockInternal();
  }

  private async acquireWakeLockInternal(): Promise<boolean> {
    if (typeof window === "undefined" || !("wakeLock" in navigator)) {
      return false;
    }

    try {
      if (this.wakeLockSentinel && !this.wakeLockSentinel.released) {
        return true;
      }
      this.wakeLockSentinel = await (navigator as any).wakeLock.request("screen");
      this.wakeLockSentinel.addEventListener("release", () => {
        // Released by OS or low battery
      });
      return true;
    } catch (err) {
      console.warn("[DeviceBridge] Screen Wake Lock acquisition failed:", err);
      return false;
    }
  }

  /**
   * Release Screen Wake Lock when delivery task is completed or paused
   */
  public async releaseWakeLock(): Promise<void> {
    this.isWakeLockRequested = false;
    if (this.wakeLockSentinel && !this.wakeLockSentinel.released) {
      try {
        await this.wakeLockSentinel.release();
      } catch {}
      this.wakeLockSentinel = null;
    }
  }

  // ---------------------------------------------------------------------------
  // 2. Haptic Feedback & Vibrations (For Incoming Order, Delivery, & Warnings)
  // ---------------------------------------------------------------------------

  public vibrate(pattern: VibrationPattern): void {
    if (typeof window === "undefined") return;

    // Standard Web Vibration API
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        switch (pattern) {
          case "ORDER_INCOMING":
            // Urgent pulsating rhythm
            navigator.vibrate([600, 200, 600, 200, 1000]);
            break;
          case "SUCCESS":
            // Light double tap
            navigator.vibrate([120, 80, 150]);
            break;
          case "WARNING":
            // Distinct triple buzz
            navigator.vibrate([350, 100, 350, 100, 350]);
            break;
          case "CLICK":
            navigator.vibrate(30);
            break;
        }
      } catch {}
    }
  }

  public stopVibration(): void {
    if (typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }
}

export const deviceBridge = new DeviceBridge();
