import { Order } from "../entities/Order";
import { OrderWithItems, CreateOrderInput } from "../../application/use-cases/orders/dtos/OrderRepository.dto";

export interface OrderRepository {
  create(order: Omit<Order, "createdAt">): Promise<Order>;
  createWithDraftUpdate(input: CreateOrderInput): Promise<Order>;
  findAll(): Promise<OrderWithItems[]>;
  findById(id: string): Promise<OrderWithItems | null>;
}
