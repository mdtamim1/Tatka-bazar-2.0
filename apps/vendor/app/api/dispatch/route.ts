import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const globalScope = globalThis as unknown as {
  _tatka_dispatch_tasks?: any[];
};

if (!globalScope._tatka_dispatch_tasks) {
  globalScope._tatka_dispatch_tasks = [];
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

  const tasks = globalScope._tatka_dispatch_tasks || [];

  if (orderId) {
    const single = tasks.find((t: any) => t.id === orderId || t.orderNumber === orderId);
    return NextResponse.json(
      { success: true, task: single || null },
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
        vendorName: taskData.vendorName || "Tatka Vendor Partner",
        itemCount: taskData.itemCount || (Array.isArray(taskData.items) ? taskData.items.length : 2),
        subtotal: Number(taskData.subtotal) || Number(taskData.grossTotal) || 1200,
        deliveryFee: Number(taskData.deliveryFee) || 60,
        total: Number(taskData.total) || Number(taskData.grossTotal) || 1260,
        earnings: Number(taskData.earnings) || 50,
        paymentStatus: taskData.paymentStatus || "COD",
        paymentMethod: taskData.paymentMethod || "CASH_ON_DELIVERY",
        items: Array.isArray(taskData.items) ? taskData.items : [],
        createdAt: taskData.createdAt || new Date().toISOString(),
        status: "READY_FOR_PICKUP",
        claimed: false,
        claimedBy: null,
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

    if (action === "CLAIM") {
      const targetId = body.taskId || body.orderId;
      const riderId = body.riderId || "rider-demo-01";
      const riderName = body.riderName || "রাইডার";

      const idx = tasks.findIndex((t: any) => t.id === targetId || t.orderNumber === targetId);
      if (idx !== -1 && tasks[idx]) {
        tasks[idx].claimed = true;
        tasks[idx].claimedBy = { riderId, riderName, claimedAt: new Date().toISOString() };
        tasks[idx].status = "ASSIGNED";
        globalScope._tatka_dispatch_tasks = tasks;

        return NextResponse.json(
          {
            success: true,
            message: "টাস্ক রাইডার কর্তৃক সফলভাবে গ্রহণ করা হয়েছে!",
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

    if (action === "RESET") {
      globalScope._tatka_dispatch_tasks = [];
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
