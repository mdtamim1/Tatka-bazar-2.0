import type { FastifyInstance } from "fastify";
import { getRedisClient } from "@tatka-bazar/redis";

// Chat message TTL: 7 days
const CHAT_TTL_SECONDS = 7 * 24 * 60 * 60;
// Max messages to keep per channel
const MAX_MESSAGES = 200;

export async function chatRoutes(fastify: FastifyInstance) {
  // GET /api/chat/:channelId — get messages for a channel
  fastify.get("/:channelId", async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    const limit = 100;

    try {
      const redis = getRedisClient();
      const key = `chat:${channelId}`;
      const raw = await redis.lrange(key, -limit, -1);
      const messages = raw.map((m) => {
        try { return JSON.parse(m); } catch { return null; }
      }).filter(Boolean);
      return reply.send({ success: true, data: messages });
    } catch (err: any) {
      // Graceful fallback — return empty if Redis is down
      fastify.log.warn(`[Chat] Redis unavailable: ${err.message}`);
      return reply.send({ success: true, data: [] });
    }
  });

  // POST /api/chat/:channelId — send a message
  fastify.post("/:channelId", async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    const body = request.body as {
      id: string;
      sender: string;
      senderName: string;
      text: string;
      timestamp: string;
    };

    if (!body.text?.trim() || !body.sender || !body.id) {
      return reply.status(400).send({ success: false, error: "id, sender, and text are required" });
    }

    const message = {
      id: body.id,
      sender: body.sender,
      senderName: body.senderName || body.sender,
      text: body.text.trim(),
      timestamp: body.timestamp || new Date().toISOString(),
    };

    try {
      const redis = getRedisClient();
      const key = `chat:${channelId}`;
      await redis.rpush(key, JSON.stringify(message));
      // Keep only last MAX_MESSAGES messages
      await redis.ltrim(key, -MAX_MESSAGES, -1);
      // Refresh TTL on every message
      await redis.expire(key, CHAT_TTL_SECONDS);
      return reply.status(201).send({ success: true, data: message });
    } catch (err: any) {
      fastify.log.warn(`[Chat] Redis unavailable: ${err.message}`);
      // Still return success — message shows locally even if not persisted
      return reply.status(201).send({ success: true, data: message });
    }
  });

  // DELETE /api/chat/:channelId — clear a channel (admin/support use)
  fastify.delete("/:channelId", async (request, reply) => {
    const { channelId } = request.params as { channelId: string };
    try {
      const redis = getRedisClient();
      await redis.del(`chat:${channelId}`);
      return reply.send({ success: true, message: "Channel cleared" });
    } catch (err: any) {
      return reply.status(500).send({ success: false, error: err.message });
    }
  });
}
