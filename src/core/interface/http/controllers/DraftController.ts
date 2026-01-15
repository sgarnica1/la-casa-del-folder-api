import { Request, Response, NextFunction } from "express";
import { CreateDraft } from "../../../application/use-cases/drafts/CreateDraft";
import { LockDraft } from "../../../application/use-cases/drafts/LockDraft";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { NotFoundError } from "../../../domain/errors/DomainErrors";

export const SEEDED_USER_ID = "00000000-0000-0000-0000-000000000000";

export class DraftController {
  constructor(
    private createDraft: CreateDraft,
    private lockDraft: LockDraft,
    private draftRepository: DraftRepository
  ) { }

  async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const result = await this.createDraft.execute({ userId: SEEDED_USER_ID });

    res.status(201).json({
      id: result.draft.id,
      status: result.draft.state === "editing" ? "draft" : result.draft.state,
      productId: result.draft.productId,
      templateId: result.draft.templateId,
      layoutItems: result.layoutItems.map((item) => ({
        id: item.id,
        slotId: `slot-${item.layoutIndex}`,
      })),
      createdAt: result.draft.createdAt.toISOString(),
      updatedAt: result.draft.updatedAt.toISOString(),
    });
  }

  async getById(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    const draftWithItems = await this.draftRepository.findByIdWithLayoutItems(id);

    if (!draftWithItems) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Draft not found" } });
      return;
    }

    const { prisma } = await import("../../../infrastructure/prisma/client");
    const draftData = await prisma.draft.findUnique({
      where: { id },
      include: {
        layoutItems: {
          include: {
            images: {
              take: 1,
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
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Draft not found" } });
      return;
    }

    res.json({
      id: draftWithItems.draft.id,
      status: draftWithItems.draft.state === "editing" ? "draft" : draftWithItems.draft.state,
      productId: draftWithItems.draft.productId,
      templateId: draftWithItems.draft.templateId,
      layoutItems: draftData.layoutItems.map((item) => ({
        id: item.id,
        slotId: `slot-${item.layoutIndex}`,
        imageId: item.images[0]?.uploadedImageId || null,
      })),
      createdAt: draftWithItems.draft.createdAt.toISOString(),
      updatedAt: draftWithItems.draft.updatedAt.toISOString(),
    });
  }

  async update(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { layoutItems } = req.body as { layoutItems: Array<{ id: string; slotId: string; imageId: string | null }> };

    const draft = await this.draftRepository.findById(id);
    if (!draft) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Draft not found" } });
      return;
    }

    const { prisma } = await import("../../../infrastructure/prisma/client");

    try {
      await prisma.$transaction(async (tx) => {
        for (const item of layoutItems) {
          const layoutIndex = parseInt(item.slotId.replace("slot-", ""), 10);

          const draftLayoutItem = await tx.draftLayoutItem.findFirst({
            where: {
              draftId: id,
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
                transformJson: null,
              },
            });
          }
        }

        await tx.draft.update({
          where: { id },
          data: { updatedAt: new Date() },
        });
      });

      const updatedDraft = await this.draftRepository.findByIdWithLayoutItems(id);
      if (!updatedDraft) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Draft not found" } });
        return;
      }

      const { prisma: prismaClient } = await import("../../../infrastructure/prisma/client");
      const draftData = await prismaClient.draft.findUnique({
        where: { id },
        include: {
          layoutItems: {
            include: {
              images: { take: 1 },
            },
            orderBy: { layoutIndex: "asc" },
          },
        },
      });

      if (!draftData) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Draft not found" } });
        return;
      }

      res.json({
        id: updatedDraft.draft.id,
        status: updatedDraft.draft.state === "editing" ? "draft" : updatedDraft.draft.state,
        productId: updatedDraft.draft.productId,
        templateId: updatedDraft.draft.templateId,
        layoutItems: draftData.layoutItems.map((item) => ({
          id: item.id,
          slotId: `slot-${item.layoutIndex}`,
          imageId: item.images[0]?.uploadedImageId || null,
        })),
        createdAt: updatedDraft.draft.createdAt.toISOString(),
        updatedAt: updatedDraft.draft.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to update draft" } });
    }
  }

  async lock(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { id } = req.params;

    try {
      const lockedDraft = await this.lockDraft.execute({ draftId: id });

      const { prisma } = await import("../../../infrastructure/prisma/client");
      const draftData = await prisma.draft.findUnique({
        where: { id },
        include: {
          layoutItems: {
            include: {
              images: { take: 1 },
            },
            orderBy: { layoutIndex: "asc" },
          },
        },
      });

      if (!draftData) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Draft not found" } });
        return;
      }

      res.json({
        id: lockedDraft.id,
        status: lockedDraft.state === "editing" ? "draft" : lockedDraft.state,
        productId: lockedDraft.productId,
        templateId: lockedDraft.templateId,
        layoutItems: draftData.layoutItems.map((item) => ({
          id: item.id,
          slotId: `slot-${item.layoutIndex}`,
          imageId: item.images[0]?.uploadedImageId || null,
        })),
        createdAt: lockedDraft.createdAt.toISOString(),
        updatedAt: lockedDraft.updatedAt.toISOString(),
        lockedAt: lockedDraft.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof Error && error.message.includes("Cannot lock")) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message } });
        return;
      }

      console.error("Lock draft error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to lock draft" } });
    }
  }
}
