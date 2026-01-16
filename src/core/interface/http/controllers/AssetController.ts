import { Response, NextFunction } from "express";
import { UploadImage } from "../../../application/use-cases/assets/UploadImage";
import { GetImagesByIds } from "../../../application/use-cases/assets/GetImagesByIds";
import { ValidationError, NotFoundError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "../middleware/authMiddleware";

export class AssetController {
  constructor(
    private uploadImage: UploadImage,
    private getImagesByIds: GetImagesByIds
  ) { }

  async upload(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const file = req.file;

    if (!file) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "No file provided" } });
      return;
    }

    try {
      const result = await this.uploadImage.execute({
        userId: req.userAuth.userId,
        file: {
          buffer: file.buffer,
          mimetype: file.mimetype,
        },
      });

      res.status(201).json({
        id: result.id,
        url: result.url,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      console.error("Upload error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to upload image" } });
    }
  }

  async getByIds(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    const { ids } = req.query;

    if (!ids || typeof ids !== "string") {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "ids query parameter required" } });
      return;
    }

    const imageIds = ids.split(",").filter(Boolean);

    try {
      const result = await this.getImagesByIds.execute({ ids: imageIds });
      res.json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      console.error("Get images error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get images" } });
    }
  }
}
