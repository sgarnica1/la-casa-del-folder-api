import { Cart } from "../entities/Cart";
import { CartItem } from "../entities/CartItem";
import type {
  CartWithItems,
  AddCartItemInput,
} from "../../application/use-cases/cart/dtos/CartRepository.dto";

export interface CartRepository {
  findActiveCartByUserId(userId: string): Promise<CartWithItems | null>;
  createCart(userId: string): Promise<Cart>;
  findCartItemById(id: string, userId: string): Promise<CartItem | null>;
  addCartItem(input: AddCartItemInput): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number, userId: string): Promise<CartItem>;
  removeCartItem(id: string, userId: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  markCartAsConverted(cartId: string): Promise<void>;
}

export type {
  CartWithItems,
  AddCartItemInput,
  SelectedOptionSnapshot,
} from "../../application/use-cases/cart/dtos/CartRepository.dto";
