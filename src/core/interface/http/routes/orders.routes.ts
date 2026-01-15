import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();

  router.post("/", asyncHandler((req, res, next) => orderController.create(req, res, next)));

  return router;
}
