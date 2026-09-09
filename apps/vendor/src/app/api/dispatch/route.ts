import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Global in-memory queue to survive invocations on warm serverless instances
const globalScope = globalThis as unknown as {
  _tatka_dispatch_tasks?: any[];
  _tatka_chat_messages?: Record<string, any[]>;
};

if (!globalScope._tatka_dispatch_tasks) {
  globalScope._tatka_dispatch_tasks = [];
}
if (!globalScope._tatka_chat_messages) {
  globalScope._tatka_chat_messages = {};
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const all = searchParams.get("all");
  const chatOrderId = searchParams.get("chatOrderId");

  // If requesting chat messages
  if (chatOrderId) {
    const messages = globalScope._tatka_chat_messages?.[chatOrderId] || [];
    return NextResponse.json(
      { success: true, messages },
      { headers: CORS_HEADERS }
    );
  }

  const tasks = globalScope._tatka_dispatch_tasks || [];

  if (orderId) {
    const single = tasks.find((t: any) => t.id === orderId || t.orderNumber === orderId);
    return NextResponse.json(
      { success: true, task: single || null },
      { headers: CORS_HEADERS }
    );
  }

  // Return all tasks if requested (for vendor sync)
  if (all === "true") {
    return NextResponse.json(
      { success: true, data: tasks, total: tasks.length },
      { headers: CORS_HEADERS }
    );
  }

  // Return unassigned / ready-for-pickup tasks
  const pendingTasks = tasks.filter((t: any) => !t.claimed && t.status === "READY_FOR_PICKUP");

  return NextResponse.json(
    { success: true, data: pendingTasks, total: pendingTasks.length },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || (body.task ? "READY_FOR_PICKUP" : "READY_FOR_PICKUP");
    const tasks = globalScope._tatka_dispatch_tasks || [];

    // 1. Ready For Pickup (Vendor adds new order)
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

      const filtered = tasks.filter((t: any) => t.id !== newTask.id);
      filtered.unshift(newTask);
      globalScope._tatka_dispatch_tasks = filtered;

      return NextResponse.json(
        {
          success: true,
          message: `অর্ডার #${newTask.orderNumber} সফলভাবে রাইডার ডিসপ্যাচ লাইনে যুক্ত হয়েছে!`,
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
        globalScope._tatka_dispatch_tasks = tasks;

        return NextResponse.json(
          {
            success: true,
            message: `টাস্ক ${riderName} কর্তৃক সফলভাবে গ্রহণ করা হয়েছে!`,
            task: tasks[idx],
          },
          { headers: CORS_HEADERS }
        );
      }

      return NextResponse.json(
        { success: false, error: "টাস্ক পাওয়া যায়নি অথবা ইতিমধ্যে অন্য রাইডার গ্রহণ করেছেন।" },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    // 3. Status Update (e.g. Parcel Handed Over to Rider -> ON_THE_WAY, or DELIVERED)
    if (action === "STATUS_UPDATE" || action === "HANDOVER" || action === "PICKUP") {
      const targetId = body.taskId || body.orderId;
      const newStatus = action === "HANDOVER" || action === "PICKUP" ? "ON_THE_WAY" : (body.status || "ON_THE_WAY");
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
        globalScope._tatka_dispatch_tasks = tasks;

        return NextResponse.json(
          {
            success: true,
            message: `টাস্ক স্ট্যাটাস '${newStatus}' হিসেবে আপডেট হয়েছে।`,
            task: tasks[idx],
          },
          { headers: CORS_HEADERS }
        );
      }

      return NextResponse.json(
        { success: false, error: "টাস্ক পাওয়া যায়নি" },
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

      const chatMap = globalScope._tatka_chat_messages || {};
      if (!chatMap[orderId]) {
        chatMap[orderId] = [];
      }
      chatMap[orderId].push(message);
      globalScope._tatka_chat_messages = chatMap;

      return NextResponse.json(
        { success: true, message },
        { headers: CORS_HEADERS }
      );
    }

    // 5. Reset
    if (action === "RESET") {
      globalScope._tatka_dispatch_tasks = [];
      globalScope._tatka_chat_messages = {};
      return NextResponse.json(
        { success: true, message: "ডিসপ্যাচ কিউ সফলভাবে রিসেট করা হয়েছে।" },
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
