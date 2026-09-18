"use client";
/**
 * Firebase Cloud Messaging (FCM) Push Notification Hook
 * for Tatka Bazar Rider App
 *
 * Setup steps (one-time):
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Add a Web app, enable Cloud Messaging
 * 3. Copy the config values to .env:
 *    NEXT_PUBLIC_FIREBASE_API_KEY=...
 *    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
 *    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
 *    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
 *    NEXT_PUBLIC_FIREBASE_APP_ID=...
 *    NEXT_PUBLIC_FIREBASE_VAPID_KEY=...  (from FCM > Web config > Generate key pair)
 */

import { useEffect, useState, useCallback } from "react";

export type PushPermissionStatus = "default" | "granted" | "denied" | "unsupported" | "loading";

export interface UsePushNotificationReturn {
  permissionStatus: PushPermissionStatus;
  fcmToken: string | null;
  requestPermission: () => Promise<boolean>;
  isSupported: boolean;
}

const FCM_TOKEN_STORAGE_KEY = "tatka_fcm_token";

export function usePushNotification(riderId: string): UsePushNotificationReturn {
  const [permissionStatus, setPermissionStatus] = useState<PushPermissionStatus>("loading");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  // Register FCM token with our API
  const registerTokenWithApi = useCallback(async (token: string) => {
    if (!riderId) return;
    try {
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId, fcmToken: token, platform: "web" }),
        signal: AbortSignal.timeout(10000),
      });
    } catch (err) {
      console.warn("[FCM] Failed to register token with API:", err);
    }
  }, [riderId]);

  // Initialize Firebase and get token
  const initializeFCM = useCallback(async (): Promise<string | null> => {
    if (!isSupported) return null;

    // Check if Firebase env vars are set
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

    if (!apiKey || !projectId || !messagingSenderId || !appId || !vapidKey) {
      console.warn("[FCM] Firebase env vars not configured. Push notifications disabled.");
      return null;
    }

    try {
      // Lazy import Firebase to avoid loading it if not needed
      // @ts-ignore -- dynamic import resolved at runtime if Firebase package is installed
      const { initializeApp, getApps } = await import("firebase/app");
      // @ts-ignore -- dynamic import resolved at runtime if Firebase package is installed
      const { getMessaging, getToken } = await import("firebase/messaging");

      // Initialize Firebase app (singleton)
      const firebaseConfig = {
        apiKey,
        ...(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? { authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN } : {}),
        projectId,
        storageBucket: `${projectId}.appspot.com`,
        messagingSenderId,
        appId,
      };

      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const messaging = getMessaging(app);

      // Get FCM registration token
      const swReg = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg,
      });

      return token || null;
    } catch (err) {
      console.warn("[FCM] Failed to get token:", err);
      return null;
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setPermissionStatus("unsupported");
      return false;
    }

    setPermissionStatus("loading");

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        setPermissionStatus("granted");
        const token = await initializeFCM();
        if (token) {
          setFcmToken(token);
          localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
          await registerTokenWithApi(token);
        }
        return true;
      } else {
        setPermissionStatus("denied");
        return false;
      }
    } catch (err) {
      console.warn("[FCM] Permission request failed:", err);
      setPermissionStatus("denied");
      return false;
    }
  }, [isSupported, initializeFCM, registerTokenWithApi]);

  // On mount: check existing permission and cached token
  useEffect(() => {
    if (!isSupported) {
      setPermissionStatus("unsupported");
      return;
    }

    const currentPermission = Notification.permission;

    if (currentPermission === "granted") {
      setPermissionStatus("granted");
      // Try to get/refresh token
      const cachedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      if (cachedToken) {
        setFcmToken(cachedToken);
      }
      // Refresh token in background
      initializeFCM().then((token) => {
        if (token) {
          setFcmToken(token);
          localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
          if (riderId) registerTokenWithApi(token);
        }
      });
    } else if (currentPermission === "denied") {
      setPermissionStatus("denied");
    } else {
      setPermissionStatus("default");
    }
  }, [isSupported, riderId, initializeFCM, registerTokenWithApi]);

  return { permissionStatus, fcmToken, requestPermission, isSupported };
}
