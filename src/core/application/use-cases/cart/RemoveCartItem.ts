import { CartRepository } from "../../../domain/repositories/CartRepository";
import {
  NotFoundError,
  ValidationError,
} from "../../../domain/errors/DomainErrors";
import { RemoveCartItemInputSchema } from "./dtos/RemoveCartItem.dto";

export interface RemoveCartItemDependencies {
  cartRepository: CartRepository;
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

    await this.deps.cartRepository.removeCartItem(validatedInput.cartItemId, userId);
  }
}
