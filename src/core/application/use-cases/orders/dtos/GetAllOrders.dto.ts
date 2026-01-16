import { z } from "zod";

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
