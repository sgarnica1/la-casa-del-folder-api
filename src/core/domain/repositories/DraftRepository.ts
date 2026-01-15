import { Draft } from "../entities/Draft";
import { DraftLayoutItem } from "../entities/DraftLayoutItem";

export interface CreateDraftWithLayoutItemsInput {
  draft: Omit<Draft, "id" | "createdAt" | "updatedAt">;
  layoutItems: Omit<DraftLayoutItem, "id" | "draftId" | "createdAt" | "updatedAt">[];
}

export interface DraftWithLayoutItems {
  draft: Draft;
  layoutItems: DraftLayoutItem[];
}

export interface DraftRepository {
  create(draft: Omit<Draft, "createdAt" | "updatedAt">): Promise<Draft>;
  createWithLayoutItems(input: CreateDraftWithLayoutItemsInput): Promise<DraftWithLayoutItems>;
  findById(id: string): Promise<Draft | null>;
  findByIdWithLayoutItems(id: string): Promise<DraftWithLayoutItems | null>;
  update(id: string, updates: Partial<Draft>): Promise<Draft>;
}
