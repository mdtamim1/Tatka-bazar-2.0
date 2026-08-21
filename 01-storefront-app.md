# Tatka Bazar — 01: Storefront App
**Builds on `00-architecture-and-foundation.md`. This is the customer-facing app, deployed as `apps/storefront` at `tatkabazar.com`, talking only to `apps/api`.**

This is the "standard web" — the one surface real customers judge the brand by. Full premium treatment here; keep it clean and fast, never cluttered.

## Internationalization — Bangla ⇄ English

- Full switch via `next-intl`, not just UI chrome — **every** database-backed text (product names, descriptions, category names, banner copy, vendor shop names) needs bilingual fields, not just static interface strings.
- Header language switcher (বাং/EN toggle), preference persisted in a cookie; default from browser locale, always user-overridable.
- Locale-prefixed routes (`/bn/...`, `/en/...`) so both languages are independently SEO-indexable.
- Pair a proper Bangla webfont (e.g. Noto Sans Bengali / Hind Siliguri) with the English display face — both languages must look equally intentional.
- ৳ (Taka) as the currency symbol everywhere.
- Seed a realistic bilingual category set, for example:
  - চাল, ডাল ও নিত্যপণ্য / Rice, Lentils & Staples
  - শাকসবজি / Vegetables · ফলমূল / Fruits · মাছ ও মাংস / Fish & Meat
  - ডিম, দুধ ও দুগ্ধজাত পণ্য / Eggs, Milk & Dairy
  - মসলা ও রান্নার উপকরণ / Spices & Cooking Essentials
  - তেল, ঘি ও নিত্যব্যবহার্য / Oil, Ghee & Daily Essentials
  - বেকারি ও স্ন্যাকস / Bakery & Snacks · পানীয় / Beverages
  - ব্যক্তিগত যত্ন ও গৃহস্থালি পণ্য / Personal Care & Household

  (Categories are fully admin-managed and unlimited — this is just a starting seed set.)

## Design System & Visual Direction

Do not default to a generic template look. Work out a real design plan grounded in this specific subject — a Bangladeshi daily bazar: its color, abundance, freshness, and trust.

- Explicitly avoid the current AI-generated-design defaults: (1) cream background + high-contrast serif + terracotta accent, (2) near-black background + a single acid-green/vermilion accent, (3) broadsheet-style hairline-rule newspaper layout. Find a direction grounded in a bazar's own materials instead — jute, crates, fresh produce, spice, morning light.
- Build on `packages/design-tokens` (Section in File 00): a named 4–6 color palette, a display + body typeface pairing (both with strong Bangla glyph support), an intentional type scale.
- Pick one genuine signature element the page will be remembered by. The quantity/weight selector on the product page is a strong candidate — it's the functional heart of this shopping experience, worth making feel crafted and specific, not a generic dropdown.
- Spend boldness in one place; keep everything else disciplined and quiet.
- Motion deliberate, not decorative — a few well-chosen moments (add-to-cart, live price recalculation) beat scattered effects everywhere.
- Non-negotiable floor: fully responsive 360px through desktop (1280px+), visible keyboard focus states, reduced-motion respected, real hover/focus/active/disabled states everywhere.

## Homepage

- **Hero banner**: full-width, admin-manageable carousel — schedulable per slide, deep-links to category/product/promo, overlay text + CTA.
- Category quick-nav strip directly under the hero.
- Flash-deal / "today's offer" rail with a countdown timer.
- Best-seller / featured product rail.
- "Shop by category" grid with real imagery.
- Featured vendor shops rail.
- Trust strip: delivery promise, secure payment, freshness guarantee, easy returns.
- Ratings/testimonials summary. Recently viewed section for returning users.
- App-download teaser banner (placeholder now).

## Category System

- Department → Category → Subcategory with mega-menu navigation, backed by an unlimited-depth tree.
- Category landing pages: own hero, filter/sort bar, product grid — mixing first-party and vendor products seamlessly.

## Search & Filtering

