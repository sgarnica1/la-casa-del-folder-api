import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { OrderActivityRepository } from "../../../domain/repositories/OrderActivityRepository";
import { OrderActivityType } from "../../../domain/entities/OrderActivity";
import { ValidationError, NotFoundError } from "../../../domain/errors/DomainErrors";
import { ValidateOrderStatusTransition } from "./ValidateOrderStatusTransition";

export type OrderStatus = "new" | "in_production" | "ready" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed";

export interface UpdateOrderStatusDependencies {
  orderRepository: OrderRepository;
  orderActivityRepository: OrderActivityRepository;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  orderStatus: OrderStatus;
  note?: string | null;
}

export interface UpdateOrderStatusOutput {
  orderId: string;
  orderStatus: OrderStatus;
}

export class UpdateOrderStatus {
  constructor(private deps: UpdateOrderStatusDependencies) {}

  async execute(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusOutput> {
    if (!input.orderId) {
      throw new ValidationError("Order ID is required");
    }

    if (!input.orderStatus) {
      throw new ValidationError("Order status is required");
    }

    // Check if order exists
    const order = await this.deps.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Order", input.orderId);
    }

    const currentState = {
      orderStatus: order.orderStatus as OrderStatus,
      paymentStatus: order.paymentStatus as PaymentStatus,
    };

    // Validate transition
    const validation = ValidateOrderStatusTransition.isValidTransition(
      currentState,
      input.orderStatus,
      input.note
    );

    if (!validation.valid) {
      throw new ValidationError(validation.error || "Invalid status transition");
    }

    // Determine if we need to update paymentStatus
    let newPaymentStatus: PaymentStatus | undefined = undefined;

    // Handle special case: ordered → paid (new + pending → new + paid)
    if (currentState.orderStatus === "new" && currentState.paymentStatus === "pending" && input.orderStatus === "new") {
      // This is the ordered → paid transition
      newPaymentStatus = "paid";
    }

    // Handle cancelled → new (paid) transition
    if (currentState.orderStatus === "cancelled" && input.orderStatus === "new") {
      // Ensure paymentStatus is paid
      if (currentState.paymentStatus !== "paid") {
        throw new ValidationError("Solo se puede reactivar un pedido cancelado si el pago está confirmado");
      }
      // Keep paymentStatus as paid
      newPaymentStatus = "paid";
    }

    // Update order status (and paymentStatus if needed)
    if (newPaymentStatus !== undefined) {
      await this.deps.orderRepository.updateOrderStatusAndPaymentStatus(
        input.orderId,
        input.orderStatus,
        newPaymentStatus
      );
    } else {
      await this.deps.orderRepository.updateOrderStatus(input.orderId, input.orderStatus);
    }

    // Determine activity type based on status
    const activityTypeMap: Record<OrderStatus, OrderActivityType> = {
      new: OrderActivityType.STATUS_CHANGED,
      in_production: OrderActivityType.ORDER_IN_PRODUCTION,
      ready: OrderActivityType.ORDER_READY,
      shipped: OrderActivityType.ORDER_SHIPPED,
      delivered: OrderActivityType.ORDER_DELIVERED,
      cancelled: OrderActivityType.ORDER_CANCELLED,
      refunded: OrderActivityType.ORDER_REFUNDED,
    };

    // Special handling for ordered → paid transition
    let activityType = activityTypeMap[input.orderStatus];
    let description = `Estado del pedido cambiado a: ${ValidateOrderStatusTransition.getStatusLabel(input.orderStatus)}`;

    if (currentState.orderStatus === "new" && currentState.paymentStatus === "pending" && input.orderStatus === "new" && newPaymentStatus === "paid") {
      // This is the ordered → paid transition
      activityType = OrderActivityType.PAYMENT_CONFIRMED;
      description = "Pago confirmado";
    }

    // Create activity entry with note in metadata if provided
    const metadata: Record<string, unknown> = {
      previousStatus: currentState.orderStatus,
      newStatus: input.orderStatus,
      previousPaymentStatus: currentState.paymentStatus,
      newPaymentStatus: newPaymentStatus || currentState.paymentStatus,
    };

    if (input.note) {
      metadata.note = input.note;
    }

    await this.deps.orderActivityRepository.create({
      orderId: input.orderId,
      activityType,
      description,
      metadata,
    });

    return {
      orderId: input.orderId,
      orderStatus: input.orderStatus,
    };
  }
}
