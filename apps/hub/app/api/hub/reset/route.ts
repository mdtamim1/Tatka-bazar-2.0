import { NextRequest, NextResponse } from "next/server";
import { resetDbHubData } from "@/lib/hubDb";
import { validateSession } from "@/lib/hubStore";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token) {
    const session = validateSession(token);
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  const res = await resetDbHubData();
  return NextResponse.json(res);
}

export async function GET() {
  const res = await resetDbHubData();
  return NextResponse.json(res);
}
