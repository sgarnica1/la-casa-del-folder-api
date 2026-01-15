import { Router } from "express";
import { DraftController } from "../controllers/DraftController";
import { AssetController } from "../controllers/AssetController";
import { OrderController } from "../controllers/OrderController";
import { HealthController } from "../controllers/HealthController";

export function createRoutes(
  draftController: DraftController,
  assetController: AssetController,
  orderController: OrderController,
  healthController: HealthController
): Router {
  const router = Router();

  router.get("/health", (req, res) => healthController.check(req, res));

  router.post("/drafts", (req, res) => draftController.create(req, res));
  router.post("/drafts/:id/lock", (req, res) => draftController.lock(req, res));

  router.post("/assets", (req, res) => assetController.upload(req, res));

  router.post("/orders", (req, res) => orderController.create(req, res));

  return router;
}
