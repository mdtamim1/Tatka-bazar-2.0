import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Auto-load DATABASE_URL from .env files if not already set in process.env
if (!process.env["DATABASE_URL"]) {
  const envCandidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), "../.env"),
    "C:/Users/World/Desktop/Tatka-bazar-2.0-main/.env",
  ];
  for (const envPath of envCandidates) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const eqIdx = trimmed.indexOf("=");
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
        if (process.env["DATABASE_URL"]) break;
      }
    } catch {}
  }

  if (!process.env["DATABASE_URL"]) {
    process.env["DATABASE_URL"] = "postgresql://postgres:password@localhost:5432/tatka_bazar?schema=public";
  }
}

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

