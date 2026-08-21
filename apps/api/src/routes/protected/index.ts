import type { FastifyInstance } from "fastify";
import { addRoleGuard } from "../../middleware/auth.js";

// ---------------------------------------------------------------------------
// Customer-only protected zone
// ---------------------------------------------------------------------------
async function customerProtected(fastify: FastifyInstance) {
  addRoleGuard(fastify, ["customer"]);

  fastify.get("/dashboard", async (request) => {
    const user = request.user as { sub: string; email: string; role: string };
    return {
      success: true,
      data: { message: "Welcome to your dashboard!", user },
    };
  });
}

// ---------------------------------------------------------------------------
// Admin-only protected zone
// ---------------------------------------------------------------------------
async function adminProtected(fastify: FastifyInstance) {
  addRoleGuard(fastify, ["admin"]);

  fastify.get("/dashboard", async (request) => {
    const user = request.user as { sub: string; email: string; role: string };
    return {
      success: true,
      data: { message: "Admin panel — restricted access", user },
    };
  });
}

// ---------------------------------------------------------------------------
// Vendor-only protected zone
// ---------------------------------------------------------------------------
async function vendorProtected(fastify: FastifyInstance) {
  addRoleGuard(fastify, ["vendor"]);

  fastify.get("/dashboard", async (request) => {
    const user = request.user as { sub: string; email: string; role: string };
    return {
      success: true,
      data: { message: "Vendor portal — your products and orders", user },
    };
  });
}

// ---------------------------------------------------------------------------
// Rider-only protected zone
// ---------------------------------------------------------------------------
async function riderProtected(fastify: FastifyInstance) {
  addRoleGuard(fastify, ["rider"]);

  fastify.get("/dashboard", async (request) => {
    const user = request.user as { sub: string; email: string; role: string };
    return {
      success: true,
      data: { message: "Rider app — your deliveries", user },
    };
  });
}

// ---------------------------------------------------------------------------
// Register all protected sub-routes
// ---------------------------------------------------------------------------
export async function protectedRoutes(fastify: FastifyInstance) {
  await fastify.register(customerProtected, { prefix: "/customer" });
  await fastify.register(adminProtected,    { prefix: "/admin" });
  await fastify.register(vendorProtected,   { prefix: "/vendor" });
  await fastify.register(riderProtected,    { prefix: "/rider" });
}
