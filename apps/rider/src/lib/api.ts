import { emitSyncEvent } from "./sync";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rider_token");
}

export function setToken(token: string) {
  localStorage.setItem("rider_token", token);
}

export function clearToken() {
  localStorage.removeItem("rider_token");
  localStorage.removeItem("rider_user");
}

export function getDutyStatus(): "ONLINE" | "OFFLINE" {
  if (typeof window === "undefined") return "ONLINE";
  return (localStorage.getItem("rider_duty_status") as "ONLINE" | "OFFLINE") || "ONLINE";
}

export function setDutyStatus(status: "ONLINE" | "OFFLINE") {
  if (typeof window === "undefined") return;
  localStorage.setItem("rider_duty_status", status);
  window.dispatchEvent(new CustomEvent("rider_duty_change", { detail: { status } }));
  if (status === "ONLINE") {
    const user = localStorage.getItem("rider_user");
    const name = user ? (JSON.parse(user).name || "রাইডার") : "রাইডার";
    const id = user ? (JSON.parse(user).id || "rider-live") : "rider-live";
    startGPSBroadcast(id, name);
  } else {
    stopGPSBroadcast();
  }
}

// ---------------------------------------------------------------------------
// GPS Live Broadcast (Rider → localStorage → Admin can poll)
// ---------------------------------------------------------------------------
let _gpsWatchId: number | null = null;

export function startGPSBroadcast(riderId: string, riderName: string) {
  if (typeof window === "undefined" || !navigator.geolocation) return;
  // Clear existing watch
  if (_gpsWatchId !== null) {
    navigator.geolocation.clearWatch(_gpsWatchId);
    _gpsWatchId = null;
  }
  _gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      const payload = {
        riderId,
        riderName,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        duty: "ONLINE",
        ts: Date.now(),
      };
      localStorage.setItem(`rider_gps_${riderId}`, JSON.stringify(payload));
      // Notify same-tab listeners
      window.dispatchEvent(new CustomEvent("rider_gps_update", { detail: payload }));

      // Broadcast to Central Fastify API Engine
      const token = getToken();
      fetch(`${API_BASE}/api/riders/live-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          riderId,
          riderName,
          lat: payload.lat,
          lng: payload.lng,
          accuracy: payload.accuracy,
          dutyStatus: "ONLINE",
        }),
      }).catch(() => {});
    },
    (err) => {
      // GPS denied - write a Dhaka fallback so admin map still shows rider
      const payload = {
        riderId,
        riderName,
        lat: 23.8103 + (Math.random() - 0.5) * 0.05,
        lng: 90.4125 + (Math.random() - 0.5) * 0.05,
        accuracy: 9999,
        duty: "ONLINE",
        ts: Date.now(),
        gpsError: err.message,
      };
      localStorage.setItem(`rider_gps_${riderId}`, JSON.stringify(payload));
    },
    { enableHighAccuracy: true, maximumAge: 8000, timeout: 10000 }
  );
}

export function stopGPSBroadcast() {
  if (typeof window === "undefined") return;
  if (_gpsWatchId !== null) {
    navigator.geolocation.clearWatch(_gpsWatchId);
    _gpsWatchId = null;
  }
  // Mark all rider_gps_* entries as OFFLINE
  Object.keys(localStorage)
    .filter((k) => k.startsWith("rider_gps_"))
    .forEach((k) => {
      try {
        const data = JSON.parse(localStorage.getItem(k) || "{}");
        data.duty = "OFFLINE";
        data.ts = Date.now();
        localStorage.setItem(k, JSON.stringify(data));
      } catch {}
    });
}

/** Read all rider GPS pings from localStorage (used by Admin panel) */
export function getAllRiderGPS(): RiderGPSPin[] {
  if (typeof window === "undefined") return [];
  return Object.keys(localStorage)
    .filter((k) => k.startsWith("rider_gps_"))
    .map((k) => {
      try { return JSON.parse(localStorage.getItem(k) || "") as RiderGPSPin; }
      catch { return null; }
    })
    .filter(Boolean) as RiderGPSPin[];
}

export interface RiderGPSPin {
  riderId: string;
  riderName: string;
  lat: number;
  lng: number;
  accuracy?: number;
  duty: "ONLINE" | "OFFLINE";
  ts: number;
  gpsError?: string;
}

// ---------------------------------------------------------------------------
// Client Mock / Fallback Storage (when API backend is offline or on cloud HTTPS)
// ---------------------------------------------------------------------------
const DEFAULT_USER: RiderUser = {
  id: "",
  name: "রাইডার",
  email: "",
  phone: "",
  role: "rider",
};

const DEFAULT_PROFILE: RiderProfile = {
  id: "",
  name: "রাইডার",
  email: "",
  phone: "",
  vehicleType: "MOTORCYCLE",
  vehicleNumber: "",
  status: "AVAILABLE",
  balance: 0,
  totalEarned: 0,
  due: 0,
  kycStatus: "PENDING",
  fatherName: "",
  motherName: "",
  dateOfBirth: "",
  presentAddress: "",
  permanentAddress: "",
  nidNumber: "",
  paymentMethod: "BKASH",
  paymentAccount: "",
  paymentAccountLocked: false,
  createdAt: new Date().toISOString(),
};

const DEFAULT_NOTIFICATIONS: RiderNotification[] = [];

const RIDER_DATA_VERSION = "v5_real_database_auth";

export function checkAndPurgeDemoData() {
  if (typeof window === "undefined") return;
  try {
    const currentVersion = localStorage.getItem("tatka_rider_reset_ver");
    // Purge fake demo tokens and demo user sessions
    const existingToken = localStorage.getItem("rider_token");
    if (existingToken && (existingToken.startsWith("rider-token-") || existingToken.startsWith("demo_"))) {
      localStorage.removeItem("rider_token");
      localStorage.removeItem("rider_user");
    }

    if (currentVersion !== RIDER_DATA_VERSION) {
      // Purge all legacy storage items
      const keysToClear = [
        "rider_token",
        "rider_user",
        "tb_demo_profile",
        "tb_demo_available_tasks",
        "tb_demo_active_tasks",
        "tb_demo_history",
        "tb_demo_tatka_today_completed_orders",
        "tb_demo_tatka_today_returned_orders",
        "tb_demo_deposit_requests",
        "tb_demo_notifications",
        "tatka_today_completed_orders",
        "tatka_today_returned_orders",
        "tatka_rider_today_date",
        "tatka_rider_performance",
        "tatka_chat_task-01",
        "rider_duty_status",
        "rider_active_task",
        "tatka_active_sos",
        "tatka_active_orders",
        "tatka_order_events",
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));

      // Clear all dynamic legacy keys
      Object.keys(localStorage).forEach((k) => {
        if (
          k.startsWith("rider_gps_") ||
          k.startsWith("tb_demo_") ||
          k.startsWith("rider_task_")
        ) {
          localStorage.removeItem(k);
        }
      });

      localStorage.setItem("tatka_rider_available_tasks", JSON.stringify([]));
      localStorage.setItem("tatka_rider_active_tasks", JSON.stringify([]));
      localStorage.setItem("tatka_rider_history", JSON.stringify([]));
      localStorage.setItem("tatka_rider_deposit_requests", JSON.stringify([]));
      localStorage.setItem("rider_duty_status", "OFFLINE");
      localStorage.setItem("tatka_rider_reset_ver", RIDER_DATA_VERSION);
    }
  } catch {}
}

export function fullyResetRiderPanel() {
  if (typeof window === "undefined") return;
  try {
    const keysToClear = [
      "tb_demo_profile",
      "tb_demo_available_tasks",
      "tb_demo_active_tasks",
      "tb_demo_history",
      "tb_demo_tatka_today_completed_orders",
      "tb_demo_tatka_today_returned_orders",
      "tb_demo_deposit_requests",
      "tb_demo_notifications",
      "tatka_today_completed_orders",
      "tatka_today_returned_orders",
      "tatka_rider_today_date",
      "tatka_rider_performance",
      "tatka_chat_task-01",
      "rider_duty_status",
      "rider_active_task",
      "tatka_active_sos",
      "tatka_active_orders",
      "tatka_order_events",
    ];
    keysToClear.forEach((k) => localStorage.removeItem(k));

    Object.keys(localStorage).forEach((k) => {
      if (
        k.startsWith("rider_gps_") ||
        k.startsWith("tb_demo_") ||
        k.startsWith("rider_task_")
      ) {
        localStorage.removeItem(k);
      }
    });

    localStorage.setItem("tatka_rider_available_tasks", JSON.stringify([]));
    localStorage.setItem("tatka_rider_active_tasks", JSON.stringify([]));
    localStorage.setItem("tatka_rider_history", JSON.stringify([]));
    localStorage.setItem("tatka_rider_deposit_requests", JSON.stringify([]));
    localStorage.setItem("rider_duty_status", "OFFLINE");
    localStorage.setItem("tatka_rider_reset_ver", RIDER_DATA_VERSION);
    window.dispatchEvent(new CustomEvent("tatka_rider_reset"));
  } catch {}
}

function getLocalStore<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  checkAndPurgeDemoData();
  try {
    const raw = localStorage.getItem(`tatka_rider_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalStore(key: string, val: any) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`tatka_rider_${key}`, JSON.stringify(val));
  } catch {}
}



