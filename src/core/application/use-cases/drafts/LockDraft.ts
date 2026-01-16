import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { DraftState } from "../../../domain/entities/Draft";
import { ConflictError, NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import { LockDraftInputSchema, LockDraftOutput } from "./dtos/LockDraft.dto";

export interface LockDraftDependencies {
  draftRepository: DraftRepository;
}

export class LockDraft {
  constructor(private deps: LockDraftDependencies) { }

  async execute(input: unknown): Promise<LockDraftOutput> {
    const validationResult = LockDraftInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    const draft = await this.deps.draftRepository.findById(validatedInput.draftId);

    if (!draft) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    if (draft.state === DraftState.LOCKED) {
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

    if (draft.state === DraftState.ORDERED) {
      throw new ConflictError("Cannot lock an already ordered draft");
    }

    const updatedDraft = await this.deps.draftRepository.update(validatedInput.draftId, {
      state: DraftState.LOCKED,
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
