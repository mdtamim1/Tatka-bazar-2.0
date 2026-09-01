import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { createBkashPayment, executeBkashPayment } from "../../services/payment/bkash.js";
import { initSSLCommerzPayment } from "../../services/payment/sslcommerz.js";
import { idempotencyGuard } from "../../services/security/idempotency.js";

export async function paymentRoutes(fastify: FastifyInstance) {
  // POST /api/payment/bkash/create — create bKash session (Idempotent)
  fastify.post("/bkash/create", async (request, reply) => {
    try {
      const body = request.body as {
        orderId: string;
        orderNumber: string;
        amount: number;
        payerPhone?: string;
      };

      const idempotencyKey = `bkash:create:${body.orderNumber || body.orderId}`;
      const existing = idempotencyGuard.check(idempotencyKey);
      if (existing?.cachedResponse) {
        reply.header("X-Idempotent-Replay", "true");
        return reply.send(existing.cachedResponse);
      }

      idempotencyGuard.start(idempotencyKey);

      const result = await createBkashPayment({
        amount: body.amount,
        orderNumber: body.orderNumber,
        payerReference: body.payerPhone || undefined,
      });

      idempotencyGuard.complete(idempotencyKey, result);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/payment/bkash/execute — execute, verify amount & capture bKash payment
  fastify.post("/bkash/execute", async (request, reply) => {
    try {
      const body = request.body as {
        paymentID: string;
        orderId?: string;
        orderNumber?: string;
      };

      const idempotencyKey = `bkash:execute:${body.paymentID}`;
      const existing = idempotencyGuard.check(idempotencyKey);
      if (existing?.cachedResponse) {
        reply.header("X-Idempotent-Replay", "true");
        return reply.send(existing.cachedResponse);
      }

      idempotencyGuard.start(idempotencyKey);

      // 1. Execute with bKash Gateway
      const result = await executeBkashPayment(body.paymentID);

      // 2. Server-to-Server Amount & Order Tampering Verification
      if (body.orderId || body.orderNumber) {
        const order = await prisma.order.findFirst({
          where: {
            OR: [
              ...(body.orderId ? [{ id: body.orderId }] : []),
              ...(body.orderNumber ? [{ orderNumber: body.orderNumber }] : []),
            ],
          },
        });

        if (!order) {
          idempotencyGuard.release(idempotencyKey);
          return reply.status(404).send({ success: false, error: "Order not found for verification" });
        }

        // Amount verification: prevent price tampering
        if (result.amount && Number(result.amount) < Number(order.total)) {
          idempotencyGuard.release(idempotencyKey);
          return reply.status(400).send({
            success: false,
            error: "Payment Amount Mismatch (Security Tamper Alert)",
            message: "পরিশোধিত টাকার পরিমাণ অর্ডারের মূল্যের সাথে মেলেনি।",
          });
        }

        // Mark as verified and PAID
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            paidAt: new Date(),
            status: "CONFIRMED",
          },
        });
      }

      const responsePayload = {
        success: true,
        data: result,
        message: "Payment successfully verified and captured with bKash PGW (Server Verified)",
      };

      idempotencyGuard.complete(idempotencyKey, responsePayload);
      return reply.send(responsePayload);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/payment/sslcommerz/init — init SSLCommerz session (Idempotent)
  fastify.post("/sslcommerz/init", async (request, reply) => {
    try {
      const body = request.body as any;
      const idempotencyKey = `ssl:init:${body.orderNumber}`;
      const existing = idempotencyGuard.check(idempotencyKey);
      if (existing?.cachedResponse) {
        reply.header("X-Idempotent-Replay", "true");
        return reply.send(existing.cachedResponse);
      }

      idempotencyGuard.start(idempotencyKey);

      const result = await initSSLCommerzPayment({
        amount: Number(body.amount),
        orderNumber: body.orderNumber,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        customerAddress: body.customerAddress,
      });

      idempotencyGuard.complete(idempotencyKey, result);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/payment/sslcommerz/ipn — Server-to-Server IPN listener with amount check
  fastify.post("/sslcommerz/ipn", async (request, reply) => {
    try {
      const body = request.body as any;
      if (body.tran_id && (body.status === "VALID" || body.status === "VALIDATED")) {
        const order = await prisma.order.findUnique({
          where: { orderNumber: body.tran_id },
        });

        // Server-to-server amount check
        if (order && body.amount && Number(body.amount) >= Number(order.total)) {
          await prisma.order.update({
            where: { id: order.id },
            data: { paymentStatus: "PAID", paidAt: new Date(), status: "CONFIRMED" },
          });
        }
      }
      return reply.send({ success: true, message: "IPN Verified & Order Captured" });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
