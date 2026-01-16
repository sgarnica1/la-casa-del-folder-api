import { Router } from "express";
import { getAuth } from "@clerk/express";
import type { Controllers } from "../controllers";
import type { Repositories } from "../../../domain/repositories";
import { createDraftRoutes } from "./drafts.routes";
import { createAssetRoutes } from "./assets.routes";
import { createOrderRoutes } from "./orders.routes";
import { createHealthRoutes } from "./health.routes";
import { createLayoutRoutes } from "./layouts.routes";
import { createUserProvisioningMiddleware } from "../middleware/authMiddleware";
import { UnauthorizedError } from "../../../domain/errors/DomainErrors";
import { asyncHandler } from "../middleware/asyncHandler";

function requireAuthApi(req: any, res: any, next: any): void {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new UnauthorizedError("Authentication required");
  }
  next();
}

export function createRoutes(controllers: Controllers, repositories: Repositories): Router {
  const router = Router();

  const userProvisioningMiddleware = createUserProvisioningMiddleware(repositories.userRepository, repositories.roleRepository);

  router.use("/health", createHealthRoutes(controllers.healthController));
  router.use("/drafts", requireAuthApi, userProvisioningMiddleware, createDraftRoutes(controllers.draftController, repositories.draftRepository));
  router.use("/assets", requireAuthApi, userProvisioningMiddleware, createAssetRoutes(controllers.assetController));
  router.use("/orders", requireAuthApi, userProvisioningMiddleware, createOrderRoutes(controllers.orderController, repositories.draftRepository));
  router.use("/layouts", createLayoutRoutes(controllers.layoutController));
  router.get("/user/me", requireAuthApi, userProvisioningMiddleware, asyncHandler((req, res, next) => controllers.userController.getCurrentUser(req, res, next)));

  return router;
}
