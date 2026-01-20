import { UploadedImage } from "../entities/UploadedImage";

export interface UploadedImageRepository {
  create(image: Omit<UploadedImage, "id" | "createdAt" | "updatedAt">): Promise<UploadedImage>;
  findByIds(ids: string[]): Promise<UploadedImage[]>;
}
