import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetCart } from "../../core/application/use-cases/cart/GetCart";
import { CartRepository } from "../../core/domain/repositories/CartRepository";
import { ProductRepository } from "../../core/domain/repositories/ProductRepository";

describe("GetCart", () => {
  let getCart: GetCart;
  let mockCartRepository: CartRepository;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCartRepository = {
      findActiveCartByUserId: vi.fn(),
    } as unknown as CartRepository;

    mockProductRepository = {
      findById: vi.fn(),
    } as unknown as ProductRepository;

    getCart = new GetCart({
      cartRepository: mockCartRepository,
      productRepository: mockProductRepository,
    });
  });

  it("should return cart with products when cart exists", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartId = "123e4567-e89b-12d3-a456-426614174001";
    const productId1 = "123e4567-e89b-12d3-a456-426614174002";
    const productId2 = "123e4567-e89b-12d3-a456-426614174003";
    const now = new Date();

    const mockCartWithItems = {
      cart: {
        id: cartId,
        userId,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      items: [
        {
          id: "123e4567-e89b-12d3-a456-426614174004",
          cartId,
          draftId: "123e4567-e89b-12d3-a456-426614174005",
          productId: productId1,
          quantity: 1,
          unitPrice: 29.99,
          selectedOptionsSnapshot: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174006",
          cartId,
          draftId: "123e4567-e89b-12d3-a456-426614174007",
          productId: productId2,
          quantity: 2,
          unitPrice: 39.99,
          selectedOptionsSnapshot: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      total: 109.97,
    };

    const mockProduct1 = {
      id: productId1,
      categoryId: "123e4567-e89b-12d3-a456-426614174008",
      name: "Product 1",
      description: "Description 1",
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    const mockProduct2 = {
      id: productId2,
      categoryId: "123e4567-e89b-12d3-a456-426614174009",
      name: "Product 2",
      description: "Description 2",
      basePrice: 39.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);
    vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct1);
    vi.mocked(mockProductRepository.findById).mockResolvedValueOnce(mockProduct2);

    const result = await getCart.execute(userId);

    expect(result.cart).toEqual(mockCartWithItems);
    expect(result.products[productId1]).toEqual({
      id: productId1,
      name: "Product 1",
      description: "Description 1",
    });
    expect(result.products[productId2]).toEqual({
      id: productId2,
      name: "Product 2",
      description: "Description 2",
    });
    expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(userId);
    expect(mockProductRepository.findById).toHaveBeenCalledTimes(2);
  });

  it("should return null cart when no active cart exists", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(null);

    const result = await getCart.execute(userId);

    expect(result.cart).toBeNull();
    expect(result.products).toEqual({});
    expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(userId);
    expect(mockProductRepository.findById).not.toHaveBeenCalled();
  });

  it("should handle missing products gracefully", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartId = "123e4567-e89b-12d3-a456-426614174001";
    const productId = "123e4567-e89b-12d3-a456-426614174002";
    const now = new Date();

    const mockCartWithItems = {
      cart: {
        id: cartId,
        userId,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      items: [
        {
          id: "123e4567-e89b-12d3-a456-426614174004",
          cartId,
          draftId: "123e4567-e89b-12d3-a456-426614174005",
          productId,
          quantity: 1,
          unitPrice: 29.99,
          selectedOptionsSnapshot: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      total: 29.99,
    };

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);
    vi.mocked(mockProductRepository.findById).mockRejectedValue(new Error("Product not found"));

    const result = await getCart.execute(userId);

    expect(result.cart).toEqual(mockCartWithItems);
    expect(result.products).toEqual({});
    expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
  });
});
