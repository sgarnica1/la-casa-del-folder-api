import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { NotFoundError } from "../../../domain/errors/DomainErrors";

export interface GetMyOrderByIdDependencies {
  orderRepository: OrderRepository;
}

export class GetMyOrderById {
  constructor(private dependencies: GetMyOrderByIdDependencies) { }

  async execute({ orderId, userId }: { orderId: string; userId: string }) {
    const result = await this.dependencies.orderRepository.findOrderByIdAndUser(orderId, userId);

    if (!result) {
      throw new NotFoundError("Order not found");
    }

    return result;
  }
}
