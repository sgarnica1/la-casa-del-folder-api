import { CartRepository } from "../../../domain/repositories/CartRepository";
import {
  NotFoundError,
  ValidationError,
} from "../../../domain/errors/DomainErrors";
import { UpdateCartItemQuantityInputSchema, UpdateCartItemQuantityOutput } from "./dtos/UpdateCartItemQuantity.dto";

export interface UpdateCartItemQuantityDependencies {
  cartRepository: CartRepository;
}

export class UpdateCartItemQuantity {
  constructor(private deps: UpdateCartItemQuantityDependencies) { }

  async execute(input: unknown, userId: string): Promise<UpdateCartItemQuantityOutput> {
    const validationResult = UpdateCartItemQuantityInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;

    const cartItem = await this.deps.cartRepository.findCartItemById(validatedInput.cartItemId, userId);

    if (!cartItem) {
      throw new NotFoundError("Cart item", validatedInput.cartItemId);
    }

    const updated = await this.deps.cartRepository.updateCartItemQuantity(
      validatedInput.cartItemId,
      validatedInput.quantity,
      userId
    );

    return {
      id: updated.id,
      cartId: updated.cartId,
      draftId: updated.draftId,
      productId: updated.productId,
      quantity: updated.quantity,
      unitPrice: updated.unitPrice,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
