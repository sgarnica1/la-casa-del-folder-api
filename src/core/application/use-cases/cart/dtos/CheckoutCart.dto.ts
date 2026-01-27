import { z } from "zod";
import { OrderState } from "../../../../domain/entities/Order";

export const CheckoutCartOutputSchema = z.object({
  id: z.uuid(),
  draftId: z.uuid(),
  state: z.nativeEnum(OrderState),
  createdAt: z.date(),
});

export type CheckoutCartOutput = z.infer<typeof CheckoutCartOutputSchema>;
