import { NextRequest, NextResponse } from "next/server";
import { getConfig, validateSession } from "@/lib/hubStore";

function auth(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  return token ? validateSession(token) : null;
}

// GET /api/proxy/dispatch — fetch active tasks from Rider portal
export async function GET(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  const config = getConfig();
  const endpoints = [
    `${config.riderLocalUrl}/api/dispatch`,
    `${config.riderVercelUrl}/api/dispatch`,
  ];
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(t);
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json({ success: true, data: json.data ?? json, source: url });
      }
    } catch {}
  }
  return NextResponse.json({ success: true, data: [], source: "none" });
}

// POST /api/proxy/dispatch — send action to Rider dispatch
export async function POST(req: NextRequest) {
  const session = auth(req);
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
  const body = await req.json();
  const config = getConfig();
  const endpoints = [
    `${config.riderLocalUrl}/api/dispatch`,
    `${config.riderVercelUrl}/api/dispatch`,
  ];
  const results = await Promise.allSettled(
    endpoints.map((url) =>
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      })
    )
  );
  return NextResponse.json({ success: true, results: results.map((r) => r.status) });
}
