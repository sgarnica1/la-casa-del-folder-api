import { z } from "zod";

export const RemoveCartItemInputSchema = z.object({
  cartItemId: z.uuid(),
});

export type RemoveCartItemInput = z.infer<typeof RemoveCartItemInputSchema>;
