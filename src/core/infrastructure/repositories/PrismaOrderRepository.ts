import { OrderRepository } from "../../domain/repositories/OrderRepository";
import { Order, OrderState } from "../../domain/entities/Order";
import { prisma } from "../prisma/client";

export class PrismaOrderRepository implements OrderRepository {
  async create(order: Omit<Order, "createdAt">): Promise<Order> {
    const prismaOrder = await prisma.order.findUnique({
      where: { id: order.id },
    });

    if (prismaOrder) {
      return {
        id: prismaOrder.id,
        draftId: order.draftId,
        state: order.state,
        createdAt: prismaOrder.createdAt,
      };
    }

    throw new Error("Order not found after creation");
  }

  async findById(id: string): Promise<Order | null> {
    const prismaOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          take: 1,
        },
      },
    });

    if (!prismaOrder) {
      return null;
    }

    const orderItem = prismaOrder.items[0];
    const designSnapshot = orderItem?.designSnapshotJson as { draftId?: string } | null;

    return {
      id: prismaOrder.id,
      draftId: designSnapshot?.draftId || "",
      state: OrderState.PENDING,
      createdAt: prismaOrder.createdAt,
    };
  }
}
