import { getRedisClient } from "./client";

// ============================================================
// Tatka Bazar — Resilient Background Queue Engine
// Fast, durable Redis queue with automatic retries,
// dead-letter handling, and in-memory offline fallback.
// ============================================================

export const QUEUES = {
  DISPATCH: "tatka:queue:dispatch",
  NOTIFICATIONS: "tatka:queue:notifications",
  SYNC: "tatka:queue:sync",
} as const;

export type QueueName = typeof QUEUES[keyof typeof QUEUES] | string;

export interface QueueJob<T = any> {
  id: string;
  queue: string;
  data: T;
  attempts: number;
  maxRetries: number;
  enqueuedAt: string;
  processedAt?: string;
  error?: string;
}

export interface EnqueueOptions {
  maxRetries?: number;
}

// In-memory fallback queue for when Redis server is offline
const memoryQueues = new Map<string, QueueJob[]>();

function getMemoryQueue(queueName: string): QueueJob[] {
  if (!memoryQueues.has(queueName)) {
    memoryQueues.set(queueName, []);
  }
  return memoryQueues.get(queueName)!;
}

export async function enqueueJob<T = any>(
  queue: QueueName,
  data: T,
  options?: EnqueueOptions
): Promise<QueueJob<T>> {
  const job: QueueJob<T> = {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    queue,
    data,
    attempts: 0,
    maxRetries: options?.maxRetries ?? 3,
    enqueuedAt: new Date().toISOString(),
  };

  try {
    const client = getRedisClient();
    await client.lpush(queue, JSON.stringify(job));
  } catch {
    // Redis offline: push to local memory queue
    getMemoryQueue(queue).unshift(job);
  }

  return job;
}

export interface WorkerOptions {
  pollIntervalMs?: number;
  concurrency?: number;
}

export function createQueueWorker<T = any>(
  queue: QueueName,
  handler: (job: QueueJob<T>) => Promise<void> | void,
  options?: WorkerOptions
): { stop: () => void } {
  const pollInterval = options?.pollIntervalMs ?? 1500;
  let running = true;

  const processNextJob = async () => {
    if (!running) return;

    let rawJob: string | null = null;
    let job: QueueJob<T> | null = null;
    let isFromMemory = false;

    try {
      const client = getRedisClient();
      rawJob = await client.rpop(queue);
      if (rawJob) {
        job = JSON.parse(rawJob);
      }
    } catch {
      // Offline fallback: check memory queue
      const memQueue = getMemoryQueue(queue);
      if (memQueue.length > 0) {
        job = memQueue.pop()! as QueueJob<T>;
        isFromMemory = true;
      }
    }

    if (job) {
      job.attempts += 1;
      job.processedAt = new Date().toISOString();

      try {
        await handler(job);
      } catch (err: any) {
        job.error = err?.message || String(err);

        if (job.attempts < job.maxRetries) {
          // Re-enqueue for retry
          try {
            const client = getRedisClient();
            await client.lpush(queue, JSON.stringify(job));
          } catch {
            getMemoryQueue(queue).unshift(job);
          }
        } else {
          // Push to Dead Letter Queue (DLQ)
          const dlqKey = `${queue}:dlq`;
          try {
            const client = getRedisClient();
            await client.lpush(dlqKey, JSON.stringify(job));
          } catch {
            getMemoryQueue(dlqKey).unshift(job);
          }
        }
      }
    }

    if (running) {
      setTimeout(processNextJob, pollInterval);
    }
  };

  // Start consumer loop
  setTimeout(processNextJob, 500);

  return {
    stop: () => {
      running = false;
    },
  };
}

export async function getQueueStats(queue: QueueName): Promise<{ pending: number; isOfflineFallback: boolean }> {
  try {
    const client = getRedisClient();
    const len = await client.llen(queue);
    return { pending: len, isOfflineFallback: false };
  } catch {
    const mem = getMemoryQueue(queue);
    return { pending: mem.length, isOfflineFallback: true };
  }
}
