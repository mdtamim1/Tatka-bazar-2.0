import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@tatka-bazar/database";
import { signCustomerToken } from "@/lib/jwt";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, accessToken, email, name, picture } = body;

    let googleEmail = email ? String(email).trim().toLowerCase() : "";
    let googleName = name ? String(name).trim() : "";
    let googlePicture: string | null = picture || null;

    // 1. Verify Google ID Token if present
    if (credential) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const tokenInfo = await verifyRes.json();
          if (tokenInfo.email) {
            googleEmail = tokenInfo.email.toLowerCase();
            googleName = tokenInfo.name || googleName || googleEmail.split("@")[0];
            googlePicture = tokenInfo.picture || googlePicture;
          }
        }
      } catch (e) {
        console.warn("[Google Token Verification Failed]:", e);
      }
    }

    // 2. Or verify with Google UserInfo via access token
    if (!googleEmail && accessToken) {
      try {
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userinfoRes.ok) {
          const userinfo = await userinfoRes.json();
          if (userinfo.email) {
            googleEmail = userinfo.email.toLowerCase();
            googleName = userinfo.name || googleName || googleEmail.split("@")[0];
            googlePicture = userinfo.picture || googlePicture;
          }
        }
      } catch (e) {
        console.warn("[Google UserInfo fetch failed]:", e);
      }
    }

    if (!googleEmail) {
      return NextResponse.json(
        { success: false, error: "Google authentication failed. No valid email received." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    // 3. Find or Create User in Supabase PostgreSQL
    let user = await prisma.user.findFirst({
      where: { email: googleEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleEmail,
          name: googleName || (googleEmail.split("@")[0] as string) || "Customer",
          avatarUrl: googlePicture,
          passwordHash: "GOOGLE_OAUTH",
          isVerified: true,
        },
      });
    } else {
      if (!user.avatarUrl && googlePicture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: googlePicture, isVerified: true },
        });
      }
    }

    const token = signCustomerToken({
      sub: user.id,
      role: "CUSTOMER",
      email: user.email || null,
      phone: user.phone || null,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          accessToken: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            role: "CUSTOMER",
          },
        },
      },
      { headers: CORS_HEADERS }
    );
  } catch (err: any) {
    console.error("[Customer Google Auth Route Error]:", err);
    return NextResponse.json(
      { success: false, error: "Google sign-in could not be processed. Please try again." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
