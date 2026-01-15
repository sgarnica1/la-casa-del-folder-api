import { Router } from "express";
import { AssetController } from "../controllers/AssetController";
import { asyncHandler } from "../middleware/asyncHandler";
import { upload } from "../middleware/upload";

export function createAssetRoutes(assetController: AssetController): Router {
  const router = Router();

  router.get("/", asyncHandler((req, res, next) => assetController.getByIds(req, res, next)));
  router.post("/", upload.single("file"), asyncHandler((req, res, next) => assetController.upload(req, res, next)));

  return router;
}
