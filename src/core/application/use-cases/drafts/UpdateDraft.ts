import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { DraftMutationPolicy } from "../../../domain/policies/DraftMutationPolicy";
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

    const result = await this.deps.draftRepository.updateLayoutItems(validatedInput.draftId, {
      layoutItems: validatedInput.layoutItems.map((item) => ({
        slotId: item.slotId,
        imageId: item.imageId,
      })),
    });

    return {
      id: result.draft.id,
      status: result.draft.state === "editing" ? "draft" : result.draft.state,
      productId: result.draft.productId,
      templateId: result.draft.templateId,
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
