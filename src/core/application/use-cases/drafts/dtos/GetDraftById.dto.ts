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
  layoutItems: z.array(
    z.object({
      id: z.uuid(),
      slotId: z.string(),
      imageId: z.uuid().nullable(),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetDraftByIdOutput = z.infer<typeof GetDraftByIdOutputSchema>;
