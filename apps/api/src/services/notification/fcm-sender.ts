/**
 * Tatka Bazar — Firebase Admin FCM Push Notification Sender
 * Real push dispatch to rider devices via Firebase Cloud Messaging
 *
 * Setup:
 * 1. Firebase Console → Project Settings → Service Accounts → Generate New Private Key
 * 2. Set env vars:
 *    FIREBASE_ADMIN_PROJECT_ID=your-project-id
 *    FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
 *    FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
 */

let _app: any = null;
let _messaging: any = null;
let _initialized = false;

/**
 * Lazy initialize Firebase Admin SDK (singleton)
 */
function getFirebaseMessaging(): any | null {
  if (_initialized) return _messaging;
  _initialized = true;

  const projectId = process.env["FIREBASE_ADMIN_PROJECT_ID"];
  const clientEmail = process.env["FIREBASE_ADMIN_CLIENT_EMAIL"];
  const privateKeyRaw = process.env["FIREBASE_ADMIN_PRIVATE_KEY"];

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.warn("[FCM] Firebase Admin env vars not set — push notifications disabled.");
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const admin = require("firebase-admin");

    if (admin.apps.length === 0) {
      _app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      _app = admin.apps[0];
    }

    _messaging = admin.messaging();
    console.log("[FCM] Firebase Admin SDK initialized ✅");
    return _messaging;
  } catch (err: any) {
    console.error("[FCM] Failed to initialize Firebase Admin:", err.message);
    return null;
  }
}

export interface FcmSendParams {
  tokens: string[];         // FCM registration tokens (multi-device)
  title: string;
  body: string;
  data?: Record<string, string>; // Must be string values for FCM
  imageUrl?: string;
  priority?: "normal" | "high";
}

export interface FcmSendResult {
  successCount: number;
  failureCount: number;
  invalidTokens: string[]; // tokens that should be deactivated
}

/**
 * Send FCM push notification to multiple device tokens
 * Uses Firebase Admin sendEachForMulticast for batched delivery
 */
export async function sendFcmPush(params: FcmSendParams): Promise<FcmSendResult> {
  const messaging = getFirebaseMessaging();

  const result: FcmSendResult = { successCount: 0, failureCount: 0, invalidTokens: [] };

  if (!messaging || params.tokens.length === 0) {
    return result;
  }

  // FCM data values must be strings
  const stringData: Record<string, string> = {};
  if (params.data) {
    for (const [k, v] of Object.entries(params.data)) {
      stringData[k] = String(v);
    }
  }

  try {
    const message = {
      tokens: params.tokens,
      notification: {
        title: params.title,
        body: params.body,
        ...(params.imageUrl ? { imageUrl: params.imageUrl } : {}),
      },
      data: stringData,
      android: {
        priority: (params.priority === "high" ? "high" : "normal") as "high" | "normal",
        notification: {
          channelId: "tatka_rider_notifications",
          priority: "high" as const,
          defaultSound: true,
          defaultVibrateTimings: true,
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          icon: "/icons/icon-192x192.png",
          badge: "/icons/badge-72x72.png",
          vibrate: [200, 100, 200],
        },
        headers: {
          Urgency: params.priority === "high" ? "high" : "normal",
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    result.successCount = response.successCount;
    result.failureCount = response.failureCount;

    // Collect invalid/expired tokens for cleanup
    if (response.responses) {
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          // These error codes indicate the token is permanently invalid
          if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token" ||
            code === "messaging/mismatched-credential"
          ) {
            const token = params.tokens[idx];
            if (token) result.invalidTokens.push(token);
          }
        }
      });
    }

    console.log(`[FCM] Sent: ${result.successCount} success, ${result.failureCount} failed${result.invalidTokens.length > 0 ? `, ${result.invalidTokens.length} invalid tokens` : ""}`);
  } catch (err: any) {
    console.error("[FCM] sendEachForMulticast failed:", err.message);
    result.failureCount = params.tokens.length;
  }

  return result;
}
