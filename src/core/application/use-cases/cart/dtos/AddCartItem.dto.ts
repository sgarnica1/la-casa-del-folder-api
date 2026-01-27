import { z } from "zod";

export const AddCartItemInputSchema = z.object({
  draftId: z.uuid(),
});

export type AddCartItemInput = z.infer<typeof AddCartItemInputSchema>;

export const SelectedOptionSnapshotSchema = z.object({
  optionTypeId: z.string(),
  optionTypeName: z.string(),
  optionValueId: z.string(),
  optionValueName: z.string(),
  priceModifier: z.number().nullable(),
});

export type SelectedOptionSnapshot = z.infer<typeof SelectedOptionSnapshotSchema>;

export const AddCartItemOutputSchema = z.object({
  id: z.uuid(),
  cartId: z.uuid(),
  draftId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  selectedOptionsSnapshot: z.array(SelectedOptionSnapshotSchema).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AddCartItemOutput = z.infer<typeof AddCartItemOutputSchema>;
