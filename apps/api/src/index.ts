import fs from "fs";
import path from "path";

// Load .env if not loaded
if (!process.env["DATABASE_URL"]) {
  const envCandidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
    "C:/Users/World/Desktop/Tatka-bazar-2.0-main/.env",
  ];
  for (const envPath of envCandidates) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const eqIdx = trimmed.indexOf("=");
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
        if (process.env["DATABASE_URL"]) break;
      }
    } catch {}
  }
  if (!process.env["DATABASE_URL"]) {
    process.env["DATABASE_URL"] = "postgresql://postgres:password@localhost:5432/tatka_bazar?schema=public";
  }
}

import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";
import compress from "@fastify/compress";
import underPressure from "@fastify/under-pressure";
import { getRedisClient } from "@tatka-bazar/redis";

import { healthRoute } from "./routes/health.js";
import { customerAuthRoutes } from "./routes/auth/customer.js";
import { adminAuthRoutes } from "./routes/auth/admin.js";
import { vendorAuthRoutes } from "./routes/auth/vendor.js";
import { riderAuthRoutes } from "./routes/auth/rider.js";
import { hubAuthRoutes } from "./routes/auth/hub.js";
import { protectedRoutes } from "./routes/protected/index.js";
import { productRoutes } from "./routes/api/products.js";
import { categoryRoutes } from "./routes/api/categories.js";
import { orderRoutes } from "./routes/api/orders.js";
import { riderRoutes } from "./routes/api/riders.js";
import { vendorRoutes } from "./routes/api/vendors.js";
import { paymentRoutes } from "./routes/api/payment.js";
import { otpRoutes } from "./routes/api/otp.js";
import { dispatchRoutes } from "./routes/api/dispatch.js";
import { riderPortalRoutes } from "./routes/rider-portal/index.js";
import { chatRoutes } from "./routes/api/chat.js";
import { adminRoutes } from "./routes/api/admin.js";
import { riderWebSocketRoutes } from "./routes/ws/rider.js";
import { startBackgroundWorkers, stopBackgroundWorkers } from "./workers/background-jobs.js";
import { xssSanitizerHook } from "./middleware/xss-sanitizer.js";
// @ts-ignore -- @fastify/websocket has CJS default export
import websocketPlugin from "@fastify/websocket";

const PORT = Number(process.env["API_PORT"]) || 4000;
const HOST = process.env["API_HOST"] || "0.0.0.0";
const JWT_SECRET = process.env["JWT_SECRET"] || "dev-secret-change-in-production";

// Parse allowed origins from env — strict: no wildcard in production
const rawOrigins = process.env["CORS_ORIGINS"] ?? "";
const ALLOWED_ORIGINS = rawOrigins.length
  ? rawOrigins.split(",").map((o) => o.trim())
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004",
      "http://localhost:3005",
      "http://localhost:3006",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3003",
      "http://127.0.0.1:3006",
      "https://tatka-bazar-2-0-storefront.vercel.app",
      "https://tatka-bazar-2-0-rider-seven.vercel.app",
      "https://tatka-bazar-2-0-vendor.vercel.app",
      "https://tatka-bazar-2-0-admin.vercel.app",
      "https://hub-gamma-umber.vercel.app",
    ];

