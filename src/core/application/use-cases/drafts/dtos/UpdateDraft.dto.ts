import { z } from "zod";

export const UpdateDraftInputSchema = z.object({
  draftId: z.uuid(),
  layoutItems: z.array(
    z.object({
      id: z.uuid(),
      slotId: z.string(),
      imageId: z.uuid().nullable(),
    })
  ),
});

export type UpdateDraftInput = z.infer<typeof UpdateDraftInputSchema>;

export const UpdateDraftOutputSchema = z.object({
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

export type UpdateDraftOutput = z.infer<typeof UpdateDraftOutputSchema>;
