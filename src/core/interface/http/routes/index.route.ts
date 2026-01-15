import { Router } from "express";
import type { Controllers } from "../controllers";
import { createDraftRoutes } from "./drafts.routes";
import { createAssetRoutes } from "./assets.routes";
import { createOrderRoutes } from "./orders.routes";
import { createHealthRoutes } from "./health.routes";
import { createLayoutRoutes } from "./layouts.routes";

export function createRoutes(controllers: Controllers): Router {
  const router = Router();

  router.use("/health", createHealthRoutes(controllers.healthController));
  router.use("/drafts", createDraftRoutes(controllers.draftController));
  router.use("/assets", createAssetRoutes(controllers.assetController));
  router.use("/orders", createOrderRoutes(controllers.orderController));
  router.use("/layouts", createLayoutRoutes(controllers.layoutController));

  return router;
}
