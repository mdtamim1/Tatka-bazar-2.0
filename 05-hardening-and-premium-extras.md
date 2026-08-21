# Tatka Bazar — 05: Hardening & Optional Premium Extras
**Do this last, after all four apps (`01`–`04`) are built and verified working end to end.**

## Part A — Hardening (apply across all four apps)

### Performance & High-Traffic Readiness
- ISR for storefront category/product pages, with on-demand revalidation when admin or vendor content changes.
- Redis caching for hot queries (homepage data, category tree, popular searches).
- Image optimization via `next/image` + Cloudinary transforms, lazy loading, responsive `srcset`.
- Connection pooling (PgBouncer), proper indexing; plan for a read replica if traffic grows.
- Rate limiting on public endpoints, especially search and OTP requests.
- CDN in front of all static assets.
- Stateless app servers behind a load balancer — cart/session state lives in Redis, never in server memory.

### Security
- Zod validation on every input, sanitized output.
- Parameterized queries via Prisma — never raw string-concatenated SQL.
- HTTPS everywhere, secure cookies, CSRF protection on state-changing routes.
- Rate-limited OTP/login endpoints.
- RBAC enforced server-side across all four realms; vendors and riders can only ever touch their own data, checked at the query layer.
- Payment handling stays PCI-conscious: never store raw card data — use the gateway's own hosted/tokenized flow for SSLCommerz.

### SEO (storefront)
- Server-rendered product/category/vendor-shop pages.
- Per-page bilingual meta title/description, Open Graph + Twitter Card tags on every page including the homepage.
- schema.org structured data: `Product`, `Organization`, `BreadcrumbList`, `AggregateRating`.
- Auto-generated `sitemap.xml` and `robots.txt`. Clean, human-readable slugs in both languages.

### Monitoring
Sentry across all four apps plus `apps/api`, with a shared trace/request ID so an error in the API can be traced back to which frontend triggered it.

## Part B — Optional Premium Extras

Consider these only once the core platform (Files `00`–`04`) is stable and shipped. They're genuine value-adds, not requirements — adding them earlier is exactly the kind of scope-stacking that causes the bugs you're trying to avoid.

- **Predictive reorder nudges** — "you usually order rice every 3 weeks, running low?" — a natural extension of subscribe & save.
- **Personalized homepage** — reorder homepage content based on a customer's actual purchase history.
- **Recipe-to-cart** — a recipe page where one click adds every ingredient to the cart at the right quantity.
- **"Build a box" curated bundles** — pre-made, customizable bundles (e.g. "Bachelor's Weekly Essentials," "Family Monthly Staples").
- **Tiered loyalty** — Bronze/Silver/Gold with escalating perks, layered on top of the base points system.
- **Live chat support widget**, with escalation to a human agent.
- **Genuine low-stock urgency indicators** — real stock counts, never fabricated scarcity.
- **Order edit/cancel window** — allow changes for a few minutes after placing, before an order is packed.
- **Festival pre-order** — advance reservation for Eid/Puja demand spikes.
- **In-app wallet / store credit** — refunds land as redeemable credit instead of only reversing to the original payment method.
