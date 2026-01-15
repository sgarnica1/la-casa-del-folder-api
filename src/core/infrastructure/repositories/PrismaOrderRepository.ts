import { OrderRepository } from "../../core/domain/repositories/OrderRepository";
import { Order } from "../../core/domain/entities/Order";
import { prisma } from "../prisma/client";

export class PrismaOrderRepository implements OrderRepository {
  async create(order: Omit<Order, "createdAt">): Promise<Order> {
    throw new Error("Not implemented");
  }

  async findById(id: string): Promise<Order | null> {
    throw new Error("Not implemented");
  }
}
