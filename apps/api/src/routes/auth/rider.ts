import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { loginSchema } from "@tatka-bazar/shared";

export async function riderAuthRoutes(fastify: FastifyInstance) {
  // POST /auth/rider/login — accounts created by admin only
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
    const rider = await prisma.deliveryRider.findUnique({ where: { email } });

    if (!rider || !rider.isActive) {
      return reply.status(401).send({ success: false, error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, rider.passwordHash);
    if (!valid) {
      return reply.status(401).send({ success: false, error: "Invalid credentials" });
    }

    const accessToken = fastify.jwt.sign({
      sub: rider.id,
      role: "rider",
      email: rider.email,
    });

    return reply.send({
      success: true,
      data: {
        accessToken,
        expiresIn: 7 * 24 * 60 * 60,
        user: { id: rider.id, email: rider.email, name: rider.name, role: "rider" },
      },
    });
  });
}
