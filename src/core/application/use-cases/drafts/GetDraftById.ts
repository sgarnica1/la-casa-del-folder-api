import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";
import { GetDraftByIdInputSchema, GetDraftByIdOutput } from "./dtos/GetDraftById.dto";

export interface GetDraftByIdDependencies {
  draftRepository: DraftRepository;
}

export class GetDraftById {
  constructor(private deps: GetDraftByIdDependencies) { }

  async execute(input: unknown): Promise<GetDraftByIdOutput> {
    const validationResult = GetDraftByIdInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    const draftWithItems = await this.deps.draftRepository.findByIdWithLayoutItemsAndImages(validatedInput.draftId);

    if (!draftWithItems) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    return {
      id: draftWithItems.draft.id,
      status: draftWithItems.draft.state === "editing" ? "draft" : draftWithItems.draft.state,
      productId: draftWithItems.draft.productId,
      templateId: draftWithItems.draft.templateId,
      title: draftWithItems.draft.title || null,
      layoutItems: draftWithItems.layoutItems.map((item) => {
        const transformJson = item.transformJson as { x?: number; y?: number; scale?: number; rotation?: number } | null;
        return {
          id: item.id,
          slotId: `slot-${item.layoutIndex}`,
          imageId: item.imageId,
          transform: transformJson ? {
            x: transformJson.x ?? 0,
            y: transformJson.y ?? 0,
            scale: transformJson.scale ?? 1,
            rotation: transformJson.rotation ?? 0,
          } : null,
        };
      }),
      createdAt: draftWithItems.draft.createdAt,
      updatedAt: draftWithItems.draft.updatedAt,
    };
  }
}
