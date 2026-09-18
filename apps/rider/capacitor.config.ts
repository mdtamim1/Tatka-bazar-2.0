import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tatkabazar.rider",
  appName: "Tatka Rider",
  webDir: "public",
  server: {
    // In production APK, connects to the live production deployment
    // In local development, can point to http://10.0.2.2:3003 (Android Emulator) or local IP
    url: process.env.CAPACITOR_SERVER_URL || "https://tatka-bazar-2-0-rider-seven.vercel.app",
    cleartext: true,
    androidScheme: "https",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_tatka",
      iconColor: "#16a34a",
      sound: "order_alert.wav",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
