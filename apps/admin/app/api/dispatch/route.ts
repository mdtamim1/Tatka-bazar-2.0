import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body.action || (body.task ? "READY_FOR_PICKUP" : "READY_FOR_PICKUP");
    const tasks = globalScope._tatka_dispatch_tasks || [];

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
        orderNumber: taskData.orderNumber || taskData.displayId || `TB-${taskData.id.replace(/\D/g, "") || "9000"}`,
        customerName: taskData.customerName || "সম্মানিত গ্রাহক",
        customerPhone: taskData.customerPhone || "01729-458921",
        deliveryAddress: taskData.deliveryAddress || `${taskData.deliveryZone || "ঢাকা জোন"}, ঢাকা`,
        vendorName: taskData.vendorName || "Tatka Bazar Central",
        vendorPhone: taskData.vendorPhone || "01711-223344",
        itemCount: taskData.itemCount || (Array.isArray(taskData.items) ? taskData.items.length : 2),
        subtotal: Number(taskData.subtotal) || 1200,
        deliveryFee: Number(taskData.deliveryFee) || 60,
        total: Number(taskData.total) || 1260,
        status: "READY_FOR_PICKUP",
        claimed: false,
        claimedBy: null,
        claimedAt: null,
        createdAt: taskData.createdAt || new Date().toISOString(),
        items: taskData.items || [],
      };

      const existingIdx = tasks.findIndex((t: any) => t.id === newTask.id);
      if (existingIdx >= 0) {
        tasks[existingIdx] = { ...tasks[existingIdx], ...newTask };
      } else {
        tasks.unshift(newTask);
      }

      globalScope._tatka_dispatch_tasks = tasks.slice(0, 100);

      return NextResponse.json(
        { success: true, task: newTask },
        { headers: CORS_HEADERS }
      );
    }

    if (action === "CLAIM") {
      const { taskId, riderId, riderName, riderPhone } = body;
      const task = tasks.find((t: any) => t.id === taskId);
      if (!task) {
        return NextResponse.json(
          { success: false, error: "Task not found" },
          { status: 404, headers: CORS_HEADERS }
        );
      }
      task.claimed = true;
      task.claimedBy = { riderId, riderName, riderPhone };
      task.claimedAt = new Date().toISOString();
      task.status = "OUT_FOR_DELIVERY";

      return NextResponse.json(
        { success: true, task },
        { headers: CORS_HEADERS }
      );
    }

    if (action === "DELIVERED") {
      const { taskId } = body;
      const task = tasks.find((t: any) => t.id === taskId);
      if (task) {
        task.status = "DELIVERED";
        task.deliveredAt = new Date().toISOString();
      }
      return NextResponse.json(
        { success: true, task },
        { headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: `Unknown action ${action}` },
      { status: 400, headers: CORS_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
