import { describe, it, expect, beforeEach, vi } from "vitest";
import { AddCartItem } from "../../core/application/use-cases/cart/AddCartItem";
import { CartRepository } from "../../core/domain/repositories/CartRepository";
import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { ProductRepository } from "../../core/domain/repositories/ProductRepository";
import { DraftStateEnum } from "../../core/domain/entities/Draft";
import { NotFoundError, ConflictError, ValidationError, ForbiddenError } from "../../core/domain/errors/DomainErrors";

vi.mock("../../core/domain/policies/DraftMutationPolicy", () => ({
  DraftMutationPolicy: vi.fn().mockImplementation(() => ({
    assertCanAddToCart: vi.fn(),
  })),
}));

describe("AddCartItem", () => {
  let addCartItem: AddCartItem;
  let mockCartRepository: CartRepository;
  let mockDraftRepository: DraftRepository;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCartRepository = {
      findActiveCartByUserId: vi.fn(),
      createCart: vi.fn(),
      addCartItem: vi.fn(),
    } as unknown as CartRepository;

    mockDraftRepository = {
      findById: vi.fn(),
      findByIdWithSelectedOptions: vi.fn(),
      update: vi.fn(),
    } as unknown as DraftRepository;

    mockProductRepository = {
      findById: vi.fn(),
    } as unknown as ProductRepository;

    addCartItem = new AddCartItem({
      cartRepository: mockCartRepository,
      draftRepository: mockDraftRepository,
      productRepository: mockProductRepository,
    });
  });

  it("should add item to existing cart successfully", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const draftId = "123e4567-e89b-12d3-a456-426614174001";
    const cartId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
    const now = new Date();

    const mockDraft = {
      id: draftId,
      userId,
      productId,
      templateId: "123e4567-e89b-12d3-a456-426614174004",
      state: DraftStateEnum.LOCKED,
      createdAt: now,
      updatedAt: now,
    };

    const mockDraftWithOptions = {
      draft: mockDraft,
      selectedOptions: [],
    };

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174005",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    const mockCartWithItems = {
      cart: {
        id: cartId,
        userId,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      items: [],
      total: 0,
    };

    const mockCartItem = {
      id: "123e4567-e89b-12d3-a456-426614174006",
      cartId,
      draftId,
      productId,
      quantity: 1,
      unitPrice: 29.99,
      selectedOptionsSnapshot: null,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockDraft);
    vi.mocked(mockDraftRepository.findByIdWithSelectedOptions).mockResolvedValue(mockDraftWithOptions);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);
    vi.mocked(mockCartRepository.addCartItem).mockResolvedValue(mockCartItem);

    const result = await addCartItem.execute({ draftId }, userId);

    expect(result.id).toBe(mockCartItem.id);
    expect(result.draftId).toBe(draftId);
    expect(result.productId).toBe(productId);
    expect(result.quantity).toBe(1);
    expect(result.unitPrice).toBe(29.99);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
    expect(mockCartRepository.addCartItem).toHaveBeenCalled();
  });

  it("should create cart if none exists", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const draftId = "123e4567-e89b-12d3-a456-426614174001";
    const cartId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
    const now = new Date();

    const mockDraft = {
      id: draftId,
      userId,
      productId,
      templateId: "123e4567-e89b-12d3-a456-426614174004",
      state: DraftStateEnum.LOCKED,
      createdAt: now,
      updatedAt: now,
    };

    const mockDraftWithOptions = {
      draft: mockDraft,
      selectedOptions: [],
    };

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174005",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    const mockNewCart = {
      id: cartId,
      userId,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    const mockCartItem = {
      id: "123e4567-e89b-12d3-a456-426614174006",
      cartId,
      draftId,
      productId,
      quantity: 1,
      unitPrice: 29.99,
      selectedOptionsSnapshot: null,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockDraft);
    vi.mocked(mockDraftRepository.findByIdWithSelectedOptions).mockResolvedValue(mockDraftWithOptions);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(null);
    vi.mocked(mockCartRepository.createCart).mockResolvedValue(mockNewCart);
    vi.mocked(mockCartRepository.addCartItem).mockResolvedValue(mockCartItem);

    const result = await addCartItem.execute({ draftId }, userId);

    expect(result.id).toBe(mockCartItem.id);
    expect(mockCartRepository.createCart).toHaveBeenCalledWith(userId);
    expect(mockCartRepository.addCartItem).toHaveBeenCalled();
  });

  it("should auto-lock editing draft when adding to cart", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const draftId = "123e4567-e89b-12d3-a456-426614174001";
    const cartId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
    const now = new Date();

    const mockDraftEditing = {
      id: draftId,
      userId,
      productId,
      templateId: "123e4567-e89b-12d3-a456-426614174004",
      state: DraftStateEnum.EDITING,
      createdAt: now,
      updatedAt: now,
    };

    const mockDraftLocked = {
      ...mockDraftEditing,
      state: DraftStateEnum.LOCKED,
    };

    const mockDraftWithOptions = {
      draft: mockDraftLocked,
      selectedOptions: [],
    };

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174005",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    const mockCartWithItems = {
      cart: {
        id: cartId,
        userId,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      items: [],
      total: 0,
    };

    const mockCartItem = {
      id: "123e4567-e89b-12d3-a456-426614174006",
      cartId,
      draftId,
      productId,
      quantity: 1,
      unitPrice: 29.99,
      selectedOptionsSnapshot: null,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValueOnce(mockDraftEditing);
    vi.mocked(mockDraftRepository.findById).mockResolvedValueOnce(mockDraftLocked);
    vi.mocked(mockDraftRepository.findByIdWithSelectedOptions).mockResolvedValue(mockDraftWithOptions);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);
    vi.mocked(mockCartRepository.addCartItem).mockResolvedValue(mockCartItem);

    await addCartItem.execute({ draftId }, userId);

    expect(mockDraftRepository.update).toHaveBeenCalledWith(draftId, {
      state: DraftStateEnum.LOCKED,
    });
  });

  it("should throw ValidationError for invalid input", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";

    await expect(addCartItem.execute({ draftId: "invalid" }, userId)).rejects.toThrow(ValidationError);
    expect(mockDraftRepository.findById).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when draft does not exist", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const draftId = "123e4567-e89b-12d3-a456-426614174001";

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(null);

    await expect(addCartItem.execute({ draftId }, userId)).rejects.toThrow(NotFoundError);
    expect(mockDraftRepository.findById).toHaveBeenCalledWith(draftId);
  });

  it("should throw ForbiddenError when draft does not belong to user", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const draftId = "123e4567-e89b-12d3-a456-426614174001";
    const otherUserId = "123e4567-e89b-12d3-a456-426614174999";
    const now = new Date();

    const mockDraft = {
      id: draftId,
      userId: otherUserId,
      productId: "123e4567-e89b-12d3-a456-426614174002",
      templateId: "123e4567-e89b-12d3-a456-426614174003",
      state: DraftStateEnum.LOCKED,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockDraft);

    await expect(addCartItem.execute({ draftId }, userId)).rejects.toThrow(ForbiddenError);
  });

  it("should throw ConflictError when draft already in cart", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const draftId = "123e4567-e89b-12d3-a456-426614174001";
    const cartId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
    const now = new Date();

    const mockDraft = {
      id: draftId,
      userId,
      productId,
      templateId: "123e4567-e89b-12d3-a456-426614174004",
      state: DraftStateEnum.LOCKED,
      createdAt: now,
      updatedAt: now,
    };

    const mockDraftWithOptions = {
      draft: mockDraft,
      selectedOptions: [],
    };

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174005",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

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
          id: "123e4567-e89b-12d3-a456-426614174006",
          cartId,
          draftId,
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

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockDraft);
    vi.mocked(mockDraftRepository.findByIdWithSelectedOptions).mockResolvedValue(mockDraftWithOptions);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);

    await expect(addCartItem.execute({ draftId }, userId)).rejects.toThrow(ConflictError);
  });

  it("should throw NotFoundError when product does not exist", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const draftId = "123e4567-e89b-12d3-a456-426614174001";
    const cartId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
    const now = new Date();

    const mockDraft = {
      id: draftId,
      userId,
      productId,
      templateId: "123e4567-e89b-12d3-a456-426614174004",
      state: DraftStateEnum.LOCKED,
      createdAt: now,
      updatedAt: now,
    };

    const mockDraftWithOptions = {
      draft: mockDraft,
      selectedOptions: [],
    };

    const mockCartWithItems = {
      cart: {
        id: cartId,
        userId,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      items: [],
      total: 0,
    };

    vi.mocked(mockDraftRepository.findById).mockResolvedValue(mockDraft);
    vi.mocked(mockDraftRepository.findByIdWithSelectedOptions).mockResolvedValue(mockDraftWithOptions);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(null);
    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);

    await expect(addCartItem.execute({ draftId }, userId)).rejects.toThrow(NotFoundError);
  });
});
