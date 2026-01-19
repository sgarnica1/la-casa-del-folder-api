import { UploadedImageRepository } from "../../../domain/repositories/UploadedImageRepository";
import { cloudinary } from "../../../infrastructure/cloudinary/client";
import { UploadImageInputSchema, UploadImageOutput } from "./dtos/UploadImage.dto";
import { ValidationError } from "../../../domain/errors/DomainErrors";
import type { UploadApiResponse } from "cloudinary";

export interface UploadImageDependencies {
  uploadedImageRepository: UploadedImageRepository;
}

export class UploadImage {
  constructor(private deps: UploadImageDependencies) { }

  async execute(input: unknown): Promise<UploadImageOutput> {
    const validationResult = UploadImageInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;

    // Use streaming upload with timeout to prevent blocking other uploads
    const UPLOAD_TIMEOUT_MS = 30000; // 30 seconds timeout per image

    const uploadResult = await Promise.race([
      new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "user_uploads",
            resource_type: "image",
            timeout: UPLOAD_TIMEOUT_MS,
            chunk_size: 6000000, // 6MB chunks for better streaming
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else if (!result) {
              reject(new Error("Upload failed: no result"));
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(validatedInput.file.buffer);
      }),
      new Promise<UploadApiResponse>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Upload timeout after ${UPLOAD_TIMEOUT_MS}ms`));
        }, UPLOAD_TIMEOUT_MS);
      }),
    ]);

    if (!uploadResult) {
      throw new Error("Upload failed: no result");
    }

    const uploadedImage = await this.deps.uploadedImageRepository.create({
      userId: validatedInput.userId,
      cloudinaryPublicId: uploadResult.public_id,
      originalUrl: uploadResult.secure_url,
      width: uploadResult.width || 0,
      height: uploadResult.height || 0,
    });

    const optimizedUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    return {
      id: uploadedImage.id,
      url: optimizedUrl,
    };
  }
}
