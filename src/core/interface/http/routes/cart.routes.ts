import { Router } from "express";
import { CartController } from "../controllers/CartController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createCartRoutes(cartController: CartController): Router {
  const router = Router();

  router.get("/", asyncHandler((req, res, next) => cartController.getCart(req, res, next)));
  router.post("/items", asyncHandler((req, res, next) => cartController.addItem(req, res, next)));
  router.patch("/items/:id", asyncHandler((req, res, next) => cartController.updateItem(req, res, next)));
  router.delete("/items/:id", asyncHandler((req, res, next) => cartController.removeItem(req, res, next)));
  router.post("/checkout", asyncHandler((req, res, next) => cartController.checkout(req, res, next)));

  return router;
}