export function syncDailyOrdersReset(): {
  todayDate: string;
  completed: TodayCompletedOrder[];
  returned: TodayReturnedOrder[];
} {
  if (typeof window === "undefined") {
    return { todayDate: "", completed: [], returned: [] };
  }
  const today = new Date().toISOString().slice(0, 10);
  const savedDate = localStorage.getItem("tatka_rider_today_date");

  if (savedDate !== today) {
    localStorage.setItem("tatka_rider_today_date", today);
    setLocalStore("tatka_today_completed_orders", []);
    setLocalStore("tatka_today_returned_orders", []);
    return { todayDate: today, completed: [], returned: [] };
  }

  const completed = getLocalStore<TodayCompletedOrder[]>("tatka_today_completed_orders", []);
  const returned = getLocalStore<TodayReturnedOrder[]>("tatka_today_returned_orders", []);
  return { todayDate: today, completed, returned };
}

function handleMockFallback<T>(path: string, options: RequestInit): { success: boolean; data?: T; error?: string } {
  const method = (options.method || "GET").toUpperCase();
  const cleanPath = path.split("?")[0] || "";
  const queryString = path.includes("?") ? (path.split("?")[1] || "") : "";
  const params = new URLSearchParams(queryString);

  // 1. Auth routes should never use mock fallback
  if (cleanPath === "/auth/rider/login" || cleanPath === "/auth/rider/register") {
    return { success: false, error: "রিয়েল সার্ভার সংযোগ ব্যর্থ হয়েছে। সঠিক ডাটাবেজ ক্রেডেনশিয়াল দিয়ে লগইন করুন।" };
  }

  // 3. Balance
  if (cleanPath === "/rider-portal/balance") {
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    const completed = getLocalStore<TodayCompletedOrder[]>("tatka_today_completed_orders", []);
    const todayEarning = completed.reduce((sum, c) => sum + (c.earnings || 0), 0);
    const todayDeliveries = completed.length;
    return {
      success: true,
      data: {
        balance: profile.balance || 0,
        totalEarned: profile.totalEarned || 0,
        todayEarning,
        todayDeliveries,
        weekEarning: todayEarning,
      } as any,
    };
  }

  // 4. Available Tasks
  if (cleanPath === "/rider-portal/tasks" && method === "GET") {
    const tasks = getLocalStore<Task[]>("available_tasks", []);
    return { success: true, data: tasks as any };
  }


  // 5. Active Tasks
  if (cleanPath === "/rider-portal/tasks/active") {
    const activeTasks = getLocalStore<ActiveTask[]>("active_tasks", []);
    return { success: true, data: activeTasks as any };
  }

  // 5b. Today Orders Summary & Auto Daily Reset
  if (cleanPath === "/rider-portal/tasks/today-summary") {
    const { todayDate, completed, returned } = syncDailyOrdersReset();
    const available = getLocalStore<Task[]>("available_tasks", []);
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    const pendingCount = available.length;
    const processingCount = active.length;
    const completedCount = completed.length;
    const returnedCount = returned.length;
    const totalTodayCount = pendingCount + processingCount + completedCount + returnedCount;

    return {
      success: true,
      data: {
        todayDate,
        pendingCount,
        processingCount,
        completedCount,
        returnedCount,
        totalTodayCount,
        todayCompleted: completed,
        todayReturned: returned,
      } as any,
    };
  }

  // 6. Single Task Detail
  if (
    cleanPath.startsWith("/rider-portal/tasks/") &&
    !cleanPath.includes("/today-summary") &&
    !cleanPath.includes("/accept") &&
    !cleanPath.includes("/pickup") &&
    !cleanPath.includes("/transit") &&
    !cleanPath.includes("/cancel-request") &&
    !cleanPath.includes("/approve-cancel") &&
    !cleanPath.includes("/verify-return-code") &&
    !cleanPath.includes("/cancel-return") &&
    !cleanPath.includes("/confirm-return") &&
    !cleanPath.includes("/deliver")
  ) {
    const taskId = cleanPath.split("/").pop();
    const activeList = getLocalStore<ActiveTask[]>("active_tasks", []);
    const matchingActive = activeList.find((a) => a.assignmentId === taskId || a.order.id === taskId);
    if (matchingActive) {
      return {
        success: true,
        data: {
          id: matchingActive.order.id,
          orderNumber: matchingActive.order.orderNumber,
          customerName: matchingActive.order.customerName,
          customerPhone: matchingActive.order.customerPhone,
          deliveryAddress: matchingActive.order.deliveryAddress,
          vendorName: matchingActive.order.vendorName,
          items: matchingActive.order.items || [],
          subtotal: matchingActive.order.subtotal || 0,
          deliveryFee: matchingActive.order.deliveryFee || 0,
          total: matchingActive.order.total || 0,
          earnings: matchingActive.order.earnings || 0,
          paymentStatus: matchingActive.order.paymentStatus || "COD",
          paymentMethod: matchingActive.order.paymentMethod || "CASH_ON_DELIVERY",
          customerDeliveryOtp: matchingActive.customerDeliveryOtp,
        } as any,
      };
    }

    const available = getLocalStore<Task[]>("available_tasks", []);
    const task = available.find((t) => t.id === taskId);
    if (task) {
      return {
        success: true,
        data: {
          id: task.id,
          orderNumber: task.orderNumber,
          customerName: task.customerName,
          customerPhone: task.customerPhone,
          deliveryAddress: task.deliveryAddress,
          vendorName: task.vendorName,
          items: task.items || [],
          subtotal: task.subtotal || 0,
          deliveryFee: task.deliveryFee || 0,
          total: task.total || 0,
          earnings: task.earnings || 0,
          paymentStatus: task.paymentStatus || "COD",
          paymentMethod: task.paymentMethod || "CASH_ON_DELIVERY",
          customerDeliveryOtp: undefined,
        } as any,
      };
    }

    return {
      success: false,
      error: "টাস্ক পাওয়া যায়নি",
    };
  }

  // 7. Accept Task
  if (cleanPath.includes("/accept") && method === "POST") {
    const taskId = cleanPath.split("/")[3];
    const available = getLocalStore<Task[]>("available_tasks", []);
    const accepted = available.find((t) => t.id === taskId);
    if (!accepted) {
      return { success: false, error: "টাস্ক পাওয়া যায়নি বা ইতোমধ্যে অন্য রাইডার গ্রহণ করেছেন" };
    }

    const remaining = available.filter((t) => t.id !== taskId);
    setLocalStore("available_tasks", remaining);

    const deliveryFee = accepted.deliveryFee || 0;
    const earnings = accepted.earnings || Math.round(deliveryFee * 0.5);
    const items = accepted.items || [];
    const subtotal = accepted.subtotal || items.reduce((s, it) => s + (it.total || it.qty * (it.price || 0)), 0);
    const total = accepted.total || (subtotal + deliveryFee);
    const paymentStatus = accepted.paymentStatus || "COD";
    const paymentMethod = accepted.paymentMethod || (paymentStatus === "PAID" ? "BKASH" : "CASH_ON_DELIVERY");
    const customerDeliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

      // Assign realistic Dhaka-area customer delivery coordinates
      const DHAKA_COORDS: Record<string, [number, number]> = {
        "ধানমন্ডি": [23.7461, 90.3742],
        "উত্তরা":   [23.8759, 90.3795],
        "বনশ্রী":   [23.7524, 90.4397],
        "গুলশান":   [23.7808, 90.4147],
        "মিরপুর":   [23.8223, 90.3654],
        "মোহাম্মদপুর": [23.7614, 90.3578],
        "বারিধারা": [23.7968, 90.4246],
        "তেজগাঁও":  [23.7671, 90.3929],
        "মালিবাগ":  [23.7448, 90.4153],
        "শান্তিনগর":[23.7353, 90.4118],
        "বাড্ডা":   [23.7796, 90.4285],
      };
      let customerLat = 23.8103, customerLng = 90.4125;
      const addr = accepted.deliveryAddress || "";
      for (const [area, [lat, lng]] of Object.entries(DHAKA_COORDS)) {
        if (addr.includes(area)) { customerLat = lat; customerLng = lng; break; }
      }
      // Add small random offset so each pin isn't exactly the same
      customerLat += (Math.random() - 0.5) * 0.008;
      customerLng += (Math.random() - 0.5) * 0.008;

      const active = getLocalStore<ActiveTask[]>("active_tasks", []);
      active.push({
        assignmentId: "asgn-" + Date.now(),
        status: "PICKED_UP",
        assignedAt: new Date().toISOString(),
        pickedAt: new Date().toISOString(),
        customerDeliveryOtp,
        customerLat,
        customerLng,
        order: {
          id: accepted.id,
          orderNumber: accepted.orderNumber,
          customerName: accepted.customerName,
          customerPhone: accepted.customerPhone,
          deliveryAddress: accepted.deliveryAddress,
          vendorName: accepted.vendorName,
          items,
          subtotal,
          deliveryFee,
          total,
          earnings,
          paymentStatus,
          paymentMethod,
          hasAccount: accepted.hasAccount ?? true,
        },
      });
      setLocalStore("active_tasks", active);
    return { success: true, data: { message: "Task accepted" } as any };
  }


  // 8a-0. Rider Adds Delivery Note / Status Update
  if (cleanPath.includes("/note") && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const taskId = cleanPath.split("/")[3];
    const noteText = (body.note || body.text || "").trim();
    if (!noteText) {
      return { success: false, error: "নোট খালি রাখা যাবে না" };
    }
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    const idx = active.findIndex((a) => a.assignmentId === taskId || a.order.id === taskId);
    if (idx !== -1 && active[idx]) {
      const user = typeof window !== "undefined" ? localStorage.getItem("rider_user") : null;
      const riderName = body.riderName || (user ? (JSON.parse(user).name || "রাইডার") : "রাইডার");
      if (!active[idx].riderNotes) {
        active[idx].riderNotes = [];
      }
      const noteItem = {
        id: "note-" + Date.now(),
        note: noteText,
        riderName,
        createdAt: new Date().toISOString(),
      };
      active[idx].riderNotes!.push(noteItem);
      active[idx].riderNote = noteText;
      setLocalStore("active_tasks", active);

      // Async sync to admin & dispatch API
      const syncPayload = {
        action: "ADD_NOTE",
        taskId: active[idx].assignmentId,
        orderId: active[idx].order.id,
        orderNumber: active[idx].order.orderNumber,
        note: noteText,
        riderName,
      };
      const targets = [
        "/api/dispatch",
        "https://tatka-bazar-2-0-admin.vercel.app/api/dispatch",
      ];
      targets.forEach(url => {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(syncPayload),
        }).catch(() => {});
      });

      return { success: true, data: { task: active[idx], note: noteItem } as any };
    }
    return { success: false, error: "টাস্ক পাওয়া যায়নি" };
  }

  // 8a. Start Transit / On The Way (Stage 1 -> Stage 2)
  if (cleanPath.includes("/transit") && method === "POST") {
    const taskId = cleanPath.split("/")[3];
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    const idx = active.findIndex((a) => a.assignmentId === taskId || a.order.id === taskId);
    if (idx !== -1 && active[idx]) {
      active[idx].status = "ON_THE_WAY";
      active[idx].transitAt = new Date().toISOString();
      setLocalStore("active_tasks", active);
      return { success: true, data: active[idx] as any };
    }
    return { success: false, error: "টাস্ক পাওয়া যায়নি" };
  }

  // 8b. Rider Sends Cancellation Request to Admin & Local Hub
  if (cleanPath.includes("/cancel-request") && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const taskId = cleanPath.split("/")[3];
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    const idx = active.findIndex((a) => a.assignmentId === taskId || a.order.id === taskId);
    if (idx !== -1 && active[idx]) {
      const returnOtp = active[idx].returnCode || String(Math.floor(1000 + Math.random() * 9000));
      active[idx].status = "CANCELLATION_REQUESTED";
      active[idx].cancellationReason = body.reason || "কাস্টমার পার্সেল রিসিভ করেননি";
      active[idx].cancellationRequestedAt = new Date().toISOString();
      active[idx].hubPhone = "01711-998877";
      active[idx].returnCode = returnOtp;
      setLocalStore("active_tasks", active);

      // add notification
      const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
      notifs.unshift({
        id: "n-cancel-req-" + Date.now(),
        type: "TASK",
        title: "বাতিল অনুরোধ পাঠানো হয়েছে",
        body: `অর্ডার #${active[idx].order.orderNumber}: বাতিলের আবেদন অ্যাডমিনে পাঠানো হয়েছে। প্রয়োজনে হাবে কল দিন (01711-998877)।`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setLocalStore("notifications", notifs);

      return { success: true, data: active[idx] as any };
    }
    return { success: false, error: "টাস্ক পাওয়া যায়নি" };
  }

  // 8c. Admin Approves Cancellation -> Status becomes RETURNING_TO_VENDOR
  if (cleanPath.includes("/approve-cancel") && method === "POST") {
    const taskId = cleanPath.split("/")[3];
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    const idx = active.findIndex((a) => a.assignmentId === taskId || a.order.id === taskId);
    if (idx !== -1 && active[idx]) {
      if (!active[idx].returnCode) {
        active[idx].returnCode = String(Math.floor(1000 + Math.random() * 9000));
      }
      active[idx].status = "RETURNING_TO_VENDOR";
      setLocalStore("active_tasks", active);

      const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
      notifs.unshift({
        id: "n-cancel-appr-" + Date.now(),
        type: "TASK",
        title: "বাতিল আবেদন অনুমোদিত — পার্সেল ফেরত দিন",
        body: `অর্ডার #${active[idx].order.orderNumber}: অ্যাডমিন বাতিল আবেদন অনুমোদন করেছে। পণ্যটি সেলারের দোকানে পৌঁছে দিন।`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setLocalStore("notifications", notifs);

      // Real-time cross-tab sync
      emitSyncEvent({
        type: "CANCELLATION_APPROVED",
        taskId: active[idx].assignmentId,
        message: `অর্ডার #${active[idx].order.orderNumber}: অ্যাডমিন বাতিল আবেদন অনুমোদন করেছে। পণ্যটি সেলারের দোকানে পৌঁছে দিন।`,
      });

      return { success: true, data: active[idx] as any };
    }
    return { success: false, error: "টাস্ক পাওয়া যায়নি" };
  }

  // 8d. Verify Store Return Code (Handover confirmed by Vendor with 4-digit code)
  if (cleanPath.includes("/verify-return-code") && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const taskId = cleanPath.split("/")[3];
    const enteredCode = (body.returnCode || "").toString().trim();
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    const idx = active.findIndex((a) => a.assignmentId === taskId || a.order.id === taskId);
    if (idx !== -1 && active[idx]) {
      const expectedCode = (active[idx].returnCode || "").trim();
      if (!enteredCode || enteredCode !== expectedCode) {
        return {
          success: false,
          error: "❌ ভুল রিটার্ন কোড! দোকানদার পণ্য বুঝে নিয়ে যে ৪-সংখ্যার রিটার্ন কোড দিয়েছেন সেটি লিখুন।",
        };
      }

      const [done] = active.splice(idx, 1);
      setLocalStore("active_tasks", active);

      const returnAllowance = 20; // ৳ ২০ return trip fee
      const profile = getLocalStore("profile", DEFAULT_PROFILE);
      profile.balance = (profile.balance || 0) + returnAllowance;
      profile.totalEarned = (profile.totalEarned || 0) + returnAllowance;
      setLocalStore("profile", profile);

      const allHistory = getLocalStore<HistoryItem[]>("history", []);
      allHistory.unshift({
        id: "h-return-" + Date.now(),
        type: "income",
        amount: returnAllowance,
        orderNumber: done?.order.orderNumber,
        description: `অর্ডার #${done?.order.orderNumber} বাতিল — সেলারকে রিটার্ন সফল (কোড যাচাইকৃত) — ট্রিপ ভাতা`,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      });
      setLocalStore("history", allHistory);

      const todayReturned = getLocalStore<TodayReturnedOrder[]>("tatka_today_returned_orders", []);
      todayReturned.unshift({
        id: "ret-" + Date.now(),
        orderNumber: done?.order.orderNumber || "",
        customerName: done?.order.customerName || "কাস্টমার",
        vendorName: done?.order.vendorName || "সেলার",
        deliveryAddress: done?.order.deliveryAddress || "",
        returnAllowance,
        returnCode: enteredCode || "",
        reason: done?.cancellationReason || "কাস্টমার পার্সেল রিসিভ করেননি",
        returnedAt: new Date().toISOString(),
        itemCount: done?.order.items?.length || 0,
      });
      setLocalStore("tatka_today_returned_orders", todayReturned);

      const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
      notifs.unshift({
        id: "n-return-done-" + Date.now(),
        type: "TASK",
        title: "পার্সেল রিটার্ন কোড যাচাই সফল",
        body: `অর্ডার #${done?.order.orderNumber}: সেলারকে পার্সেল ফেরত কোড যাচাই সম্পন্ন। ৳ ২০ রিটার্ন ট্রিপ ভাতা অ্যাকাউন্টে যোগ হয়েছে। কোনো বিল কর্তন নেই।`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setLocalStore("notifications", notifs);

      return {
        success: true,
        data: {
          returnAllowance,
          cashDeduction: 0,
          message: "দোকানদার কোড যাচাই সফল! রিটার্ন সম্পন্ন হয়েছে।",
        } as any,
      };
    }
    return { success: false, error: "টাস্ক পাওয়া যায়নি" };
  }

  // 8e. Direct Cancel & Initiate Return to Vendor (Legacy/Fallback)
  if (cleanPath.includes("/cancel-return") && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const taskId = cleanPath.split("/")[3];
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    const idx = active.findIndex((a) => a.assignmentId === taskId || a.order.id === taskId);
    if (idx !== -1 && active[idx]) {
      active[idx].status = "RETURNING_TO_VENDOR";
      active[idx].cancellationReason = body.reason || "কাস্টমার পার্সেল রিসিভ করেননি";
      if (!active[idx].returnCode) active[idx].returnCode = String(Math.floor(1000 + Math.random() * 9000));
      setLocalStore("active_tasks", active);
      return { success: true, data: active[idx] as any };
    }
    return { success: false, error: "টাস্ক পাওয়া যায়নি" };
  }

  // 8f. Confirm Return to Vendor (Finances: zero deduction, +৳20 trip fee)
  if (cleanPath.includes("/confirm-return") && method === "POST") {
    const taskId = cleanPath.split("/")[3];
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    const idx = active.findIndex((a) => a.assignmentId === taskId || a.order.id === taskId);
    if (idx !== -1) {
      const [done] = active.splice(idx, 1);
      setLocalStore("active_tasks", active);

      const returnAllowance = 20; // ৳ ২০ return allowance
      const profile = getLocalStore("profile", DEFAULT_PROFILE);
      profile.balance = (profile.balance || 0) + returnAllowance;
      profile.totalEarned = (profile.totalEarned || 0) + returnAllowance;
      setLocalStore("profile", profile);

      const allHistory = getLocalStore<HistoryItem[]>("history", []);
      allHistory.unshift({
        id: "h-return-" + Date.now(),
        type: "income",
        amount: returnAllowance,
        orderNumber: done?.order.orderNumber,
        description: `অর্ডার #${done?.order.orderNumber} বাতিল — সেলারকে রিটার্ন সম্পন্ন (রিটার্ন ট্রিপ ফি)`,
        status: "COMPLETED",
        createdAt: new Date().toISOString(),
      });
      setLocalStore("history", allHistory);

      const todayReturned = getLocalStore<TodayReturnedOrder[]>("tatka_today_returned_orders", []);
      todayReturned.unshift({
        id: "ret-" + Date.now(),
        orderNumber: done?.order.orderNumber || "",
        customerName: done?.order.customerName || "কাস্টমার",
        vendorName: done?.order.vendorName || "সেলার",
        deliveryAddress: done?.order.deliveryAddress || "",
        returnAllowance,
        returnCode: done?.returnCode || "",
        reason: done?.cancellationReason || "কাস্টমার পার্সেল রিসিভ করেননি",
        returnedAt: new Date().toISOString(),
        itemCount: done?.order.items?.length || 0,
      });
      setLocalStore("tatka_today_returned_orders", todayReturned);

      const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
      notifs.unshift({
        id: "n-return-" + Date.now(),
        type: "TASK",
        title: "পার্সেল রিটার্ন সম্পন্ন",
        body: `অর্ডার #${done?.order.orderNumber}: সেলারকে পার্সেল ফেরত দেওয়া হয়েছে। রিটার্ন ট্রিপ ভাতা ৳ ${returnAllowance} আপনার ওয়ালেটে জমা হয়েছে (কোনো বিল কর্তন নেই)।`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setLocalStore("notifications", notifs);

      return {
        success: true,
        data: {
          returnAllowance,
          cashDeduction: 0,
          message: "সেলারকে পণ্য ফেরত সম্পন্ন হয়েছে",
        } as any,
      };
    }
    return { success: false, error: "টাস্ক পাওয়া যায়নি" };
  }

  // 8d. Deliver Task (Handover & Settlement with OTP verification)
  if (cleanPath.includes("/deliver") && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const taskId = cleanPath.split("/")[3];
    const active = getLocalStore<ActiveTask[]>("active_tasks", []);
    let idx = active.findIndex((a) => a.assignmentId === taskId || a.order.id === taskId);
    let earned = 30;
    let orderTotal = 0;
    let cashDeduction = 0;
    let isPaid = false;

    const targetTask = active[idx];
    if (idx !== -1 && targetTask) {
      const expectedOtp = targetTask.customerDeliveryOtp;
      const inputOtp = body.deliveryOtp ? String(body.deliveryOtp).trim() : "";
      const proofNote = body.proofNote ? String(body.proofNote).trim() : "";

      if (expectedOtp && !proofNote) {
        if (!inputOtp || inputOtp !== expectedOtp) {
          return {
            success: false,
            error: "ভুল ডেলিভারি ওটিপি! কাস্টমারের মোবাইলে প্রেরিত ৪-সংখ্যার কোডটি দিন।",
          };
        }
      }

      const [done] = active.splice(idx, 1);
      setLocalStore("active_tasks", active);

      isPaid = done?.order.paymentStatus === "PAID";
      const deliveryFee = Number(done?.order.deliveryFee ?? 60);
      earned = done?.order.earnings ?? Math.round(deliveryFee * 0.5);
      orderTotal = Number(done?.order.total ?? 1450);
      cashDeduction = isPaid ? 0 : orderTotal;

      // update profile balance:
      // + 50% delivery charge added to rider account
      // - total order bill deducted from rider account only if COD (collected cash from customer)
      // - for PAID order, deduction is 0 (customer paid online to company)
      const profile = getLocalStore("profile", DEFAULT_PROFILE);
      profile.balance = profile.balance + earned - cashDeduction;
      profile.totalEarned += earned;
      setLocalStore("profile", profile);

      // add history entries
      const allHistory = getLocalStore<HistoryItem[]>("history", []);
      allHistory.unshift({
        id: "h-" + Date.now(),
        type: "income",
        amount: earned,
        orderNumber: done?.order.orderNumber,
        description: `অর্ডার #${done?.order.orderNumber} ডেলিভারি আয় (৫০% ডেলিভারি ফি)`,
        createdAt: new Date().toISOString(),
      });
      if (!isPaid) {
        allHistory.unshift({
          id: "h-deduct-" + Date.now(),
          type: "withdrawal",
          amount: orderTotal,
          orderNumber: done?.order.orderNumber,
          description: `অর্ডার #${done?.order.orderNumber} সংগৃহীত বিল সমন্বয় (অ্যাকাউন্ট থেকে কর্তন)`,
          status: "COMPLETED",
          createdAt: new Date().toISOString(),
        });
      }
      setLocalStore("history", allHistory);

      // Record in today's completed list
      const todayCompleted = getLocalStore<TodayCompletedOrder[]>("tatka_today_completed_orders", []);
      todayCompleted.unshift({
        id: "comp-" + Date.now(),
        orderNumber: done?.order.orderNumber || "",
        customerName: done?.order.customerName || "কাস্টমার",
        customerPhone: done?.order.customerPhone || "",
        deliveryAddress: done?.order.deliveryAddress || "",
        vendorName: done?.order.vendorName || "ভেন্ডর",
        earnings: earned,
        total: orderTotal,
        paymentStatus: isPaid ? "PAID" : "COD",
        completedAt: new Date().toISOString(),
        deliveryOtp: inputOtp || "",
        itemCount: done?.order.items?.length || 0,
      });
      setLocalStore("tatka_today_completed_orders", todayCompleted);

      // add notification
      const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
      notifs.unshift({
        id: "n-" + Date.now(),
        type: "PAYMENT",
        title: isPaid ? "ডেলিভারি সম্পন্ন — অনলাইন পেইড" : "ডেলিভারি সম্পন্ন ও বিল সমন্বয়",
        body: isPaid
          ? `অর্ডার #${done?.order.orderNumber}: আয় ৳ ${earned} যোগ হয়েছে (অনলাইন পেইড অর্ডার, কোনো কর্তন নেই)`
          : `অর্ডার #${done?.order.orderNumber}: আয় ৳ ${earned} যোগ হয়েছে এবং সংগৃহীত বিল ৳ ${orderTotal} সমন্বয় হয়েছে`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setLocalStore("notifications", notifs);
    }
    return { success: true, data: { earning: earned, orderTotal, cashDeduction, isPaid, message: "ডেলিভারি সম্পন্ন" } as any };
  }

  // 9. Profile / Me
  if (cleanPath === "/rider-portal/me" && method === "GET") {
    const token = getToken();
    if (!token || token.startsWith("rider-token-") || token.startsWith("demo_")) {
      clearToken();
      return { success: false, error: "লগইন প্রয়োজন।" };
    }
    const user = getLocalStore<RiderUser>("user", DEFAULT_USER);
    if (!user.id) {
      clearToken();
      return { success: false, error: "লগইন প্রয়োজন।" };
    }
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    profile.name = user.name || profile.name;
    profile.email = user.email || profile.email;
    profile.phone = user.phone || profile.phone;
    return { success: true, data: profile as any };
  }

  // 10. KYC Submit
  if (cleanPath === "/rider-portal/kyc" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    Object.assign(profile, body, { kycStatus: "SUBMITTED", kycSubmittedAt: new Date().toISOString() });
    setLocalStore("profile", profile);
    return { success: true, data: { kycStatus: "SUBMITTED" } as any };
  }

  // 11. Payment Account
  if (cleanPath === "/rider-portal/payment-account" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    profile.paymentMethod = body.paymentMethod;
    profile.paymentAccount = body.paymentAccount;
    profile.paymentAccountLocked = true;
    setLocalStore("profile", profile);
    return { success: true, data: profile as any };
  }

  // 12. History
  if (cleanPath === "/rider-portal/history") {
    const filterType = params.get("type") || "all";
    const searchQuery = (params.get("q") || "").trim().toLowerCase();
    const allHistory = getLocalStore<HistoryItem[]>("history", []);
    let filtered = filterType === "all" ? allHistory : allHistory.filter((h) => h.type === filterType);
    if (searchQuery) {
      filtered = filtered.filter((h) =>
        (h.orderNumber && h.orderNumber.toLowerCase().includes(searchQuery)) ||
        h.description.toLowerCase().includes(searchQuery) ||
        h.id.toLowerCase().includes(searchQuery)
      );
    }
    return { success: true, data: filtered as any };
  }

  // 13. Deposit / Recharge Request (Sets to PENDING, waiting for Admin approval)
  if (cleanPath === "/rider-portal/deposit" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const amount = Number(body.amount) || 0;
    const lastFour = body.lastFour || "";
    const paymentMethod = body.paymentMethod || "bKash";
    if (!amount || amount <= 0) return { success: false, error: "সঠিক পরিমাণ দিন" };
    if (!lastFour || lastFour.length !== 4) return { success: false, error: "শেষ ৪ সংখ্যা সঠিক নয়" };

    const user = getLocalStore<RiderUser>("user", DEFAULT_USER);
    const profile = getLocalStore<RiderProfile>("profile", DEFAULT_PROFILE);

    // Save deposit request as PENDING. Balance is NOT updated until Admin approves!
    const newDeposit: DepositRequest = {
      id: "dep-" + Date.now(),
      riderId: user.id || profile.id || `rider-${Date.now()}`,
      riderName: profile.name || user.name || "রাইডার",
      riderPhone: profile.phone || user.phone || "",
      amount,
      paymentMethod,
      lastFour,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    const deposits = getLocalStore<DepositRequest[]>("deposit_requests", []);
    deposits.unshift(newDeposit);
    setLocalStore("deposit_requests", deposits);

    // Add notification
    const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
    notifs.unshift({
      id: "n-" + Date.now(),
      type: "PAYMENT",
      title: "ডিপোজিট রিকোয়েস্ট জমা হয়েছে",
      body: `৳ ${amount} (${paymentMethod}) জমার রিকোয়েস্ট অ্যাডমিন অনুমোদনের অপেক্ষায় রয়েছে`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    setLocalStore("notifications", notifs);

    return {
      success: true,
      data: {
        message: "আপনার ডিপোজিট রিকোয়েস্ট জমা হয়েছে। অ্যাডমিন অনুমোদন করার পর ব্যালেন্সে যুক্ত হবে।",
        deposit: newDeposit,
        currentBalance: profile.balance,
      } as any,
    };
  }

  // 13b. Get Deposit Requests History
  if (cleanPath === "/rider-portal/deposits" && method === "GET") {
    const deposits = getLocalStore<DepositRequest[]>("deposit_requests", []);
    return { success: true, data: deposits as any };
  }

  // 13c. Admin Approve / Reject Deposit Handler
  if ((cleanPath.startsWith("/api/riders/deposits") || cleanPath.startsWith("/rider-portal/deposits/")) && (method === "PATCH" || method === "POST")) {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const depositId = cleanPath.split("/").pop();
    const deposits = getLocalStore<DepositRequest[]>("deposit_requests", []);
    const target = deposits.find(d => d.id === depositId);
    if (target) {
      target.status = body.status === "APPROVED" ? "APPROVED" : "REJECTED";
      target.approvedAt = new Date().toISOString();
      target.adminNote = body.adminNote;
      setLocalStore("deposit_requests", deposits);

      if (target.status === "APPROVED") {
        // Increment rider balance only upon approval
        const profile = getLocalStore<RiderProfile>("profile", DEFAULT_PROFILE);
        profile.balance += target.amount;
        setLocalStore("profile", profile);

        // Add to history
        const allHistory = getLocalStore<HistoryItem[]>("history", []);
        allHistory.unshift({
          id: "h-dep-" + Date.now(),
          type: "income",
          amount: target.amount,
          description: `ডিপোজিট অনুমোদন — ৳ ${target.amount} (${target.paymentMethod || "bKash"})`,
          createdAt: new Date().toISOString(),
        });
        setLocalStore("history", allHistory);

        // Add notification
        const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
        notifs.unshift({
          id: "n-" + Date.now(),
          type: "PAYMENT",
          title: "ডিপোজিট অনুমোদিত হয়েছে ✅",
          body: `আপনার ৳ ${target.amount} ডিপোজিট অ্যাডমিন অনুমোদন করেছেন এবং ব্যালেন্সে যোগ হয়েছে`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
        setLocalStore("notifications", notifs);

        emitSyncEvent({
          type: "DEPOSIT_APPROVED",
          amount: target.amount,
          depositId: target.id,
          riderId: target.riderId,
          message: `⚡ আপনার ৳ ${target.amount} ডিপোজিট অনুমোদিত হয়েছে!`,
        });
      } else {
        const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
        notifs.unshift({
          id: "n-" + Date.now(),
          type: "PAYMENT",
          title: "ডিপোজিট বাতিল ❌",
          body: `আপনার ৳ ${target.amount} ডিপোজিট রিকোয়েস্ট অ্যাডমিন বাতিল করেছেন`,
          isRead: false,
          createdAt: new Date().toISOString(),
        });
        setLocalStore("notifications", notifs);

        emitSyncEvent({
          type: "DEPOSIT_REJECTED",
          amount: target.amount,
          depositId: target.id,
          riderId: target.riderId,
          message: `❌ আপনার ৳ ${target.amount} ডিপোজিট বাতিল করা হয়েছে।`,
        });
      }
    }
    return { success: true, data: { message: "ডিপোজিট স্ট্যাটাস আপডেট হয়েছে" } as any };
  }

  // 14. Notifications — GET
  if (cleanPath === "/rider-portal/notifications" && method === "GET") {
    const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
    return { success: true, data: notifs as any };
  }

  // 15. Notifications — Mark all read
  if (cleanPath === "/rider-portal/notifications/read" && method === "POST") {
    const notifs = getLocalStore<RiderNotification[]>("notifications", DEFAULT_NOTIFICATIONS);
    notifs.forEach(n => n.isRead = true);
    setLocalStore("notifications", notifs);
    return { success: true, data: { message: "সব নোটিফিকেশন পড়া হয়েছে" } as any };
  }

  // 15b. Duty Status — GET / POST
  if (cleanPath === "/rider-portal/duty-status") {
    if (method === "POST") {
      let body: any = {};
      try { body = JSON.parse(options.body as string); } catch {}
      const st = body.status === "OFFLINE" ? "OFFLINE" : "ONLINE";
      setDutyStatus(st);
      const profile = getLocalStore("profile", DEFAULT_PROFILE);
      profile.status = st === "ONLINE" ? "AVAILABLE" : "OFFLINE";
      setLocalStore("profile", profile);
      return { success: true, data: { status: st } as any };
    }
    return { success: true, data: { status: getDutyStatus() } as any };
  }

  // 16. Withdraw Request
  if (cleanPath === "/rider-portal/withdraw" && method === "POST") {
    let body: any = {};
    try { body = JSON.parse(options.body as string); } catch {}
    const profile = getLocalStore("profile", DEFAULT_PROFILE);
    const amount = Number(body.amount) || 500;
    if (profile.balance >= amount) {
      profile.balance -= amount;
      setLocalStore("profile", profile);
    }
    return { success: true, data: { message: "উইথড্রয়াল রিকোয়েস্ট জমা হয়েছে" } as any };
  }

  if (cleanPath.includes("tasks") || cleanPath.includes("history")) {
    return { success: true, data: [] as any };
  }

  return { success: true, data: {} as any };
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string; message?: string }> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const method = (options.method || "GET").toUpperCase();

  // 1. Cross-App Dispatch Sync for Tasks (Vercel serverless & local)
  // Tries own /api/dispatch first, then falls back to vendor's Vercel endpoint
  if (path === "/rider-portal/tasks" && method === "GET") {
    const dispatchEndpoints = [
      `${API_BASE}/api/dispatch/tasks`,
      `${API_BASE}/api/dispatch`,
      "/api/dispatch",
      "https://tatka-bazar-2-0-rider-seven.vercel.app/api/dispatch",
    ];
    for (const endpoint of dispatchEndpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const dispatchRes = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (dispatchRes.ok) {
          const dispatchJson = await dispatchRes.json();
          if (dispatchJson.success && Array.isArray(dispatchJson.data)) {
            const localTasks = getLocalStore<Task[]>("available_tasks", []);
            const merged: Task[] = [...(dispatchJson.data as Task[])];
            for (const lt of localTasks) {
              if (!merged.some((m) => m.id === lt.id || m.orderNumber === lt.orderNumber)) {
                merged.push(lt);
              }
            }
            setLocalStore("available_tasks", merged);
            return { success: true, data: merged as any };
          }
        }
      } catch {}
    }
  }

  // 2. Cross-App Dispatch Claim & Lifecycle Sync (Notify /api/dispatch when rider acts)
  if (path.includes("/accept") && method === "POST") {
    const taskId = path.split("/")[3];
    if (taskId) {
      const userProfile = getLocalStore("profile", DEFAULT_PROFILE);
      const riderPayload = {
        action: "CLAIM",
        taskId,
        riderId: userProfile.id || `rider-${Date.now()}`,
        riderName: userProfile.name ? `${userProfile.name}` : "রাইডার",
        riderPhone: userProfile.phone || "",
        riderVehicle: `${userProfile.vehicleType === "MOTORCYCLE" ? "মোটরসাইকেল" : "বাইক"}${userProfile.vehicleNumber ? ` (${userProfile.vehicleNumber})` : ""}`,
        riderTier: "রাইডার",
      };
      const targets = [
        `${API_BASE}/api/dispatch/tasks/${taskId}/claim`,
        `${API_BASE}/api/dispatch`,
        "/api/dispatch",
        "https://tatka-bazar-2-0-vendor.vercel.app/api/dispatch",
        "https://tatka-bazar-2-0-admin.vercel.app/api/dispatch",
        "https://hub-gamma-umber.vercel.app/api/dispatch",
        "http://localhost:3006/api/dispatch",
      ];
      targets.forEach((url) => {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(riderPayload),
        }).catch(() => {});
      });
    }
  }

  // 3. Cross-App Handover / Parcel Pickup Sync (Parcel picked up from vendor -> Transit)
  if (path.includes("/transit") && method === "POST") {
    const taskId = path.split("/")[3];
    if (taskId) {
      const payload = { action: "STATUS_UPDATE", taskId, status: "ON_THE_WAY" };
      const targets = [
        "/api/dispatch",
        "https://tatka-bazar-2-0-vendor.vercel.app/api/dispatch",
        "https://tatka-bazar-2-0-admin.vercel.app/api/dispatch",
        "https://hub-gamma-umber.vercel.app/api/dispatch",
        "http://localhost:3006/api/dispatch",
      ];
      targets.forEach((url) => {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      });

      // Cross-tab direct broadcast to vendor portal
      try {
        if (typeof window !== "undefined") {
          const syncEvt = {
            type: "RIDER_PICKED_UP",
            orderId: taskId,
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem("tatka_sync_broadcast", JSON.stringify(syncEvt));
          window.dispatchEvent(new CustomEvent("tatka_sync_event", { detail: syncEvt }));
          try {
            const ch = new BroadcastChannel("tatka_vendor_realtime_sync_channel");
            ch.postMessage(syncEvt);
            ch.close();
          } catch {}
        }
      } catch {}
    }
  }

  // 4. Cross-App Delivery Completion Sync
  if (path.includes("/deliver") && method === "POST") {
    const taskId = path.split("/")[3];
    if (taskId) {
      const payload = { action: "STATUS_UPDATE", taskId, status: "DELIVERED" };
      const targets = [
        `${API_BASE}/api/dispatch/tasks/${taskId}/deliver`,
        `${API_BASE}/api/dispatch`,
        "/api/dispatch",
        "https://tatka-bazar-2-0-vendor.vercel.app/api/dispatch",
        "https://tatka-bazar-2-0-admin.vercel.app/api/dispatch",
        "https://hub-gamma-umber.vercel.app/api/dispatch",
        "http://localhost:3006/api/dispatch",
      ];
      targets.forEach((url) => {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      });
    }
  }

  // 5. Cross-App Return Sync
  if ((path.includes("/confirm-return") || path.includes("/verify-return-code")) && method === "POST") {
    const taskId = path.split("/")[3];
    if (taskId) {
      const payload = { action: "STATUS_UPDATE", taskId, status: "RETURNED" };
      const targets = [
        "/api/dispatch",
        "https://tatka-bazar-2-0-vendor.vercel.app/api/dispatch",
        "https://tatka-bazar-2-0-admin.vercel.app/api/dispatch",
        "https://hub-gamma-umber.vercel.app/api/dispatch",
        "http://localhost:3006/api/dispatch",
      ];
      targets.forEach((url) => {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {});
      });
    }
  }

  const isInternalRoute =
    path.startsWith("/api/") ||
    path.startsWith("/auth/rider/") ||
    path.startsWith("/rider-portal/");

  const targetUrl = isInternalRoute
    ? (path.startsWith("/api/") ? path : `/api${path}`)
    : `${API_BASE}${path}`;

  try {
    const res = await fetch(targetUrl, { ...options, headers });
    const json = await res.json();
    if (res.status === 401) {
      clearToken();
    }
    return json;
  } catch {
    if (isInternalRoute) {
      return { success: false, error: "ডাটাবেজ সার্ভারে সংযোগ ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।" };
    }
    // Graceful fallback to offline local state on network failure or offline backend
    return handleMockFallback<T>(path, options);
  }
}

export async function login(email: string, password: string) {
  const res = await apiFetch<{ accessToken: string; user: RiderUser }>("/auth/rider/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (res.success && res.data) {
    setToken(res.data.accessToken);
    localStorage.setItem("rider_user", JSON.stringify(res.data.user));
  }
  return res;
}

export async function registerRider(data: {
  name: string;
  phone: string;
  email?: string | undefined;
  password: string;
  vehicleType?: "BICYCLE" | "MOTORCYCLE" | "VAN" | undefined;
}) {
  const res = await apiFetch<{ accessToken: string; user: RiderUser }>("/auth/rider/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (res.success && res.data) {
    setToken(res.data.accessToken);
    localStorage.setItem("rider_user", JSON.stringify(res.data.user));
  }
  return res;
}

export interface RiderUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface BalanceData {
  balance: number;
  totalEarned: number;
  todayEarning: number;
  todayDeliveries: number;
  weekEarning: number;
}

export interface TaskItem {
  name: string;
  qty: number;
  price?: number;
  total?: number;
}

export interface Task {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  vendorName: string;
  itemCount: number;
  subtotal?: number;
  deliveryFee?: number;
  total: number;
  earnings: number;
  paymentStatus?: "PAID" | "COD";
  paymentMethod?: string;
  hasAccount?: boolean | undefined;
  items?: TaskItem[];
  createdAt: string;
}

export type DeliveryStage =
  | "ASSIGNED"
  | "PICKED_UP"
  | "ON_THE_WAY"
  | "CANCELLATION_REQUESTED"
  | "RETURNING_TO_VENDOR"
  | "DELIVERED"
  | "CANCELLED_RETURNED";

export interface RiderNoteItem {
  id?: string;
  note: string;
  riderName?: string;
  createdAt: string;
}

export interface ActiveTask {
  assignmentId: string;
  status: DeliveryStage | string;
  assignedAt: string;
  pickedAt?: string | undefined;
  transitAt?: string | undefined;
  deliveredAt?: string | undefined;
  returnedAt?: string | undefined;
  cancellationReason?: string | undefined;
  cancellationRequestedAt?: string | undefined;
  hubPhone?: string | undefined;
  returnCode?: string | undefined;
  returnTripFee?: number | undefined;
  customerDeliveryOtp?: string | undefined;
  deliveryProofNote?: string | undefined;
  riderNotes?: RiderNoteItem[] | undefined;
  riderNote?: string | undefined;
  /** Customer's pinned GPS delivery coordinates (from checkout map/GPS) */
  customerLat?: number | undefined;
  customerLng?: number | undefined;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    vendorName: string;
    items: TaskItem[];
    subtotal?: number | undefined;
    deliveryFee?: number | undefined;
    total?: number | undefined;
    earnings: number;
    paymentStatus?: "PAID" | "COD" | undefined;
    paymentMethod?: string | undefined;
    hasAccount?: boolean | undefined;
  };
}

export interface RiderNotification {
  id: string;
  type: "TASK" | "PAYMENT" | "SYSTEM";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  amount: number;
  paymentMethod?: string;
  lastFour: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  approvedAt?: string;
  adminNote?: string;
}

export interface HistoryItem {
  id: string;
  type: "income" | "withdrawal";
  amount: number;
  description: string;
  orderNumber?: string | undefined;
  status?: string | undefined;
  createdAt: string;
}

export interface TodayCompletedOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  vendorName: string;
  earnings: number;
  total: number;
  paymentStatus: "PAID" | "COD";
  completedAt: string;
  deliveryOtp?: string;
  itemCount?: number;
}

export interface TodayReturnedOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  vendorName: string;
  deliveryAddress?: string;
  returnAllowance: number;
  returnCode: string;
  reason?: string;
  returnedAt: string;
  itemCount?: number;
}

export interface TodayOrdersSummary {
  todayDate: string;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  returnedCount: number;
  totalTodayCount: number;
  todayCompleted: TodayCompletedOrder[];
  todayReturned: TodayReturnedOrder[];
}

export interface RiderProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  vehicleNumber?: string;
  status: string;
  balance: number;
  totalEarned: number;
  kycStatus: string;
  kycSubmittedAt?: string;
  kycApprovedAt?: string;
  fatherName?: string;
  motherName?: string;
  dateOfBirth?: string;
  presentAddress?: string;
  permanentAddress?: string;
  nidNumber?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  photoUrl?: string;
  paymentMethod?: string;
  paymentAccount?: string;
  paymentAccountLocked?: boolean;
  due?: number;
  createdAt: string;
}

// ─── Chat System ────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  channelId: string;
  sender: "RIDER" | "CUSTOMER" | "SUPPORT";
  senderName: string;
  text: string;
  timestamp: string;
}

export function getChatMessages(channelId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`tatka_chat_${channelId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function sendChatMessage(
  channelId: string,
  sender: "RIDER" | "CUSTOMER" | "SUPPORT",
  senderName: string,
  text: string
): ChatMessage {
  const current = getChatMessages(channelId);
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    channelId,
    sender,
    senderName,
    text,
    timestamp: new Date().toISOString(),
  };
  const updated = [...current, newMsg];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`tatka_chat_${channelId}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("tatka_chat_updated", { detail: { channelId, message: newMsg } }));

      // Sync across Vercel cloud dispatch endpoints
      const endpoints = [
        "/api/dispatch",
        "https://tatka-bazar-2-0-vendor.vercel.app/api/dispatch",
      ];
      endpoints.forEach((url) => {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "SEND_CHAT",
            orderId: channelId,
            sender: sender === "RIDER" ? "RIDER" : "VENDOR",
            senderName,
            text,
          }),
        }).catch(() => {});
      });
    } catch {}
  }
  return newMsg;
}

