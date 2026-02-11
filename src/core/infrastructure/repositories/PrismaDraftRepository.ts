import {
  DraftRepository,
  CreateDraftWithLayoutItemsInput,
  DraftWithLayoutItems,
  DraftWithLayoutItemsAndImages,
  UpdateLayoutItemsInput,
  DraftWithImagesForOrder,
  DraftListSummary,
  DraftWithSelectedOptions,
} from "../../domain/repositories/DraftRepository";
import { Draft, DraftStateEnum } from "../../domain/entities/Draft";
import { DraftLayoutItem } from "../../domain/entities/DraftLayoutItem";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";
import { Prisma } from "@prisma/client";

export class PrismaDraftRepository implements DraftRepository {
  async create(draft: Omit<Draft, "createdAt" | "updatedAt">): Promise<Draft> {
    try {
      const created = await prisma.draft.create({
        data: {
          id: draft.id,
          userId: draft.userId,
          productId: draft.productId,
          templateId: draft.templateId,
          status: draft.state as "editing" | "locked" | "ordered",
        },
      });

      return {
        id: created.id,
        userId: created.userId,
        productId: created.productId,
        templateId: created.templateId!,
        state: created.status as DraftStateEnum,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async createWithLayoutItems(input: CreateDraftWithLayoutItemsInput): Promise<DraftWithLayoutItems> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const draft = await tx.draft.create({
          data: {
            userId: input.draft.userId,
            productId: input.draft.productId,
            templateId: input.draft.templateId,
            status: input.draft.state as "editing" | "locked" | "ordered",
          },
        });

        const layoutItems = await Promise.all(
          input.layoutItems.map((item) =>
            tx.draftLayoutItem.create({
              data: {
                draftId: draft.id,
                layoutIndex: item.layoutIndex,
                type: item.type as "image" | "text",
                transformJson: item.transformJson ? (item.transformJson as Prisma.InputJsonValue) : undefined,
              },
            })
          )
        );

        return { draft, layoutItems };
      });

      return {
        draft: {
          id: result.draft.id,
          userId: result.draft.userId,
          productId: result.draft.productId,
          templateId: result.draft.templateId!,
          state: result.draft.status as DraftStateEnum,
          createdAt: result.draft.createdAt,
          updatedAt: result.draft.updatedAt,
        },
        layoutItems: result.layoutItems.map((item) => ({
          id: item.id,
          draftId: item.draftId,
          layoutIndex: item.layoutIndex,
          type: item.type as DraftLayoutItem["type"],
          transformJson: item.transformJson as Record<string, unknown> | null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findById(id: string): Promise<Draft | null> {
    const draft = await prisma.draft.findUnique({
      where: { id },
    });

    if (!draft) {
      return null;
    }

    return {
      id: draft.id,
      userId: draft.userId,
      productId: draft.productId,
      templateId: draft.templateId!,
      state: draft.status as DraftStateEnum,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt,
    };
  }

  async findByIdWithLayoutItems(id: string): Promise<DraftWithLayoutItems | null> {
    const draft = await prisma.draft.findUnique({
      where: { id },
      include: {
        layoutItems: {
          include: {
            images: {
              take: 1,
            },
          },
          orderBy: { layoutIndex: "asc" },
        },
      },
    });

    if (!draft) {
      return null;
    }

    return {
      draft: {
        id: draft.id,
        userId: draft.userId,
        productId: draft.productId,
        templateId: draft.templateId!,
        state: draft.status as DraftStateEnum,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      },
      layoutItems: draft.layoutItems.map((item) => ({
        id: item.id,
        draftId: item.draftId,
        layoutIndex: item.layoutIndex,
        type: item.type as DraftLayoutItem["type"],
        transformJson: item.transformJson as Record<string, unknown> | null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }

  async update(id: string, updates: Partial<Draft>): Promise<Draft> {
    try {
      const updated = await prisma.draft.update({
        where: { id },
        data: {
          ...(updates.userId !== undefined && { userId: updates.userId }),
          ...(updates.productId !== undefined && { productId: updates.productId }),
          ...(updates.templateId !== undefined && { templateId: updates.templateId }),
          ...(updates.state !== undefined && { status: updates.state as "editing" | "locked" | "ordered" }),
          ...(updates.title !== undefined && { title: updates.title }),
        },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        productId: updated.productId,
        templateId: updated.templateId!,
        state: updated.status as DraftStateEnum,
        title: updated.title || undefined,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByIdWithLayoutItemsAndImages(id: string): Promise<DraftWithLayoutItemsAndImages | null> {
    const draft = await prisma.draft.findUnique({
      where: { id },
      include: {
        layoutItems: {
          include: {
            images: {
              take: 1,
            },
          },
          orderBy: { layoutIndex: "asc" },
        },
      },
    });

    if (!draft) {
      return null;
    }

    return {
      draft: {
        id: draft.id,
        userId: draft.userId,
        productId: draft.productId,
        templateId: draft.templateId!,
        state: draft.status as DraftStateEnum,
        title: draft.title || undefined,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      },
      layoutItems: draft.layoutItems.map((item) => ({
        id: item.id,
        layoutIndex: item.layoutIndex,
        imageId: item.images[0]?.uploadedImageId || null,
      })),
    };
  }

  async updateLayoutItems(draftId: string, input: UpdateLayoutItemsInput): Promise<DraftWithLayoutItemsAndImages> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        for (const item of input.layoutItems) {
          const layoutIndex = parseInt(item.slotId.replace("slot-", ""), 10);

          const draftLayoutItem = await tx.draftLayoutItem.findFirst({
            where: {
              draftId,
              layoutIndex,
            },
          });

          if (!draftLayoutItem) {
            continue;
          }

          await tx.draftLayoutItemImage.deleteMany({
            where: {
              draftLayoutItemId: draftLayoutItem.id,
            },
          });

          if (item.imageId) {
            await tx.draftLayoutItemImage.create({
              data: {
                draftLayoutItemId: draftLayoutItem.id,
                uploadedImageId: item.imageId,
              },
            });
          }
        }

        await tx.draft.update({
          where: { id: draftId },
          data: { updatedAt: new Date() },
        });

        const updated = await tx.draft.findUnique({
          where: { id: draftId },
          include: {
            layoutItems: {
              include: {
                images: {
                  take: 1,
                },
              },
              orderBy: { layoutIndex: "asc" },
            },
          },
        });

        if (!updated) {
          throw new Error("Draft not found after update");
        }

        return updated;
      });

      return {
        draft: {
          id: result.id,
          userId: result.userId,
          productId: result.productId,
          templateId: result.templateId!,
          state: result.status as DraftStateEnum,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
        layoutItems: result.layoutItems.map((item) => ({
          id: item.id,
          layoutIndex: item.layoutIndex,
          imageId: item.images[0]?.uploadedImageId || null,
        })),
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByIdWithImagesForOrder(id: string): Promise<DraftWithImagesForOrder | null> {
    const draft = await prisma.draft.findUnique({
      where: { id },
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

    if (!draft) {
      return null;
    }

    return {
      layoutItems: draft.layoutItems.map((item) => ({
        layoutIndex: item.layoutIndex,
        type: item.type,
        transformJson: item.transformJson as Record<string, unknown> | null,
        images: item.images.map((img) => ({
          uploadedImageId: img.uploadedImageId,
          transformJson: img.transformJson as Record<string, unknown> | null,
          uploadedImage: {
            cloudinaryPublicId: img.uploadedImage.cloudinaryPublicId,
            originalUrl: img.uploadedImage.originalUrl,
            width: img.uploadedImage.width,
            height: img.uploadedImage.height,
          },
        })),
      })),
    };
  }

  async markAsOrdered(draftId: string): Promise<void> {
    await prisma.draft.update({
      where: { id: draftId },
      data: { status: "ordered" },
    });
  }

  async findDraftsByUser(userId: string): Promise<DraftListSummary[]> {
    const drafts = await prisma.draft.findMany({
      where: {
        userId,
        status: {
          in: ['editing', 'locked']
        }
      },
      orderBy: { updatedAt: "desc" },
      include: {
        product: {
          select: {
            name: true,
          },
        },
        layoutItems: {
          include: {
            images: {
              take: 1,
              include: {
                uploadedImage: {
                  select: {
                    originalUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { layoutIndex: "asc" },
          take: 1,
        },
      },
    });

    return drafts.map((draft) => {
      const firstLayoutItem = draft.layoutItems[0];
      const firstImage = firstLayoutItem?.images[0];
      const coverUrl = firstImage?.uploadedImage?.originalUrl || null;

      return {
        id: draft.id,
        title: draft.title,
        state: draft.status as DraftStateEnum,
        updatedAt: draft.updatedAt,
        coverUrl,
        productName: draft.product?.name || null,
      };
    });
  }

  async findByIdWithSelectedOptions(id: string): Promise<DraftWithSelectedOptions | null> {
    const draft = await prisma.draft.findUnique({
      where: { id },
      include: {
        selectedOptions: {
          include: {
            productOptionValue: {
              include: {
                optionType: true,
              },
            },
          },
        },
      },
    });

    if (!draft) {
      return null;
    }

    return {
      draft: {
        id: draft.id,
        userId: draft.userId,
        productId: draft.productId,
        templateId: draft.templateId!,
        state: draft.status as DraftStateEnum,
        title: draft.title || undefined,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      },
      selectedOptions: draft.selectedOptions.map((selectedOption) => ({
        optionTypeId: selectedOption.productOptionValue.optionType.id,
        optionTypeName: selectedOption.productOptionValue.optionType.name,
        optionValueId: selectedOption.productOptionValue.id,
        optionValueName: selectedOption.productOptionValue.name,
        priceModifier: selectedOption.productOptionValue.priceModifier ? Number(selectedOption.productOptionValue.priceModifier) : null,
      })),
    };
  }

  async findDraftByIdAndUser(id: string, userId: string): Promise<DraftWithLayoutItemsAndImages | null> {
    const draft = await prisma.draft.findFirst({
      where: { id, userId },
      include: {
        layoutItems: {
          include: {
            images: {
              take: 1,
            },
          },
          orderBy: { layoutIndex: "asc" },
        },
      },
    });

    if (!draft) {
      return null;
    }

    return {
      draft: {
        id: draft.id,
        userId: draft.userId,
        productId: draft.productId,
        templateId: draft.templateId!,
        state: draft.status as DraftStateEnum,
        title: draft.title || undefined,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      },
      layoutItems: draft.layoutItems.map((item) => ({
        id: item.id,
        layoutIndex: item.layoutIndex,
        imageId: item.images[0]?.uploadedImageId || null,
      })),
    };
  }
}
