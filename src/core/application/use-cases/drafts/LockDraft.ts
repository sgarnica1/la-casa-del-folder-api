import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { DraftStateEnum } from "../../../domain/entities/Draft";
import { DraftMutationPolicy } from "../../../domain/policies/DraftMutationPolicy";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import { LockDraftInputSchema, LockDraftOutput } from "./dtos/LockDraft.dto";

export interface LockDraftDependencies {
  draftRepository: DraftRepository;
}

export class LockDraft {
  private draftMutationPolicy: DraftMutationPolicy;

  constructor(private deps: LockDraftDependencies) {
    this.draftMutationPolicy = new DraftMutationPolicy(deps.draftRepository);
  }

  async execute(input: unknown): Promise<LockDraftOutput> {
    const validationResult = LockDraftInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    await this.draftMutationPolicy.assertCanLock(validatedInput.draftId);

    const draft = await this.deps.draftRepository.findById(validatedInput.draftId);
    if (!draft) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    if (draft.state === DraftStateEnum.LOCKED) {
      return {
        id: draft.id,
        userId: draft.userId,
        productId: draft.productId,
        templateId: draft.templateId,
        state: draft.state,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      };
    }

    const updatedDraft = await this.deps.draftRepository.update(validatedInput.draftId, {
      state: DraftStateEnum.LOCKED,
    });

    return {
      id: updatedDraft.id,
      userId: updatedDraft.userId,
      productId: updatedDraft.productId,
      templateId: updatedDraft.templateId,
      state: updatedDraft.state,
      createdAt: updatedDraft.createdAt,
      updatedAt: updatedDraft.updatedAt,
    };
  }
}
