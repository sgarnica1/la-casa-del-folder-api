import { CartRepository } from "../../domain/repositories/CartRepository";
import type { CartWithItems, AddCartItemInput } from "../../application/use-cases/cart/dtos/CartRepository.dto";
import { Cart, CartStatusEnum } from "../../domain/entities/Cart";
import { CartItem } from "../../domain/entities/CartItem";
import { prisma } from "../prisma/client";
import { mapPrismaError } from "../errors/PrismaErrorMapper";

export class PrismaCartRepository implements CartRepository {
  async findActiveCartByUserId(userId: string): Promise<CartWithItems | null> {
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
        status: CartStatusEnum.ACTIVE,
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      return null;
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      cartId: item.cartId,
      draftId: item.draftId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      selectedOptionsSnapshot: item.selectedOptionsSnapshot as Array<{
        optionTypeId: string;
        optionTypeName: string;
        optionValueId: string;
        optionValueName: string;
        priceModifier: number | null;
      }> | null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return {
      cart: {
        id: cart.id,
        userId: cart.userId,
        status: cart.status as CartStatusEnum,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      },
      items,
      total,
    };
  }

  async createCart(userId: string): Promise<Cart> {
    try {
      const cart = await prisma.cart.create({
        data: {
          userId,
          status: CartStatusEnum.ACTIVE,
        },
      });

      return {
        id: cart.id,
        userId: cart.userId,
        status: cart.status as CartStatusEnum,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findCartItemById(id: string, userId: string): Promise<CartItem | null> {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return null;
    }

    if (cartItem.cart.userId !== userId) {
      return null;
    }

    return {
      id: cartItem.id,
      cartId: cartItem.cartId,
      draftId: cartItem.draftId,
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      unitPrice: Number(cartItem.unitPrice),
      selectedOptionsSnapshot: cartItem.selectedOptionsSnapshot as Array<{
        optionTypeId: string;
        optionTypeName: string;
        optionValueId: string;
        optionValueName: string;
        priceModifier: number | null;
      }> | null,
      createdAt: cartItem.createdAt,
      updatedAt: cartItem.updatedAt,
    };
  }

  async addCartItem(input: AddCartItemInput): Promise<CartItem> {
    try {
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: input.cartId,
          draftId: input.draftId,
          productId: input.productId,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          selectedOptionsSnapshot: input.selectedOptionsSnapshot as any,
        },
      });

      return {
        id: cartItem.id,
        cartId: cartItem.cartId,
        draftId: cartItem.draftId,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        unitPrice: Number(cartItem.unitPrice),
        selectedOptionsSnapshot: cartItem.selectedOptionsSnapshot as Array<{
          optionTypeId: string;
          optionTypeName: string;
          optionValueId: string;
          optionValueName: string;
          priceModifier: number | null;
        }> | null,
        createdAt: cartItem.createdAt,
        updatedAt: cartItem.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async updateCartItemQuantity(id: string, quantity: number, userId: string): Promise<CartItem> {
    try {
      const cartItem = await this.findCartItemById(id, userId);
      if (!cartItem) {
        throw new Error("Cart item not found or does not belong to user");
      }

      const updated = await prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });

      return {
        id: updated.id,
        cartId: updated.cartId,
        draftId: updated.draftId,
        productId: updated.productId,
        quantity: updated.quantity,
        unitPrice: Number(updated.unitPrice),
        selectedOptionsSnapshot: updated.selectedOptionsSnapshot as Array<{
          optionTypeId: string;
          optionTypeName: string;
          optionValueId: string;
          optionValueName: string;
          priceModifier: number | null;
        }> | null,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async removeCartItem(id: string, userId: string): Promise<void> {
    try {
      const cartItem = await this.findCartItemById(id, userId);
      if (!cartItem) {
        throw new Error("Cart item not found or does not belong to user");
      }

      await prisma.cartItem.delete({
        where: { id },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async clearCart(cartId: string): Promise<void> {
    try {
      await prisma.cartItem.deleteMany({
        where: { cartId },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async markCartAsConverted(cartId: string): Promise<void> {
    try {
      // Update the cart status to converted
      // The partial unique index only applies to active carts, so we can have multiple converted carts
      await prisma.cart.update({
        where: { id: cartId },
        data: { status: CartStatusEnum.CONVERTED },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findCartByOrderId(orderId: string): Promise<Cart | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { cart: true },
      });

      if (!order || !order.cart) {
        return null;
      }

      return {
        id: order.cart.id,
        userId: order.cart.userId,
        status: order.cart.status as CartStatusEnum,
        createdAt: order.cart.createdAt,
        updatedAt: order.cart.updatedAt,
      };
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async clearCartByOrderId(orderId: string): Promise<void> {
    try {
      const cart = await this.findCartByOrderId(orderId);
      if (cart) {
        await this.clearCart(cart.id);
      }
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
