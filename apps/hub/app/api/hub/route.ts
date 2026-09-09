import { NextRequest, NextResponse } from "next/server";
import { getTeam, getConfig, getWithdrawals, validateSession, logActivity } from "@/lib/hubStore";
import { getDbActivity, getDbTeam, logDbActivity, resetDbHubData, addDbTeamMember, updateDbTeamMember } from "@/lib/hubDb";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/hub/dashboard — unified dashboard stats
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  const activity = await getDbActivity();
  return NextResponse.json({
    success: true,
    data: {
      activity: activity.slice(0, 20),
      config: getConfig(),
      pendingWithdrawals: getWithdrawals().filter((w) => w.status === "PENDING").length,
    },
  });
}

// GET /api/hub/team — team members list  
// PATCH /api/hub/team — update team member

export async function POST(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ success: false, error: "Only Super Admin can perform this action" }, { status: 403 });
  }
  const body = await req.json();
  if (body.action === "GET_TEAM") {
    const team = await getDbTeam();
    return NextResponse.json({ success: true, data: team });
  }
  if (body.action === "GET_ACTIVITY") {
    const activity = await getDbActivity();
    return NextResponse.json({ success: true, data: activity });
  }
  if (body.action === "GET_CONFIG") {
    return NextResponse.json({ success: true, data: getConfig() });
  }
  if (body.action === "RESET_HUB") {
    const result = await resetDbHubData();
    return NextResponse.json(result);
  }
  if (body.action === "ADD_TEAM_MEMBER") {
    const newMember = await addDbTeamMember(body.member);
    await logDbActivity({
      actorId: session.memberId,
      actorName: session.name,
      action: "TEAM_MEMBER_ADDED",
      targetType: "TEAM",
      targetName: body.member.name,
      details: `Role: ${body.member.role}`,
    });
    return NextResponse.json({ success: true, data: newMember });
  }
  if (body.action === "UPDATE_TEAM_MEMBER") {
    const ok = await updateDbTeamMember(body.id, body.updates);
    if (!ok) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    await logDbActivity({
      actorId: session.memberId,
      actorName: session.name,
      action: "TEAM_MEMBER_UPDATED",
      targetType: "TEAM",
      targetId: body.id,
      details: `Updated fields: ${Object.keys(body.updates || {}).join(", ")}`,
    });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
