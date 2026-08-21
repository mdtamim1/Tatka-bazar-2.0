# Tatka Bazar — 03: Vendor App
**Builds on `00`, `01`, `02`. This is the partner-shop portal, deployed as `apps/vendor` at `vendor.tatkabazar.com`.**

Design: clean, dense, efficient — same shared tokens as admin, not the storefront's premium treatment. Shop owners need to manage stock and orders quickly, not browse a marketing page.

## Public Application Flow

`vendor.tatkabazar.com/apply` — a public page, no login required: shop name, owner NID, trade license upload, address, categories of goods they sell. Submits into the admin approval queue (`02-admin-app.md`). No dashboard access until approved.

## Vendor Dashboard (after admin approval)

- **Product management**: own catalog only, full use of the pricing engine from `01-storefront-app.md` (fixed / variableWeight / pack, tiered pricing), multi-image upload, bilingual fields. New products enter admin's approval queue before going live.
- **Stock management**: own inventory levels, low-stock visibility.
- **Orders**: view only their own slice of any order — including orders split across multiple vendors — and update fulfillment status (e.g. "ready for pickup").
- **Payouts**: running balance, commission deducted per sale, payout history, next scheduled payout date.
- **Shop page**: customize banner, description, and logo — feeds their public `/shop/[vendor-slug]` page on the storefront.
- **Ratings**: view their own shop rating and reviews.

## Definition of Done

- [ ] A vendor cannot see or modify another vendor's products, orders, or payout data — verified at the API layer, not just hidden in the UI.
- [ ] A new product from a vendor does not appear on the storefront until admin approves it.
- [ ] Payout ledger math stays correct after a refund or cancellation.
- [ ] A vendor's status update on their part of a split order reflects correctly in admin's order view.

Once verified, move to `04-rider-app.md`.
