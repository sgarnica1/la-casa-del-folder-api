import { z } from "zod";

export const DeleteDraftInputSchema = z.object({
  draftId: z.string().uuid(),
});

export type DeleteDraftInput = z.infer<typeof DeleteDraftInputSchema>;