// ─── Emergency SOS System ───────────────────────────────────────────────────

export interface SosAlert {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  lat: number;
  lng: number;
  status: "ACTIVE" | "RESOLVED";
  triggeredAt: string;
  reason?: string;
}

const SOS_STORAGE_KEY = "tatka_active_sos_alerts";

export function getActiveSosAlerts(): SosAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SOS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function getRiderActiveSos(riderId: string): SosAlert | null {
  const alerts = getActiveSosAlerts();
  return alerts.find(a => a.riderId === riderId && a.status === "ACTIVE") || null;
}

export function triggerSosAlert(data: {
  riderId: string;
  riderName: string;
  riderPhone: string;
  lat: number;
  lng: number;
  reason?: string;
}): SosAlert {
  const alerts = getActiveSosAlerts().filter(a => a.riderId !== data.riderId);
  const newAlert: SosAlert = {
    id: `sos-${Date.now()}`,
    riderId: data.riderId,
    riderName: data.riderName,
    riderPhone: data.riderPhone,
    lat: data.lat,
    lng: data.lng,
    status: "ACTIVE",
    triggeredAt: new Date().toISOString(),
    ...(data.reason !== undefined ? { reason: data.reason } : {}),
  };
  alerts.unshift(newAlert);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(alerts));
      window.dispatchEvent(new CustomEvent("tatka_sos_alert_change", { detail: { alert: newAlert } }));
    } catch {}
  }
  return newAlert;
}

