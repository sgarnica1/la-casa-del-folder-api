import { Router } from "express";
import { DraftController } from "../controllers/DraftController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createDraftRoutes(draftController: DraftController): Router {
  const router = Router();

  router.get("/:id", asyncHandler((req, res, next) => draftController.getById(req, res, next)));
  router.post("/", asyncHandler((req, res, next) => draftController.create(req, res, next)));

  // GUARD: All mutation routes require draft to be in "editing" status
  router.patch("/:id", draftController.mutationGuard(), asyncHandler((req, res, next) => draftController.update(req, res, next)));
  router.post("/:id/lock", asyncHandler((req, res, next) => draftController.lock(req, res, next)));

  return router;
}
