# Tatka Bazar — 04: Rider App
**Builds on `00`, `01`, `02`. This is the delivery portal, deployed as `apps/rider` at `rider.tatkabazar.com`.**

Design: clean, fast, mobile-first. Riders are in the field on modest phones and patchy data — this app should feel lighter and simpler than any of the other three, not less premium, just leaner.

## Access

Rider accounts are created and approved only by admin (`02-admin-app.md`), never public self-signup. Login via phone OTP.

## Core Screens

- **Today's deliveries**: list of assigned orders for the day.
- **Order detail**: items, customer address and contact, COD amount if applicable, a map/navigation link to the address.
- **Status updates**: one-tap transitions — picked up → en route → delivered / failed with a reason.
- **COD collection confirmation**: mark cash collected against the order.
- **Daily summary**: completed deliveries and total cash collected for the day.

## Real-Time Sync

Every status update pushes instantly, over the Socket.io channel from `apps/api`, to:
- the customer's order tracking timeline on the storefront, and
- admin's live delivery view.

## Assignment

Admin assigns orders to riders (or an auto-assignment rule based on delivery zone and rider availability, configured in `02-admin-app.md`). A rider only ever sees deliveries assigned to them.

## Definition of Done

- [ ] A rider only sees their own assigned deliveries, never anyone else's — verified at the API layer.
- [ ] A status update appears on the customer's tracking page within seconds.
- [ ] Daily COD totals reconcile correctly against individual order records.
- [ ] Works smoothly on a mid-range phone over a slow connection.

Once verified, move to `05-hardening-and-premium-extras.md`.
