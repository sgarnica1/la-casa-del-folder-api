import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { Draft, DraftState } from "../../core/domain/entities/Draft";
import { prisma } from "../prisma/client";

export class PrismaDraftRepository implements DraftRepository {
  async create(draft: Omit<Draft, "createdAt" | "updatedAt">): Promise<Draft> {
    throw new Error("Not implemented");
  }

  async findById(id: string): Promise<Draft | null> {
    throw new Error("Not implemented");
  }

  async update(id: string, updates: Partial<Draft>): Promise<Draft> {
    throw new Error("Not implemented");
  }
}
