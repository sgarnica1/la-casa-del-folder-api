import { z } from "zod";

export const GetOrderByIdInputSchema = z.object({
  orderId: z.uuid(),
});

export type GetOrderByIdInput = z.infer<typeof GetOrderByIdInputSchema>;

export const OrderCustomerSchema = z.object({
  id: z.uuid(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});

export type OrderCustomer = z.infer<typeof OrderCustomerSchema>;

export const OrderAddressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

export type OrderAddress = z.infer<typeof OrderAddressSchema>;

export const GetOrderByIdOutputSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  totalAmount: z.string(),
  paymentStatus: z.string(),
  orderStatus: z.string(),
  shippingAddressJson: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
  customer: OrderCustomerSchema,
  address: OrderAddressSchema.nullable(),
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