- **Instant search**: autocomplete-as-you-type with thumbnail + price, recent/trending searches, category-scoped search, typo-tolerant matching for mixed Bangla/English typing.
- **Filters**: price range, brand, vendor/shop, unit type, discount %, rating, in-stock only, organic/certified — multi-select, live counts, removable filter chips.
- **Sort**: relevance, price, newest, best-selling, top-rated.
- Filter/sort state reflected in the URL.

## Product Page — Advanced Feature Set

**Media**: multi-image gallery, zoom-on-hover, lightbox; video support for hero products.

**Dynamic Weight-Based Pricing Engine** (core differentiator):
- `pricingType`: `fixed` (per piece), `variableWeight` (rice, flour, vegetables, spices), or `pack` (fixed pack sizes with multiple size options).
- For `variableWeight`: base unit (kg/gram/liter/ml), price per base unit, min quantity, step increment, max quantity.
- UI: quick-select chips (250g/500g/1kg/2kg/5kg/custom) + a +/– stepper + free-text input, all in sync, price recalculating live. Build as a first-class custom component — this is the page's signature element (see Design System above).
- Configurable tiered/bulk pricing (e.g. 1–4kg at ৳68/kg, 5–24kg at ৳65/kg, 25kg+ at ৳60/kg) — this same structure powers wholesale pricing below.
- Stock tracked internally in the base unit so partial-unit purchases decrement correctly.

**Trust & decision-support**: price-per-base-unit always visible for comparison; freshness/expiry for perishables; origin/source tag; "Sold by Tatka Bazar" or "Sold by [Vendor]" with a link to their shop page; nutrition info where relevant; organic badges; real stock status with "notify me" option.

**Conversion & retention**: sticky add-to-cart on scroll; "frequently bought together"; substitute suggestions when out of stock; bundle/combo deals; **subscribe & save** recurring delivery (weekly/biweekly/monthly); reviews with photo upload + verified-purchase badge + Q&A; breadcrumbs; wishlist; share button; schema.org `Product` structured data.

## Shopping From Partner Vendors

- Each vendor has a public shop page at `/shop/[vendor-slug]` — their branding, product list, rating. Customers can browse by shop as well as by category.

## Wholesale / B2B — Customer-Facing Flow

- Business account registration (separate from retail signup) with document upload for verification. Admin approves in `02-admin-app.md`.
- Once approved, the same storefront login unlocks wholesale pricing tiers and a "Request a Quote" flow for large/custom orders.
- Dedicated B2B dashboard: order history, saved recurring order templates, downloadable invoices.

## Cart & Checkout

- Persistent cart: guest cart merged into account cart on login.
- Cart drawer + full cart page — items grouped visibly by vendor when the cart spans more than one seller.
- Multi-vendor carts split automatically into fulfillment sub-orders at checkout (logic lives in `apps/api`) — the customer still sees one cart, one payment, one confirmation.
- Delivery address suited to Bangladesh: division/district/upazila/area + landmark field, map-pin picker.
- Delivery slot selection. Coupon/promo code with live validation.
- Payment: bKash, Nagad, SSLCommerz, Cash on Delivery — presented clearly.
- Order confirmation page + automatic SMS/email confirmation. Guest checkout allowed.

## User Accounts

- Phone OTP login primary, email/social as options.
- Order history with one-click reorder. Live order tracking (placed → confirmed → packed → out for delivery → delivered), updated in real time as a rider updates status.
- Multiple saved addresses. Wishlist.
- Subscription management (view/pause/cancel). Loyalty points. Referral program.

## Branches & Footer

- Branch cards (image + name + address + map link), quick links, social links, payment icons, app-download badge placeholder, newsletter signup.
- Branch data pulled live from the admin panel — never hardcoded.

## Definition of Done

- [ ] Fully responsive at mobile/tablet/desktop.
- [ ] Bangla and English both 100% functional, no fallback text.
- [ ] Weight-based pricing calculates and decrements stock correctly.
- [ ] All four payment methods integrated or clearly stubbed.
- [ ] A multi-vendor cart splits correctly at checkout.
- [ ] Footer pulls branches live from admin.

Once verified, move to `02-admin-app.md`.
