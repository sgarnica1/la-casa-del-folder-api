import { DraftRepository } from "../../../domain/repositories/DraftRepository";

export interface GetMyDraftsDependencies {
  draftRepository: DraftRepository;
}

export class GetMyDrafts {
  constructor(private dependencies: GetMyDraftsDependencies) { }

  async execute({ userId }: { userId: string }) {
    return await this.dependencies.draftRepository.findDraftsByUser(userId);
  }
}
