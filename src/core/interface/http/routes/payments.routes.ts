import { Router, Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { PaymentController } from "../controllers/PaymentController";
import { WebhookController } from "../controllers/WebhookController";
import { asyncHandler } from "../middleware/asyncHandler";
import { createUserProvisioningMiddleware } from "../middleware/authMiddleware";
import type { Repositories } from "../../../domain/repositories";
import { UnauthorizedError } from "../../../domain/errors/DomainErrors";

function requireAuthApi(req: Request, _: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new UnauthorizedError("Authentication required");
  }
  next();
}

export function createPaymentRoutes(
  paymentController: PaymentController,
  webhookController: WebhookController,
  repositories: Repositories
): Router {
  const router = Router();
  const userProvisioningMiddleware = createUserProvisioningMiddleware(repositories.userRepository, repositories.roleRepository);

  router.post("/preference", requireAuthApi, userProvisioningMiddleware, asyncHandler((req, res, next) => paymentController.createPreference(req, res, next)));

  router.post("/verify", requireAuthApi, userProvisioningMiddleware, asyncHandler((req, res, next) => paymentController.verifyPayment(req, res, next)));

  router.post("/webhook", asyncHandler((req, res, next) => webhookController.handleWebhook(req, res, next)));

  return router;
}
