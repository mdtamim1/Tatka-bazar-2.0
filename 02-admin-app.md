# Tatka Bazar — 02: Admin App

**Builds on `00` and assumes `01-storefront-app.md` is working. This is the internal control panel, deployed as `apps/admin` at `admin.tatkabazar.com`.**

Design: clean, efficient, information-dense — using the shared design tokens, not the storefront's marketing-style treatment. Every part of the platform — storefront, marketplace, B2B, delivery — must be manageable from here, with nothing requiring a code change for routine operation.

## Roles

Super Admin, Manager, Inventory Staff, Support Staff, Delivery Coordinator — each with scoped permissions, enforced server-side in `apps/api`, never just hidden in the UI.

## Dashboard

Real-time sales figures, order funnel, top products, low-stock alerts, revenue charts, traffic overview, vendor sales breakdown.

## Product Management

Full CRUD, rich-text description editor, multi-image upload with drag-reorder, the full pricing-type/tiered-pricing configuration from File 01, bulk import/export (CSV/Excel), bulk price updates, per-product SEO fields, bilingual fields throughout.

## Category Management

Unlimited nested tree, drag-drop ordering, bulk actions, per-category default commission rate.

## Inventory Management

Real-time stock levels, low-stock threshold alerts, expiry-date tracking for perishables, stock-adjustment audit trail, per-branch stock if fulfillment is multi-branch.

## Order Management

Searchable/filterable order list (including the multi-vendor sub-order view), status update workflow, assign to delivery rider, print packing slip/invoice, refund/cancellation handling, internal order notes.

## Vendor Management

Review and approve/reject vendor applications submitted via `vendor.tatkabazar.com/apply`, approve new vendor products before they go live, set commission rates per vendor/category, suspend/reactivate vendors, view and settle vendor payouts, view vendor performance and ratings.

## B2B Account Management

Approve/reject business account applications, set credit terms and limits, view outstanding receivables, respond to quote requests.

## Rider Management

Create/approve rider accounts, assign delivery zones, monitor live deliveries, review performance metrics, process rider payouts.

## Customer Management

Customer list with order history and lifetime value, ability to message or block, view saved addresses.

## Branch Management

Define branch/warehouse locations (name, address, image, map coordinates, phone, hours — feeds the storefront footer directly), delivery-zone mapping with per-zone fee and ETA rules.

## Marketing Tools

Hero banner scheduler, coupon/discount engine (percentage/flat, minimum order, usage limits, category or vendor scoping), push/SMS/email campaign sender, flash-sale scheduler.

## Content Management

Footer content, branch listing, About/Terms/Privacy pages, FAQ, optional recipes/blog module.

## Reviews Moderation

Approve/reject/reply, for both product reviews and vendor-shop reviews.

## Reports

Sales by category/product/vendor/time range, exportable as CSV.

## Settings

Payment gateway keys, tax/delivery-fee rules, and a translation-management screen so non-technical staff can add or edit Bangla/English copy without a developer.

## Audit Log

Full log of admin actions — who changed what, when.

## Definition of Done

- [ ] Every section above is fully functional — no stubbed-out screens.
- [ ] RBAC enforced server-side for every role.
- [ ] A vendor application can be approved end-to-end and the vendor can then log into `vendor.tatkabazar.com`.
- [ ] A B2B account, once approved, sees wholesale pricing on the storefront immediately.
- [ ] A rider, once created here, can log into `rider.tatkabazar.com`.

Once verified, move to `03-vendor-app.md`.
