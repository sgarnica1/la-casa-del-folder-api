import { CartRepository } from "../../../domain/repositories/CartRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import {
  NotFoundError,
  ValidationError,
} from "../../../domain/errors/DomainErrors";
import { RemoveCartItemInputSchema } from "./dtos/RemoveCartItem.dto";
import { DraftStateEnum } from "../../../domain/entities/Draft";

export interface RemoveCartItemDependencies {
  cartRepository: CartRepository;
  draftRepository: DraftRepository;
}

export class RemoveCartItem {
  constructor(private deps: RemoveCartItemDependencies) { }

  async execute(input: unknown, userId: string): Promise<void> {
    const validationResult = RemoveCartItemInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;

    const cartItem = await this.deps.cartRepository.findCartItemById(validatedInput.cartItemId, userId);

    if (!cartItem) {
      throw new NotFoundError("Cart item", validatedInput.cartItemId);
    }

    // Store draftId before removing the cart item
    const draftId = cartItem.draftId;

    await this.deps.cartRepository.removeCartItem(validatedInput.cartItemId, userId);

    // Unlock the draft when removed from cart (if it's locked and not ordered)
    const draft = await this.deps.draftRepository.findById(draftId);
    if (draft && draft.state === DraftStateEnum.LOCKED) {
      await this.deps.draftRepository.update(draftId, {
        state: DraftStateEnum.EDITING,
      });
    }
  }
}
