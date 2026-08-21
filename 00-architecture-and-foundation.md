# Tatka Bazar — 00: Architecture & Foundation
**Read this first. Build this before any other file in this series — everything else depends on it.**

## The Plan

This build is split into sequential prompt files so you build and verify one piece at a time, instead of one enormous change:

- `00` (this file) — monorepo, shared backend, database, auth, design tokens
- `01-storefront-app.md` — the customer-facing site
- `02-admin-app.md` — the admin control panel
- `03-vendor-app.md` — the partner-shop portal
- `04-rider-app.md` — the delivery rider portal
- `05-hardening-and-premium-extras.md` — final performance/security pass + optional extra features

Complete and verify each file's Definition of Done before starting the next. Don't jump ahead.

## Why four separate apps on four separate domains

Tatka Bazar has four very different audiences — shoppers, internal staff, partner shop owners, and delivery riders — each needing a different app, at a different address, with different design priorities and different risk if something breaks. Splitting them into separate deployable apps, all backed by one shared database and one shared API, gets you:

- **Contained blast radius.** Building the vendor app cannot break storefront checkout — separate codebases sharing only a typed API contract, never shared UI code.
- **Lean bundles.** The rider app (often used on modest phones, patchy data) never ships admin-dashboard weight, and vice versa.
- **Simple, hard-to-misconfigure auth.** Each app has its own login page and its own guard — no single giant permission matrix to get wrong.
- **Independent scaling.** Public storefront traffic spikes don't compete with internal admin/vendor/rider load.
- **Real milestones.** Each app is a complete, shippable unit — this is what makes "build it step by step" actually safe, not just a nice idea.

## Monorepo Structure

Use Turborepo:

```
tatka-bazar/
├── apps/
│   ├── api/            → shared backend, all business logic + DB access
│   ├── storefront/     → tatkabazar.com
│   ├── admin/          → admin.tatkabazar.com
│   ├── vendor/         → vendor.tatkabazar.com
│   └── rider/          → rider.tatkabazar.com
├── packages/
│   ├── database/        → Prisma schema + client (single source of truth)
│   ├── shared/           → Zod schemas, shared TS types, constants
│   └── design-tokens/    → shared colors, spacing, type scale
```

## Domain Map

| App | Domain | Audience | Design priority |
|---|---|---|---|
| storefront | tatkabazar.com | Customers | Full premium treatment |
| admin | admin.tatkabazar.com | Internal staff | Clean, dense, efficient |
| vendor | vendor.tatkabazar.com | Partner shop owners | Clean, dense, efficient |
| rider | rider.tatkabazar.com | Delivery riders | Clean, fast, mobile-first |
| api | internal / api.tatkabazar.com | Called by the four apps above | No UI |

## Backend (`apps/api`)

One backend, one database, shared by all four frontends. Layered: route handler → service → repository (Prisma). All business logic — the pricing engine, order-splitting across vendors, commission calculation, notification sending — lives here exactly once. No frontend app ever talks to the database directly.

Also owns: SMS/email/push notification sending (BullMQ-queued), Socket.io real-time channels (order status, rider tracking), payment gateway integration (bKash/Nagad/SSLCommerz/COD).

If `apps/api` is called client-side (from the browser) rather than only server-to-server, restrict CORS to exactly the four frontend origins — no wildcard.

## Authentication — one identity system, four separate realms

Get this right early, it's easy to get wrong under time pressure:

- Each app has its own login page and its own JWT carrying a `role` claim: `customer`, `admin`, `vendor`, or `rider`.
- `apps/api` checks the `role` claim on every protected route — a token issued for one role must be rejected by another role's endpoints, enforced server-side, never assumed from the frontend alone.
- Cookies/tokens are scoped to their own subdomain — a customer session must never be readable by the admin app.
- `User` (customers), `AdminUser`, `Vendor`, and `DeliveryRider` are separate identity tables in the database, not one polymorphic table with a role flag — this keeps the four realms structurally separate, not just separate by convention.
- Vendor and rider accounts are created only via admin approval — never public self-signup — enforced in `apps/api`, not just hidden in a UI.

## Design tokens vs. design systems

`packages/design-tokens` holds the shared brand fundamentals — color palette, type scale, spacing scale — so all four apps read as the same brand. Apply them differently, though:

- **Storefront**: the full premium design system (detailed in File 01) — this is the one surface real customers judge the brand by, so it earns the extra design effort.
- **Admin / Vendor / Rider**: clean, efficient, information-dense "internal tool" UI using the same tokens — prioritize speed, clarity, and data density over marketing polish. Think well-built dashboard, not landing page. This keeps these three apps fast to build and use, and keeps design effort concentrated where it matters most.

## Database — Key Entities

Design the Prisma schema in `packages/database` around: `User`, `AdminUser`, `Vendor`, `DeliveryRider`, `Address`, `Category` (self-referential), `Product` (with `vendorId`), `ProductPricingRule`, `ProductImage`, `Review`, `Order`, `OrderItem`, `Coupon`, `Branch`, `DeliveryZone`, `DeliveryAssignment`, `Subscription`, `VendorPayout`, `Commission`, `B2BAccount`, `QuoteRequest`, `Invoice`, `Notification`, `AuditLog`. Index columns filtered/sorted often (`categoryId`, `vendorId`, `price`, `createdAt`, `slug`). Real foreign keys and cascade rules — don't leave referential integrity to the application layer.

## The marketplace model, in one place

Tatka Bazar is a hybrid marketplace: first-party Tatka Bazar inventory plus verified partner shops (vendors), sold through one storefront. Every product has a `vendorId` (null for Tatka Bazar's own stock). A cart spanning multiple vendors is split into separate fulfillment sub-orders automatically at checkout — the customer sees one cart and one payment; each vendor sees only their own slice. Admin sets commission per vendor/category; `apps/api` calculates it on every order line and keeps a running payout ledger per vendor. Full customer-facing and vendor-facing behavior is detailed in Files 01 and 03.

## Future mobile apps

Because everything sits behind `apps/api`, a future customer, vendor, or rider mobile app is simply a fifth, sixth, or seventh client calling the same endpoints — not a rebuild.

## Build order for this phase

1. Set up the Turborepo monorepo and workspace tooling.
2. Define the full Prisma schema in `packages/database`, run the initial migration.
3. Build the `apps/api` skeleton with the layered structure and all four auth guards — no business features yet beyond a health check and working login/signup for each role.
4. Scaffold all four frontend apps with routing, the shared design tokens wired in, and each app's own login page working end-to-end against `apps/api`.

## Definition of Done for this phase

- [ ] You can register/log in as each of the four roles independently.
- [ ] A token from one role is correctly rejected by another role's protected routes.
- [ ] All four apps build and deploy independently.
- [ ] CORS on `apps/api` allows only the four known frontend origins.

Once verified, move to `01-storefront-app.md`.
