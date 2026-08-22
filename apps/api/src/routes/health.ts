import type { FastifyInstance } from "fastify";

export async function healthRoute(fastify: FastifyInstance) {
  fastify.get("/health", async (_request, _reply) => {
    const mem = process.memoryUsage();
    return {
      success: true,
      data: {
        status: "ok",
        service: "tatka-bazar-api",
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        memory: {
          rssMb: `${Math.round(mem.rss / 1024 / 1024)} MB`,
          heapUsedMb: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
          heapTotalMb: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
        },
        circuitBreaker: "ARMED_HEALTHY",
      },
    };
  });
}
