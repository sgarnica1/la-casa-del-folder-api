import { CartRepository } from "../../../domain/repositories/CartRepository";
import { ProductRepository } from "../../../domain/repositories/ProductRepository";
import type { CartWithItems } from "./dtos/CartRepository.dto";

export interface GetCartDependencies {
  cartRepository: CartRepository;
  productRepository: ProductRepository;
}

export interface GetCartOutput {
  cart: CartWithItems | null;
  products: Record<string, { id: string; name: string; description: string | null }>;
}

export class GetCart {
  constructor(private deps: GetCartDependencies) { }

  async execute(userId: string): Promise<GetCartOutput> {
    const cartWithItems = await this.deps.cartRepository.findActiveCartByUserId(userId);

    const products: Record<string, { id: string; name: string; description: string | null }> = {};

    if (cartWithItems) {
      const uniqueProductIds = [...new Set(cartWithItems.items.map(item => item.productId))];

      await Promise.all(
        uniqueProductIds.map(async (productId) => {
          try {
            const product = await this.deps.productRepository.findById(productId);
            if (product) {
              products[productId] = {
                id: product.id,
                name: product.name,
                description: product.description || null,
              };
            }
          } catch {
            // Product not found, skip
          }
        })
      );
    }

    return {
      cart: cartWithItems,
      products,
    };
  }
}
