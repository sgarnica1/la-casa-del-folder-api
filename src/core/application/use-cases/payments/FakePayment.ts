import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { CartRepository } from "../../../domain/repositories/CartRepository";
import { OrderActivityRepository } from "../../../domain/repositories/OrderActivityRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import { OrderActivityType } from "../../../domain/entities/OrderActivity";

export interface FakePaymentDependencies {
  orderRepository: OrderRepository;
  draftRepository: DraftRepository;
  cartRepository: CartRepository;
  orderActivityRepository: OrderActivityRepository;
}

export interface FakePaymentInput {
  orderId: string;
}

export class FakePayment {
  constructor(private deps: FakePaymentDependencies) { }

  async execute(input: FakePaymentInput, userId: string): Promise<void> {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      throw new ValidationError("Fake payment is only available in development environment");
    }

    if (!input.orderId) {
      throw new ValidationError("Order ID is required");
    }

    // Verify order exists and belongs to user
    const order = await this.deps.orderRepository.findOrderByIdAndUser(input.orderId, userId);
    if (!order) {
      throw new NotFoundError("Order", input.orderId);
    }

    // Check if already paid
    if (order.paymentStatus === "paid") {
      throw new ValidationError("Order is already paid");
    }

    // Update payment status to paid
    await this.deps.orderRepository.updatePaymentStatus(input.orderId, "paid");

    // Create PAYMENT_CONFIRMED activity
    await this.deps.orderActivityRepository.create({
      orderId: input.orderId,
      activityType: OrderActivityType.PAYMENT_CONFIRMED,
      description: "Pago simulado (modo desarrollo)",
      metadata: {
        fakePayment: true,
        development: true,
      },
    });

    // Mark all drafts in the order as ordered
    const draftIds = await this.deps.orderRepository.getDraftIdsFromOrder(input.orderId);
    for (const draftId of draftIds) {
      await this.deps.draftRepository.markAsOrdered(draftId);
    }

    // Clear the cart
    await this.deps.cartRepository.clearCartByOrderId(input.orderId);
  }
}
