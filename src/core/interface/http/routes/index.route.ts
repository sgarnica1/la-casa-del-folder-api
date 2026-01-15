import { Router } from "express";
import { DraftController } from "../controllers/DraftController";
import { AssetController } from "../controllers/AssetController";
import { OrderController } from "../controllers/OrderController";
import { HealthController } from "../controllers/HealthController";
import { createDraftRoutes } from "./drafts.routes";
import { createAssetRoutes } from "./assets.routes";
import { createOrderRoutes } from "./orders.routes";
import { createHealthRoutes } from "./health.routes";

export function createRoutes(
  draftController: DraftController,
  assetController: AssetController,
  orderController: OrderController,
  healthController: HealthController
): Router {
  const router = Router();

  router.use("/health", createHealthRoutes(healthController));
  router.use("/drafts", createDraftRoutes(draftController));
  router.use("/assets", createAssetRoutes(assetController));
  router.use("/orders", createOrderRoutes(orderController));

  return router;
}
