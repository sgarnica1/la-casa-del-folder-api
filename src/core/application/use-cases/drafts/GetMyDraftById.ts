import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { NotFoundError } from "../../../domain/errors/DomainErrors";

export interface GetMyDraftByIdDependencies {
  draftRepository: DraftRepository;
}

export class GetMyDraftById {
  constructor(private dependencies: GetMyDraftByIdDependencies) { }

  async execute({ draftId, userId }: { draftId: string; userId: string }) {
    const result = await this.dependencies.draftRepository.findDraftByIdAndUser(draftId, userId);

    if (!result) {
      throw new NotFoundError("Draft not found");
    }

    return result;
  }
}
