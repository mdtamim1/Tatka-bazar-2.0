import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet";

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
      message: "অতিরিক্ত রিকোয়েস্ট পাঠানো হয়েছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন। (Rate limit exceeded. Please wait a moment.)",
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
  // Global error handler
  // ---------------------------------------------------------------------------
  app.setErrorHandler((error: any, _request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({
      success: false,
      error: statusCode === 500 ? "Internal server error" : error.message,
      code: error.code,
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
