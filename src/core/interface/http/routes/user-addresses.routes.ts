import { Router } from "express";
import { UserAddressController } from "../controllers/UserAddressController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createUserAddressRoutes(userAddressController: UserAddressController): Router {
  const router = Router();

  router.get("/addresses", asyncHandler((req, res, next) => userAddressController.getAddresses(req, res, next)));
  router.post("/addresses", asyncHandler((req, res, next) => userAddressController.createAddress(req, res, next)));

  return router;
}
