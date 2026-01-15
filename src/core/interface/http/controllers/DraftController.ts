import { Request, Response, NextFunction } from "express";
import { CreateDraft } from "../../../application/use-cases/drafts/CreateDraft";
import { LockDraft } from "../../../application/use-cases/drafts/LockDraft";
import { UnauthorizedError } from "../../../domain/errors";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class DraftController {
  constructor(
    private createDraft: CreateDraft,
    private lockDraft: LockDraft
  ) { }

  async create(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.userId || (req.body as { userId?: string }).userId;
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const result = await this.createDraft.execute({ userId });

    res.status(201).json({
      id: result.draftId,
      layoutItems: result.layoutItems.map((item) => ({
        id: item.id,
        layoutIndex: item.layoutIndex,
        type: item.type,
      })),
    });
  }

  async lock(req: Request, res: Response, _next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
