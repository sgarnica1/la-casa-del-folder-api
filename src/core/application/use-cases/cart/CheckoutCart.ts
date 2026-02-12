import { CartRepository } from "../../../domain/repositories/CartRepository";
import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { ProductRepository } from "../../../domain/repositories/ProductRepository";
import { ProductTemplateRepository } from "../../../domain/repositories/ProductTemplateRepository";
import { UserAddressRepository } from "../../../domain/repositories/UserAddressRepository";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { OrderActivityRepository } from "../../../domain/repositories/OrderActivityRepository";
import { OrderActivityType } from "../../../domain/entities/OrderActivity";
import { User } from "../../../domain/entities/User";
import { DraftMutationPolicy } from "../../../domain/policies/DraftMutationPolicy";
import { DraftStateEnum } from "../../../domain/entities/Draft";
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from "../../../domain/errors/DomainErrors";
import { validateDraftCompleteness } from "../../../interface/http/middleware/draftGuards";
import { CheckoutCartOutput } from "./dtos/CheckoutCart.dto";

export interface CheckoutCartDependencies {
  cartRepository: CartRepository;
  orderRepository: OrderRepository;
  draftRepository: DraftRepository;
  productRepository: ProductRepository;
  productTemplateRepository: ProductTemplateRepository;
  userAddressRepository: UserAddressRepository;
  userRepository: UserRepository;
  orderActivityRepository: OrderActivityRepository;
}

