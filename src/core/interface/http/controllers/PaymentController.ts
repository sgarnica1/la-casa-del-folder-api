import { Response, NextFunction } from "express";
import { CreatePaymentPreference } from "../../../application/use-cases/payments/CreatePaymentPreference";
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "../middleware/authMiddleware";

export class PaymentController {
  constructor(
    private createPaymentPreference: CreatePaymentPreference
  ) { }

  async createPreference(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const { orderId } = req.body as { orderId: string };

    if (!orderId) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "orderId is required" } });
      return;
    }

    try {
      const userId = req.userAuth.userId;
      const result = await this.createPaymentPreference.execute({ orderId, userId });

      res.status(200).json({
        preferenceId: result.preferenceId,
        initPoint: result.initPoint,
        sandboxInitPoint: result.sandboxInitPoint,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ForbiddenError) {
        res.status(403).json({ error: { code: "FORBIDDEN", message: error.message } });
        return;
      }

      console.error("Create payment preference error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create payment preference" } });
    }
  }
}
