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

export const OrderWithItemsSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  totalAmount: z.number(),
  paymentStatus: z.string(),
  orderStatus: z.string(),
  shippingAddressJson: z.record(z.string(), z.unknown()),
  createdAt: z.date(),
  updatedAt: z.date(),
  customer: OrderCustomerSchema,
  address: OrderAddressSchema.nullable(),
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

export const CreateOrderItemInputSchema = z.object({
  productName: z.string(),
  variantName: z.string().nullable(),
  quantity: z.number().int().positive(),
  priceSnapshot: z.number(),
  designSnapshot: z.record(z.string(), z.unknown()),
  draftId: z.uuid(),
});

export type CreateOrderItemInput = z.infer<typeof CreateOrderItemInputSchema>;

export const CreateOrderWithItemsInputSchema = z.object({
  userId: z.uuid(),
  cartId: z.uuid().optional(),
  totalAmount: z.number(),
  items: z.array(CreateOrderItemInputSchema),
  draftIds: z.array(z.uuid()),
  shippingAddressJson: z.record(z.string(), z.unknown()).optional(),
});

export type CreateOrderWithItemsInput = z.infer<typeof CreateOrderWithItemsInputSchema>;

export const PaginationParamsSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
});

export type PaginationParams = z.infer<typeof PaginationParamsSchema>;

export const PaginatedResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const OrderListSummarySchema = z.object({
  id: z.string(),
  status: z.string(),
  total: z.number(),
  createdAt: z.date(),
  title: z.string().nullable(),
  coverUrl: z.string().nullable(),
  productName: z.string().nullable(),
});

export type OrderListSummary = z.infer<typeof OrderListSummarySchema>;