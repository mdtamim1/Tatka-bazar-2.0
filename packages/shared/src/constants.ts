// =============================================================================
// Tatka Bazar — Shared Constants
// =============================================================================

// ---------------------------------------------------------------------------
// App URLs — used for CORS, redirects, and JWT audience
// ---------------------------------------------------------------------------
export const APP_URLS = {
  storefront: process.env["STOREFRONT_URL"] ?? "http://localhost:3000",
  admin:      process.env["ADMIN_URL"]      ?? "http://localhost:3001",
  vendor:     process.env["VENDOR_URL"]     ?? "http://localhost:3002",
  rider:      process.env["RIDER_URL"]      ?? "http://localhost:3003",
  api:        process.env["API_URL"]        ?? "http://localhost:4000",
} as const;

export const CORS_ORIGINS = Object.values(APP_URLS).filter(
  (url) => url !== APP_URLS.api
);

// ---------------------------------------------------------------------------
// User Roles
// ---------------------------------------------------------------------------
export const USER_ROLES = {
  CUSTOMER: "customer",
  ADMIN:    "admin",
  VENDOR:   "vendor",
  RIDER:    "rider",
} as const;

// ---------------------------------------------------------------------------
// Pagination defaults
// ---------------------------------------------------------------------------
export const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT:     100,
} as const;

// ---------------------------------------------------------------------------
// Order status labels (for display)
// ---------------------------------------------------------------------------
export const ORDER_STATUS_LABELS = {
  PENDING:           "Pending",
  CONFIRMED:         "Confirmed",
  PREPARING:         "Preparing",
  READY_FOR_PICKUP:  "Ready for Pickup",
  OUT_FOR_DELIVERY:  "Out for Delivery",
  DELIVERED:         "Delivered",
  CANCELLED:         "Cancelled",
  REFUNDED:          "Refunded",
} as const;

// ---------------------------------------------------------------------------
// Commission defaults
// ---------------------------------------------------------------------------
export const DEFAULT_COMMISSION_RATE = 10; // percent

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------
export const CURRENCY = {
  code:   "BDT",
  symbol: "৳",
  locale: "bn-BD",
} as const;

// ---------------------------------------------------------------------------
// File upload limits
// ---------------------------------------------------------------------------
export const UPLOAD = {
  MAX_IMAGE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  MAX_IMAGES_PER_PRODUCT: 8,
} as const;
