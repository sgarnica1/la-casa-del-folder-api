import { Response, NextFunction } from "express";
import { GetProductById } from "../../../application/use-cases/products/GetProductById";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "../middleware/authMiddleware";

export class ProductController {
  constructor(private getProductById: GetProductById) { }

  async getById(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Product ID is required" } });
      return;
    }

    try {
      const result = await this.getProductById.execute({ productId: id });

      res.status(200).json({
        id: result.id,
        name: result.name,
        description: result.description || "",
        basePrice: result.basePrice,
        currency: result.currency,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ValidationError) {
        console.error("[ProductController] Validation error:", {
          message: error.message,
          details: error.details,
          input: { productId: id },
        });
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      console.error("Get product by id error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get product" } });
    }
  }
}
