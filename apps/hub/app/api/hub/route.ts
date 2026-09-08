import { NextRequest, NextResponse } from "next/server";
import { getTeam, getConfig, getWithdrawals, validateSession, logActivity } from "@/lib/hubStore";
import { getDbActivity, getDbTeam, logDbActivity } from "@/lib/hubDb";

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
  if (body.action === "ADD_TEAM_MEMBER") {
    const team = getTeam();
    const exists = team.find((m) => m.email === body.member.email);
    if (exists) return NextResponse.json({ success: false, error: "Email already in use" }, { status: 400 });
    const newMember = {
      id: `hub-member-${Date.now()}`,
      ...body.member,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    team.push(newMember);
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
    const team = getTeam();
    const idx = team.findIndex((m) => m.id === body.id);
    if (idx === -1) return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
    Object.assign(team[idx], body.updates);
    await logDbActivity({
      actorId: session.memberId,
      actorName: session.name,
      action: "TEAM_MEMBER_UPDATED",
      targetType: "TEAM",
      targetId: body.id,
      targetName: team[idx].name,
    });
    return NextResponse.json({ success: true, data: team[idx] });
  }
  return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
}
