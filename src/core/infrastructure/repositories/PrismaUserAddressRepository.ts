import { UserAddressRepository, UserAddress, CreateUserAddressInput } from "../../domain/repositories/UserAddressRepository";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";

export class PrismaUserAddressRepository implements UserAddressRepository {
  async findByUserId(userId: string): Promise<UserAddress[]> {
    try {
      const addresses = await prisma.userAddress.findMany({
        where: { userId },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' },
        ],
      });

      return addresses.map((addr) => ({
        id: addr.id,
        userId: addr.userId,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        isDefault: addr.isDefault,
        createdAt: addr.createdAt,
        updatedAt: addr.updatedAt,
      }));
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findById(id: string, userId: string): Promise<UserAddress | null> {
    try {
      const address = await prisma.userAddress.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!address) {
        return null;
      }

      return {
        id: address.id,
        userId: address.userId,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async create(input: CreateUserAddressInput): Promise<UserAddress> {
    try {
      if (input.isDefault) {
        await prisma.userAddress.updateMany({
          where: { userId: input.userId },
          data: { isDefault: false },
        });
      }

      const address = await prisma.userAddress.create({
        data: {
          userId: input.userId,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 || null,
          city: input.city,
          state: input.state,
          postalCode: input.postalCode,
          country: input.country,
          isDefault: input.isDefault || false,
        },
      });

      return {
        id: address.id,
        userId: address.userId,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
