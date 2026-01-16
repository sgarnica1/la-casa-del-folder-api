import { OrderRepository } from "../../domain/repositories/OrderRepository";
import { OrderWithItems, CreateOrderInput } from "../../application/use-cases/orders/dtos/OrderRepository.dto";
import { Order, OrderState } from "../../domain/entities/Order";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";
import { Prisma } from "@prisma/client";

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

  async createWithDraftUpdate(input: CreateOrderInput): Promise<Order> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId: input.userId,
            totalAmount: input.totalAmount,
            paymentStatus: "paid",
            orderStatus: "new",
            shippingAddressJson: {},
            items: {
              create: {
                productNameSnapshot: input.productName,
                variantNameSnapshot: null,
                quantity: 1,
                priceSnapshot: input.totalAmount,
                designSnapshotJson: input.designSnapshot as Prisma.InputJsonValue,
              },
            },
          },
          include: {
            items: true,
          },
        });

        await tx.draft.update({
          where: { id: input.draftId },
          data: { status: "ordered" },
        });

        return order;
      });

      const orderItem = result.items[0];
      const designSnapshot = orderItem?.designSnapshotJson as { draftId?: string } | null;

      return {
        id: result.id,
        draftId: designSnapshot?.draftId || input.draftId,
        state: OrderState.PENDING,
        createdAt: result.createdAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findAll(): Promise<OrderWithItems[]> {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      shippingAddressJson: order.shippingAddressJson as Record<string, unknown>,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        productNameSnapshot: item.productNameSnapshot,
        variantNameSnapshot: item.variantNameSnapshot,
        quantity: item.quantity,
        priceSnapshot: Number(item.priceSnapshot),
        designSnapshotJson: item.designSnapshotJson as Record<string, unknown>,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    }));
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    const prismaOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!prismaOrder) {
      return null;
    }

    return {
      id: prismaOrder.id,
      userId: prismaOrder.userId,
      totalAmount: Number(prismaOrder.totalAmount),
      paymentStatus: prismaOrder.paymentStatus,
      orderStatus: prismaOrder.orderStatus,
      shippingAddressJson: prismaOrder.shippingAddressJson as Record<string, unknown>,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
      items: prismaOrder.items.map((item) => ({
        id: item.id,
        productNameSnapshot: item.productNameSnapshot,
        variantNameSnapshot: item.variantNameSnapshot,
        quantity: item.quantity,
        priceSnapshot: Number(item.priceSnapshot),
        designSnapshotJson: item.designSnapshotJson as Record<string, unknown>,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    };
  }
}
