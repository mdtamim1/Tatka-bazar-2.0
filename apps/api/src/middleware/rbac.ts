// =============================================================================
// Tatka Bazar — Role-Based Access Control (RBAC) Security Middleware
// Enforces role segregation: CUSTOMER vs VENDOR vs RIDER vs ADMIN
// =============================================================================

import type { FastifyRequest, FastifyReply } from "fastify";

export type UserRole = "customer" | "vendor" | "rider" | "admin" | "superadmin";

/**
 * Require specific user role(s) to access endpoint
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Verify JWT
      await request.jwtVerify();
      const user = request.user as { sub: string; role: UserRole; email?: string };

      if (!user || !user.role) {
        return reply.status(401).send({
          success: false,
          error: "Unauthorized",
          message: "লগইন করা আবশ্যক। (Authentication required)",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return reply.status(403).send({
          success: false,
          error: "Forbidden",
          message: `আপনার এই অ্যাকশনটি করার অনুমতি নেই। (Access denied. Requires role: ${allowedRoles.join(" or ")})`,
        });
      }
    } catch (err: any) {
      return reply.status(401).send({
        success: false,
        error: "Unauthorized",
        message: "মেয়াদোত্তীর্ণ বা অবৈধ টোকেন। (Invalid or expired token)",
      });
    }
  };
}
