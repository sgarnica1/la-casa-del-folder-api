import { OrderActivity } from "../entities/OrderActivity";

export interface CreateOrderActivityInput {
  orderId: string;
  activityType: OrderActivity["activityType"];
  description?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface OrderActivityRepository {
  create(input: CreateOrderActivityInput): Promise<OrderActivity>;
  findByOrderId(orderId: string): Promise<OrderActivity[]>;
}
