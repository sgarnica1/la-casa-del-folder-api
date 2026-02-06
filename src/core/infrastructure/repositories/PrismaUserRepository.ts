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
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
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
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
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
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          phone: user.phone || null,
          roleId: user.roleId,
        },
      });

      return {
        id: created.id,
        clerkId: created.clerkId,
        email: created.email,
        firstName: created.firstName,
        lastName: created.lastName,
        phone: created.phone,
        roleId: created.roleId,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async update(id: string, updates: Partial<Pick<User, "firstName" | "lastName" | "phone">>): Promise<User> {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          ...(updates.firstName !== undefined && { firstName: updates.firstName }),
          ...(updates.lastName !== undefined && { lastName: updates.lastName }),
          ...(updates.phone !== undefined && { phone: updates.phone }),
        },
      });

      return {
        id: updated.id,
        clerkId: updated.clerkId,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        roleId: updated.roleId,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

}
