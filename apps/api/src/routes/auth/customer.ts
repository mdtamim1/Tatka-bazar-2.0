import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { loginSchema, customerRegisterSchema } from "@tatka-bazar/shared";
import { bruteForceGuard } from "../../services/security/brute-force.js";

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

  // POST /auth/customer/login (Protected with 5-attempt brute-force lockout)
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

    // Check account lockout status
    const lockStatus = bruteForceGuard.isLocked(email);
    if (lockStatus.locked) {
      return reply.status(423).send({
        success: false,
        error: "Account Locked",
        message: `Account is temporarily locked due to too many failed attempts. Please retry in ${lockStatus.remainingMinutes} minutes.`,
        retryAfterMinutes: lockStatus.remainingMinutes,
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      const attempt = bruteForceGuard.recordFailedAttempt(email);
      return reply.status(401).send({
        success: false,
        error: "Invalid credentials",
        message: attempt.locked
          ? "Account locked for 10 minutes after 5 failed attempts."
          : `Invalid email or password. ${attempt.attemptsLeft} attempts remaining before temporary lockout.`,
        attemptsLeft: attempt.attemptsLeft,
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const attempt = bruteForceGuard.recordFailedAttempt(email);
      return reply.status(401).send({
        success: false,
        error: "Invalid credentials",
        message: attempt.locked
          ? "Account locked for 10 minutes after 5 failed attempts."
          : `Invalid email or password. ${attempt.attemptsLeft} attempts remaining before temporary lockout.`,
        attemptsLeft: attempt.attemptsLeft,
      });
    }

    // Reset attempts on successful login
    bruteForceGuard.recordSuccess(email);

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
