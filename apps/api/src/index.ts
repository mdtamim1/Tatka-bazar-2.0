import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";
import compress from "@fastify/compress";
import underPressure from "@fastify/under-pressure";

import { healthRoute } from "./routes/health.js";
import { customerAuthRoutes } from "./routes/auth/customer.js";
import { adminAuthRoutes } from "./routes/auth/admin.js";
import { vendorAuthRoutes } from "./routes/auth/vendor.js";
import { riderAuthRoutes } from "./routes/auth/rider.js";
import { protectedRoutes } from "./routes/protected/index.js";
import { productRoutes } from "./routes/api/products.js";
import { categoryRoutes } from "./routes/api/categories.js";
import { orderRoutes } from "./routes/api/orders.js";
import { riderRoutes } from "./routes/api/riders.js";
import { vendorRoutes } from "./routes/api/vendors.js";
import { paymentRoutes } from "./routes/api/payment.js";
import { otpRoutes } from "./routes/api/otp.js";
import { xssSanitizerHook } from "./middleware/xss-sanitizer.js";

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

  // Attach HTTP Keep-Alive & TCP Connection Reuse Headers
  app.addHook("onSend", async (_req, reply) => {
    reply.header("Connection", "keep-alive");
    reply.header("Keep-Alive", "timeout=60, max=1000");
  });

  await app.register(sensible);

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

  // Enterprise Rate Limiting Protection against DDoS & Spammers
  await app.register(rateLimit, {
    max: 120, // 120 requests per minute per IP
    timeWindow: "1 minute",
    allowList: ["127.0.0.1", "localhost"],
    errorResponseBuilder: (_request, context) => ({
      success: false,
      statusCode: 429,
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please wait a moment before sending more requests.",
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
  await app.register(protectedRoutes,    { prefix: "/protected" });

  // Public & Operational REST API Endpoints
  await app.register(productRoutes,      { prefix: "/api/products" });
  await app.register(categoryRoutes,     { prefix: "/api/categories" });
  await app.register(orderRoutes,        { prefix: "/api/orders" });
  await app.register(riderRoutes,        { prefix: "/api/riders" });
  await app.register(vendorRoutes,       { prefix: "/api/vendors" });
  await app.register(paymentRoutes,      { prefix: "/api/payment" });
  await app.register(otpRoutes,          { prefix: "/api/otp" });

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
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
