import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { GetAllOrdersOutput } from "./dtos/GetAllOrders.dto";

export interface GetAllOrdersDependencies {
  orderRepository: OrderRepository;
}

export class GetAllOrders {
  constructor(private deps: GetAllOrdersDependencies) { }

  async execute(): Promise<GetAllOrdersOutput[]> {
    const orders = await this.deps.orderRepository.findAll();

    return orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount.toString(),
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));
  }
}
