import { NextRequest, NextResponse } from "next/server";
import { verifyVendorToken } from "@/lib/jwt";
import {
  getTasks,
  saveTasks,
  getChatMessages,
  addChatMessage,
  resetDispatch,
} from "@/lib/dispatchStore";

export const dynamic = "force-dynamic";

// 🔒 Shared secret for internal Hub-to-Vendor cross-portal calls.
// Set INTERNAL_API_SECRET in .env on both Hub and Vendor portals.
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_STOREFRONT_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Internal-Secret",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Verifies that the caller is either:
 *   1. A valid vendor JWT, OR
 *   2. A trusted internal portal (Hub/Rider) using the INTERNAL_API_SECRET header.
 */
function isAuthorized(req: NextRequest): boolean {
  // Internal portal-to-portal calls (Hub dispatching to Vendor)
  const internalSecret = req.headers.get("x-internal-secret");
  if (INTERNAL_API_SECRET && internalSecret === INTERNAL_API_SECRET) {
    return true;
  }

  // Standard vendor JWT auth
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (token) {
    const payload = verifyVendorToken(token);
    if (payload) return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  // 🔒 READ operations require auth too (dispatch list contains customer data)
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "অননুমোদিত অনুরোধ।" },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const all = searchParams.get("all");
  const chatOrderId = searchParams.get("chatOrderId");

  if (chatOrderId) {
    const messages = await getChatMessages(chatOrderId);
    return NextResponse.json({ success: true, messages }, { headers: CORS_HEADERS });
  }

  const tasks = await getTasks();

  if (orderId) {
    const single = tasks.find((t: any) => t.id === orderId || t.orderNumber === orderId);
    return NextResponse.json({ success: true, task: single || null }, { headers: CORS_HEADERS });
  }

  if (all === "true") {
    return NextResponse.json(
      { success: true, data: tasks, total: tasks.length },
      { headers: CORS_HEADERS }
    );
  }

  const pendingTasks = tasks.filter((t: any) => !t.claimed && t.status === "READY_FOR_PICKUP");
  return NextResponse.json(
    { success: true, data: pendingTasks, total: pendingTasks.length },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: NextRequest) {
  // 🔒 All write operations require authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, error: "অননুমোদিত অনুরোধ।" },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || (body.task ? "READY_FOR_PICKUP" : "READY_FOR_PICKUP");
    // Tasks fetched per-action via Redis-backed getTasks()

    // 1. Ready For Pickup (Vendor adds new order to dispatch queue)
    if (action === "READY_FOR_PICKUP") {
      const taskData = body.task || body;
      if (!taskData.id) {
        return NextResponse.json(
          { success: false, error: "Task id is required" },
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const newTask = {
        id: taskData.id,
        orderNumber: taskData.orderNumber || taskData.displayId || `TB-${taskData.id.replace(/\D/g, "") || "1001"}`,
        customerName: taskData.customerName || "সম্মানিত গ্রাহক",
        customerPhone: taskData.customerPhone || "",
        deliveryAddress: taskData.deliveryAddress || (taskData.deliveryZone ? `${taskData.deliveryZone}, ঢাকা` : "ঢাকা"),
        vendorName: taskData.vendorName || "তাতকা ভেন্ডর",
        vendorPhone: taskData.vendorPhone || "",
        itemCount: taskData.itemCount || (Array.isArray(taskData.items) ? taskData.items.length : 0),
        subtotal: Number(taskData.subtotal) || Number(taskData.grossTotal) || 0,
        deliveryFee: Number(taskData.deliveryFee) || 0,
        total: Number(taskData.total) || Number(taskData.grossTotal) || 0,
        earnings: Number(taskData.earnings) || 0,
        paymentStatus: taskData.paymentStatus || "COD",
        paymentMethod: taskData.paymentMethod || "CASH_ON_DELIVERY",
        items: Array.isArray(taskData.items) ? taskData.items : [],
        createdAt: taskData.createdAt || new Date().toISOString(),
        status: "READY_FOR_PICKUP",
        claimed: false,
        claimedBy: null,
        riderName: null,
        riderPhone: null,
        riderVehicle: null,
        pickedUpFromStore: false,
      };

      const tasks = await getTasks();
      const filtered = tasks.filter((t: any) => t.id !== newTask.id);
      filtered.unshift(newTask);
      await saveTasks(filtered);

      return NextResponse.json(
        {
          success: true,
          message: `অর্ডার #${newTask.orderNumber} সফলভাবে রাইডার ডিসপ্যাচ লাইনে যুক্ত হয়েছে!`,
          task: newTask,
        },
        { headers: CORS_HEADERS }
      );
    }

    // 2. Claim (Rider accepts order)
    if (action === "CLAIM") {
      const targetId = body.taskId || body.orderId;
      const riderId = body.riderId || "";
      const riderName = body.riderName || "রাইডার";
      const riderPhone = body.riderPhone || "";
      const riderVehicle = body.riderVehicle || "";
      const riderTier = body.riderTier || "";

      const tasks = await getTasks();
      const idx = tasks.findIndex((t: any) => t.id === targetId || t.orderNumber === targetId);
      if (idx !== -1 && tasks[idx]) {
        tasks[idx].claimed = true;
        tasks[idx].status = "ASSIGNED";
        tasks[idx].riderId = riderId;
        tasks[idx].riderName = riderName;
        tasks[idx].riderPhone = riderPhone;
        tasks[idx].riderVehicle = riderVehicle;
        tasks[idx].riderTier = riderTier;
        tasks[idx].pickedUpFromStore = false;
        tasks[idx].claimedBy = {
          riderId,
          riderName,
          riderPhone,
          riderVehicle,
          riderTier,
          claimedAt: new Date().toISOString(),
        };
        await saveTasks(tasks);

        return NextResponse.json(
          {
            success: true,
            message: `টাস্ক ${riderName} কর্তৃক সফলভাবে গ্রহণ করা হয়েছে!`,
            task: tasks[idx],
          },
          { headers: CORS_HEADERS }
        );
      }

      return NextResponse.json(
        { success: false, error: "টাস্ক পাওয়া যায়নি অথবা ইতিমধ্যে অন্য রাইডার গ্রহণ করেছেন।" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // 3. Status Update
    if (action === "STATUS_UPDATE" || action === "HANDOVER" || action === "PICKUP") {
      const targetId = body.taskId || body.orderId;
      const newStatus =
        action === "HANDOVER" || action === "PICKUP"
          ? "ON_THE_WAY"
          : body.status || "ON_THE_WAY";

      const tasks = await getTasks();
      const idx = tasks.findIndex((t: any) => t.id === targetId || t.orderNumber === targetId);

      if (idx !== -1 && tasks[idx]) {
        tasks[idx].status = newStatus;
        if (newStatus === "ON_THE_WAY") {
          tasks[idx].pickedUpFromStore = true;
          tasks[idx].pickedAt = new Date().toISOString();
        } else if (newStatus === "DELIVERED") {
          tasks[idx].deliveredAt = new Date().toISOString();
        } else if (newStatus === "RETURNED") {
          tasks[idx].returnedAt = new Date().toISOString();
        }
        await saveTasks(tasks);

        return NextResponse.json(
          {
            success: true,
            message: `টাস্ক স্ট্যাটাস '${newStatus}' হিসেবে আপডেট হয়েছে।`,
            task: tasks[idx],
          },
          { headers: CORS_HEADERS }
        );
      }

      return NextResponse.json(
        { success: false, error: "টাস্ক পাওয়া যায়নি" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // 4. Send Chat Message between Vendor and Rider
    if (action === "SEND_CHAT") {
      const orderId = body.orderId || "";
      const message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: body.sender || "VENDOR",
        senderName: body.senderName || (body.sender === "RIDER" ? "রাইডার" : "ভেন্ডর"),
        text: body.text || "",
        timestamp: new Date().toISOString(),
      };

      await addChatMessage(orderId, message);
      return NextResponse.json({ success: true, message }, { headers: CORS_HEADERS });
    }

    // 5. Reset — 🔒 REQUIRES internal secret (Hub/Admin only, not vendor JWT)
    if (action === "RESET") {
      const internalSecret = request.headers.get("x-internal-secret");
      if (!INTERNAL_API_SECRET || internalSecret !== INTERNAL_API_SECRET) {
        return NextResponse.json(
          { success: false, error: "রিসেট অপারেশনের জন্য Hub-লেভেল অনুমোদন প্রয়োজন।" },
          { status: 403, headers: CORS_HEADERS }
        );
      }
      await resetDispatch();
      return NextResponse.json(
        { success: true, message: "ডিসপ্যাচ কিউ সফলভাবে রিসেট করা হয়েছে।" },
        { headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
