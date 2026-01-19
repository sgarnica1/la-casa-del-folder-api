import { Response, NextFunction } from "express";
import { CreateOrder } from "../../../application/use-cases/orders/CreateOrder";
import { GetAllOrders } from "../../../application/use-cases/orders/GetAllOrders";
import { GetOrderById } from "../../../application/use-cases/orders/GetOrderById";
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  ValidationError,
} from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "../middleware/authMiddleware";

export class OrderController {
  constructor(
    private createOrder: CreateOrder,
    private getAllOrders: GetAllOrders,
    private getOrderById: GetOrderById
  ) { }

  async create(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
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
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({ error: { code: "CONFLICT", message: error.message } });
        return;
      }

      if (error instanceof UnprocessableEntityError) {
        res.status(422).json({
          error: { code: "UNPROCESSABLE_ENTITY", message: error.message },
        });
        return;
      }

      console.error("Create order error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create order" } });
    }
  }

  async getAll(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.getAllOrders.execute({ page, limit });

      res.status(200).json({
        ...result,
        data: result.data.map((order) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        })),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      console.error("Get all orders error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get orders" } });
    }
  }

  async getById(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Order ID is required" } });
      return;
    }

    try {
      const result = await this.getOrderById.execute({ orderId: id });

      res.status(200).json({
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        items: result.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
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

      console.error("Get order by id error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get order" } });
    }
  }
}
