import type { FastifyInstance } from "fastify";
import { prisma } from "@tatka-bazar/database";
import { createBkashPayment, executeBkashPayment } from "../../services/payment/bkash.js";
import { initSSLCommerzPayment } from "../../services/payment/sslcommerz.js";

export async function paymentRoutes(fastify: FastifyInstance) {
  // POST /api/payment/bkash/create — create bKash session
  fastify.post("/bkash/create", async (request, reply) => {
    try {
      const body = request.body as {
        orderId: string;
        orderNumber: string;
        amount: number;
        payerPhone?: string;
      };

      const result = await createBkashPayment({
        amount: body.amount,
        orderNumber: body.orderNumber,
        payerReference: body.payerPhone,
      });

      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/payment/bkash/execute — execute and verify bKash payment
  fastify.post("/bkash/execute", async (request, reply) => {
    try {
      const body = request.body as {
        paymentID: string;
        orderId?: string;
        orderNumber?: string;
      };

      const result = await executeBkashPayment(body.paymentID);

      // If orderId provided, mark order as PAID in Supabase!
      if (body.orderId || body.orderNumber) {
        await prisma.order.updateMany({
          where: {
            OR: [
              ...(body.orderId ? [{ id: body.orderId }] : []),
              ...(body.orderNumber ? [{ orderNumber: body.orderNumber }] : []),
            ],
          },
          data: {
            paymentStatus: "PAID",
            paidAt: new Date(),
            status: "CONFIRMED",
          },
        });
      }

      return reply.send({
        success: true,
        data: result,
        message: "Payment successfully verified and captured with bKash PGW",
      });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/payment/sslcommerz/init — init SSLCommerz session
  fastify.post("/sslcommerz/init", async (request, reply) => {
    try {
      const body = request.body as any;
      const result = await initSSLCommerzPayment({
        amount: Number(body.amount),
        orderNumber: body.orderNumber,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        customerAddress: body.customerAddress,
      });

      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });

  // POST /api/payment/sslcommerz/ipn — IPN listener
  fastify.post("/sslcommerz/ipn", async (request, reply) => {
    try {
      const body = request.body as any;
      if (body.tran_id && (body.status === "VALID" || body.status === "VALIDATED")) {
        await prisma.order.updateMany({
          where: { orderNumber: body.tran_id },
          data: { paymentStatus: "PAID", paidAt: new Date(), status: "CONFIRMED" },
        });
      }
      return reply.send({ success: true, message: "IPN Received" });
    } catch (err: any) {
      return reply.status(400).send({ success: false, error: err.message });
    }
  });
}
