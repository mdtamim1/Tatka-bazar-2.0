// =============================================================================
// Tatka Bazar — Shared TypeScript Types
// =============================================================================

// ---------------------------------------------------------------------------
// User Roles
// ---------------------------------------------------------------------------
export type UserRole = "customer" | "admin" | "vendor" | "rider";

// ---------------------------------------------------------------------------
// JWT Payload — shape of the decoded token in all 4 apps
// ---------------------------------------------------------------------------
export interface JwtPayload {
  sub: string;       // User's UUID from the relevant identity table
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

// ---------------------------------------------------------------------------
// API Response envelopes
// ---------------------------------------------------------------------------
export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Auth responses (returned on successful login/register)
// ---------------------------------------------------------------------------
export interface AuthTokenResponse {
  accessToken: string;
  expiresIn: number; // seconds
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

// ---------------------------------------------------------------------------
// Order status
// ---------------------------------------------------------------------------
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

// ---------------------------------------------------------------------------
// Payment status
// ---------------------------------------------------------------------------
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

// ---------------------------------------------------------------------------
// Payment method
// ---------------------------------------------------------------------------
export type PaymentMethod = "BKASH" | "NAGAD" | "SSLCOMMERZ" | "COD";

// ---------------------------------------------------------------------------
// Vendor status
// ---------------------------------------------------------------------------
export type VendorStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

// ---------------------------------------------------------------------------
// Rider status
// ---------------------------------------------------------------------------
export type RiderStatus = "AVAILABLE" | "BUSY" | "OFFLINE";
