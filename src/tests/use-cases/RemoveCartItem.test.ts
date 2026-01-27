import { describe, it, expect, beforeEach, vi } from "vitest";
import { RemoveCartItem } from "../../core/application/use-cases/cart/RemoveCartItem";
import { CartRepository } from "../../core/domain/repositories/CartRepository";
import { NotFoundError, ValidationError } from "../../core/domain/errors/DomainErrors";

describe("RemoveCartItem", () => {
  let removeCartItem: RemoveCartItem;
  let mockCartRepository: CartRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCartRepository = {
      findCartItemById: vi.fn(),
      removeCartItem: vi.fn(),
    } as unknown as CartRepository;

    removeCartItem = new RemoveCartItem({
      cartRepository: mockCartRepository,
    });
  });

  it("should remove cart item successfully", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartItemId = "123e4567-e89b-12d3-a456-426614174001";
    const cartId = "123e4567-e89b-12d3-a456-426614174002";
    const draftId = "123e4567-e89b-12d3-a456-426614174003";
    const productId = "123e4567-e89b-12d3-a456-426614174004";
    const now = new Date();

    const mockCartItem = {
      id: cartItemId,
      cartId,
      draftId,
      productId,
      quantity: 1,
      unitPrice: 29.99,
      selectedOptionsSnapshot: null,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockCartRepository.findCartItemById).mockResolvedValue(mockCartItem);
    vi.mocked(mockCartRepository.removeCartItem).mockResolvedValue(undefined);

    await removeCartItem.execute({ cartItemId }, userId);

    expect(mockCartRepository.findCartItemById).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockCartRepository.removeCartItem).toHaveBeenCalledWith(cartItemId, userId);
  });

  it("should throw ValidationError for invalid input", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";

    await expect(
      removeCartItem.execute({ cartItemId: "invalid" }, userId)
    ).rejects.toThrow(ValidationError);

    expect(mockCartRepository.findCartItemById).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when cart item does not exist", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartItemId = "123e4567-e89b-12d3-a456-426614174001";

    vi.mocked(mockCartRepository.findCartItemById).mockResolvedValue(null);

    await expect(
      removeCartItem.execute({ cartItemId }, userId)
    ).rejects.toThrow(NotFoundError);

    expect(mockCartRepository.findCartItemById).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockCartRepository.removeCartItem).not.toHaveBeenCalled();
  });
});
