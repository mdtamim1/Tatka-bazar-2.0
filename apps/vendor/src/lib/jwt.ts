import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "tatka-bazar-super-secret-jwt-key-2024-32chars";

export interface VendorJwtPayload {
  sub: string;
  role: string;
  email: string;
  phone?: string;
  businessName?: string;
}

export function signVendorToken(payload: VendorJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyVendorToken(token: string): VendorJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as VendorJwtPayload;
  } catch {
    return null;
  }
}
