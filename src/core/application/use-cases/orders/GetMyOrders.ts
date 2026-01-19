import { OrderRepository } from "../../../domain/repositories/OrderRepository";

export interface GetMyOrdersDependencies {
  orderRepository: OrderRepository;
}

export class GetMyOrders {
  constructor(private dependencies: GetMyOrdersDependencies) { }

  async execute({ userId }: { userId: string }) {
    return await this.dependencies.orderRepository.findOrdersByUser(userId);
  }
}
