import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "@tatka-bazar/database";

export async function riderRoutes(fastify: FastifyInstance) {
  // GET /api/riders — list all delivery riders with counts
  fastify.get("/", async (_request, reply) => {
    try {
      const riders = await prisma.deliveryRider.findMany({
        include: {
          assignments: {
            where: { status: { in: ["ASSIGNED", "PICKED_UP"] } },
            select: { id: true, status: true, orderId: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const formatted = riders.map(r => ({
        id: r.id,
        name: r.name,
        phone: r.phone,
        email: r.email,
        nid: r.nidNumber || "N/A",
        vehicleType: r.vehicleType,
        assignedHubId: "branch-dhanmondi",
        assignedHubName: "Dhanmondi Express Hub",
        status: r.status,
        activeDeliveriesCount: r.assignments.length,
        totalDeliveriesCompleted: 12,
        rating: 4.9,
        balancePayable: 0,
      }));

      return reply.send({ success: true, data: formatted });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/riders — register new rider
  fastify.post("/", async (request, reply) => {
    try {
      const body = request.body as {
        name: string;
        phone: string;
        email?: string;
        nid?: string;
        vehicleType?: "BICYCLE" | "MOTORCYCLE" | "VAN";
      };

      const passwordHash = await bcrypt.hash("Rider@tatka2024!", 12);
      const rider = await (prisma.deliveryRider.create as any)({
        data: {
          name: body.name,
          phone: body.phone,
          email: body.email || `rider_${body.phone.replace(/[^0-9]/g, "")}@tatkabazar.com`,
          nidNumber: body.nid || null,
          vehicleType: body.vehicleType || "MOTORCYCLE",
          status: "AVAILABLE",
          passwordHash,
        },
      });

      return reply.status(201).send({ success: true, data: rider });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/riders/:id — update rider status
  fastify.patch("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as { status?: any; vehicleType?: any };

      const rider = await prisma.deliveryRider.update({
        where: { id },
        data: {
          ...(body.status && { status: body.status }),
          ...(body.vehicleType && { vehicleType: body.vehicleType }),
        },
      });

      return reply.send({ success: true, data: rider });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
