import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------
export const customerRegisterSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  phone:    z.string().regex(/^(\+88)?01[3-9]\d{8}$/, "Valid Bangladeshi phone required"),
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Address schema
// ---------------------------------------------------------------------------
export const addressSchema = z.object({
  label:      z.string().max(50).optional(),
  line1:      z.string().min(5).max(200),
  line2:      z.string().max(200).optional(),
  area:       z.string().max(100),
  city:       z.string().max(100),
  postCode:   z.string().max(10).optional(),
  isDefault:  z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Product schema (for admin/vendor creating products)
// ---------------------------------------------------------------------------
export const productSchema = z.object({
  name:        z.string().min(2).max(200),
  slug:        z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().max(5000).optional(),
  price:       z.number().positive(),
  comparePrice:z.number().positive().optional(),
  sku:         z.string().max(100).optional(),
  stock:       z.number().int().min(0).default(0),
  categoryId:  z.string().uuid(),
  vendorId:    z.string().uuid().optional(), // null = Tatka Bazar's own stock
  isPublished: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Order schema
// ---------------------------------------------------------------------------
export const createOrderSchema = z.object({
  addressId:      z.string().uuid(),
  paymentMethod:  z.enum(["BKASH", "NAGAD", "SSLCOMMERZ", "COD"]),
  couponCode:     z.string().optional(),
  items:          z.array(z.object({
    productId: z.string().uuid(),
    quantity:  z.number().int().min(1),
  })).min(1),
  note:           z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Pagination query
// ---------------------------------------------------------------------------
export const paginationSchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort:  z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// ---------------------------------------------------------------------------
// Exported types from schemas
// ---------------------------------------------------------------------------
export type CustomerRegisterInput = z.infer<typeof customerRegisterSchema>;
export type LoginInput            = z.infer<typeof loginSchema>;
export type AddressInput          = z.infer<typeof addressSchema>;
export type ProductInput          = z.infer<typeof productSchema>;
export type CreateOrderInput      = z.infer<typeof createOrderSchema>;
export type PaginationInput       = z.infer<typeof paginationSchema>;
