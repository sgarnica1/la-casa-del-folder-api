import { Request, Response } from "express";
import { CreateOrder } from "../../../application/use-cases/CreateOrder";

export class OrderController {
  constructor(private createOrder: CreateOrder) { }

  async create(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
