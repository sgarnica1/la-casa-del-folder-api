import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateCartItemQuantity } from "../../core/application/use-cases/cart/UpdateCartItemQuantity";
import { CartRepository } from "../../core/domain/repositories/CartRepository";
import { NotFoundError, ValidationError } from "../../core/domain/errors/DomainErrors";

describe("UpdateCartItemQuantity", () => {
  let updateCartItemQuantity: UpdateCartItemQuantity;
  let mockCartRepository: CartRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCartRepository = {
      findCartItemById: vi.fn(),
      updateCartItemQuantity: vi.fn(),
    } as unknown as CartRepository;

    updateCartItemQuantity = new UpdateCartItemQuantity({
      cartRepository: mockCartRepository,
    });
  });

  it("should update cart item quantity successfully", async () => {
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

    const mockUpdatedCartItem = {
      ...mockCartItem,
      quantity: 3,
      updatedAt: new Date(),
    };

    vi.mocked(mockCartRepository.findCartItemById).mockResolvedValue(mockCartItem);
    vi.mocked(mockCartRepository.updateCartItemQuantity).mockResolvedValue(mockUpdatedCartItem);

    const result = await updateCartItemQuantity.execute(
      { cartItemId, quantity: 3 },
      userId
    );

    expect(result.id).toBe(cartItemId);
    expect(result.quantity).toBe(3);
    expect(result.unitPrice).toBe(29.99);
    expect(mockCartRepository.findCartItemById).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockCartRepository.updateCartItemQuantity).toHaveBeenCalledWith(
      cartItemId,
      3,
      userId
    );
  });

  it("should throw ValidationError for invalid input", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";

    await expect(
      updateCartItemQuantity.execute(
        { cartItemId: "invalid", quantity: 3 },
        userId
      )
    ).rejects.toThrow(ValidationError);

    await expect(
      updateCartItemQuantity.execute(
        { cartItemId: "123e4567-e89b-12d3-a456-426614174001", quantity: 0 },
        userId
      )
    ).rejects.toThrow(ValidationError);

    await expect(
      updateCartItemQuantity.execute(
        { cartItemId: "123e4567-e89b-12d3-a456-426614174001", quantity: -1 },
        userId
      )
    ).rejects.toThrow(ValidationError);
  });

  it("should throw NotFoundError when cart item does not exist", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartItemId = "123e4567-e89b-12d3-a456-426614174001";

    vi.mocked(mockCartRepository.findCartItemById).mockResolvedValue(null);

    await expect(
      updateCartItemQuantity.execute({ cartItemId, quantity: 3 }, userId)
    ).rejects.toThrow(NotFoundError);

    expect(mockCartRepository.findCartItemById).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockCartRepository.updateCartItemQuantity).not.toHaveBeenCalled();
  });
});
