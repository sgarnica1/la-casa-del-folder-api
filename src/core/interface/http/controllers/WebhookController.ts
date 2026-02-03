import { Request, Response, NextFunction } from "express";
import { ProcessPaymentWebhook } from "../../../application/use-cases/payments/ProcessPaymentWebhook";
import { parseSignature, validateWebhookSignature } from "../../../infrastructure/mercadopago/webhook-validator";
import { ValidationError } from "../../../domain/errors/DomainErrors";

export class WebhookController {
  constructor(
    private processPaymentWebhook: ProcessPaymentWebhook
  ) { }

  async handleWebhook(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const xSignature = req.headers["x-signature"] as string;
      const xRequestId = req.headers["x-request-id"] as string;
      const dataId = req.query["data.id"] as string;

      if (!xSignature || !xRequestId || !dataId) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Missing required webhook headers or query params" } });
        return;
      }

      const signature = parseSignature(xSignature);
      if (!signature) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid signature format" } });
        return;
      }

      const isValid = validateWebhookSignature(dataId, xRequestId, signature.ts, signature.v1);
      if (!isValid) {
        console.error("Webhook signature validation failed", {
          dataId,
          requestId: xRequestId,
          ts: signature.ts,
        });
        res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid webhook signature" } });
        return;
      }

      const notification = req.body;
      if (!notification || notification.type !== "payment") {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid notification type" } });
        return;
      }

      await this.processPaymentWebhook.execute(notification);

      res.status(200).json({ received: true });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message } });
        return;
      }

      console.error("Webhook processing error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to process webhook" } });
    }
  }
}
