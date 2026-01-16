import { Response, NextFunction } from "express";
import { ForbiddenError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "./authMiddleware";

export function requireAdmin(
  req: AuthRequest,
  _: Response,
  next: NextFunction
): void {
  if (!req.userAuth) {
    throw new ForbiddenError("Authentication required");
  }

  if (req.userAuth.role !== "admin") {
    throw new ForbiddenError("Admin access required");
  }

  next();
}
