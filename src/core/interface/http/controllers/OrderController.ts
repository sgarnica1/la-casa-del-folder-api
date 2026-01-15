import { Request, Response, NextFunction } from "express";
import { CreateOrder } from "../../../application/use-cases/orders/CreateOrder";

export class OrderController {
  constructor(private createOrder: CreateOrder) { }

  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
