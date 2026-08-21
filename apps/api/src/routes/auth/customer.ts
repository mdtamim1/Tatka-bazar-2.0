import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { loginSchema, customerRegisterSchema } from "@tatka-bazar/shared";

export async function customerAuthRoutes(fastify: FastifyInstance) {
  // POST /auth/customer/register
  fastify.post("/register", async (request, reply) => {
    const result = customerRegisterSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({
        success: false,
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      });
    }

    const { name, email, phone, password } = result.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return reply.status(409).send({
        success: false,
        error: "Email or phone already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, Number(process.env["BCRYPT_ROUNDS"]) || 12);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash },
      select: { id: true, email: true, name: true },
    });

    const accessToken = fastify.jwt.sign({
      sub: user.id,
      role: "customer",
      email: user.email,
    });

    return reply.status(201).send({
      success: true,
      data: {
        accessToken,
        expiresIn: 7 * 24 * 60 * 60,
        user: { ...user, role: "customer" },
      },
    });
  });

  // POST /auth/customer/login
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return reply.status(401).send({ success: false, error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ success: false, error: "Invalid credentials" });
    }

    const accessToken = fastify.jwt.sign({
      sub: user.id,
      role: "customer",
      email: user.email,
    });

    return reply.send({
      success: true,
      data: {
        accessToken,
        expiresIn: 7 * 24 * 60 * 60,
        user: { id: user.id, email: user.email, name: user.name, role: "customer" },
      },
    });
  });
}
