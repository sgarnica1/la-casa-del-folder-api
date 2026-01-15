import { Router } from "express";
import { DraftController } from "../controllers/DraftController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createDraftRoutes(draftController: DraftController): Router {
  const router = Router();

  router.post("/", asyncHandler((req, res, next) => draftController.create(req, res, next)));
  router.post("/:id/lock", asyncHandler((req, res, next) => draftController.lock(req, res, next)));

  return router;
}
