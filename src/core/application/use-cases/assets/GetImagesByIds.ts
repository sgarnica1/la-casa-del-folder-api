import { UploadedImageRepository } from "../../../domain/repositories/UploadedImageRepository";
import { GetImagesByIdsInputSchema, GetImagesByIdsOutput } from "./dtos/GetImagesByIds.dto";
import { ValidationError } from "../../../domain/errors/DomainErrors";

export interface GetImagesByIdsDependencies {
  uploadedImageRepository: UploadedImageRepository;
}

export class GetImagesByIds {
  constructor(private deps: GetImagesByIdsDependencies) { }

  async execute(input: unknown): Promise<GetImagesByIdsOutput[]> {
    const validationResult = GetImagesByIdsInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;

    if (validatedInput.ids.length === 0) {
      return [];
    }

    const images = await this.deps.uploadedImageRepository.findByIds(validatedInput.ids);

    return images.map((img) => ({
      id: img.id,
      url: img.originalUrl,
    }));
  }
}
