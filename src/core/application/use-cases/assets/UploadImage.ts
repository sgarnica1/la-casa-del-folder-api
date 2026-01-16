import { UploadedImageRepository } from "../../../domain/repositories/UploadedImageRepository";
import { cloudinary } from "../../../infrastructure/cloudinary/client";
import { UploadImageInputSchema, UploadImageOutput } from "./dtos/UploadImage.dto";
import { ValidationError } from "../../../domain/errors/DomainErrors";

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
    const dataUri = `data:${validatedInput.file.mimetype};base64,${validatedInput.file.buffer.toString("base64")}`;

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "user_uploads",
      resource_type: "image",
    });

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