export interface CheckoutCartInput {
  shippingAddressId?: string;
  shippingAddressData?: {
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customerData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export class CheckoutCart {
  private draftMutationPolicy: DraftMutationPolicy;

  constructor(private deps: CheckoutCartDependencies) {
    this.draftMutationPolicy = new DraftMutationPolicy(deps.draftRepository);
  }

  async execute(userId: string, input?: CheckoutCartInput): Promise<CheckoutCartOutput> {
    console.log('[CheckoutCart] Starting checkout for user:', userId);

    const cartWithItems = await this.deps.cartRepository.findActiveCartByUserId(userId);
    console.log('[CheckoutCart] Cart found:', {
      cartId: cartWithItems?.cart?.id,
      itemsCount: cartWithItems?.items.length,
      total: cartWithItems?.total,
    });

    if (!cartWithItems) {
      console.error('[CheckoutCart] No active cart found for user:', userId);
      throw new NotFoundError("Cart", "active cart for user");
    }

    if (cartWithItems.items.length === 0) {
      console.error('[CheckoutCart] Cart is empty');
      throw new UnprocessableEntityError("Cart is empty");
    }

    // Check if there's already a pending order for this cart
    const existingOrder = await this.deps.orderRepository.findPendingOrderByCartId(cartWithItems.cart.id);
    if (existingOrder) {
      console.log('[CheckoutCart] Pending order already exists for this cart:', existingOrder.id);
      return {
        id: existingOrder.id,
        draftId: existingOrder.draftId,
        state: existingOrder.state,
        createdAt: existingOrder.createdAt,
      };
    }

    const draftIds = cartWithItems.items.map((item) => item.draftId);
    console.log('[CheckoutCart] Draft IDs in cart:', draftIds);

    const drafts = await Promise.all(
      draftIds.map((draftId) => this.deps.draftRepository.findByIdWithLayoutItems(draftId))
    );

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];
      console.log(`[CheckoutCart] Processing draft ${i + 1}/${drafts.length}:`, {
        draftId: draftIds[i],
        found: !!draft,
        state: draft?.draft?.state,
        userId: draft?.draft?.userId,
        expectedUserId: userId,
      });

      if (!draft) {
        console.error(`[CheckoutCart] Draft ${draftIds[i]} not found`);
        throw new NotFoundError("Draft", draftIds[i]);
      }

      if (draft.draft.userId !== userId) {
        console.error(`[CheckoutCart] Draft ${draftIds[i]} ownership mismatch:`, {
          draftUserId: draft.draft.userId,
          requestUserId: userId,
        });
        throw new ConflictError(`Draft ${draftIds[i]} does not belong to user`);
      }

      // Ensure draft is locked before checkout (auto-lock if in editing state)
      if (draft.draft.state === DraftStateEnum.EDITING) {
        console.log(`[CheckoutCart] Auto-locking draft ${draftIds[i]} (currently editing)`);
        await this.deps.draftRepository.update(draftIds[i], {
          state: DraftStateEnum.LOCKED,
        });
        // Refetch to get updated state
        const updatedDraft = await this.deps.draftRepository.findByIdWithLayoutItems(draftIds[i]);
        if (!updatedDraft) {
          console.error(`[CheckoutCart] Failed to refetch draft ${draftIds[i]} after locking`);
          throw new NotFoundError("Draft", draftIds[i]);
        }
        console.log(`[CheckoutCart] Draft ${draftIds[i]} locked successfully, new state:`, updatedDraft.draft.state);
        drafts[i] = updatedDraft;
      }

      const currentDraft = drafts[i];
      if (!currentDraft) {
        throw new NotFoundError("Draft", draftIds[i]);
      }

      console.log(`[CheckoutCart] Validating draft ${draftIds[i]} can be checked out (state: ${currentDraft.draft.state})`);
      try {
        await this.draftMutationPolicy.assertCanCheckout(draftIds[i]);
        console.log(`[CheckoutCart] Draft ${draftIds[i]} validation passed`);
      } catch (error) {
        console.error(`[CheckoutCart] Draft ${draftIds[i]} validation failed:`, {
          error: error instanceof Error ? error.message : String(error),
          draftState: currentDraft.draft.state,
        });
        throw error;
      }

      if (!currentDraft.draft.templateId) {
        throw new UnprocessableEntityError(`Draft ${draftIds[i]} template is missing`);
      }

      const completeness = await validateDraftCompleteness(
        draftIds[i],
        currentDraft.draft.templateId,
        this.deps.draftRepository,
        this.deps.productTemplateRepository
      );

      if (!completeness.isComplete) {
        throw new UnprocessableEntityError(
          `Draft ${draftIds[i]} is incomplete. Missing images for slots: ${completeness.missingSlots.join(", ")}`
        );
      }
    }

    const orderItems = await Promise.all(
      cartWithItems.items.map(async (cartItem) => {
        const draftData = await this.deps.draftRepository.findByIdWithImagesForOrder(cartItem.draftId);
        if (!draftData) {
          throw new NotFoundError("Draft", cartItem.draftId);
        }

        const product = await this.deps.productRepository.findById(cartItem.productId);
        if (!product) {
          throw new NotFoundError("Product", cartItem.productId);
        }

        const draftWithItems = await this.deps.draftRepository.findByIdWithLayoutItems(cartItem.draftId);
        if (!draftWithItems) {
          throw new NotFoundError("Draft", cartItem.draftId);
        }

        const designSnapshot = {
          draftId: cartItem.draftId,
          productId: cartItem.productId,
          templateId: draftWithItems.draft.templateId,
          title: draftWithItems.draft.title || null,
          layoutItems: draftData.layoutItems.map((item) => ({
            layoutIndex: item.layoutIndex,
            type: item.type,
            transformJson: item.transformJson,
            images: item.images.map((img) => ({
              cloudinaryPublicId: img.uploadedImage.cloudinaryPublicId,
              secureUrl: img.uploadedImage.originalUrl,
              width: img.uploadedImage.width,
              height: img.uploadedImage.height,
              transform: img.transformJson,
              uploadedImageId: img.uploadedImageId,
            })),
          })),
        };

        return {
          productName: product.name,
          variantName: null,
          quantity: cartItem.quantity,
          priceSnapshot: cartItem.unitPrice,
          designSnapshot,
          draftId: cartItem.draftId,
        };
      })
    );

    let shippingAddressJson: Record<string, unknown> = {};

    const user = await this.deps.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    if (input?.shippingAddressId) {
      const address = await this.deps.userAddressRepository.findById(input.shippingAddressId, userId);
      if (!address) {
        throw new NotFoundError("Address", input.shippingAddressId);
      }
      shippingAddressJson = {
        addressId: address.id,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };
    } else if (input?.shippingAddressData) {
      shippingAddressJson = {
        addressLine1: input.shippingAddressData.addressLine1,
        addressLine2: input.shippingAddressData.addressLine2 || null,
        city: input.shippingAddressData.city,
        state: input.shippingAddressData.state,
        postalCode: input.shippingAddressData.postalCode,
        country: input.shippingAddressData.country,
      };
    }

    // Update user data if provided
    const userUpdates: Partial<Pick<User, "firstName" | "lastName" | "phone">> = {};
    if (input?.customerData?.firstName) {
      userUpdates.firstName = input.customerData.firstName;
    }
    if (input?.customerData?.lastName) {
      userUpdates.lastName = input.customerData.lastName;
    }
    if (input?.customerData?.phone) {
      userUpdates.phone = input.customerData.phone;
    }

    if (Object.keys(userUpdates).length > 0) {
      await this.deps.userRepository.update(userId, userUpdates);
    }

    // Get updated user data for snapshot
    const updatedUser = await this.deps.userRepository.findById(userId);
    if (!updatedUser) {
      throw new NotFoundError("User", userId);
    }

    shippingAddressJson = {
      ...shippingAddressJson,
      customer: {
        firstName: updatedUser.firstName || null,
        lastName: updatedUser.lastName || null,
        email: updatedUser.email,
        phone: updatedUser.phone || null,
      },
    };

    const order = await this.deps.orderRepository.createWithItemsAndDraftUpdate({
      userId,
      cartId: cartWithItems.cart.id,
      totalAmount: cartWithItems.total,
      items: orderItems,
      draftIds,
      shippingAddressJson,
    });

    // Create ORDER_PLACED activity
    await this.deps.orderActivityRepository.create({
      orderId: order.id,
      activityType: OrderActivityType.ORDER_PLACED,
      description: "Pedido realizado",
      metadata: {
        totalAmount: cartWithItems.total.toString(),
        itemsCount: orderItems.length,
      },
    });

    // Don't mark cart as converted here - keep it active until payment is confirmed via webhook
    // The webhook will clear the cart when payment status becomes "paid"

    return {
      id: order.id,
      draftId: order.draftId,
      state: order.state,
      createdAt: order.createdAt,
    };
  }
}
