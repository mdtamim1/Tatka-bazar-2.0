import { NextRequest, NextResponse } from "next/server";
import { getSessions, generateToken } from "@/lib/hubStore";
import { authenticateDbAdmin, logDbActivity } from "@/lib/hubDb";

// POST /api/auth/login
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const member = await authenticateDbAdmin(email, password);
  if (!member) {
    return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
  }
  const token = generateToken();
  const session = {
    token,
    memberId: member.id,
    role: member.role,
    name: member.name,
    email: member.email,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), // 8 hours
  };
  getSessions().set(token, session);
  await logDbActivity({
    actorId: member.id,
    actorName: member.name,
    action: "LOGIN",
    targetType: "SYSTEM",
    details: `${member.role} logged in`,
  });
  return NextResponse.json({ success: true, data: session });
}

// DELETE /api/auth/logout
export async function DELETE(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token) getSessions().delete(token);
  return NextResponse.json({ success: true });
}
