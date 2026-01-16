import { UploadedImageRepository } from "../../domain/repositories/UploadedImageRepository";
import { UploadedImage } from "../../domain/entities/UploadedImage";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";

export class PrismaUploadedImageRepository implements UploadedImageRepository {
  async create(image: Omit<UploadedImage, "id" | "createdAt" | "updatedAt">): Promise<UploadedImage> {
    try {
      const created = await prisma.uploadedImage.create({
        data: {
          userId: image.userId,
          cloudinaryPublicId: image.cloudinaryPublicId,
          originalUrl: image.originalUrl,
          width: image.width,
          height: image.height,
        },
      });

      return {
        id: created.id,
        userId: created.userId,
        cloudinaryPublicId: created.cloudinaryPublicId,
        originalUrl: created.originalUrl,
        width: created.width,
        height: created.height,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByIds(ids: string[]): Promise<UploadedImage[]> {
    const images = await prisma.uploadedImage.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return images.map((img) => ({
      id: img.id,
      userId: img.userId,
      cloudinaryPublicId: img.cloudinaryPublicId,
      originalUrl: img.originalUrl,
      width: img.width,
      height: img.height,
      createdAt: img.createdAt,
      updatedAt: img.updatedAt,
    }));
  }
}
