import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { asyncHandler } from "../middleware/asyncHandler";

export function createProductRoutes(productController: ProductController): Router {
  const router = Router();

  router.get("/:id", asyncHandler((req, res, next) => productController.getById(req, res, next)));

  return router;
}
