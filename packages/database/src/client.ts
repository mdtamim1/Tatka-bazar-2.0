import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in development (hot-reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize Prisma Client optimized for Supabase PgBouncer Transaction Pooler
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env["NODE_ENV"] === "development"
        ? ["error", "warn"]
        : ["error"],
  });

// Handle graceful disconnect on process termination to release PgBouncer pool slots
if (typeof process !== "undefined") {
  const gracefulShutdown = async () => {
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors on process exit
    }
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
  process.on("beforeExit", gracefulShutdown);
}

if (process.env["NODE_ENV"] !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
export { PrismaClient };
export * from "@prisma/client";

