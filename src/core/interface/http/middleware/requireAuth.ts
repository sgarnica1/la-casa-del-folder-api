import { Response, NextFunction } from "express";
import { UnauthorizedError } from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "./authMiddleware";

export function requireAuth(
  req: AuthRequest,
  _: Response,
  next: NextFunction
): void {
  if (!req.auth) {
    throw new UnauthorizedError("Authentication required");
  }
  next();
}