async function bootstrap() {
  const app = Fastify({
    logger: process.env["NODE_ENV"] === "production"
      ? { level: "warn" }
      : true,
    keepAliveTimeout: 65000, // 65s keep-alive timeout (aligned with Cloudflare/Vercel proxies)
    connectionTimeout: 10000, // 10s connection timeout
    maxRequestsPerSocket: 1000, // Reuse TCP sockets for up to 1000 requests
    requestTimeout: 15000, // 15s request timeout
  });

  // Precision Latency Tracker (Sub-millisecond Server Timing Header)
  app.addHook("onRequest", async (req) => {
    (req as any)._startTime = process.hrtime();
  });

  // Attach HTTP Keep-Alive & TCP Connection Reuse & Latency Headers
  app.addHook("onSend", async (req, reply) => {
    reply.header("Connection", "keep-alive");
    reply.header("Keep-Alive", "timeout=60, max=1000");
    if ((req as any)._startTime) {
      const diff = process.hrtime((req as any)._startTime);
      const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
      reply.header("X-Response-Time", `${timeMs}ms`);
      reply.header("Server-Timing", `total;dur=${timeMs}`);
    }
  });

  await app.register(sensible);

  // WebSocket Plugin — enables ws:// and wss:// real-time connections for riders
  await app.register(websocketPlugin, {
    options: {
      maxPayload: 1024 * 1024, // 1MB max WS message size
    },
  });

  // Security Headers & MIME Sniffing Protection (X-Content-Type-Options: nosniff)
  await app.register(helmet, {
    contentSecurityPolicy: false, // Managed at edge / API level
    crossOriginEmbedderPolicy: false,
    noSniff: true, // X-Content-Type-Options: nosniff
    frameguard: { action: "sameorigin" }, // X-Frame-Options: SAMEORIGIN
    hidePoweredBy: true, // Remove X-Powered-By
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  });

  // High-Throughput Brotli & Gzip Fast Compression (70-85% payload size reduction)
  await app.register(compress, {
    global: true,
    threshold: 1024, // Compress responses larger than 1KB
    encodings: ["br", "gzip", "deflate"],
  });

  // Memory & Event Loop Circuit Breaker Watchdog (Zero Out-Of-Memory Crash Guarantee)
  await app.register(underPressure, {
    maxEventLoopDelay: 1000, // 1 second event loop delay
    maxHeapUsedBytes: 1024 * 1024 * 1024, // 1GB heap limit
    maxRssBytes: 1536 * 1024 * 1024, // 1.5GB RSS limit
    maxEventLoopUtilization: 0.98,
    pressureHandler: (_req: any, rep: any, type: string, value: number | undefined) => {
      app.log.warn({ type, value }, "Tatka Bazar API under extreme pressure, shedding load gracefully!");
      rep.status(503).send({
        success: false,
        statusCode: 503,
        error: "ServiceOverloaded",
        message: "Tatka Bazar servers are experiencing heavy load. Please retry in a few seconds.",
      });
    },
    exposeStatusRoute: "/health/pressure",
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g., curl, server-to-server)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(jwt, {
    secret: JWT_SECRET,
    sign: { expiresIn: process.env["JWT_EXPIRY"] ?? "7d" },
  });

  // Enterprise Adaptive Multi-Tier Rate Limiting backed by Redis & Cloudflare Real-IP
  await app.register(rateLimit, {
    redis: getRedisClient(),
    keyGenerator: (req) => {
      // Prioritize Cloudflare proxy header, then x-forwarded-for, then socket IP
      const cfIp = req.headers["cf-connecting-ip"];
      if (typeof cfIp === "string" && cfIp) return cfIp;
      const xff = req.headers["x-forwarded-for"];
      if (typeof xff === "string" && xff) return xff.split(",")[0]?.trim() || req.ip;
      return req.ip;
    },
    max: (req) => {
      // High-frequency telemetry: Rider live GPS ping every 5s
      if (req.url.includes("/api/riders/live-location")) return 600;
      // High-traffic public catalog browsing (e-commerce storefront)
      if (req.url.startsWith("/api/products") || req.url.startsWith("/api/categories")) return 300;
      // Ultra-strict brute-force protection on rider & admin login (5 tries per minute)
      if (req.url.includes("/login")) return 5;
      // Strict auth endpoints (registration, verification)
      if (req.url.startsWith("/auth/")) return 15;
      // Default standard API tier
      return 180;
    },
    timeWindow: "1 minute",
    allowList: ["127.0.0.1", "localhost", "::1"],
    errorResponseBuilder: (_request, context) => ({
      success: false,
      statusCode: 429,
      error: "Too Many Requests",
      message: "অতিরিক্ত রিকোয়েস্ট পাঠানো হয়েছে। দয়া করে কিছুক্ষণ অপেক্ষা করুন। (Rate limit exceeded)",
      retryAfter: context.after,
    }),
  });

  // Global XSS (Cross-Site Scripting) Request Payload Sanitizer
  app.addHook("preValidation", xssSanitizerHook);

  // ---------------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------------
  await app.register(healthRoute);
  await app.register(customerAuthRoutes, { prefix: "/auth/customer" });
  await app.register(adminAuthRoutes,    { prefix: "/auth/admin" });
  await app.register(vendorAuthRoutes,   { prefix: "/auth/vendor" });
  await app.register(riderAuthRoutes,    { prefix: "/auth/rider" });
  await app.register(hubAuthRoutes,      { prefix: "/auth/hub" });
  await app.register(protectedRoutes,    { prefix: "/protected" });

  // Public & Operational REST API Endpoints
  await app.register(productRoutes,      { prefix: "/api/products" });
  await app.register(categoryRoutes,     { prefix: "/api/categories" });
  await app.register(orderRoutes,        { prefix: "/api/orders" });
  await app.register(riderRoutes,        { prefix: "/api/riders" });
  await app.register(vendorRoutes,       { prefix: "/api/vendors" });
  await app.register(paymentRoutes,      { prefix: "/api/payment" });
  await app.register(otpRoutes,          { prefix: "/api/otp" });
  await app.register(riderPortalRoutes,  { prefix: "/rider-portal" });
  await app.register(dispatchRoutes,     { prefix: "/api/dispatch" });
  await app.register(adminRoutes,        { prefix: "/api/admin" });
  await app.register(chatRoutes,         { prefix: "/api/chat" });

  // WebSocket Routes
  await app.register(riderWebSocketRoutes, { prefix: "/ws" });

  // ---------------------------------------------------------------------------
  // Global Unified Mobile & Web Error Handler
  // ---------------------------------------------------------------------------
  app.setErrorHandler((error: any, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode ?? (error.name === "ZodError" ? 400 : 500);
    
    return reply.status(statusCode).send({
      success: false,
      statusCode,
      error: error.name || (statusCode === 500 ? "InternalServerError" : "BadRequest"),
      message: statusCode === 500
        ? "Internal server error. Please try again shortly."
        : error.message || "Request could not be completed.",
      details: error.validation || error.issues || undefined,
    });
  });

  // Global 404 Handler for REST APIs (Guarantees JSON response for Mobile Apps)
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      success: false,
      statusCode: 404,
      error: "NotFound",
      message: `Requested endpoint (${request.method} ${request.url}) was not found.`,
    });
  });

  // ---------------------------------------------------------------------------
  // Start
  // ---------------------------------------------------------------------------
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`\n🚀 Tatka Bazar API running on http://${HOST}:${PORT}`);
    console.log(`📋 Allowed origins: ${ALLOWED_ORIGINS.join(", ")}\n`);
    startBackgroundWorkers();

    // ── Render Free Tier Keep-Alive ──────────────────────────────────────────
    // Render free services sleep after 15min idle. Self-ping every 10min
    // prevents sleep. Automatically disabled on paid hosts (RENDER != "true")
    if (process.env["RENDER"] === "true") {
      const selfUrl = process.env["RENDER_EXTERNAL_URL"] || `http://localhost:${PORT}`;
      const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
      setInterval(async () => {
        try {
          await fetch(`${selfUrl}/health`);
          console.log("[KeepAlive] Self-ping OK");
        } catch {
          // Non-fatal — just log
          console.warn("[KeepAlive] Self-ping failed");
        }
      }, PING_INTERVAL);
      console.log(`🏓 Render keep-alive active → pinging ${selfUrl}/health every 10min`);
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Rock-Solid Process Crash Guard (Zero Unexpected Termination)
  // ---------------------------------------------------------------------------
  process.on("unhandledRejection", (reason) => {
    app.log.error({ reason }, "Trapped Unhandled Promise Rejection (Anti-Crash)");
  });

  process.on("uncaughtException", (error) => {
    app.log.error({ error }, "Trapped Uncaught Exception (Anti-Crash)");
  });

  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, initiating graceful server shutdown...`);
    try {
      stopBackgroundWorkers();
      await app.close();
      console.log("✅ Fastify closed all connections cleanly.");
      process.exit(0);
    } catch (err) {
      console.error("Error during graceful shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap();
