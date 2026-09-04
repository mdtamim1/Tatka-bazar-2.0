import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";
import { loginSchema } from "@tatka-bazar/shared";

export async function riderAuthRoutes(fastify: FastifyInstance) {
  // POST /auth/rider/register — self-registration for riders
  fastify.post("/register", async (request, reply) => {
    try {
      const body = request.body as {
        name?: string;
        phone?: string;
        email?: string;
        password?: string;
        vehicleType?: "BICYCLE" | "MOTORCYCLE" | "VAN";
      };

      const { name, phone, email, password, vehicleType } = body;

      if (!name || name.trim().length < 2) {
        return reply.status(400).send({ success: false, error: "সঠিক নাম লিখুন (কমপক্ষে ২ অক্ষর)" });
      }
      if (!phone || phone.trim().length < 11) {
        return reply.status(400).send({ success: false, error: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন" });
      }
      if (!password || password.length < 6) {
        return reply.status(400).send({ success: false, error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" });
      }

      const cleanPhone = phone.trim();
      const cleanEmail = email && email.trim().length > 0 
        ? email.trim().toLowerCase() 
        : `rider_${cleanPhone.replace(/[^0-9]/g, "")}@tatkabazar.com`;

      const existing = await prisma.deliveryRider.findFirst({
        where: {
          OR: [{ phone: cleanPhone }, { email: cleanEmail }],
        },
      });

      if (existing) {
        return reply.status(409).send({
          success: false,
          error: "এই ফোন নম্বর বা ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে। লগইন করুন।",
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const rider = await prisma.deliveryRider.create({
        data: {
          name: name.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          passwordHash,
          vehicleType: vehicleType || "MOTORCYCLE",
          status: "OFFLINE",
          isActive: true,
          kycStatus: "PENDING",
          balance: 0,
          totalEarned: 0,
        },
      });

      const accessToken = fastify.jwt.sign({
        sub: rider.id,
        role: "rider",
        email: rider.email,
      });

      return reply.status(201).send({
        success: true,
        data: {
          accessToken,
          expiresIn: 7 * 24 * 60 * 60,
          user: {
            id: rider.id,
            email: rider.email,
            phone: rider.phone,
            name: rider.name,
            role: "rider",
            vehicleType: rider.vehicleType,
            kycStatus: rider.kycStatus,
          },
        },
      });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || "সার্ভার সমস্যা হয়েছে" });
    }
  });

  // POST /auth/rider/login — supports login via email or phone
  fastify.post("/login", async (request, reply) => {
    const { email, password } = (request.body as { email?: string; password?: string }) || {};

    if (!email || !password) {
      return reply.status(400).send({
        success: false,
        error: "ইমেইল/ফোন নম্বর এবং পাসওয়ার্ড প্রদান করুন",
      });
    }

    const identifier = email.trim().toLowerCase();
    const rider = await prisma.deliveryRider.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!rider || !rider.isActive) {
      return reply.status(401).send({ success: false, error: "ভুল তথ্য অথবা অ্যাকাউন্ট নিষ্ক্রিয়" });
    }

    const valid = await bcrypt.compare(password, rider.passwordHash);
    if (!valid) {
      return reply.status(401).send({ success: false, error: "পাসওয়ার্ড ভুল হয়েছে" });
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
        user: {
          id: rider.id,
          email: rider.email,
          phone: rider.phone,
          name: rider.name,
          role: "rider",
          vehicleType: rider.vehicleType,
          kycStatus: rider.kycStatus,
        },
      },
    });
  });
}
