import { UserRepository } from "../../domain/repositories/UserRepository";
import { User } from "../../domain/entities/User";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      roleId: user.roleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async create(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    try {
      const created = await prisma.user.create({
        data: {
          clerkId: user.clerkId,
          email: user.email,
          roleId: user.roleId,
        },
      });

      return {
        id: created.id,
        clerkId: created.clerkId,
        email: created.email,
        roleId: created.roleId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

}
