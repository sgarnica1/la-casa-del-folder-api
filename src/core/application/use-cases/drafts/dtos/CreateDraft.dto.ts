import { z } from "zod";

export const CreateDraftInputSchema = z.object({
  userId: z.uuid(),
});

export type CreateDraftInput = z.infer<typeof CreateDraftInputSchema>;

export const CreateDraftOutputSchema = z.object({
  draft: z.object({
    id: z.uuid(),
    productId: z.uuid(),
    templateId: z.uuid(),
    state: z.enum(["editing", "locked", "ordered"]),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
  layoutItems: z.array(
    z.object({
      id: z.uuid(),
      layoutIndex: z.number().int().nonnegative(),
      type: z.string(),
    })
  ),
});

export type CreateDraftOutput = z.infer<typeof CreateDraftOutputSchema>;
