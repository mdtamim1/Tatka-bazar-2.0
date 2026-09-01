import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";

export async function vendorRoutes(fastify: FastifyInstance) {
  // GET /api/vendors — list vendors
  fastify.get("/", async (_request, reply) => {
    try {
      const vendors = await prisma.vendor.findMany({
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = vendors.map(v => ({
        id: v.id,
        nameBn: v.businessName,
        nameEn: v.businessName,
        slug: v.slug,
        contactName: v.businessName,
        phone: v.phone,
        email: v.email,
        tradeLicense: "TRAD/DNCC/092811",
        location: "ঢাকা (Dhaka)",
        status: v.status,
        commissionRate: v.commissionRate,
        totalSales: 245000,
        payableBalance: 42000,
        totalProducts: v._count.products,
        joinedDate: v.createdAt.toLocaleDateString("en-GB"),
        rating: 4.8,
      }));

      return reply.send({ success: true, data: formatted });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/vendors/apply — public application
  fastify.post("/apply", async (request, reply) => {
    try {
      const body = request.body as {
        businessName: string;
        phone: string;
        email: string;
        description?: string;
      };

      const passwordHash = await bcrypt.hash("Vendor@tatka2024!", 12);
      const vendor = await (prisma.vendor.create as any)({
        data: {
          businessName: body.businessName,
          slug: body.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          phone: body.phone,
          email: body.email,
          description: body.description || null,
          status: "PENDING",
          passwordHash,
        },
      });

      return reply.status(201).send({ success: true, data: vendor });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/vendors/:id — approve or suspend vendor
  fastify.patch("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as { status?: any; commissionRate?: number };

      const vendor = await prisma.vendor.update({
        where: { id },
        data: {
          ...(body.status && { status: body.status }),
          ...(body.commissionRate !== undefined && { commissionRate: Number(body.commissionRate) }),
        },
      });

      return reply.send({ success: true, data: vendor });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
