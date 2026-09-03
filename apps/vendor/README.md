# 🏪 Tatka Bazar — Vendor Portal (ভেন্ডর অপারেশন কনসোল)

A dedicated operational web application and back-office management console for shop owners, fresh produce merchants, grocery sellers, and wholesale suppliers on the **Tatka Bazar** multi-vendor marketplace.

---

## 🌟 Key Features

### 1. 📊 Operations Dashboard
- Real-time KPI cards: Today's Gross Sales, Pending Orders, Low Stock Alerts, and Available Settlement Balance.
- Urgent perishable grocery dispatch queue.
- Live order simulation with synthesized Web Audio chimes.

### 2. ⚖️ Produce Scale Weight Reconciliation & Packing Checklist
- **Wet Market & Grocery Scale Weighing**: Enter exact scale weight for meat, fish, and produce items (e.g. 1.0 kg ordered vs 1.08 kg weighed) with automatic price recalculation and customer adjustment transparency.
- **Interactive Packing Checklist**: Item-by-item checkbox verification ensuring proper quality and packaging before dispatch.
- Complete status lifecycle: `RECEIVED` → `PREPARING` → `READY_FOR_PICKUP` → `HANDED_TO_RIDER` → `COMPLETED`.

### 3. 📦 Catalog & Product Management
- Weight-based pricing (per kg, 100g) vs fixed unit pricing (packs, pieces, litres).
- Bulk actions toolbar: multi-select to adjust stock (+10, -5), toggle visibility (Active / Hidden), and export CSV.
- Add / edit product modal with wholesale tier pricing and MOQ.

### 4. 📋 Inventory & Mandatory Audit Logging
- Real-time stock levels with critical low-stock warnings.
- Mandatory audit reasons for manual stock edits (`RESTOCK`, `DAMAGED`, `RECOUNT_AUDIT`, `CUSTOMER_RETURN`, `EXPIRED`).
- Audit trail log recording staff member, timestamp, and notes.

### 5. 💰 Payments, Commission & Settlements
- Transparent commission ledger deducting Tatka Bazar's 10% platform fee.
- Payout request engine for **bKash Merchant**, **Nagad Merchant**, and **Commercial Bank Transfers (BEFTN)**.
- Downloadable CSV settlement statements.
- Role-gated to Store Owners only.

### 6. 🏢 Wholesale & B2B Supply
- Volume discount tiers and Minimum Order Quantity (MOQ).
- Approved B2B buyer account list (restaurants, caterers) with credit limits and net payment terms (Net 15, Net 30).

### 7. 📈 Visual Analytics & Reports
- Daily gross revenue area charts.
- Hourly rush peak periods bar chart (identifying morning 9 AM and evening 6 PM rushes).
- Category revenue share breakdown and Average Order Value (AOV).

### 8. 🌐 Bilingual & Role Gating
- **English ⇄ বাংলা Switcher**: Instant localization covering all screens, buttons, badges, and modals.
- **Role Switcher**: Switch between **Owner**, **Manager**, and **Staff** perspectives to test permission-gated workflows.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom operational palette: Forest Emerald, Harvest Amber, Dark Slate)
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Zustand with LocalStorage Persistence
- **Alerts**: Web Audio API (Zero-dependency synthesized chimes)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Run the Development Server
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3006](http://localhost:3006) in your browser.

### 3. Build for Production
```bash
pnpm run build
pnpm start
```
