import { z } from "zod";

export const OrderItemSchema = z.object({
  id: z.uuid(),
  productNameSnapshot: z.string(),
  variantNameSnapshot: z.string().nullable(),
  quantity: z.number().int().nonnegative(),
  priceSnapshot: z.number(),
  designSnapshotJson: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderWithItemsSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  totalAmount: z.number(),
  paymentStatus: z.string(),
  orderStatus: z.string(),
  shippingAddressJson: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(OrderItemSchema),
});

export type OrderWithItems = z.infer<typeof OrderWithItemsSchema>;

export const CreateOrderInputSchema = z.object({
  userId: z.uuid(),
  draftId: z.uuid(),
  totalAmount: z.number(),
  productName: z.string(),
  designSnapshot: z.record(z.string(), z.unknown()),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;
