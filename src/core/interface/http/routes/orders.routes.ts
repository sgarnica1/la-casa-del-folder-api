import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAdmin } from "../middleware/requireAdmin";
import { createCreateOrderGuard } from "../middleware/createOrderGuard";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";

export function createOrderRoutes(orderController: OrderController, draftRepository: DraftRepository): Router {
  const router = Router();

  const createOrderGuard = asyncHandler(createCreateOrderGuard(draftRepository));

  // Admin-only routes for dashboard
  router.get("/", requireAdmin, asyncHandler((req, res, next) => orderController.getAll(req, res, next)));
  router.get("/:id", requireAdmin, asyncHandler((req, res, next) => orderController.getById(req, res, next)));
  router.patch("/:id/status", requireAdmin, asyncHandler((req, res, next) => orderController.updateStatus(req, res, next)));
  router.get("/:id/activities", requireAdmin, asyncHandler((req, res, next) => orderController.getActivities(req, res, next)));

  // Customer route - create order (with draft ownership check)
  router.post("/", createOrderGuard, asyncHandler((req, res, next) => orderController.create(req, res, next)));

  return router;
}
