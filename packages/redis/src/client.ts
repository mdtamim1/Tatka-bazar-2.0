import { Redis } from "ioredis";

// ============================================================
// Tatka Bazar — Resilient Redis Connection Manager
// Supports local docker (port 6380/6379), cloud Redis (Upstash/Aiven),
// and safe offline fallback mode.
// ============================================================

const DEFAULT_REDIS_URL =
  process.env["REDIS_URL"] ||
  process.env["REDIS_PRIVATE_URL"] ||
  "redis://localhost:6380"; // Matches docker-compose port 6380:6379

let clientInstance: Redis | null = null;
let subInstance: Redis | null = null;
let isConnected = false;
let hasReportedOffline = false;

function createRedisConnection(name: string): Redis {
  const redis = new Redis(DEFAULT_REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        if (!hasReportedOffline) {
          console.warn(`[Redis:${name}] Server unreachable at ${DEFAULT_REDIS_URL}. Running in offline fallback mode.`);
          hasReportedOffline = true;
        }
        return Math.min(times * 1000, 10000); // Back off to 10s
      }
      return 1000;
    },
    reconnectOnError(err) {
      const targetErrors = ["READONLY", "ETIMEDOUT", "ECONNREFUSED"];
      return targetErrors.some((e) => err.message.includes(e));
    },
    lazyConnect: true,
    enableReadyCheck: false,
    enableOfflineQueue: false,
    autoResubscribe: true,
    autoResendUnfulfilledCommands: false,
  });

  redis.on("connect", () => {
    isConnected = true;
    hasReportedOffline = false;
  });

  redis.on("ready", () => {
    isConnected = true;
  });

  redis.on("error", (err) => {
    isConnected = false;
    // Suppress spamming unhandled ECONNREFUSED when docker is off
    if (!hasReportedOffline) {
      console.warn(`[Redis:${name}] Offline: ${err.message}`);
      hasReportedOffline = true;
    }
  });

  redis.on("close", () => {
    isConnected = false;
  });

  // Attempt initial connect asynchronously
  redis.connect().catch(() => {
    isConnected = false;
  });

  return redis;
}

export function getRedisClient(): Redis {
  if (!clientInstance) {
    clientInstance = createRedisConnection("client");
  }
  return clientInstance;
}

export function getRedisSubscriber(): Redis {
  if (!subInstance) {
    subInstance = createRedisConnection("sub");
  }
  return subInstance;
}

export async function isRedisConnected(): Promise<boolean> {
  if (!clientInstance) return false;
  try {
    const res = await Promise.race([
      clientInstance.ping(),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 800)),
    ]);
    return res === "PONG";
  } catch {
    return false;
  }
}

export async function closeRedis(): Promise<void> {
  if (clientInstance) {
    await clientInstance.quit().catch(() => {});
    clientInstance = null;
  }
  if (subInstance) {
    await subInstance.quit().catch(() => {});
    subInstance = null;
  }
  isConnected = false;
}
