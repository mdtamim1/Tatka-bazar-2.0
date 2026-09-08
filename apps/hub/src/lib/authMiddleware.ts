import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/hubStore";

export function getSessionFromRequest(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  return validateSession(token);
}

export function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ success: false, error: "Forbidden: Access denied" }, { status: 403 });
}
