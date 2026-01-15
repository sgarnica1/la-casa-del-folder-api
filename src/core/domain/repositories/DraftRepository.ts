import { Draft } from "../entities/Draft";

export interface DraftRepository {
  create(draft: Omit<Draft, "createdAt" | "updatedAt">): Promise<Draft>;
  findById(id: string): Promise<Draft | null>;
  update(id: string, updates: Partial<Draft>): Promise<Draft>;
}
