import { z } from "zod";

export const UpdateCartItemQuantityInputSchema = z.object({
  cartItemId: z.uuid(),
  quantity: z.number().int().positive(),
});

export type UpdateCartItemQuantityInput = z.infer<typeof UpdateCartItemQuantityInputSchema>;

export const UpdateCartItemQuantityOutputSchema = z.object({
  id: z.uuid(),
  cartId: z.uuid(),
  draftId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UpdateCartItemQuantityOutput = z.infer<typeof UpdateCartItemQuantityOutputSchema>;
