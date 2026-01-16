import { Router } from "express";
import { DraftController } from "../controllers/DraftController";
import { asyncHandler } from "../middleware/asyncHandler";
import { createDraftOwnershipGuard } from "../middleware/ownershipGuards";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";

export function createDraftRoutes(draftController: DraftController, draftRepository: DraftRepository): Router {
  const router = Router();

  const draftOwnershipGuard = createDraftOwnershipGuard(draftRepository);

  router.get("/:id", draftOwnershipGuard, asyncHandler((req, res, next) => draftController.getById(req, res, next)));
  router.post("/", asyncHandler((req, res, next) => draftController.create(req, res, next)));

  // GUARD: All mutation routes require draft to be in "editing" status AND ownership
  router.patch("/:id", draftOwnershipGuard, draftController.mutationGuard(), asyncHandler((req, res, next) => draftController.update(req, res, next)));
  router.post("/:id/lock", draftOwnershipGuard, asyncHandler((req, res, next) => draftController.lock(req, res, next)));

  return router;
}
