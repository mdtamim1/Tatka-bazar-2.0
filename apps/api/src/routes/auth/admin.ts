import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { loginSchema } from "@tatka-bazar/shared";
import { bruteForceGuard } from "../../services/security/brute-force.js";

export async function adminAuthRoutes(fastify: FastifyInstance) {
  // POST /auth/admin/login — protected with brute-force lockout
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
    const lockStatus = bruteForceGuard.isLocked(`admin:${email}`);
    if (lockStatus.locked) {
      return reply.status(423).send({
        success: false,
        error: "Admin Account Locked",
        message: `Admin account is temporarily locked due to too many failed attempts. Please retry in ${lockStatus.remainingMinutes} minutes.`,
        retryAfterMinutes: lockStatus.remainingMinutes,
      });
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (!admin || !admin.isActive) {
      const attempt = bruteForceGuard.recordFailedAttempt(`admin:${email}`);
      return reply.status(401).send({
        success: false,
        error: "Invalid credentials",
        message: attempt.locked
          ? "Admin panel locked for 10 minutes after 5 failed attempts."
          : `Invalid credentials. ${attempt.attemptsLeft} attempts remaining before temporary lockout.`,
        attemptsLeft: attempt.attemptsLeft,
      });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      const attempt = bruteForceGuard.recordFailedAttempt(`admin:${email}`);
      return reply.status(401).send({
        success: false,
        error: "Invalid credentials",
        message: attempt.locked
          ? "Admin panel locked for 10 minutes after 5 failed attempts."
          : `Invalid credentials. ${attempt.attemptsLeft} attempts remaining before temporary lockout.`,
        attemptsLeft: attempt.attemptsLeft,
      });
    }

    // Reset attempts
    bruteForceGuard.recordSuccess(`admin:${email}`);

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
