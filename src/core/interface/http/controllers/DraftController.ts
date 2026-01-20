import { Response, NextFunction } from "express";
import { CreateDraft } from "../../../application/use-cases/drafts/CreateDraft";
import { GetDraftById } from "../../../application/use-cases/drafts/GetDraftById";
import { UpdateDraft } from "../../../application/use-cases/drafts/UpdateDraft";
import { LockDraft } from "../../../application/use-cases/drafts/LockDraft";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { NotFoundError, ConflictError, ValidationError } from "../../../domain/errors/DomainErrors";
import { DraftMutationPolicy } from "../../../domain/policies/DraftMutationPolicy";
import type { AuthRequest } from "../middleware/authMiddleware";
import { DraftStateEnum } from '../../../domain/entities/Draft';

export class DraftController {
  private draftMutationPolicy: DraftMutationPolicy;

  constructor(
    private createDraft: CreateDraft,
    private getDraftById: GetDraftById,
    private updateDraft: UpdateDraft,
    private lockDraft: LockDraft,
    draftRepository: DraftRepository
  ) {
    this.draftMutationPolicy = new DraftMutationPolicy(draftRepository);
  }

  /**
   * HTTP GUARD: Prevents mutation of locked or ordered drafts
   * 
   * Uses domain policy for the actual rule enforcement.
   * This guard is HTTP-specific orchestration only.
   */
  mutationGuard() {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

      if (!id) {
        res.status(400).json({
          error: { code: "VALIDATION_ERROR", message: "Draft ID is required" },
        });
        return;
      }

      try {
        await this.draftMutationPolicy.assertEditable(id);
        next();
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({
            error: { code: "NOT_FOUND", message: error.message },
          });
          return;
        }

        if (error instanceof ConflictError) {
          res.status(409).json({
            error: { code: "CONFLICT", message: error.message },
          });
          return;
        }

        next(error);
      }
    };
  }

  async create(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const result = await this.createDraft.execute({ userId: req.userAuth.userId });

      res.status(201).json({
        id: result.draft.id,
        status: result.draft.state === DraftStateEnum.EDITING ? "draft" : result.draft.state,
        productId: result.draft.productId,
        templateId: result.draft.templateId,
        layoutItems: result.layoutItems.map((item) => ({
          id: item.id,
          slotId: `slot-${item.layoutIndex}`,
        })),
        createdAt: result.draft.createdAt.toISOString(),
        updatedAt: result.draft.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }
      throw error;
    }
  }

  async getById(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Draft ID is required" } });
      return;
    }

    try {
      const result = await this.getDraftById.execute({ draftId: id });
      res.json({
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }
      throw error;
    }
  }

  async update(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Draft ID is required" } });
      return;
    }

    const { layoutItems, title } = req.body as {
      layoutItems?: Array<{ id: string; slotId: string; imageId: string | null }>;
      title?: string;
    };

    try {
      const result = await this.updateDraft.execute({
        draftId: id,
        ...(title !== undefined && { title }),
        ...(layoutItems && { layoutItems }),
      });

      res.json({
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({ error: { code: "CONFLICT", message: error.message } });
        return;
      }

      console.error("Update error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to update draft" } });
    }
  }

  async lock(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Draft ID is required" } });
      return;
    }

    try {
      await this.lockDraft.execute({ draftId: id });
      const result = await this.getDraftById.execute({ draftId: id });

      res.json({
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
        lockedAt: result.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({ error: { code: "CONFLICT", message: error.message } });
        return;
      }

      console.error("Lock draft error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to lock draft" } });
    }
  }
}
