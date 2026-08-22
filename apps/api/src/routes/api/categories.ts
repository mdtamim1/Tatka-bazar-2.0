import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { catalogCache } from "../../services/cache/memory-cache.js";

export async function categoryRoutes(fastify: FastifyInstance) {
  // GET /api/categories — list all active categories with tree structure and product count (RAM Cached)
  fastify.get("/", async (_request, reply) => {
    try {
      const cacheKey = "categories:tree";
      const cached = catalogCache.get(cacheKey);
      if (cached) {
        reply.header("X-Cache", "HIT-RAM");
        return reply.send(cached);
      }

      const categories = await prisma.category.findMany({
        where: { isActive: true, parentId: null },
        include: {
          children: {
            where: { isActive: true },
            include: {
              _count: { select: { products: true } },
            },
            orderBy: { sortOrder: "asc" },
          },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: "asc" },
      });

      const responsePayload = { success: true, data: categories };
      catalogCache.set(cacheKey, responsePayload, 120); // 2 minutes TTL

      // Edge CDN & Cloudflare Cache Headers
      reply.header("Cache-Control", "public, max-age=120, s-maxage=600, stale-while-revalidate=1200");
      reply.header("CDN-Cache-Control", "max-age=600");
      reply.header("Cloudflare-CDN-Cache-Control", "max-age=1200");
      reply.header("X-Cache", "MISS-DB");
      return reply.send(responsePayload);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/categories/:slug — single category with products
  fastify.get("/:slug", async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          children: true,
          products: {
            where: { isPublished: true },
            include: { images: true, pricingRules: true, vendor: true },
            take: 20,
          },
        },
      });

      if (!category) {
        return reply.status(404).send({ success: false, error: "Category not found" });
      }

      return reply.send({ success: true, data: category });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
