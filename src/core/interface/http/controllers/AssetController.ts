import { Request, Response, NextFunction } from "express";
import { prisma } from "../../../infrastructure/prisma/client";

const SEEDED_USER_ID = "00000000-0000-0000-0000-000000000000";

export class AssetController {
  async upload(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "No file provided" } });
      return;
    }

    try {
      const buffer = file.buffer;
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.mimetype};base64,${base64}`;

      const uploadedImage = await prisma.uploadedImage.create({
        data: {
          userId: SEEDED_USER_ID,
          cloudinaryPublicId: `mvp-${Date.now()}-${file.originalname}`,
          originalUrl: dataUrl,
          width: 0,
          height: 0,
        },
      });

      res.status(201).json({
        id: uploadedImage.id,
        url: uploadedImage.originalUrl,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to upload image" } });
    }
  }

  async getByIds(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { ids } = req.query;

    if (!ids || typeof ids !== "string") {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "ids query parameter required" } });
      return;
    }

    const imageIds = ids.split(",").filter(Boolean);

    if (imageIds.length === 0) {
      res.json([]);
      return;
    }

    try {
      const images = await prisma.uploadedImage.findMany({
        where: {
          id: {
            in: imageIds,
          },
        },
      });

      res.json(
        images.map((img) => ({
          id: img.id,
          url: img.originalUrl,
        }))
      );
    } catch (error) {
      console.error("Get images error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get images" } });
    }
  }
}
