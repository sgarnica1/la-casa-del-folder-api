import { Response, NextFunction } from "express";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { ForbiddenError, NotFoundError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "./authMiddleware";

export function createCreateOrderGuard(draftRepository: DraftRepository) {
  return async function createOrderGuard(
    req: AuthRequest,
    _: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.userAuth) {
      throw new ForbiddenError("Authentication required");
    }

    const { draftId } = req.body as { draftId: string | undefined };

    if (!draftId) {
      next();
      return;
    }

    const draft = await draftRepository.findById(draftId);

    if (!draft) {
      throw new NotFoundError("Draft", draftId);
    }

    if (draft.userId !== req.userAuth.userId) {
      throw new ForbiddenError("Access denied: draft belongs to another user");
    }

    next();
  };
}
