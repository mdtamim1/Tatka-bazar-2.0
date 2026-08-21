import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { loginSchema } from "@tatka-bazar/shared";

export async function adminAuthRoutes(fastify: FastifyInstance) {
  // POST /auth/admin/login — no public registration; accounts created via DB/seed
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
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin || !admin.isActive) {
      return reply.status(401).send({ success: false, error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return reply.status(401).send({ success: false, error: "Invalid credentials" });
    }

    const accessToken = fastify.jwt.sign({
      sub: admin.id,
      role: "admin",
      email: admin.email,
    });

    return reply.send({
      success: true,
      data: {
        accessToken,
        expiresIn: 7 * 24 * 60 * 60,
        user: { id: admin.id, email: admin.email, name: admin.name, role: "admin" },
      },
    });
  });
}
