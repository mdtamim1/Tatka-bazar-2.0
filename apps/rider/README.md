# TATKA BAZAR — Rider Portal (টাটকা বাজার রাইডার পোর্টাল)

> Dedicated Delivery Rider Companion Progressive Web Application (PWA) built specifically for Tatka Bazar's grocery delivery fleet in Dhaka, Bangladesh.

---

## 🌟 Highlights & Features Built

### 1. Grounded in Dhaka Reality (Section 3 of Prompt)
- **Monsoon Weather Advisory**: Real-time Dhaka rain alerts with automatic +15 min buffer added to customer ETAs and perishable crate protection tips.
- **Dhaka Sector GPS Map**: Visual route navigation through Dhanmondi, Satmasjid Road, Abahani Field, Kalabagan, and Gulshan with 1-tap Google Maps native app deep-linking.
- **Authentic Bilingual Support**: Instant 1-tap toggle between **English** and **বাংলা (Bengali)** across all headers, metrics, action buttons, modals, and status badges using Google's `Hind Siliguri` font pairing with `Inter`.
- **One-Handed Thumb Reach**: 5-tab persistent bottom navigation bar with notification badges and minimum 44px touch targets designed for riding motorcycles and bicycles.

### 2. Full Order Lifecycle & Batch Delivery (Section 7)
- **Status Progression Flow**: `Offered` ➔ `Assigned` ➔ `Accepted` ➔ `Picked Up from Hub` ➔ `En Route` ➔ `Arrived` ➔ `Delivered` / `Failed`.
- **Audio Chime Synthesizer**: Authentic 3-tone chime (Web Audio API) for incoming delivery dispatches with mute/test controls.
- **Batch Delivery Trip**: Multi-order bundling for the same delivery sector (e.g. Dhanmondi / Kalabagan cluster).
- **Proof of Delivery (POD)**: Digital HTML5 touch signature canvas + 4-digit customer OTP validation + doorstep camera photo verification.
- **Structured Failure Reporting**: Standardized Dhaka issue codes (Customer unreachable, Incorrect address, Customer refused, Road waterlogging).

### 3. Cash-on-Delivery (COD) & Instant Payouts (Sections 9 & 10)
- **Live Cash-in-Hand Balance**: Real-time tracking of physical cash collected from customers.
- **Contactless Digital COD**: Generates an on-the-spot merchant bKash/Nagad QR code and reference number to eliminate physical cash handling.
- **End-of-Shift Hub Reconciliation**: Deposit cash to Dhanmondi Express Hub cashier with automated digital receipts.
- **Instant Wallet Withdrawals**: Zero-fee instant payout requests to bKash and Nagad with real-time transaction ledger.

### 4. Safety & Emergency SOS (Section 15)
- **Prominent Emergency SOS**: High-visibility header button with a 5-second accidental press countdown, 999 Police calling link, Hub Dispatch hotline, live GPS coordinates broadcast, and incident dispatch logger.

### 5. Gamification, Tiers & Leaderboard (Sections 11 & 12)
- **Rider Tiers**: Bronze ➔ Silver ➔ Gold ➔ Platinum with transparent commission perks (+10% base fare, peak hour priority).
- **Milestone & Streaks**: 6-day on-time streak tracker (+৳150 bonus) and daily target progression bar (+৳250 bonus).
- **Achievement Badges**: "Monsoon Hero", "100 Club Deliveries", "5-Star Perfectionist", "Dawn Patrol".
- **Weekly Dhaka Fleet Leaderboard**: Live ranking across Dhaka delivery zones.

### 6. KYC & Onboarding Wizard (Section 4)
- 5-step onboarding wizard at `/onboarding`:
  1. Personal Information & Emergency contact
  2. Vehicle details (Motorcycle, Bicycle, Van + BRTA registration)
  3. Document uploads (NID front/back + license)
  4. Payout wallet details (bKash / Nagad)
  5. Tatka Bazar Delivery Agreement & Code of Conduct acceptance

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS + Tatka Bazar Brand Design Tokens (`#1B8A4C`, `#F47920`) |
| State Engine | Zustand with LocalStorage persistence & real-time lifecycle actions |
| Audio | Browser Web Audio API (zero external mp3 dependencies) |
| Icons | Lucide React |
| PWA | Web App Manifest (`public/manifest.json`), mobile-first viewport |
| Backend Integration | Pre-configured to Tatka Bazar API on `http://localhost:4000` |

---

## 🚀 Running the Application

### Development Server:
```bash
pnpm dev
# or: npm run dev
```
Open **http://localhost:3005** on your browser or mobile device.

### Production Build:
```bash
pnpm build
pnpm start
```

---

## 📱 Navigation Tabs

1. **Dashboard (`/`)**: Today's 4 shift KPIs, monsoon advisory, daily bonus target, pinned active order card, and live dispatch trigger.
2. **Tasks (`/tasks`)**: Active, Completed, and Failed delivery filters with batch trip bundles and issue reporting.
3. **Map & Nav (`/map`)**: Interactive Dhaka sector vector map, live GPS marker, turn-by-turn guidance, and Google Maps app launcher.
4. **Wallet (`/wallet`)**: Available earnings balance, instant bKash/Nagad payout modal, cash-in-hand tracker, and fee rate sheet.
5. **Profile (`/profile`)**: Rider credentials, Gold tier perks, achievement badges, Dhaka weekly leaderboard, and KYC verification status.
6. **KYC Wizard (`/onboarding`)**: 5-step registration and document verification wizard.
