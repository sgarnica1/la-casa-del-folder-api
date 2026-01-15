import { Router } from "express";
import { AssetController } from "../controllers/AssetController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createAssetRoutes(assetController: AssetController): Router {
  const router = Router();

  router.post("/", asyncHandler((req, res, next) => assetController.upload(req, res, next)));

  return router;
}
