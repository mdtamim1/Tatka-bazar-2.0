import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";

export async function vendorRoutes(fastify: FastifyInstance) {
  // GET /api/vendors — list vendors with optional location filters
  fastify.get("/", async (request, reply) => {
    try {
      const query = request.query as {
        district?: string;
        thana?: string;
        bazar?: string;
        status?: string;
      };

      const where: any = {};
      if (query.status && query.status !== "all") where.status = query.status;
      if (query.district) where.district = query.district;
      if (query.thana) where.thana = query.thana;
      if (query.bazar) where.bazar = query.bazar;

      const vendors = await prisma.vendor.findMany({
        where,
        include: {
          _count: { select: { products: true, orderItems: true } },
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
        location: v.bazar || v.thana || v.district || "Dhaka",
        district: v.district,
        thana: v.thana,
        bazar: v.bazar,
        locationSetAt: v.locationSetAt,
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

  // GET /api/vendors/by-location — get approved vendors filtered by location (for order dispatch)
  fastify.get("/by-location", async (request, reply) => {
    try {
      const query = request.query as {
        district?: string;
        thana?: string;
        bazar?: string;
      };

      const where: any = { status: "APPROVED" };
      if (query.district) where.district = { contains: query.district, mode: "insensitive" };
      if (query.thana) where.thana = { contains: query.thana, mode: "insensitive" };
      if (query.bazar) where.bazar = { contains: query.bazar, mode: "insensitive" };

      const vendors = await prisma.vendor.findMany({
        where,
        include: {
          _count: { select: { orderItems: true } },
          riderAssignments: {
            include: {
              rider: {
                select: {
                  id: true, name: true, phone: true, status: true,
                  assignments: {
                    where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
                    select: { id: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = vendors.map(v => ({
        id: v.id,
        nameEn: v.businessName,
        phone: v.phone,
        district: v.district,
        thana: v.thana,
        bazar: v.bazar,
        activeOrders: v._count.orderItems,
        assignedRiders: v.riderAssignments.map(ra => ({
          id: ra.rider.id,
          name: ra.rider.name,
          phone: ra.rider.phone,
          status: ra.rider.status,
          activeDeliveries: ra.rider.assignments.length,
        })),
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

  // PATCH /api/vendors/:id — approve, suspend or update commission
  fastify.patch("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as {
        status?: any;
        commissionRate?: number;
        // Location fields for approval
        district?: string;
        thana?: string;
        bazar?: string;
      };

      const updateData: any = {};
      if (body.status) updateData.status = body.status;
      if (body.commissionRate !== undefined) updateData.commissionRate = Number(body.commissionRate);

      // If approving with location, set location fields too
      if (body.status === "APPROVED" && (body.district || body.thana || body.bazar)) {
        if (body.district) updateData.district = body.district;
        if (body.thana) updateData.thana = body.thana;
        if (body.bazar) updateData.bazar = body.bazar;
        updateData.locationSetAt = new Date();
        updateData.approvedAt = new Date();
      }

      const vendor = await prisma.vendor.update({
        where: { id },
        data: updateData,
      });

      return reply.send({ success: true, data: vendor });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // GET /api/vendors/:id/riders — get riders assigned to this vendor
  fastify.get("/:id/riders", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const assignments = await prisma.vendorRiderAssignment.findMany({
        where: { vendorId: id },
        include: {
          rider: {
            select: {
              id: true, name: true, phone: true, vehicleType: true,
              status: true, kycStatus: true, district: true, thana: true, bazar: true,
              assignments: {
                where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
                select: { id: true },
              },
            },
          },
        },
      });
      return reply.send({
        success: true,
        data: assignments.map(a => ({
          ...a.rider,
          activeDeliveries: a.rider.assignments.length,
        })),
      });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
