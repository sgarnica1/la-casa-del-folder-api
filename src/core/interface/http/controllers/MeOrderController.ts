import { Response, NextFunction } from "express";
import { GetMyOrders } from "../../../application/use-cases/orders/GetMyOrders";
import { GetMyOrderById } from "../../../application/use-cases/orders/GetMyOrderById";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "../middleware/authMiddleware";

export class MeOrderController {
  constructor(
    private getMyOrdersUseCase: GetMyOrders,
    private getMyOrderByIdUseCase: GetMyOrderById
  ) { }

  async getMyOrders(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const orders = await this.getMyOrdersUseCase.execute({ userId: req.userAuth.userId });
      res.json(
        orders.map((order) => ({
          id: order.id,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt.toISOString(),
          title: order.title,
          coverUrl: order.coverUrl,
          productName: order.productName,
        }))
      );
    } catch (error) {
      console.error("Get my orders error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get orders" } });
    }
  }

  async getMyOrderById(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Order ID is required" } });
      return;
    }

    try {
      const order = await this.getMyOrderByIdUseCase.execute({ orderId: id, userId: req.userAuth.userId });

      res.json({
        id: order.id,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        items: order.items.map((item) => ({
          id: item.id,
          productNameSnapshot: item.productNameSnapshot,
          variantNameSnapshot: item.variantNameSnapshot,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
          designSnapshotJson: item.designSnapshotJson,
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message } });
        return;
      }

      console.error("Get my order by id error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get order" } });
    }
  }
}
