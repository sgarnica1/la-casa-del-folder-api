import { RoleRepository } from "../../domain/repositories/RoleRepository";
import { Role, RoleType } from "../../domain/entities/Role";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";

export class PrismaRoleRepository implements RoleRepository {
  async findByType(type: RoleType): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { type },
    });

    if (!role) {
      return null;
    }

    return {
      id: role.id,
      type: role.type as RoleType,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async findById(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return null;
    }

    return {
      id: role.id,
      type: role.type as RoleType,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  async create(role: Omit<Role, "id" | "createdAt" | "updatedAt">): Promise<Role> {
    try {
      const created = await prisma.role.create({
        data: {
          type: role.type,
        },
      });

      return {
        id: created.id,
        type: created.type as RoleType,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
