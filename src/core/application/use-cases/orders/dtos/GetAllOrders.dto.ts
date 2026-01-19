import { z } from "zod";

export const GetAllOrdersInputSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type GetAllOrdersInput = z.infer<typeof GetAllOrdersInputSchema>;

export const GetAllOrdersOutputSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  totalAmount: z.string(),
  paymentStatus: z.string(),
  orderStatus: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GetAllOrdersOutput = z.infer<typeof GetAllOrdersOutputSchema>;

export const GetAllOrdersPaginatedOutputSchema = z.object({
  data: z.array(GetAllOrdersOutputSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type GetAllOrdersPaginatedOutput = z.infer<typeof GetAllOrdersPaginatedOutputSchema>;
