import { NextRequest, NextResponse } from "next/server";
import { resetDbHubData } from "@/lib/hubDb";
import { getSessionFromRequest, unauthorized, forbidden } from "@/lib/authMiddleware";

// POST /api/hub/reset
// SUPER_ADMIN only — wipes all hub DB data and resets in-memory store.
// The insecure open GET handler has been removed to prevent unauthenticated DB wipes.
export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);

  if (!session) {
    return unauthorized();
  }

  if (session.role !== "SUPER_ADMIN") {
    return forbidden();
  }

  const res = await resetDbHubData();
  return NextResponse.json(res);
}
