import { DraftRepository } from "../repositories/DraftRepository";
import { DraftStateEnum } from "../entities/Draft";
import { NotFoundError, ConflictError } from "../errors/DomainErrors";

/**
 * DOMAIN POLICY: Enforces draft mutation invariants
 * 
 * Rule: Drafts with status "locked" or "ordered" must be read-only forever.
 * This ensures order snapshots never diverge from draft state.
 * 
 * This policy is reusable across:
 * - HTTP guards
 * - Use cases
 * - Background jobs
 * - CLI scripts
 * - Future GraphQL resolvers
 */
export class DraftMutationPolicy {
  constructor(private draftRepository: DraftRepository) { }

  /**
   * Asserts that a draft is editable (status === "editing")
   * Throws ConflictError if draft is locked or ordered
   */
  async assertEditable(draftId: string): Promise<void> {
    const draft = await this.draftRepository.findById(draftId);

    if (!draft) {
      throw new NotFoundError("Draft", draftId);
    }

    if (draft.state !== DraftStateEnum.EDITING) {
      throw new ConflictError(
        "Draft is locked and cannot be edited",
        { draftId, status: draft.state }
      );
    }
  }
}
