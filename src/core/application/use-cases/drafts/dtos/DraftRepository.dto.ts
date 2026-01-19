import { z } from "zod";
import { DraftStateEnum } from "../../../../domain/entities/Draft";

export const DraftLayoutItemSchema = z.object({
  id: z.string(),
  draftId: z.string(),
  layoutIndex: z.number(),
  type: z.enum(["image", "text"]),
  transformJson: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DraftLayoutItem = z.infer<typeof DraftLayoutItemSchema>;

export const DraftSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  templateId: z.string(),
  state: z.nativeEnum(DraftStateEnum),
  title: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Draft = z.infer<typeof DraftSchema>;

export const CreateDraftWithLayoutItemsInputSchema = z.object({
  draft: DraftSchema.omit({ id: true, createdAt: true, updatedAt: true }),
  layoutItems: z.array(DraftLayoutItemSchema.omit({ id: true, draftId: true, createdAt: true, updatedAt: true })),
});

export type CreateDraftWithLayoutItemsInput = z.infer<typeof CreateDraftWithLayoutItemsInputSchema>;

export const DraftWithLayoutItemsSchema = z.object({
  draft: DraftSchema,
  layoutItems: z.array(DraftLayoutItemSchema),
});

export type DraftWithLayoutItems = z.infer<typeof DraftWithLayoutItemsSchema>;

export const DraftLayoutItemWithImageSchema = z.object({
  id: z.string(),
  layoutIndex: z.number(),
  imageId: z.string().nullable(),
});

export type DraftLayoutItemWithImage = z.infer<typeof DraftLayoutItemWithImageSchema>;

export const DraftWithLayoutItemsAndImagesSchema = z.object({
  draft: DraftSchema,
  layoutItems: z.array(DraftLayoutItemWithImageSchema),
});

export type DraftWithLayoutItemsAndImages = z.infer<typeof DraftWithLayoutItemsAndImagesSchema>;

export const UpdateLayoutItemsInputSchema = z.object({
  layoutItems: z.array(z.object({
    slotId: z.string(),
    imageId: z.string().nullable(),
  })),
});

export type UpdateLayoutItemsInput = z.infer<typeof UpdateLayoutItemsInputSchema>;

export const DraftWithImagesForOrderSchema = z.object({
  layoutItems: z.array(z.object({
    layoutIndex: z.number(),
    type: z.string(),
    transformJson: z.record(z.string(), z.unknown()).nullable(),
    images: z.array(z.object({
      uploadedImageId: z.string(),
      transformJson: z.record(z.string(), z.unknown()).nullable(),
      uploadedImage: z.object({
        cloudinaryPublicId: z.string(),
        originalUrl: z.string(),
        width: z.number(),
        height: z.number(),
      }),
    })),
  })),
});

export type DraftWithImagesForOrder = z.infer<typeof DraftWithImagesForOrderSchema>;

export const CreateOrderWithDraftUpdateInputSchema = z.object({
  userId: z.string(),
  draftId: z.string(),
  totalAmount: z.number(),
  productName: z.string(),
  designSnapshot: z.record(z.string(), z.unknown()),
});

export type CreateOrderWithDraftUpdateInput = z.infer<typeof CreateOrderWithDraftUpdateInputSchema>;

export const DraftListSummarySchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  state: z.nativeEnum(DraftStateEnum),
  updatedAt: z.date(),
  coverUrl: z.string().nullable(),
});

export type DraftListSummary = z.infer<typeof DraftListSummarySchema>;
