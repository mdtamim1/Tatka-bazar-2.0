import type { FastifyInstance } from "fastify";
import { sendSmsOtp, verifySmsOtp } from "../../services/otp/sms.js";
import { bruteForceGuard } from "../../services/security/brute-force.js";

export async function otpRoutes(fastify: FastifyInstance) {
  // POST /api/otp/send — send OTP code to Bangladeshi phone
  fastify.post("/send", async (request, reply) => {
    try {
      const body = request.body as { phone: string };
      if (!body.phone) {
        return reply.status(400).send({ success: false, error: "Phone number is required" });
      }

      // Check if phone is locked out
      const lockStatus = bruteForceGuard.isLocked(`otp:${body.phone}`);
      if (lockStatus.locked) {
        return reply.status(423).send({
          success: false,
          error: "Phone Locked",
          message: `OTP generation temporarily suspended for this phone number. Please retry in ${lockStatus.remainingMinutes} minutes.`,
          retryAfterMinutes: lockStatus.remainingMinutes,
        });
      }

      const result = await sendSmsOtp(body.phone);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/otp/verify — verify OTP code with brute-force protection
  fastify.post("/verify", async (request, reply) => {
    try {
      const body = request.body as { phone: string; otp: string };
      if (!body.phone || !body.otp) {
        return reply.status(400).send({ success: false, error: "Phone and OTP are required" });
      }

      // Check lockout status
      const lockStatus = bruteForceGuard.isLocked(`otp:${body.phone}`);
      if (lockStatus.locked) {
        return reply.status(423).send({
          success: false,
          error: "Phone Locked",
          message: "Phone locked for 10 minutes due to 5 wrong attempts.",
          retryAfterMinutes: lockStatus.remainingMinutes,
        });
      }

      const result = await verifySmsOtp(body.phone, body.otp);
      if (!result.success) {
        const attempt = bruteForceGuard.recordFailedAttempt(`otp:${body.phone}`);
        return reply.status(400).send({
          ...result,
          message: attempt.locked
            ? "Phone locked for 10 minutes after 5 wrong OTP attempts."
            : `Invalid OTP code. ${attempt.attemptsLeft} attempts remaining before temporary lockout.`,
          attemptsLeft: attempt.attemptsLeft,
        });
      }

      // Reset attempts on successful OTP verify
      bruteForceGuard.recordSuccess(`otp:${body.phone}`);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
