import { Order } from "../entities/Order";
import type {
  OrderWithItems,
  CreateOrderInput,
  CreateOrderWithItemsInput,
  PaginationParams,
  PaginatedResult,
  OrderListSummary,
} from "../../application/use-cases/orders/dtos/OrderRepository.dto";

export interface OrderRepository {
  create(order: Omit<Order, "createdAt">): Promise<Order>;
  createWithDraftUpdate(input: CreateOrderInput): Promise<Order>;
  createWithItemsAndDraftUpdate(input: CreateOrderWithItemsInput): Promise<Order>;
  findAll(): Promise<OrderWithItems[]>;
  findPaginated(params: PaginationParams): Promise<PaginatedResult<OrderWithItems>>;
  findById(id: string): Promise<OrderWithItems | null>;
  findOrdersByUser(userId: string): Promise<OrderListSummary[]>;
  findOrderByIdAndUser(id: string, userId: string): Promise<OrderWithItems | null>;
  updatePaymentStatus(orderId: string, paymentStatus: "pending" | "paid" | "failed"): Promise<void>;
  getDraftIdsFromOrder(orderId: string): Promise<string[]>;
}

export type {
  OrderWithItems,
  CreateOrderInput,
  CreateOrderWithItemsInput,
  PaginationParams,
  PaginatedResult,
  OrderListSummary,
} from "../../application/use-cases/orders/dtos/OrderRepository.dto";
