import { OrderRepository } from "../../../domain/repositories/OrderRepository";
import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { Order } from "../../../domain/entities/Order";

export interface CreateOrderDependencies {
  orderRepository: OrderRepository;
  draftRepository: DraftRepository;
}

export interface CreateOrderInput {
  draftId: string;
}

export class CreateOrder {
  constructor(private deps: CreateOrderDependencies) { }

  async execute(input: CreateOrderInput): Promise<Order> {
    throw new Error("Not implemented");
  }
}
