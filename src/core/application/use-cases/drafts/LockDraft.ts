import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { Draft } from "../../../domain/entities/Draft";

export interface LockDraftDependencies {
  draftRepository: DraftRepository;
}

export interface LockDraftInput {
  draftId: string;
}

export class LockDraft {
  constructor(private deps: LockDraftDependencies) { }

  async execute(input: LockDraftInput): Promise<Draft> {
    throw new Error("Not implemented");
  }
}
