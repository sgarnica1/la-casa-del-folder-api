import { Order } from "../entities/Order";

export interface OrderRepository {
  create(order: Omit<Order, "createdAt">): Promise<Order>;
  findById(id: string): Promise<Order | null>;
}
