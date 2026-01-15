import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { Draft, DraftState } from "../../../domain/entities/Draft";
import { NotFoundError } from "../../../domain/errors/DomainErrors";

export interface LockDraftDependencies {
  draftRepository: DraftRepository;
}

export interface LockDraftInput {
  draftId: string;
}

export class LockDraft {
  constructor(private deps: LockDraftDependencies) { }

  async execute(input: LockDraftInput): Promise<Draft> {
    const draft = await this.deps.draftRepository.findById(input.draftId);

    if (!draft) {
      throw new NotFoundError("Draft", input.draftId);
    }

    if (draft.state === DraftState.LOCKED) {
      return draft;
    }

    if (draft.state === DraftState.ORDERED) {
      throw new Error("Cannot lock an already ordered draft");
    }

    const updatedDraft = await this.deps.draftRepository.update(input.draftId, {
      state: DraftState.LOCKED,
    });

    return updatedDraft;
  }
}
