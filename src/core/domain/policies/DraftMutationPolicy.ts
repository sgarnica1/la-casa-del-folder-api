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
   * Asserts that a draft is editable (status === "editing" or "locked")
   * Locked drafts can be edited, which transitions them back to editing
   * Throws ConflictError if draft is ordered
   */
  async assertEditable(draftId: string): Promise<void> {
    const draft = await this.draftRepository.findById(draftId);

    if (!draft) {
      throw new NotFoundError("Draft", draftId);
    }

    if (draft.state === DraftStateEnum.ORDERED) {
      throw new ConflictError(
        "Draft is ordered and cannot be edited",
        { draftId, status: draft.state }
      );
    }
  }

  /**
   * Asserts that a draft can be locked (status === "editing")
   * Throws ConflictError if draft is not in editing state
   */
  async assertCanLock(draftId: string): Promise<void> {
    const draft = await this.draftRepository.findById(draftId);

    if (!draft) {
      throw new NotFoundError("Draft", draftId);
    }

    if (draft.state === DraftStateEnum.ORDERED) {
      throw new ConflictError("Cannot lock an already ordered draft");
    }

    if (draft.state !== DraftStateEnum.EDITING && draft.state !== DraftStateEnum.LOCKED) {
      throw new ConflictError(
        "Draft must be in editing state to be locked",
        { draftId, status: draft.state }
      );
    }
  }

  /**
   * Asserts that a draft can be added to cart (status === "editing" or "locked")
   * Throws ConflictError if draft is ordered
   */
  async assertCanAddToCart(draftId: string): Promise<void> {
    const draft = await this.draftRepository.findById(draftId);

    if (!draft) {
      throw new NotFoundError("Draft", draftId);
    }

    if (draft.state === DraftStateEnum.ORDERED) {
      throw new ConflictError("Draft already ordered");
    }

    if (draft.state !== DraftStateEnum.EDITING && draft.state !== DraftStateEnum.LOCKED) {
      throw new ConflictError(
        "Draft must be in editing or locked state to be added to cart",
        { draftId, status: draft.state }
      );
    }
  }

  /**
   * Asserts that a draft can be checked out (status === "locked")
   * Throws ConflictError if draft is not locked
   */
  async assertCanCheckout(draftId: string): Promise<void> {
    console.log(`[DraftMutationPolicy] assertCanCheckout called for draft: ${draftId}`);
    const draft = await this.draftRepository.findById(draftId);

    if (!draft) {
      console.error(`[DraftMutationPolicy] Draft ${draftId} not found`);
      throw new NotFoundError("Draft", draftId);
    }

    console.log(`[DraftMutationPolicy] Draft ${draftId} state:`, draft.state, `(expected: ${DraftStateEnum.LOCKED})`);

    if (draft.state !== DraftStateEnum.LOCKED) {
      console.error(`[DraftMutationPolicy] Draft ${draftId} is not locked, current state:`, draft.state);
      throw new ConflictError(
        `Draft must be locked before checkout. Current state: ${draft.state}`,
        { draftId, status: draft.state }
      );
    }

    console.log(`[DraftMutationPolicy] Draft ${draftId} can be checked out`);
  }
}
