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

export interface DraftLayoutItemWithImage {
  id: string;
  layoutIndex: number;
  imageId: string | null;
}

export interface DraftWithLayoutItemsAndImages {
  draft: Draft;
  layoutItems: DraftLayoutItemWithImage[];
}

export interface UpdateLayoutItemsInput {
  layoutItems: Array<{ slotId: string; imageId: string | null }>;
}

export interface DraftWithImagesForOrder {
  layoutItems: Array<{
    layoutIndex: number;
    type: string;
    transformJson: Record<string, unknown> | null;
    images: Array<{
      uploadedImageId: string;
      transformJson: Record<string, unknown> | null;
      uploadedImage: {
        cloudinaryPublicId: string;
        originalUrl: string;
        width: number;
        height: number;
      };
    }>;
  }>;
}

export interface CreateOrderWithDraftUpdateInput {
  userId: string;
  draftId: string;
  totalAmount: number;
  productName: string;
  designSnapshot: Record<string, unknown>;
}

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
}
