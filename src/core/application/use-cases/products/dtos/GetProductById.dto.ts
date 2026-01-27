import { z } from "zod";

const uuidLikeString = z.string().regex(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  "Invalid UUID format"
);

export const GetProductByIdInputSchema = z.object({
  productId: uuidLikeString,
});

export type GetProductByIdInput = z.infer<typeof GetProductByIdInputSchema>;

export const GetProductByIdOutputSchema = z.object({
  id: uuidLikeString,
  name: z.string(),
  description: z.string().nullable(),
  basePrice: z.number(),
  currency: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetProductByIdOutput = z.infer<typeof GetProductByIdOutputSchema>;
