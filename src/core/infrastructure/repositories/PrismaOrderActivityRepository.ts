import { OrderActivityRepository, CreateOrderActivityInput } from "../../domain/repositories/OrderActivityRepository";
import { OrderActivity, OrderActivityType } from "../../domain/entities/OrderActivity";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";
import { Prisma } from "@prisma/client";

export class PrismaOrderActivityRepository implements OrderActivityRepository {
  async create(input: CreateOrderActivityInput): Promise<OrderActivity> {
    try {
      const prismaActivity = await prisma.orderActivity.create({
        data: {
          orderId: input.orderId,
          activityType: input.activityType,
          description: input.description ?? null,
          metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      });

      return {
        id: prismaActivity.id,
        orderId: prismaActivity.orderId,
        activityType: prismaActivity.activityType as OrderActivityType,
        description: prismaActivity.description,
        metadata: prismaActivity.metadata as Record<string, unknown> | null,
        createdAt: prismaActivity.createdAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByOrderId(orderId: string): Promise<OrderActivity[]> {
    try {
      const prismaActivities = await prisma.orderActivity.findMany({
        where: { orderId },
        orderBy: { createdAt: "desc" },
      });

      return prismaActivities.map((activity) => ({
        id: activity.id,
        orderId: activity.orderId,
        activityType: activity.activityType as OrderActivityType,
        description: activity.description,
        metadata: activity.metadata as Record<string, unknown> | null,
        createdAt: activity.createdAt,
      }));
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
