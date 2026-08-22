-- =============================================================================
-- Tatka Bazar — Supabase PostgreSQL Row-Level Security (RLS) Policy Migration
-- Run this in Supabase SQL Editor to enforce strict multi-tenant database security
-- =============================================================================

-- 1. Enable RLS on core tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vendors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "riders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Policies for Catalog
CREATE POLICY "Public can view active categories"
ON "categories" FOR SELECT
USING ("isActive" = true);

CREATE POLICY "Public can view published products"
ON "products" FOR SELECT
USING ("isPublished" = true);

CREATE POLICY "Public can view approved reviews"
ON "reviews" FOR SELECT
USING ("isApproved" = true);

-- 3. Customer Data Privacy Policies
-- Customers can ONLY view and update their own profile
CREATE POLICY "Users can manage own profile"
ON "users" FOR ALL
USING (auth.uid()::text = "id")
WITH CHECK (auth.uid()::text = "id");

-- Customers can ONLY view their own orders
CREATE POLICY "Customers can view own orders"
ON "orders" FOR SELECT
USING (auth.uid()::text = "customerId");

-- Customers can create orders
CREATE POLICY "Customers can create orders"
ON "orders" FOR INSERT
WITH CHECK (auth.uid()::text = "customerId" OR "customerId" IS NOT NULL);

-- Customers can ONLY view their own delivery addresses
CREATE POLICY "Customers can manage own addresses"
ON "addresses" FOR ALL
USING (auth.uid()::text = "userId")
WITH CHECK (auth.uid()::text = "userId");

-- 4. Vendor Isolation Policies
-- Vendors can ONLY view and update their own shop products
CREATE POLICY "Vendors can view own products"
ON "products" FOR SELECT
USING (auth.uid()::text = "vendorId" OR "isPublished" = true);

CREATE POLICY "Vendors can manage own products"
ON "products" FOR ALL
USING (auth.uid()::text = "vendorId")
WITH CHECK (auth.uid()::text = "vendorId");

-- 5. Service Role & Prisma Superuser Bypass
-- Allows our Fastify API Backend to access database without policy restriction
CREATE POLICY "Service role full access on orders"
ON "orders" FOR ALL
USING (current_setting('request.jwt.claim.role', true) = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on products"
ON "products" FOR ALL
USING (current_setting('request.jwt.claim.role', true) = 'service_role' OR current_user = 'postgres');

CREATE POLICY "Service role full access on users"
ON "users" FOR ALL
USING (current_setting('request.jwt.claim.role', true) = 'service_role' OR current_user = 'postgres');
