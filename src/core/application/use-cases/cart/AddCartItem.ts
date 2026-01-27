import { CartRepository } from "../../../domain/repositories/CartRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { ProductRepository } from "../../../domain/repositories/ProductRepository";
import { DraftStateEnum } from "../../../domain/entities/Draft";
import { DraftMutationPolicy } from "../../../domain/policies/DraftMutationPolicy";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from "../../../domain/errors/DomainErrors";
import { AddCartItemInputSchema, AddCartItemOutput } from "./dtos/AddCartItem.dto";

export interface AddCartItemDependencies {
  cartRepository: CartRepository;
  draftRepository: DraftRepository;
  productRepository: ProductRepository;
}

export class AddCartItem {
  private draftMutationPolicy: DraftMutationPolicy;

  constructor(private deps: AddCartItemDependencies) {
    this.draftMutationPolicy = new DraftMutationPolicy(deps.draftRepository);
  }

  async execute(input: unknown, userId: string): Promise<AddCartItemOutput> {
    const validationResult = AddCartItemInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;

    const draft = await this.deps.draftRepository.findById(validatedInput.draftId);

    if (!draft) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    if (draft.userId !== userId) {
      throw new ForbiddenError("Draft does not belong to user");
    }

    await this.draftMutationPolicy.assertCanAddToCart(validatedInput.draftId);

    if (draft.state === DraftStateEnum.EDITING) {
      await this.deps.draftRepository.update(validatedInput.draftId, {
        state: DraftStateEnum.LOCKED,
      });
    }

    const updatedDraft = await this.deps.draftRepository.findById(validatedInput.draftId);
    if (!updatedDraft) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    let cartWithItems = await this.deps.cartRepository.findActiveCartByUserId(userId);

    if (!cartWithItems) {
      const newCart = await this.deps.cartRepository.createCart(userId);
      cartWithItems = {
        cart: newCart,
        items: [],
        total: 0,
      };
    }

    const existingItem = cartWithItems.items.find((item) => item.draftId === updatedDraft.id);
    if (existingItem) {
      throw new ConflictError("Draft already in cart");
    }

    const product = await this.deps.productRepository.findById(updatedDraft.productId);
    if (!product) {
      throw new NotFoundError("Product", updatedDraft.productId);
    }

    const draftWithOptions = await this.deps.draftRepository.findByIdWithSelectedOptions(updatedDraft.id);
    if (!draftWithOptions) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    let calculatedPrice = product.basePrice;
    const selectedOptionsSnapshot = draftWithOptions.selectedOptions.map((option) => ({
      optionTypeId: option.optionTypeId,
      optionTypeName: option.optionTypeName,
      optionValueId: option.optionValueId,
      optionValueName: option.optionValueName,
      priceModifier: option.priceModifier,
    }));

    for (const option of draftWithOptions.selectedOptions) {
      if (option.priceModifier !== null) {
        calculatedPrice += option.priceModifier;
      }
    }

    const cartItem = await this.deps.cartRepository.addCartItem({
      cartId: cartWithItems.cart.id,
      draftId: updatedDraft.id,
      productId: updatedDraft.productId,
      quantity: 1,
      unitPrice: calculatedPrice,
      selectedOptionsSnapshot,
    });

    return {
      id: cartItem.id,
      cartId: cartItem.cartId,
      draftId: cartItem.draftId,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      unitPrice: cartItem.unitPrice,
      selectedOptionsSnapshot: cartItem.selectedOptionsSnapshot,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
    };
  }
}
