import { z } from "zod";
import { DraftState } from "../../../../domain/entities/Draft";

export const LockDraftInputSchema = z.object({
  draftId: z.uuid(),
});

export type LockDraftInput = z.infer<typeof LockDraftInputSchema>;

export const LockDraftOutputSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  productId: z.uuid(),
  templateId: z.uuid(),
  state: z.nativeEnum(DraftState),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LockDraftOutput = z.infer<typeof LockDraftOutputSchema>;
