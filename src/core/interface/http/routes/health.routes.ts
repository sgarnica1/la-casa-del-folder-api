import { Router } from "express";
import { HealthController } from "../controllers/HealthController";

export function createHealthRoutes(healthController: HealthController): Router {
  const router = Router();

  router.get("/", (req, res) => healthController.check(req, res));

  return router;
}
