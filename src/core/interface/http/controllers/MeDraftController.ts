import { Response, NextFunction } from "express";
import { GetMyDrafts } from "../../../application/use-cases/drafts/GetMyDrafts";
import { GetMyDraftById } from "../../../application/use-cases/drafts/GetMyDraftById";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "../middleware/authMiddleware";

export class MeDraftController {
  constructor(
    private getMyDraftsUseCase: GetMyDrafts,
    private getMyDraftByIdUseCase: GetMyDraftById
  ) { }

  async getMyDrafts(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const drafts = await this.getMyDraftsUseCase.execute({ userId: req.userAuth.userId });
      res.json(
        drafts.map((draft) => ({
          id: draft.id,
          title: draft.title,
          state: draft.state,
          updatedAt: draft.updatedAt.toISOString(),
        }))
      );
    } catch (error) {
      console.error("Get my drafts error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get drafts" } });
    }
  }

  async getMyDraftById(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Draft ID is required" } });
      return;
    }

    try {
      const result = await this.getMyDraftByIdUseCase.execute({ draftId: id, userId: req.userAuth.userId });

      const imageIds = result.layoutItems
        .map((item) => item.imageId)
        .filter((id): id is string => id !== null);

      res.json({
        id: result.draft.id,
        title: result.draft.title,
        state: result.draft.state,
        layoutItems: result.layoutItems.map((item) => ({
          id: item.id,
          slotId: `slot-${item.layoutIndex}`,
          imageId: item.imageId,
        })),
        imageIds,
        createdAt: result.draft.createdAt.toISOString(),
        updatedAt: result.draft.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message } });
        return;
      }

      console.error("Get my draft by id error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get draft" } });
    }
  }
}
