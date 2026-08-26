# 🛒 Tatka Bazar 2.0 (তাতকা বাজার)

Modern, Hyper-Fast Fullstack E-Commerce & Quick-Commerce Multi-Vendor Ecosystem built with Turborepo, Next.js, Fastify, PostgreSQL (Prisma), Redis, and TailwindCSS.

---

## 🚀 Monorepo Architecture

```
Tatka-Bazar-2.0/
├── apps/
│   ├── api/          # High-performance Fastify REST & WebSocket Backend
│   ├── storefront/   # Customer-facing Next.js E-Commerce Application
│   ├── admin/        # Comprehensive Super Admin Portal
│   ├── vendor/       # Vendor Management & Store Operations Panel
│   └── rider/        # Real-time Order Delivery & Rider Tracking PWA
└── packages/
    ├── database/     # Prisma ORM Schema, Client & Migrations (PostgreSQL)
    ├── redis/        # Redis Caching, Pub/Sub & Queue Client
    ├── config/       # Shared TypeScript & ESLint configurations
    └── ui/           # Shared UI Component Library
```

---

## 🛠️ Tech Stack

- **Monorepo Engine:** [Turborepo](https://turbo.build/) & [pnpm](https://pnpm.io/)
- **Frontend Framework:** [Next.js (App Router)](https://nextjs.org/) + React
- **Backend Framework:** [Fastify](https://fastify.dev/) (High throughput, low latency)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Cache & Message Broker:** [Redis](https://redis.io/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **Security & Protection:** Fastify Rate Limiting, Helmet, Under-Pressure Circuit Breaker, XSS Sanitization, PostgreSQL Statement Timeouts, Cloudflare Edge Tuning

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or higher
- **PostgreSQL** & **Redis** (or Docker)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mdtamim1/Tatka-bazar-2.0.git
   cd Tatka-bazar-2.0
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Update your database credentials, JWT secrets, and Redis connection strings)*

4. Setup database:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. Run development servers:
   ```bash
   pnpm dev
   ```

---

## 📄 License

This project is proprietary and confidential. All rights reserved.
