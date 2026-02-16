import { z } from "zod";

export const GetDraftByIdInputSchema = z.object({
  draftId: z.uuid(),
});

export type GetDraftByIdInput = z.infer<typeof GetDraftByIdInputSchema>;

export const GetDraftByIdOutputSchema = z.object({
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

export type GetDraftByIdOutput = z.infer<typeof GetDraftByIdOutputSchema>;
