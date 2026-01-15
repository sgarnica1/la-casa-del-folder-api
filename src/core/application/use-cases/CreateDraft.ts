import { DraftRepository } from "../../domain/repositories/DraftRepository";
import { Draft, DraftState } from "../../domain/entities/Draft";

export interface CreateDraftDependencies {
  draftRepository: DraftRepository;
}

export class CreateDraft {
  constructor(private deps: CreateDraftDependencies) { }

  async execute(): Promise<Draft> {
    throw new Error("Not implemented");
  }
}
