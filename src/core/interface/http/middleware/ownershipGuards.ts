import { Response, NextFunction } from "express";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { ForbiddenError, NotFoundError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "./authMiddleware";

export function createDraftOwnershipGuard(draftRepository: DraftRepository) {
  return async function draftOwnershipGuard(
    req: AuthRequest,
    _: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.userAuth) {
      throw new ForbiddenError("Authentication required");
    }

    const draftId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!draftId) {
      throw new NotFoundError("Draft", "unknown");
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

export function createOrderOwnershipGuard(orderRepository: OrderRepository) {
  return async function orderOwnershipGuard(
    req: AuthRequest,
    _: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.userAuth) {
      throw new ForbiddenError("Authentication required");
    }

    if (req.userAuth.role === "admin") {
      next();
      return;
    }

    const orderId = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!orderId) {
      throw new NotFoundError("Order", "unknown");
    }

    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundError("Order", orderId);
    }

    if (order.userId !== req.userAuth.userId) {
      throw new ForbiddenError("Access denied: order belongs to another user");
    }

    next();
  };
}
