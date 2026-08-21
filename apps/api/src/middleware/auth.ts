import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import type { UserRole } from "@tatka-bazar/shared";

/**
 * Role-guard factory.
 * Usage: app.addHook("preHandler", requireRole("admin"))
 *
 * Rejects with 401 if no valid JWT present.
 * Rejects with 403 if the JWT's role does not match the required role.
 */
export function requireRole(...roles: UserRole[]) {
  return async function roleGuard(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({
        success: false,
        error: "Unauthorised — valid token required",
      });
    }

    const payload = request.user as { role: UserRole };

    if (!roles.includes(payload.role)) {
      return reply.status(403).send({
        success: false,
        error: `Forbidden — this endpoint requires role: ${roles.join(" or ")}`,
      });
    }
  };
}

/**
 * Attach the role-guard as a plugin-level preHandler so it applies
 * to all routes registered in that plugin.
 *
 * Usage inside a route plugin:
 *   fastify.addHook("preHandler", requireRole("admin"))
 */
export function addRoleGuard(
  fastify: FastifyInstance,
  roles: UserRole[]
): void {
  fastify.addHook("preHandler", requireRole(...roles));
}
