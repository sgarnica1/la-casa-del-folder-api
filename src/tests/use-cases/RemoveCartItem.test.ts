import { describe, it, expect, beforeEach, vi } from "vitest";
import { RemoveCartItem } from "../../core/application/use-cases/cart/RemoveCartItem";
import { CartRepository } from "../../core/domain/repositories/CartRepository";
import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { NotFoundError, ValidationError } from "../../core/domain/errors/DomainErrors";
import { DraftStateEnum } from "../../core/domain/entities/Draft";

describe("RemoveCartItem", () => {
  let removeCartItem: RemoveCartItem;
  let mockCartRepository: CartRepository;
  let mockDraftRepository: DraftRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCartRepository = {
      findCartItemById: vi.fn(),
      removeCartItem: vi.fn(),
    } as unknown as CartRepository;

    mockDraftRepository = {
      findById: vi.fn(),
      update: vi.fn(),
    } as unknown as DraftRepository;

    removeCartItem = new RemoveCartItem({
      cartRepository: mockCartRepository,
      draftRepository: mockDraftRepository,
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

    const mockDraft = {
      id: draftId,
      userId,
      productId,
      templateId: "123e4567-e89b-12d3-a456-426614174005",
      state: DraftStateEnum.EDITING,
      title: null,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockCartRepository.findCartItemById).mockResolvedValue(mockCartItem);
    vi.mocked(mockCartRepository.removeCartItem).mockResolvedValue(undefined);
    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockDraft);

    await removeCartItem.execute({ cartItemId }, userId);

    expect(mockCartRepository.findCartItemById).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockCartRepository.removeCartItem).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    // Draft is not locked, so update should not be called
    expect(mockDraftRepository.update).not.toHaveBeenCalled();
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
    expect(mockDraftRepository.findById).not.toHaveBeenCalled();
  });

  it("should unlock draft when removed from cart if draft is locked", async () => {
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

    const mockLockedDraft = {
      id: draftId,
      userId,
      productId,
      templateId: "123e4567-e89b-12d3-a456-426614174005",
      state: DraftStateEnum.LOCKED,
      title: null,
      createdAt: now,
      updatedAt: now,
    };

    const mockUnlockedDraft = {
      ...mockLockedDraft,
      state: DraftStateEnum.EDITING,
    };

    vi.mocked(mockCartRepository.findCartItemById).mockResolvedValue(mockCartItem);
    vi.mocked(mockCartRepository.removeCartItem).mockResolvedValue(undefined);
    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockLockedDraft);
    vi.mocked(mockDraftRepository.update).mockResolvedValue(mockUnlockedDraft);

    await removeCartItem.execute({ cartItemId }, userId);

    expect(mockCartRepository.findCartItemById).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockCartRepository.removeCartItem).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockDraftRepository.update).toHaveBeenCalledWith(draftId, {
      state: DraftStateEnum.EDITING,
    });
  });

  it("should not unlock draft when removed from cart if draft is ordered", async () => {
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

    const mockOrderedDraft = {
      id: draftId,
      userId,
      productId,
      templateId: "123e4567-e89b-12d3-a456-426614174005",
      state: DraftStateEnum.ORDERED,
      title: null,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockCartRepository.findCartItemById).mockResolvedValue(mockCartItem);
    vi.mocked(mockCartRepository.removeCartItem).mockResolvedValue(undefined);
    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockOrderedDraft);

    await removeCartItem.execute({ cartItemId }, userId);

    expect(mockCartRepository.findCartItemById).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockCartRepository.removeCartItem).toHaveBeenCalledWith(cartItemId, userId);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    // Draft is ordered, so update should not be called
    expect(mockDraftRepository.update).not.toHaveBeenCalled();
  });
});
