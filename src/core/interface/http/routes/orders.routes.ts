import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();

  router.get("/", asyncHandler((req, res, next) => orderController.getAll(req, res, next)));
  router.get("/:id", asyncHandler((req, res, next) => orderController.getById(req, res, next)));
  router.post("/", asyncHandler((req, res, next) => orderController.create(req, res, next)));

  return router;
}
