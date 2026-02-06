import { OrderRepository, OrderListSummary } from "../../domain/repositories/OrderRepository";
import { OrderWithItems, CreateOrderInput, CreateOrderWithItemsInput } from "../../application/use-cases/orders/dtos/OrderRepository.dto";
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
            paymentStatus: "pending",
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

  async createWithItemsAndDraftUpdate(input: CreateOrderWithItemsInput): Promise<Order> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId: input.userId,
            cartId: input.cartId || null,
            totalAmount: input.totalAmount,
            paymentStatus: "pending",
            orderStatus: "new",
            shippingAddressJson: (input.shippingAddressJson || {}) as Prisma.InputJsonValue,
            items: {
              create: input.items.map((item) => ({
                productNameSnapshot: item.productName,
                variantNameSnapshot: item.variantName,
                quantity: item.quantity,
                priceSnapshot: item.priceSnapshot,
                designSnapshotJson: item.designSnapshot as Prisma.InputJsonValue,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        return order;
      });

      const firstItem = result.items?.[0];
      const designSnapshot = firstItem?.designSnapshotJson as { draftId?: string } | null;

      return {
        id: result.id,
        draftId: designSnapshot?.draftId || input.draftIds[0],
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
        user: {
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return orders.map((order) => {
      const defaultAddress = order.user.addresses[0] || null;

      return {
        id: order.id,
        userId: order.userId,
        totalAmount: Number(order.totalAmount),
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        shippingAddressJson: order.shippingAddressJson as Record<string, unknown>,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customer: {
          id: order.user.id,
          email: order.user.email,
          firstName: order.user.firstName,
          lastName: order.user.lastName,
        },
        address: defaultAddress ? {
          addressLine1: defaultAddress.addressLine1,
          addressLine2: defaultAddress.addressLine2,
          city: defaultAddress.city,
          state: defaultAddress.state,
          postalCode: defaultAddress.postalCode,
          country: defaultAddress.country,
        } : null,
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
      };
    });
  }

  async findPaginated(params: { page: number; limit: number }): Promise<{
    data: OrderWithItems[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (params.page - 1) * params.limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: true,
          user: {
            include: {
              addresses: {
                where: { isDefault: true },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: params.limit,
      }),
      prisma.order.count(),
    ]);

    return {
      data: orders.map((order) => {
        const defaultAddress = order.user.addresses[0] || null;

        return {
          id: order.id,
          userId: order.userId,
          totalAmount: Number(order.totalAmount),
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          shippingAddressJson: order.shippingAddressJson as Record<string, unknown>,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          customer: {
            id: order.user.id,
            email: order.user.email,
            firstName: order.user.firstName,
            lastName: order.user.lastName,
          },
          address: defaultAddress ? {
            addressLine1: defaultAddress.addressLine1,
            addressLine2: defaultAddress.addressLine2,
            city: defaultAddress.city,
            state: defaultAddress.state,
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country,
          } : null,
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
        };
      }),
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    const prismaOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!prismaOrder) {
      return null;
    }

    const defaultAddress = prismaOrder.user.addresses[0] || null;

    return {
      id: prismaOrder.id,
      userId: prismaOrder.userId,
      totalAmount: Number(prismaOrder.totalAmount),
      paymentStatus: prismaOrder.paymentStatus,
      orderStatus: prismaOrder.orderStatus,
      shippingAddressJson: prismaOrder.shippingAddressJson as Record<string, unknown>,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
      customer: {
        id: prismaOrder.user.id,
        email: prismaOrder.user.email,
        firstName: prismaOrder.user.firstName,
        lastName: prismaOrder.user.lastName,
      },
      address: defaultAddress ? {
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
      } : null,
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

  async findOrdersByUser(userId: string): Promise<OrderListSummary[]> {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return orders.map((order) => {
      const firstItem = order.items[0];
      const snapshot = firstItem?.designSnapshotJson as {
        title?: string | null;
        layoutItems?: Array<{
          layoutIndex: number;
          images?: Array<{ secureUrl?: string }>;
        }>;
      } | null;

      const title = snapshot?.title || null;

      const coverItem = snapshot?.layoutItems?.find((item) => item.layoutIndex === 0);
      const coverUrl = coverItem?.images?.[0]?.secureUrl || null;

      return {
        id: order.id,
        status: order.orderStatus,
        total: Number(order.totalAmount),
        createdAt: order.createdAt,
        title,
        coverUrl,
        productName: firstItem?.productNameSnapshot || null,
      };
    });
  }

  async findOrderByIdAndUser(id: string, userId: string): Promise<OrderWithItems | null> {
    const prismaOrder = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        user: {
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!prismaOrder) {
      return null;
    }

    const defaultAddress = prismaOrder.user.addresses[0] || null;

    return {
      id: prismaOrder.id,
      userId: prismaOrder.userId,
      totalAmount: Number(prismaOrder.totalAmount),
      paymentStatus: prismaOrder.paymentStatus,
      orderStatus: prismaOrder.orderStatus,
      shippingAddressJson: prismaOrder.shippingAddressJson as Record<string, unknown>,
      createdAt: prismaOrder.createdAt,
      updatedAt: prismaOrder.updatedAt,
      customer: {
        id: prismaOrder.user.id,
        email: prismaOrder.user.email,
        firstName: prismaOrder.user.firstName,
        lastName: prismaOrder.user.lastName,
      },
      address: defaultAddress ? {
        addressLine1: defaultAddress.addressLine1,
        addressLine2: defaultAddress.addressLine2,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postalCode: defaultAddress.postalCode,
        country: defaultAddress.country,
      } : null,
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

  async updatePaymentStatus(orderId: string, paymentStatus: "pending" | "paid" | "failed"): Promise<void> {
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async getDraftIdsFromOrder(orderId: string): Promise<string[]> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        return [];
      }

      const draftIds = new Set<string>();
      for (const item of order.items) {
        const designSnapshot = item.designSnapshotJson as { draftId?: string } | null;
        if (designSnapshot?.draftId) {
          draftIds.add(designSnapshot.draftId);
        }
      }

      return Array.from(draftIds);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findPendingOrderByCartId(cartId: string): Promise<Order | null> {
    const order = await prisma.order.findFirst({
      where: {
        cartId,
        paymentStatus: "pending",
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return null;
    }

    // Get draftId from the first order item's design snapshot
    const firstItem = order.items[0];
    const designSnapshot = firstItem?.designSnapshotJson as { draftId?: string } | null;
    const draftId = designSnapshot?.draftId || "";

    return {
      id: order.id,
      draftId,
      state: OrderState.PENDING,
      createdAt: order.createdAt,
    };
  }
}
