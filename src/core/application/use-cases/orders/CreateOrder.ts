import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { ProductRepository } from "../../../domain/repositories/ProductRepository";
import { ProductTemplateRepository } from "../../../domain/repositories/ProductTemplateRepository";
import { DraftStateEnum } from "../../../domain/entities/Draft";
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  ValidationError,
} from "../../../domain/errors/DomainErrors";
import { validateDraftCompleteness } from "../../../interface/http/middleware/draftGuards";
import { CreateOrderInputSchema, CreateOrderOutput } from "./dtos/CreateOrder.dto";

export interface CreateOrderDependencies {
  orderRepository: OrderRepository;
  draftRepository: DraftRepository;
  productRepository: ProductRepository;
  productTemplateRepository: ProductTemplateRepository;
}

export class CreateOrder {
  constructor(private deps: CreateOrderDependencies) { }

  async execute(input: unknown): Promise<CreateOrderOutput> {
    const validationResult = CreateOrderInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    const draftWithItems = await this.deps.draftRepository.findByIdWithLayoutItems(validatedInput.draftId);

    if (!draftWithItems) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    if (draftWithItems.draft.state !== DraftStateEnum.LOCKED) {
      if (draftWithItems.draft.state === DraftStateEnum.ORDERED) {
        throw new ConflictError("Draft already converted to order");
      }
      throw new ConflictError("Draft must be locked before creating an order");
    }

    if (!draftWithItems.draft.templateId) {
      throw new UnprocessableEntityError("Draft template is missing");
    }

    const completeness = await validateDraftCompleteness(
      validatedInput.draftId,
      draftWithItems.draft.templateId,
      this.deps.draftRepository,
      this.deps.productTemplateRepository
    );

    if (!completeness.isComplete) {
      throw new UnprocessableEntityError(
        `Draft is incomplete. Missing images for slots: ${completeness.missingSlots.join(", ")}`
      );
    }

    const product = await this.deps.productRepository.findById(draftWithItems.draft.productId);

    if (!product) {
      throw new NotFoundError("Product", draftWithItems.draft.productId);
    }

    const draftData = await this.deps.draftRepository.findByIdWithImagesForOrder(validatedInput.draftId);

    if (!draftData) {
      throw new NotFoundError("Draft", validatedInput.draftId);
    }

    // SNAPSHOT: Store complete image metadata in order - orders must be self-contained
    // This ensures orders render correctly even if uploaded_images are deleted
    const designSnapshot = {
      draftId: validatedInput.draftId,
      productId: draftWithItems.draft.productId,
      templateId: draftWithItems.draft.templateId,
      layoutItems: draftData.layoutItems.map((item) => ({
        layoutIndex: item.layoutIndex,
        type: item.type,
        transformJson: item.transformJson,
        images: item.images.map((img) => ({
          // SNAPSHOTTED DATA - orders must not depend on uploaded_images table
          cloudinaryPublicId: img.uploadedImage.cloudinaryPublicId,
          secureUrl: img.uploadedImage.originalUrl,
          width: img.uploadedImage.width,
          height: img.uploadedImage.height,
          transform: img.transformJson,
          // Optional: keep original ID for debugging only
          uploadedImageId: img.uploadedImageId,
        })),
      })),
    };

    const order = await this.deps.orderRepository.createWithDraftUpdate({
      userId: draftWithItems.draft.userId,
      draftId: validatedInput.draftId,
      totalAmount: product.basePrice,
      productName: product.name,
      designSnapshot,
    });

    return {
      id: order.id,
      draftId: order.draftId,
      state: order.state,
      createdAt: order.createdAt,
    };
  }
}