export function resolveSosAlert(riderId: string): void {
  const alerts = getActiveSosAlerts();
  const updated = alerts.map(a => {
    if (a.riderId === riderId) return { ...a, status: "RESOLVED" as const };
    return a;
  }).filter(a => a.status === "ACTIVE"); // keep active ones in the list
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("tatka_sos_alert_change", { detail: { riderId, resolved: true } }));
    } catch {}
  }
}

// ─── Ratings & Performance Tier System ──────────────────────────────────────

export interface RiderReview {
  id: string;
  customerName: string;
  area: string;
  rating: number;
  comment: string;
  date: string;
  orderNumber: string;
}

export interface RiderPerformance {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  tierTitleBn: string;
  tierBadgeEmoji: string;
  tierPerkBn: string;
  totalDeliveries: number;
  rating: number;
  totalRatings: number;
  onTimeRate: number;
  acceptanceRate: number;
  cancellationRate: number;
  nextTierTarget?: {
    targetTier: string;
    deliveriesNeeded: number;
    minRating: number;
  };
  starsBreakdown: {
    star5: number;
    star4: number;
    star3: number;
    star2: number;
    star1: number;
  };
  recentReviews: RiderReview[];
}

export const DEFAULT_PERFORMANCE: RiderPerformance = {
  tier: "BRONZE",
  tierTitleBn: "ব্রোঞ্জ রাইডার (Bronze Rider)",
  tierBadgeEmoji: "🥉",
  tierPerkBn: "বেসিক কমিশন + স্ট্যান্ডার্ড রাইডার সাপোর্ট",
  totalDeliveries: 0,
  rating: 5.0,
  totalRatings: 0,
  onTimeRate: 100,
  acceptanceRate: 100,
  cancellationRate: 0,
  starsBreakdown: {
    star5: 0,
    star4: 0,
    star3: 0,
    star2: 0,
    star1: 0,
  },
  recentReviews: [],
};

export function getPerformanceData(): RiderPerformance {
  if (typeof window === "undefined") return DEFAULT_PERFORMANCE;
  try {
    const raw = localStorage.getItem("tatka_rider_performance");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_PERFORMANCE;
}
