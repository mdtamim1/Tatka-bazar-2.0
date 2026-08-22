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
        message: `অতিরিক্ত ভুল চেষ্টার কারণে অ্যাডমিন একাউন্টটি সাময়িকভাবে লক করা হয়েছে। অনুগ্রহ করে ${lockStatus.remainingMinutes} মিনিট পর চেষ্টা করুন। (Admin account locked due to too many failed attempts. Retry in ${lockStatus.remainingMinutes}m)`,
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
          ? "৫ বার ভুল তথ্য দেওয়ায় অ্যাডমিন প্যানেল ১০ মিনিটের জন্য লক হয়েছে।"
          : `ভুল তথ্য। আর ${attempt.attemptsLeft} বার ভুল দিলে একাউন্ট সাময়িক লক হবে।`,
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
          ? "৫ বার ভুল তথ্য দেওয়ায় অ্যাডমিন প্যানেল ১০ মিনিটের জন্য লক হয়েছে।"
          : `ভুল তথ্য। আর ${attempt.attemptsLeft} বার ভুল দিলে একাউন্ট সাময়িক লক হবে।`,
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
