import { Response, NextFunction } from "express";
import { GetCart } from "../../../application/use-cases/cart/GetCart";
import { AddCartItem } from "../../../application/use-cases/cart/AddCartItem";
import { UpdateCartItemQuantity } from "../../../application/use-cases/cart/UpdateCartItemQuantity";
import { RemoveCartItem } from "../../../application/use-cases/cart/RemoveCartItem";
import { CheckoutCart } from "../../../application/use-cases/cart/CheckoutCart";
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  ValidationError,
  ForbiddenError,
} from "../../../domain/errors/DomainErrors";
import type { AuthRequest } from "../middleware/authMiddleware";

export class CartController {
  constructor(
    private getCartUseCase: GetCart,
    private addCartItem: AddCartItem,
    private updateCartItemQuantity: UpdateCartItemQuantity,
    private removeCartItem: RemoveCartItem,
    private checkoutCart: CheckoutCart
  ) { }

  async getCart(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const userId = req.userAuth.userId;
      const result = await this.getCartUseCase.execute(userId);

      if (!result.cart) {
        res.status(200).json({
          cart: null,
          items: [],
          total: 0,
        });
        return;
      }

      res.status(200).json({
        cart: {
          id: result.cart.cart.id,
          userId: result.cart.cart.userId,
          status: result.cart.cart.status,
          createdAt: result.cart.cart.createdAt.toISOString(),
          updatedAt: result.cart.cart.updatedAt.toISOString(),
        },
        items: result.cart.items.map((item) => ({
          id: item.id,
          cartId: item.cartId,
          draftId: item.draftId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          selectedOptionsSnapshot: item.selectedOptionsSnapshot,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
        products: result.products,
        total: result.cart.total,
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get cart" } });
    }
  }

  async addItem(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const userId = req.userAuth.userId;
      const result = await this.addCartItem.execute(req.body, userId);

      res.status(201).json({
        id: result.id,
        cartId: result.cartId,
        draftId: result.draftId,
        productId: result.productId,
        quantity: result.quantity,
        unitPrice: result.unitPrice,
        selectedOptionsSnapshot: result.selectedOptionsSnapshot,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ConflictError) {
        res.status(409).json({ error: { code: "CONFLICT", message: error.message } });
        return;
      }

      if (error instanceof ForbiddenError) {
        res.status(403).json({ error: { code: "FORBIDDEN", message: error.message } });
        return;
      }

      console.error("Add cart item error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to add cart item" } });
    }
  }

  async updateItem(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Cart item ID is required" } });
      return;
    }

    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const userId = req.userAuth.userId;
      const result = await this.updateCartItemQuantity.execute(
        { cartItemId: id, ...req.body },
        userId
      );

      res.status(200).json({
        id: result.id,
        cartId: result.cartId,
        draftId: result.draftId,
        productId: result.productId,
        quantity: result.quantity,
        unitPrice: result.unitPrice,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ForbiddenError) {
        res.status(403).json({ error: { code: "FORBIDDEN", message: error.message } });
        return;
      }

      console.error("Update cart item error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to update cart item" } });
    }
  }

  async removeItem(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id?.[0];

    if (!id) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Cart item ID is required" } });
      return;
    }

    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const userId = req.userAuth.userId;
      await this.removeCartItem.execute({ cartItemId: id }, userId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ForbiddenError) {
        res.status(403).json({ error: { code: "FORBIDDEN", message: error.message } });
        return;
      }

      console.error("Remove cart item error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to remove cart item" } });
    }
  }

  async checkout(req: AuthRequest, res: Response, _next: NextFunction): Promise<void> {
    if (!req.userAuth) {
      res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required" } });
      return;
    }

    try {
      const userId = req.userAuth.userId;
      console.log('[CartController] Checkout request received for user:', userId);
      
      const {
        shippingAddressId,
        shippingAddressData,
        customerData,
      } = req.body as {
        shippingAddressId?: string;
        shippingAddressData?: {
          name: string;
          phone?: string | null;
          addressLine1: string;
          addressLine2?: string | null;
          city: string;
          state: string;
          postalCode: string;
          country: string;
        };
        customerData?: {
          firstName?: string;
          lastName?: string;
          phone?: string;
        };
      };

      const result = await this.checkoutCart.execute(userId, {
        shippingAddressId,
        shippingAddressData,
        customerData,
      });
      console.log('[CartController] Checkout successful, order created:', result.id);

      res.status(201).json({
        id: result.id,
        draftId: result.draftId,
        state: result.state,
        createdAt: result.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('[CartController] Checkout error:', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error?.constructor?.name,
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof NotFoundError) {
        console.error('[CartController] NotFoundError:', error.message);
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      if (error instanceof ConflictError) {
        console.error('[CartController] ConflictError:', error.message, error);
        res.status(409).json({
          error: {
            code: "CONFLICT",
            message: error.message,
            details: error instanceof ConflictError && 'details' in error ? error.details : undefined,
          }
        });
        return;
      }

      if (error instanceof UnprocessableEntityError) {
        console.error('[CartController] UnprocessableEntityError:', error.message);
        res.status(422).json({
          error: { code: "UNPROCESSABLE_ENTITY", message: error.message },
        });
        return;
      }

      console.error('[CartController] Unknown error during checkout:', error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to checkout cart" } });
    }
  }
}
