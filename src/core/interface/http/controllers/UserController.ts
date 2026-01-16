import { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";

export class UserController {
  async getCurrentUser(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    res.json({
      id: req.userAuth.userId,
      clerkUserId: req.userAuth.clerkUserId,
      role: req.userAuth.role,
    });
  }
}
