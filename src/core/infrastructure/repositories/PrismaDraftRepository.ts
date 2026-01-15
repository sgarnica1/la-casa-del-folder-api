import { DraftRepository, CreateDraftWithLayoutItemsInput, DraftWithLayoutItems } from "../../domain/repositories/DraftRepository";
import { Draft, DraftState } from "../../domain/entities/Draft";
import { DraftLayoutItem } from "../../domain/entities/DraftLayoutItem";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";

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
        state: created.status as DraftState,
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
                transformJson: item.transformJson,
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
          state: result.draft.status as DraftState,
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
      state: draft.status as DraftState,
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
        state: draft.status as DraftState,
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
        },
      });

      return {
        id: updated.id,
        userId: updated.userId,
        productId: updated.productId,
        templateId: updated.templateId!,
        state: updated.status as DraftState,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
