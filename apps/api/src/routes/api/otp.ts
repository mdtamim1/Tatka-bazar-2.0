import type { FastifyInstance } from "fastify";
import { sendSmsOtp, verifySmsOtp } from "../../services/otp/sms.js";

export async function otpRoutes(fastify: FastifyInstance) {
  // POST /api/otp/send — send OTP code to Bangladeshi phone
  fastify.post("/send", async (request, reply) => {
    try {
      const body = request.body as { phone: string };
      if (!body.phone) {
        return reply.status(400).send({ success: false, error: "Phone number is required" });
      }

      const result = await sendSmsOtp(body.phone);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/otp/verify — verify OTP code
  fastify.post("/verify", async (request, reply) => {
    try {
      const body = request.body as { phone: string; otp: string };
      if (!body.phone || !body.otp) {
        return reply.status(400).send({ success: false, error: "Phone and OTP are required" });
      }

      const result = await verifySmsOtp(body.phone, body.otp);
      if (!result.success) {
        return reply.status(400).send(result);
      }
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
