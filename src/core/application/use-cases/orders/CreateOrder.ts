import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { Order, OrderState } from "../../../domain/entities/Order";
import { DraftState } from "../../../domain/entities/Draft";
import { NotFoundError } from "../../../domain/errors/DomainErrors";
import { prisma } from "../../../infrastructure/prisma/client";

export interface CreateOrderDependencies {
  orderRepository: OrderRepository;
  draftRepository: DraftRepository;
}

export interface CreateOrderInput {
  draftId: string;
}

export class CreateOrder {
  constructor(private deps: CreateOrderDependencies) { }

  async execute(input: CreateOrderInput): Promise<Order> {
    const draftWithItems = await this.deps.draftRepository.findByIdWithLayoutItems(input.draftId);

    if (!draftWithItems) {
      throw new NotFoundError("Draft", input.draftId);
    }

    if (draftWithItems.draft.state !== DraftState.LOCKED) {
      throw new Error("Draft must be locked before creating an order");
    }

    const product = await prisma.product.findUnique({
      where: { id: draftWithItems.draft.productId },
    });

    if (!product) {
      throw new NotFoundError("Product", draftWithItems.draft.productId);
    }

    const draftData = await prisma.draft.findUnique({
      where: { id: input.draftId },
      include: {
        layoutItems: {
          include: {
            images: {
              include: {
                uploadedImage: true,
              },
            },
          },
          orderBy: { layoutIndex: "asc" },
        },
      },
    });

    if (!draftData) {
      throw new NotFoundError("Draft", input.draftId);
    }

    const designSnapshot = {
      draftId: input.draftId,
      productId: draftWithItems.draft.productId,
      templateId: draftWithItems.draft.templateId,
      layoutItems: draftData.layoutItems.map((item) => ({
        layoutIndex: item.layoutIndex,
        type: item.type,
        transformJson: item.transformJson,
        images: item.images.map((img) => ({
          uploadedImageId: img.uploadedImageId,
          uploadedImageUrl: img.uploadedImage.originalUrl,
          transformJson: img.transformJson,
        })),
      })),
    };

    const SEEDED_USER_ID = "00000000-0000-0000-0000-000000000000";

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: SEEDED_USER_ID,
          totalAmount: product.basePrice,
          paymentStatus: "paid",
          orderStatus: "new",
          shippingAddressJson: {},
          items: {
            create: {
              productNameSnapshot: product.name,
              variantNameSnapshot: null,
              quantity: 1,
              priceSnapshot: product.basePrice,
              designSnapshotJson: designSnapshot,
            },
          },
        },
      });

      await tx.draft.update({
        where: { id: input.draftId },
        data: { status: "ordered" },
      });

      return order;
    });

    const domainOrder: Order = {
      id: result.id,
      draftId: input.draftId,
      state: OrderState.PENDING,
      createdAt: result.createdAt,
    };

    return domainOrder;
  }
}
