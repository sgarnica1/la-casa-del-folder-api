import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { CartRepository } from "../../../domain/repositories/CartRepository";
import { NotFoundError, ConflictError, ValidationError } from "../../../domain/errors/DomainErrors";
import { DraftStateEnum } from "../../../domain/entities/Draft";
import { DeleteDraftInputSchema } from "./dtos/DeleteDraft.dto";

export interface DeleteDraftDependencies {
  draftRepository: DraftRepository;
  cartRepository: CartRepository;
}

export class DeleteDraft {
  constructor(private deps: DeleteDraftDependencies) { }

  async execute(input: unknown, userId: string): Promise<void> {
    const validationResult = DeleteDraftInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;

    const draft = await this.deps.draftRepository.findById(validatedInput.draftId);

    if (!draft) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    if (draft.userId !== userId) {
      throw new ConflictError("Draft does not belong to user");
    }

    // Cannot delete ordered drafts
    if (draft.state === DraftStateEnum.ORDERED) {
      throw new ConflictError("Cannot delete an ordered draft");
    }

    // Check if draft is in any cart
    const activeCart = await this.deps.cartRepository.findActiveCartByUserId(userId);
    if (activeCart) {
      const isInCart = activeCart.items.some(item => item.draftId === validatedInput.draftId);
      if (isInCart) {
        throw new ConflictError("Cannot delete a draft that is in the cart");
      }
    }

    // Soft delete by setting deletedAt
    await this.deps.draftRepository.softDelete(validatedInput.draftId);
  }
}
