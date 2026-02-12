import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { OrderActivityRepository } from "../../../domain/repositories/OrderActivityRepository";
import { OrderActivityType } from "../../../domain/entities/OrderActivity";
import { ValidationError, NotFoundError } from "../../../domain/errors/DomainErrors";

export interface UpdateOrderStatusDependencies {
  orderRepository: OrderRepository;
  orderActivityRepository: OrderActivityRepository;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  orderStatus: "new" | "in_production" | "shipped";
}

export interface UpdateOrderStatusOutput {
  orderId: string;
  orderStatus: "new" | "in_production" | "shipped";
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

    // Update order status
    await this.deps.orderRepository.updateOrderStatus(input.orderId, input.orderStatus);

    // Create activity entry
    const statusLabels: Record<string, string> = {
      new: "Nuevo",
      in_production: "En Producción",
      shipped: "Enviado",
    };

    const activityTypeMap: Record<string, OrderActivityType> = {
      new: OrderActivityType.STATUS_CHANGED,
      in_production: OrderActivityType.ORDER_READY,
      shipped: OrderActivityType.ORDER_SHIPPED,
    };

    await this.deps.orderActivityRepository.create({
      orderId: input.orderId,
      activityType: activityTypeMap[input.orderStatus] || OrderActivityType.STATUS_CHANGED,
      description: `Estado del pedido cambiado a: ${statusLabels[input.orderStatus]}`,
      metadata: {
        previousStatus: order.orderStatus,
        newStatus: input.orderStatus,
      },
    });

    return {
      orderId: input.orderId,
      orderStatus: input.orderStatus,
    };
  }
}
