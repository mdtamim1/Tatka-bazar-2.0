import { EventEmitter } from "events";
import { getRedisClient } from "./client";

// ============================================================
// Tatka Bazar — Resilient Background Queue Engine
// Fast, durable Redis queue with automatic retries,
// dead-letter handling, smart adaptive polling, and in-memory fallback.
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

// In-process event emitter for instant wake-up of idle queue workers
const queueNotifier = new EventEmitter();
queueNotifier.setMaxListeners(50);

// In-memory fallback queue for when Redis server is offline or quota exceeded
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
    // Redis offline / error: push to local memory queue
    getMemoryQueue(queue).unshift(job);
  }

  // Instantly wake up any local worker listening on this queue (0ms wait)
  queueNotifier.emit(`enqueue:${queue}`);

  return job;
}

export interface WorkerOptions {
  pollIntervalMs?: number;      // Fast interval when processing active backlog (default: 300ms)
  idlePollIntervalMs?: number;  // Max backoff interval when queue is empty (default: 15000ms)
  concurrency?: number;
}

export function createQueueWorker<T = any>(
  queue: QueueName,
  handler: (job: QueueJob<T>) => Promise<void> | void,
  options?: WorkerOptions
): { stop: () => void } {
  const activeInterval = options?.pollIntervalMs ?? 300;
  const maxIdleInterval = options?.idlePollIntervalMs ?? 15000;

  let currentDelay = activeInterval;
  let running = true;
  let timer: NodeJS.Timeout | null = null;
  let redisCooloffUntil = 0; // Skip Redis calls during cooloff if quota exceeded or offline

  const scheduleNext = (delay: number) => {
    if (!running) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(processNextJob, delay);
  };

  // Instant wake-up on local enqueue
  const onJobEnqueued = () => {
    if (!running) return;
    currentDelay = activeInterval;
    scheduleNext(10); // Process immediately (10ms)
  };
  queueNotifier.on(`enqueue:${queue}`, onJobEnqueued);

  const processNextJob = async () => {
    if (!running) return;

    let rawJob: string | null = null;
    let job: QueueJob<T> | null = null;
    let isFromMemory = false;

    // Check memory queue first (free, instant)
    const memQueue = getMemoryQueue(queue);
    if (memQueue.length > 0) {
      job = memQueue.pop()! as QueueJob<T>;
      isFromMemory = true;
    } else {
      // Check Redis only if cooloff period has passed
      const now = Date.now();
      if (now >= redisCooloffUntil) {
        try {
          const client = getRedisClient();
          rawJob = await client.rpop(queue);
          if (rawJob) {
            job = JSON.parse(rawJob);
          }
        } catch {
          // If Redis throws (quota limit exceeded or network down), cool off for 30s
          redisCooloffUntil = Date.now() + 30000;
        }
      }
    }

    if (job) {
      // Job found: reset to fast interval to clear queue rapidly
      currentDelay = activeInterval;
      job.attempts += 1;
      job.processedAt = new Date().toISOString();

      try {
        await handler(job);
      } catch (err: any) {
        job.error = err?.message || String(err);

        if (job.attempts < job.maxRetries) {
          // Re-enqueue for retry
          try {
            if (Date.now() < redisCooloffUntil) {
              getMemoryQueue(queue).unshift(job);
            } else {
              const client = getRedisClient();
              await client.lpush(queue, JSON.stringify(job));
            }
          } catch {
            getMemoryQueue(queue).unshift(job);
          }
        } else {
          // Push to Dead Letter Queue (DLQ)
          const dlqKey = `${queue}:dlq`;
          try {
            if (Date.now() < redisCooloffUntil) {
              getMemoryQueue(dlqKey).unshift(job);
            } else {
              const client = getRedisClient();
              await client.lpush(dlqKey, JSON.stringify(job));
            }
          } catch {
            getMemoryQueue(dlqKey).unshift(job);
          }
        }
      }

      // Schedule next item immediately
      scheduleNext(activeInterval);
    } else {
      // Queue is empty: adaptively back off (e.g. 2s -> 4s -> 8s ... up to maxIdleInterval)
      currentDelay = Math.min(Math.max(currentDelay * 1.5, 2000), maxIdleInterval);
      scheduleNext(currentDelay);
    }
  };

  // Start consumer loop with initial fast check
  timer = setTimeout(processNextJob, 500);

  return {
    stop: () => {
      running = false;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      queueNotifier.off(`enqueue:${queue}`, onJobEnqueued);
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
