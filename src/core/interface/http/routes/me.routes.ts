import { Router } from "express";
import { MeDraftController } from "../controllers/MeDraftController";
import { MeOrderController } from "../controllers/MeOrderController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createMeRoutes(meDraftController: MeDraftController, meOrderController: MeOrderController): Router {
  const router = Router();

  router.get("/drafts", asyncHandler((req, res, next) => meDraftController.getMyDrafts(req, res, next)));
  router.get("/drafts/:id", asyncHandler((req, res, next) => meDraftController.getMyDraftById(req, res, next)));

  router.get("/orders", asyncHandler((req, res, next) => meOrderController.getMyOrders(req, res, next)));
  router.get("/orders/:id", asyncHandler((req, res, next) => meOrderController.getMyOrderById(req, res, next)));

  return router;
}
