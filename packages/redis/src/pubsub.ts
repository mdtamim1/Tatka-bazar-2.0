import { getRedisClient, getRedisSubscriber, isRedisConnected } from "./client";

// ============================================================
// Tatka Bazar — Redis Pub/Sub Event Bus
// Lightweight, cross-portal real-time messaging
// ============================================================

export const REDIS_CHANNELS = {
  PORTAL_EVENTS: "tatka:channel:events",
  DISPATCH: "tatka:channel:dispatch",
  NOTIFICATIONS: "tatka:channel:notifications",
  SYSTEM: "tatka:channel:system",
} as const;

export type RedisChannel = typeof REDIS_CHANNELS[keyof typeof REDIS_CHANNELS];

export interface RedisPubSubMessage<T = any> {
  id: string;
  channel: string;
  type: string;
  data: T;
  timestamp: string;
}

export async function publishEvent<T = any>(
  channel: RedisChannel | string,
  type: string,
  data: T
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const message: RedisPubSubMessage<T> = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      channel,
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    const count = await client.publish(channel, JSON.stringify(message));
    return count >= 0;
  } catch (err) {
    // Offline / unhandled error fallback
    return false;
  }
}

export async function subscribeEvents<T = any>(
  channel: RedisChannel | string,
  handler: (message: RedisPubSubMessage<T>) => void | Promise<void>
): Promise<() => void> {
  const subscriber = getRedisSubscriber();

  try {
    await subscriber.subscribe(channel);
  } catch {
    // Ignore if offline during subscribe
  }

  const messageListener = (chan: string, raw: string) => {
    if (chan !== channel) return;
    try {
      const parsed: RedisPubSubMessage<T> = JSON.parse(raw);
      handler(parsed);
    } catch {
      // Non-JSON message payload
    }
  };

  subscriber.on("message", messageListener);

  return () => {
    subscriber.off("message", messageListener);
    subscriber.unsubscribe(channel).catch(() => {});
  };
}
