import { z } from "zod";
import { OrderState } from "../../../../domain/entities/Order";

export const CreateOrderInputSchema = z.object({
  draftId: z.uuid(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderInputSchema>;

export const CreateOrderOutputSchema = z.object({
  id: z.uuid(),
  draftId: z.uuid(),
  state: z.nativeEnum(OrderState),
  createdAt: z.date(),
});

export type CreateOrderOutput = z.infer<typeof CreateOrderOutputSchema>;
