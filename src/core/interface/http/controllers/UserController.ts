import { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/authMiddleware";
import { UserRepository } from "../../../domain/repositories/UserRepository";
import { ValidationError } from "../../../domain/errors/DomainErrors";
import { z } from "zod";

const UpdateUserDataSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export class UserController {
  constructor(private userRepository: UserRepository) {}

  async getCurrentUser(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const user = await this.userRepository.findById(req.userAuth.userId);
    if (!user) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
      return;
    }

    res.json({
      id: user.id,
      clerkUserId: req.userAuth.clerkUserId,
      role: req.userAuth.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
    });
  }

  async updateUserData(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    const validationResult = UpdateUserDataSchema.safeParse(req.body);
    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const updates: { firstName?: string | null; lastName?: string | null; phone?: string | null } = {};
    if (validationResult.data.firstName !== undefined) {
      updates.firstName = validationResult.data.firstName || null;
    }
    if (validationResult.data.lastName !== undefined) {
      updates.lastName = validationResult.data.lastName || null;
    }
    if (validationResult.data.phone !== undefined) {
      updates.phone = validationResult.data.phone || null;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: { code: "BAD_REQUEST", message: "No updates provided" } });
      return;
    }

    const updatedUser = await this.userRepository.update(req.userAuth.userId, updates);

    res.json({
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      email: updatedUser.email,
    });
  }
}
