import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { NotFoundError } from "../../../domain/errors/DomainErrors";
import { ValidateOrderStatusTransition, StatusTransition } from "./ValidateOrderStatusTransition";

export interface GetAvailableStatusTransitionsDependencies {
  orderRepository: OrderRepository;
}

export interface GetAvailableStatusTransitionsInput {
  orderId: string;
}

export interface GetAvailableStatusTransitionsOutput {
  transitions: StatusTransition[];
}

export class GetAvailableStatusTransitions {
  constructor(private deps: GetAvailableStatusTransitionsDependencies) {}

  async execute(input: GetAvailableStatusTransitionsInput): Promise<GetAvailableStatusTransitionsOutput> {
    if (!input.orderId) {
      throw new Error("Order ID is required");
    }

    const order = await this.deps.orderRepository.findById(input.orderId);
    if (!order) {
      throw new NotFoundError("Order", input.orderId);
    }

    const currentState = {
      orderStatus: order.orderStatus as ValidateOrderStatusTransition["orderStatus"],
      paymentStatus: order.paymentStatus as ValidateOrderStatusTransition["paymentStatus"],
    };

    const transitions = ValidateOrderStatusTransition.getAvailableTransitions(currentState);

    return {
      transitions,
    };
  }
}
