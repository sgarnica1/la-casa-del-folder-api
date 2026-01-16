import { Router } from "express";
import { LayoutController } from "../controllers/LayoutController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createLayoutRoutes(layoutController: LayoutController): Router {
  const router = Router();

  router.get("/:templateId", asyncHandler((req, res, next) => layoutController.getByTemplateId(req, res, next)));

  return router;
}
