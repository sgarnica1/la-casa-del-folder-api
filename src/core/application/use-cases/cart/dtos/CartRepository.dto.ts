import { z } from "zod";
import { CartStatusEnum } from "../../../../domain/entities/Cart";

export const CartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  status: z.nativeEnum(CartStatusEnum),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Cart = z.infer<typeof CartSchema>;

export const SelectedOptionSnapshotSchema = z.object({
  optionTypeId: z.string(),
  optionTypeName: z.string(),
  optionValueId: z.string(),
  optionValueName: z.string(),
  priceModifier: z.number().nullable(),
});

export type SelectedOptionSnapshot = z.infer<typeof SelectedOptionSnapshotSchema>;

export const CartItemSchema = z.object({
  id: z.string(),
  cartId: z.string(),
  draftId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  selectedOptionsSnapshot: z.array(SelectedOptionSnapshotSchema).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartWithItemsSchema = z.object({
  cart: CartSchema,
  items: z.array(CartItemSchema),
  total: z.number(),
});

export type CartWithItems = z.infer<typeof CartWithItemsSchema>;

export const AddCartItemInputSchema = z.object({
  cartId: z.string(),
  draftId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
  selectedOptionsSnapshot: z.array(SelectedOptionSnapshotSchema),
});

export type AddCartItemInput = z.infer<typeof AddCartItemInputSchema>;
