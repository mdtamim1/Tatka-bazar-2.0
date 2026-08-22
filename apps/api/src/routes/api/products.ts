import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { catalogCache } from "../../services/cache/memory-cache.js";

export async function productRoutes(fastify: FastifyInstance) {
  // GET /api/products — list products with search, category, vendor, organic filters (RAM Cached)
  fastify.get("/", async (request, reply) => {
    try {
      const query = request.query as {
        category?: string;
        vendorId?: string;
        search?: string;
        featured?: string;
        limit?: string;
        page?: string;
      };

      const cacheKey = `products:${JSON.stringify(query)}`;
      const cached = catalogCache.get(cacheKey);

      if (cached) {
        reply.header("X-Cache", "HIT-RAM");
        return reply.send(cached);
      }

      const where: any = { isPublished: true };

      if (query.category) {
        where.category = { slug: query.category };
      }
      if (query.vendorId) {
        where.vendorId = query.vendorId;
      }
      if (query.featured === "true") {
        where.isFeatured = true;
      }
      if (query.search) {
        where.OR = [
          { name: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
          { sku: { contains: query.search, mode: "insensitive" } },
        ];
      }

      const take = query.limit ? Math.min(Number(query.limit), 100) : 50;
      const skip = query.page ? (Number(query.page) - 1) * take : 0;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true, slug: true } },
            vendor: { select: { id: true, businessName: true, slug: true } },
            images: { orderBy: { sortOrder: "asc" } },
            pricingRules: { where: { isActive: true } },
          },
          orderBy: { createdAt: "desc" },
          take,
          skip,
        }),
        prisma.product.count({ where }),
      ]);

      const responsePayload = {
        success: true,
        data: products,
        meta: { total, page: Number(query.page) || 1, limit: take },
      };

      // Store in RAM for 60 seconds
      catalogCache.set(cacheKey, responsePayload, 60);

      // Edge CDN & Browser Cache Headers (Cloudflare / Vercel Edge caching)
      reply.header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
      reply.header("CDN-Cache-Control", "max-age=300");
      reply.header("Cloudflare-CDN-Cache-Control", "max-age=600");
      reply.header("X-Cache", "MISS-DB");
      return reply.send(responsePayload);
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // GET /api/products/:slug — get single product details
  fastify.get("/:slug", async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          vendor: { select: { id: true, businessName: true, slug: true, description: true, logoUrl: true } },
          images: { orderBy: { sortOrder: "asc" } },
          pricingRules: { where: { isActive: true } },
          reviews: {
            include: { user: { select: { id: true, name: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!product) {
        return reply.status(404).send({ success: false, error: "Product not found" });
      }

      return reply.send({ success: true, data: product });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });

  // POST /api/products — create product
  fastify.post("/", async (request, reply) => {
    try {
      const body = request.body as any;
      const { name, slug, description, price, comparePrice, sku, stock, categoryId, vendorId, isFeatured, images } = body;

      const product = await prisma.product.create({
        data: {
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description,
          price: Number(price),
          comparePrice: comparePrice ? Number(comparePrice) : null,
          sku,
          stock: Number(stock) || 0,
          isPublished: true,
          isFeatured: Boolean(isFeatured),
          categoryId,
          vendorId: vendorId || null,
          images: images && Array.isArray(images) ? {
            create: images.map((url: string, index: number) => ({ url, sortOrder: index })),
          } : undefined,
        },
        include: { category: true, images: true },
      });

      // Invalidate cache
      catalogCache.invalidate("products");

      return reply.status(201).send({ success: true, data: product });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // PATCH /api/products/:id — update product
  fastify.patch("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const body = request.body as any;

      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.price !== undefined && { price: Number(body.price) }),
          ...(body.comparePrice !== undefined && { comparePrice: Number(body.comparePrice) }),
          ...(body.stock !== undefined && { stock: Number(body.stock) }),
          ...(body.isPublished !== undefined && { isPublished: Boolean(body.isPublished) }),
          ...(body.isFeatured !== undefined && { isFeatured: Boolean(body.isFeatured) }),
          ...(body.categoryId && { categoryId: body.categoryId }),
        },
        include: { category: true, images: true },
      });

      // Invalidate cache
      catalogCache.invalidate("products");

      return reply.send({ success: true, data: product });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
