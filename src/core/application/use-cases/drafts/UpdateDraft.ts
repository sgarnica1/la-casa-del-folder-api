import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { DraftMutationPolicy } from "../../../domain/policies/DraftMutationPolicy";
import { DraftStateEnum } from "../../../domain/entities/Draft";
import { ValidationError } from "../../../domain/errors/DomainErrors";
import { UpdateDraftInputSchema, UpdateDraftOutput } from "./dtos/UpdateDraft.dto";

export interface UpdateDraftDependencies {
  draftRepository: DraftRepository;
}

export class UpdateDraft {
  private draftMutationPolicy: DraftMutationPolicy;

  constructor(private deps: UpdateDraftDependencies) {
    this.draftMutationPolicy = new DraftMutationPolicy(deps.draftRepository);
  }

  async execute(input: unknown): Promise<UpdateDraftOutput> {
    const validationResult = UpdateDraftInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    await this.draftMutationPolicy.assertEditable(validatedInput.draftId);

    const draft = await this.deps.draftRepository.findById(validatedInput.draftId);
    if (!draft) {
      throw new ValidationError("Draft not found", { issues: [] });
    }

    const updates: Partial<typeof draft> = {};

    if (validatedInput.title !== undefined) {
      updates.title = validatedInput.title;
    }

    if (draft.state === DraftStateEnum.LOCKED) {
      updates.state = DraftStateEnum.EDITING;
    }

    if (Object.keys(updates).length > 0) {
      await this.deps.draftRepository.update(validatedInput.draftId, updates);
    }

    // Update layout items if provided
    let result;
    if (validatedInput.layoutItems) {
      result = await this.deps.draftRepository.updateLayoutItems(validatedInput.draftId, {
        layoutItems: validatedInput.layoutItems.map((item) => ({
          slotId: item.slotId,
          imageId: item.imageId,
        })),
      });
    } else {
      result = await this.deps.draftRepository.findByIdWithLayoutItemsAndImages(validatedInput.draftId);
      if (!result) {
        throw new ValidationError("Draft not found", { issues: [] });
      }
    }

    return {
      id: result.draft.id,
      status: result.draft.state === "editing" ? "draft" : result.draft.state,
      productId: result.draft.productId,
      templateId: result.draft.templateId,
      title: result.draft.title || null,
      layoutItems: result.layoutItems.map((item) => ({
        id: item.id,
        slotId: `slot-${item.layoutIndex}`,
        imageId: item.imageId,
      })),
      createdAt: result.draft.createdAt,
      updatedAt: result.draft.updatedAt,
    };
  }
}
