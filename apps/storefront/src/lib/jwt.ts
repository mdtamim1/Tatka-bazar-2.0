import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"] || "tatka-bazar-super-secret-jwt-key-2024-32chars";

export interface CustomerJwtPayload {
  sub: string;
  role?: string;
  email?: string | null;
  phone?: string | null;
}

export function signCustomerToken(payload: CustomerJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyCustomerToken(token: string): CustomerJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as CustomerJwtPayload;
  } catch {
    return null;
  }
}
