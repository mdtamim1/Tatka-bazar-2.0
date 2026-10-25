import jwt from "jsonwebtoken";

// ⚠️ JWT_SECRET MUST be set in .env — no insecure fallback allowed in production.
const JWT_SECRET = process.env["JWT_SECRET"];

if (!JWT_SECRET && process.env.NODE_ENV === "production") {
  throw new Error(
    "[CRITICAL] JWT_SECRET environment variable is not set. Cannot start the vendor portal securely."
  );
}

// Fallback only for local dev; this will be caught if accidentally deployed
const _secret = JWT_SECRET || "dev-only-insecure-secret-change-before-deploy";

export interface VendorJwtPayload {
  sub: string;
  role: "vendor";
  email: string;
  phone?: string;
  businessName?: string;
  iat?: number;
  exp?: number;
}

export function signVendorToken(payload: Omit<VendorJwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, _secret, { expiresIn: "7d" });
}

/**
 * Verifies a JWT token AND ensures it has role="vendor".
 * Returns null if invalid, expired, or belongs to a non-vendor (e.g. rider/customer token).
 */
export function verifyVendorToken(token: string): VendorJwtPayload | null {
  try {
    const decoded = jwt.verify(token, _secret) as VendorJwtPayload;
    // 🔒 Critical: Ensure the token is specifically a vendor token
    if (!decoded || !decoded.sub || decoded.role !== "vendor") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
