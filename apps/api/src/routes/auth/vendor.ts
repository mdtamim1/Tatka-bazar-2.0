import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { loginSchema } from "@tatka-bazar/shared";

export async function vendorAuthRoutes(fastify: FastifyInstance) {
  // POST /auth/vendor/login — accounts created by admin only
  fastify.post("/login", async (request, reply) => {
    const result = loginSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }

    const { email, password } = result.data;
    const vendor = await prisma.vendor.findUnique({ where: { email } });

    if (!vendor || !vendor.isActive) {
      return reply.status(401).send({ success: false, error: "Invalid credentials" });
    }

    if (vendor.status !== "APPROVED") {
      return reply.status(403).send({
        success: false,
        error: `Account not approved. Current status: ${vendor.status}`,
      });
    }

    const valid = await bcrypt.compare(password, vendor.passwordHash);
    if (!valid) {
      return reply.status(401).send({ success: false, error: "Invalid credentials" });
    }

    const accessToken = fastify.jwt.sign({
      sub: vendor.id,
      role: "vendor",
      email: vendor.email,
    });

    return reply.send({
      success: true,
      data: {
        accessToken,
        expiresIn: 7 * 24 * 60 * 60,
        user: {
          id: vendor.id,
          email: vendor.email,
          name: vendor.businessName,
          role: "vendor",
        },
      },
    });
  });
}
