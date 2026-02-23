import { z } from "zod";

export const UpdateDraftInputSchema = z.object({
  draftId: z.uuid(),
  title: z.string().max(60, "El título no puede exceder 60 caracteres").optional(),
  layoutItems: z.array(
    z.object({
      id: z.uuid(),
      slotId: z.string(),
      imageId: z.uuid().nullable(),
      transform: z.object({
        x: z.number(),
        y: z.number(),
        scale: z.number(),
        rotation: z.number(),
      }).nullable().optional(),
    })
  ).optional(),
});

export type UpdateDraftInput = z.infer<typeof UpdateDraftInputSchema>;

export const UpdateDraftOutputSchema = z.object({
  id: z.uuid(),
  status: z.string(),
  productId: z.uuid(),
  templateId: z.uuid(),
  title: z.string().nullable().optional(),
  layoutItems: z.array(
    z.object({
      id: z.uuid(),
      slotId: z.string(),
      imageId: z.uuid().nullable(),
      transform: z.object({
        x: z.number(),
        y: z.number(),
        scale: z.number(),
        rotation: z.number(),
      }).nullable().optional(),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UpdateDraftOutput = z.infer<typeof UpdateDraftOutputSchema>;
