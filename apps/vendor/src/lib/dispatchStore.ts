/**
 * Redis helper for dispatch tasks — uses Upstash REST API (fetch-based, no package needed).
 * Falls back to globalThis in-memory if UPSTASH_REDIS_REST_URL is not configured.
 *
 * Why Redis? Vercel serverless functions are ephemeral. globalThis is lost on:
 *   - Cold starts
 *   - Multi-instance deployments
 *   - Function restarts
 * Redis gives us persistence across all instances with TTL-based cleanup.
 */

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const TASKS_KEY = "tatka:vendor:dispatch:tasks";
const CHAT_KEY_PREFIX = "tatka:vendor:chat:";
const TASK_TTL = 60 * 60 * 24 * 2; // 2 days in seconds

// ──────────────────────────────────────────────────────────────────────────────
// In-memory fallback (development / no Redis configured)
// ──────────────────────────────────────────────────────────────────────────────
const g = globalThis as any;
if (!g._tatka_dispatch_tasks) g._tatka_dispatch_tasks = [];
if (!g._tatka_chat_messages) g._tatka_chat_messages = {};

async function redisCmd(command: string[]): Promise<any> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(`${REDIS_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    const data = await res.json();
    return data.result;
  } catch {
    return null;
  }
}

export async function getTasks(): Promise<any[]> {
  if (REDIS_URL && REDIS_TOKEN) {
    const raw = await redisCmd(["GET", TASKS_KEY]);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return [];
  }
  return g._tatka_dispatch_tasks || [];
}

export async function saveTasks(tasks: any[]): Promise<void> {
  if (REDIS_URL && REDIS_TOKEN) {
    await redisCmd(["SET", TASKS_KEY, JSON.stringify(tasks), "EX", String(TASK_TTL)]);
  } else {
    g._tatka_dispatch_tasks = tasks;
  }
}

export async function getChatMessages(orderId: string): Promise<any[]> {
  if (REDIS_URL && REDIS_TOKEN) {
    const raw = await redisCmd(["GET", CHAT_KEY_PREFIX + orderId]);
    if (raw) {
      try { return JSON.parse(raw); } catch {}
    }
    return [];
  }
  return g._tatka_chat_messages?.[orderId] || [];
}

export async function addChatMessage(orderId: string, message: any): Promise<void> {
  const messages = await getChatMessages(orderId);
  messages.push(message);
  // Keep last 100 messages per order
  const trimmed = messages.slice(-100);
  if (REDIS_URL && REDIS_TOKEN) {
    await redisCmd(["SET", CHAT_KEY_PREFIX + orderId, JSON.stringify(trimmed), "EX", String(TASK_TTL)]);
  } else {
    if (!g._tatka_chat_messages) g._tatka_chat_messages = {};
    g._tatka_chat_messages[orderId] = trimmed;
  }
}

export async function resetDispatch(): Promise<void> {
  if (REDIS_URL && REDIS_TOKEN) {
    await redisCmd(["DEL", TASKS_KEY]);
  } else {
    g._tatka_dispatch_tasks = [];
    g._tatka_chat_messages = {};
  }
}
