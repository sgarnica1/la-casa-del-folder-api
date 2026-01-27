import { describe, it, expect, beforeEach, vi } from "vitest";
import { CheckoutCart } from "../../core/application/use-cases/cart/CheckoutCart";
import { CartRepository } from "../../core/domain/repositories/CartRepository";
import { OrderRepository } from "../../core/domain/repositories/OrderRepository";
import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { ProductRepository } from "../../core/domain/repositories/ProductRepository";
import { ProductTemplateRepository } from "../../core/domain/repositories/ProductTemplateRepository";
import { DraftStateEnum } from "../../core/domain/entities/Draft";
import { OrderState } from "../../core/domain/entities/Order";
import {
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
} from "../../core/domain/errors/DomainErrors";

vi.mock("../../core/interface/http/middleware/draftGuards", () => ({
  validateDraftCompleteness: vi.fn().mockResolvedValue({ isComplete: true, missingSlots: [] }),
}));

vi.mock("../../core/domain/policies/DraftMutationPolicy", () => ({
  DraftMutationPolicy: vi.fn().mockImplementation(() => ({
    assertCanCheckout: vi.fn(),
  })),
}));

describe("CheckoutCart", () => {
  let checkoutCart: CheckoutCart;
  let mockCartRepository: CartRepository;
  let mockOrderRepository: OrderRepository;
  let mockDraftRepository: DraftRepository;
  let mockProductRepository: ProductRepository;
  let mockProductTemplateRepository: ProductTemplateRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCartRepository = {
      findActiveCartByUserId: vi.fn(),
      markCartAsConverted: vi.fn(),
      clearCart: vi.fn(),
    } as unknown as CartRepository;

    mockOrderRepository = {
      createWithItemsAndDraftUpdate: vi.fn(),
    } as unknown as OrderRepository;

    mockDraftRepository = {
      findByIdWithLayoutItems: vi.fn(),
      findByIdWithImagesForOrder: vi.fn(),
      update: vi.fn(),
    } as unknown as DraftRepository;

    mockProductRepository = {
      findById: vi.fn(),
    } as unknown as ProductRepository;

    mockProductTemplateRepository = {
      findLayoutItemsByTemplateId: vi.fn(),
    } as unknown as ProductTemplateRepository;

    checkoutCart = new CheckoutCart({
      cartRepository: mockCartRepository,
      orderRepository: mockOrderRepository,
      draftRepository: mockDraftRepository,
      productRepository: mockProductRepository,
      productTemplateRepository: mockProductTemplateRepository,
    });
  });

  it("should checkout cart successfully", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartId = "123e4567-e89b-12d3-a456-426614174001";
    const draftId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
    const templateId = "123e4567-e89b-12d3-a456-426614174004";
    const orderId = "123e4567-e89b-12d3-a456-426614174005";
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

    const mockDraftWithLayoutItems = {
      draft: {
        id: draftId,
        userId,
        productId,
        templateId,
        state: DraftStateEnum.LOCKED,
        title: "Test Draft",
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [
        {
          id: "123e4567-e89b-12d3-a456-426614174007",
          draftId,
          layoutIndex: 1,
          type: "image" as const,
          transformJson: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
    };

    const mockDraftWithImages = {
      layoutItems: [
        {
          layoutIndex: 1,
          type: "image" as const,
          transformJson: null,
          images: [
            {
              uploadedImageId: "123e4567-e89b-12d3-a456-426614174008",
              uploadedImage: {
                id: "123e4567-e89b-12d3-a456-426614174008",
                cloudinaryPublicId: "test-public-id",
                originalUrl: "https://example.com/image.jpg",
                width: 100,
                height: 100,
                createdAt: now,
                updatedAt: now,
              },
              transformJson: null,
            },
          ],
        },
      ],
    };

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174009",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    const mockOrder = {
      id: orderId,
      draftId,
      state: OrderState.PENDING,
      createdAt: now,
    };

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);
    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(mockDraftWithLayoutItems);
    vi.mocked(mockDraftRepository.findByIdWithImagesForOrder).mockResolvedValue(mockDraftWithImages);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockOrderRepository.createWithItemsAndDraftUpdate).mockResolvedValue(mockOrder);

    const result = await checkoutCart.execute(userId);

    expect(result.id).toBe(orderId);
    expect(result.draftId).toBe(draftId);
    expect(result.state).toBe(OrderState.PENDING);
    expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(userId);
    expect(mockOrderRepository.createWithItemsAndDraftUpdate).toHaveBeenCalled();
    expect(mockCartRepository.markCartAsConverted).toHaveBeenCalledWith(cartId);
    expect(mockCartRepository.clearCart).toHaveBeenCalledWith(cartId);
  });

  it("should auto-lock editing draft before checkout", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartId = "123e4567-e89b-12d3-a456-426614174001";
    const draftId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
    const templateId = "123e4567-e89b-12d3-a456-426614174004";
    const orderId = "123e4567-e89b-12d3-a456-426614174005";
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

    const mockDraftEditing = {
      draft: {
        id: draftId,
        userId,
        productId,
        templateId,
        state: DraftStateEnum.EDITING,
        title: "Test Draft",
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [],
    };

    const mockDraftLocked = {
      draft: {
        ...mockDraftEditing.draft,
        state: DraftStateEnum.LOCKED,
      },
      layoutItems: [],
    };

    const mockDraftWithImages = {
      layoutItems: [],
    };

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174009",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    const mockOrder = {
      id: orderId,
      draftId,
      state: OrderState.PENDING,
      createdAt: now,
    };

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);
    vi.mocked(mockDraftRepository.findByIdWithLayoutItems)
      .mockResolvedValueOnce(mockDraftEditing)
      .mockResolvedValueOnce(mockDraftLocked)
      .mockResolvedValueOnce(mockDraftLocked);
    vi.mocked(mockDraftRepository.findByIdWithImagesForOrder).mockResolvedValue(mockDraftWithImages);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockOrderRepository.createWithItemsAndDraftUpdate).mockResolvedValue(mockOrder);

    await checkoutCart.execute(userId);

    expect(mockDraftRepository.update).toHaveBeenCalledWith(draftId, {
      state: DraftStateEnum.LOCKED,
    });
  });

  it("should throw NotFoundError when cart does not exist", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(null);

    await expect(checkoutCart.execute(userId)).rejects.toThrow(NotFoundError);
    expect(mockCartRepository.findActiveCartByUserId).toHaveBeenCalledWith(userId);
    expect(mockOrderRepository.createWithItemsAndDraftUpdate).not.toHaveBeenCalled();
  });

  it("should throw UnprocessableEntityError when cart is empty", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartId = "123e4567-e89b-12d3-a456-426614174001";
    const now = new Date();

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

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);

    await expect(checkoutCart.execute(userId)).rejects.toThrow(UnprocessableEntityError);
    expect(mockOrderRepository.createWithItemsAndDraftUpdate).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when draft does not exist", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const cartId = "123e4567-e89b-12d3-a456-426614174001";
    const draftId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
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

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);
    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(null);

    await expect(checkoutCart.execute(userId)).rejects.toThrow(NotFoundError);
    expect(mockOrderRepository.createWithItemsAndDraftUpdate).not.toHaveBeenCalled();
  });

  it("should throw ConflictError when draft does not belong to user", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const otherUserId = "123e4567-e89b-12d3-a456-426614174999";
    const cartId = "123e4567-e89b-12d3-a456-426614174001";
    const draftId = "123e4567-e89b-12d3-a456-426614174002";
    const productId = "123e4567-e89b-12d3-a456-426614174003";
    const templateId = "123e4567-e89b-12d3-a456-426614174004";
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

    const mockDraftWithLayoutItems = {
      draft: {
        id: draftId,
        userId: otherUserId,
        productId,
        templateId,
        state: DraftStateEnum.LOCKED,
        title: "Test Draft",
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [],
    };

    vi.mocked(mockCartRepository.findActiveCartByUserId).mockResolvedValue(mockCartWithItems);
    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(mockDraftWithLayoutItems);

    await expect(checkoutCart.execute(userId)).rejects.toThrow(ConflictError);
    expect(mockOrderRepository.createWithItemsAndDraftUpdate).not.toHaveBeenCalled();
  });
});
