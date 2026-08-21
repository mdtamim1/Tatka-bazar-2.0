import type { FastifyInstance } from "fastify";

export async function healthRoute(fastify: FastifyInstance) {
  fastify.get("/health", async (_request, _reply) => {
    return {
      success: true,
      data: {
        status: "ok",
        service: "tatka-bazar-api",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    };
  });
}
