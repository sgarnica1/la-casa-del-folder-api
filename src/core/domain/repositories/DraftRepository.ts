import { Draft } from "../entities/Draft";
import type {
  CreateDraftWithLayoutItemsInput,
  DraftWithLayoutItems,
  DraftWithLayoutItemsAndImages,
  UpdateLayoutItemsInput,
  DraftWithImagesForOrder,
  DraftListSummary,
} from "../../application/use-cases/drafts/dtos/DraftRepository.dto";

export interface DraftRepository {
  create(draft: Omit<Draft, "createdAt" | "updatedAt">): Promise<Draft>;
  createWithLayoutItems(input: CreateDraftWithLayoutItemsInput): Promise<DraftWithLayoutItems>;
  findById(id: string): Promise<Draft | null>;
  findByIdWithLayoutItems(id: string): Promise<DraftWithLayoutItems | null>;
  findByIdWithLayoutItemsAndImages(id: string): Promise<DraftWithLayoutItemsAndImages | null>;
  findByIdWithImagesForOrder(id: string): Promise<DraftWithImagesForOrder | null>;
  update(id: string, updates: Partial<Draft>): Promise<Draft>;
  updateLayoutItems(draftId: string, input: UpdateLayoutItemsInput): Promise<DraftWithLayoutItemsAndImages>;
  markAsOrdered(draftId: string): Promise<void>;
  findDraftsByUser(userId: string): Promise<DraftListSummary[]>;
  findDraftByIdAndUser(id: string, userId: string): Promise<DraftWithLayoutItemsAndImages | null>;
}

export type {
  CreateDraftWithLayoutItemsInput,
  DraftWithLayoutItems,
  DraftWithLayoutItemsAndImages,
  UpdateLayoutItemsInput,
  DraftWithImagesForOrder,
  CreateOrderWithDraftUpdateInput,
  DraftListSummary,
} from "../../application/use-cases/drafts/dtos/DraftRepository.dto";
