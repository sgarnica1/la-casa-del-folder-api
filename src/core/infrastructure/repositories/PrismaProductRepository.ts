import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { Product } from "../../domain/entities/Product";
import { prisma } from "../prisma/client";

export class PrismaProductRepository implements ProductRepository {
  async findActiveProduct(): Promise<Product | null> {
    const product = await prisma.product.findFirst({
      where: { status: "active" },
    });

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}