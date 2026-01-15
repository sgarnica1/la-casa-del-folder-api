import { Request, Response, NextFunction } from "express";
import { CreateOrder } from "../../../application/use-cases/orders/CreateOrder";
import { NotFoundError } from "../../../domain/errors/DomainErrors";

export class OrderController {
  constructor(private createOrder: CreateOrder) { }

  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { draftId } = req.body as { draftId: string };

    if (!draftId) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "draftId is required" } });
      return;
    }

    try {
      const order = await this.createOrder.execute({ draftId });

      res.status(201).json({
        orderId: order.id,
        draftId: order.draftId,
        status: order.state,
        createdAt: order.createdAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof Error && error.message.includes("must be locked")) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message } });
        return;
      }

      console.error("Create order error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create order" } });
    }
  }
}
