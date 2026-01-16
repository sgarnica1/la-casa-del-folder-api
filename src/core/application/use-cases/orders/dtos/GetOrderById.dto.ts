import { z } from "zod";

export const GetOrderByIdInputSchema = z.object({
  orderId: z.uuid(),
});

export type GetOrderByIdInput = z.infer<typeof GetOrderByIdInputSchema>;

export const GetOrderByIdOutputSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  totalAmount: z.string(),
  paymentStatus: z.string(),
  orderStatus: z.string(),
  shippingAddressJson: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
  items: z.array(
    z.object({
      id: z.uuid(),
      productNameSnapshot: z.string(),
      variantNameSnapshot: z.string().nullable(),
      quantity: z.number().int().nonnegative(),
      priceSnapshot: z.string(),
      designSnapshotJson: z.record(z.string(), z.unknown()),
      createdAt: z.date(),
      updatedAt: z.date(),
    })
  ),
});

export type GetOrderByIdOutput = z.infer<typeof GetOrderByIdOutputSchema>;
