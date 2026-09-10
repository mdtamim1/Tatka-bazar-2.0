import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "tatka-bazar-super-secret-jwt-key-2024-32chars";

export interface RiderJwtPayload {
  sub: string;
  role: string;
  email: string;
  phone?: string;
}

export function signRiderToken(payload: RiderJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyRiderToken(token: string): RiderJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as RiderJwtPayload;
  } catch {
    return null;
  }
}
