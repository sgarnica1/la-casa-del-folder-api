import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateOrder } from "../../core/application/use-cases/orders/CreateOrder";
import { OrderRepository } from "../../core/domain/repositories/OrderRepository";
import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { ProductRepository } from "../../core/domain/repositories/ProductRepository";
import { ProductTemplateRepository } from "../../core/domain/repositories/ProductTemplateRepository";
import { DraftStateEnum } from "../../core/domain/entities/Draft";
import { OrderState } from "../../core/domain/entities/Order";
import { NotFoundError, ConflictError } from "../../core/domain/errors/DomainErrors";

vi.mock("../../core/interface/http/middleware/draftGuards", () => ({
  validateDraftCompleteness: vi.fn().mockResolvedValue({ isComplete: true, missingSlots: [] }),
}));

describe("CreateOrder", () => {
  let createOrder: CreateOrder;
  let mockOrderRepository: OrderRepository;
  let mockDraftRepository: DraftRepository;
  let mockProductRepository: ProductRepository;
  let mockProductTemplateRepository: ProductTemplateRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOrderRepository = {
      create: vi.fn(),
      createWithDraftUpdate: vi.fn(),
      findById: vi.fn(),
    } as unknown as OrderRepository;

    mockDraftRepository = {
      create: vi.fn(),
      createWithLayoutItems: vi.fn(),
      findById: vi.fn(),
      findByIdWithLayoutItems: vi.fn(),
      findByIdWithLayoutItemsAndImages: vi.fn(),
      findByIdWithImagesForOrder: vi.fn(),
      update: vi.fn(),
    } as unknown as DraftRepository;

    mockProductRepository = {
      findById: vi.fn(),
      findActiveProduct: vi.fn(),
    } as unknown as ProductRepository;

    mockProductTemplateRepository = {
      findActiveTemplateByProductId: vi.fn(),
      findLayoutItemsByTemplateId: vi.fn(),
    } as unknown as ProductTemplateRepository;

    createOrder = new CreateOrder({
      orderRepository: mockOrderRepository,
      draftRepository: mockDraftRepository,
      productRepository: mockProductRepository,
      productTemplateRepository: mockProductTemplateRepository,
    });
  });

  it("should create an order successfully from a locked draft", async () => {
    const draftId = "123e4567-e89b-12d3-a456-426614174000";
    const productId = "123e4567-e89b-12d3-a456-426614174001";
    const templateId = "123e4567-e89b-12d3-a456-426614174002";
    const orderId = "123e4567-e89b-12d3-a456-426614174003";
    const now = new Date();

    const mockDraftWithItems = {
      draft: {
        id: draftId,
        userId: "123e4567-e89b-12d3-a456-426614174004",
        productId,
        templateId,
        state: DraftStateEnum.LOCKED,
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [
        {
          id: "123e4567-e89b-12d3-a456-426614174005",
          draftId,
          layoutIndex: 1,
          type: "image" as const,
          transformJson: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
    };

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174007",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const mockDraftDataForOrder = {
      layoutItems: [
        {
          layoutIndex: 1,
          type: "image" as const,
          transformJson: null,
          images: [
            {
              uploadedImageId: "123e4567-e89b-12d3-a456-426614174006",
              uploadedImage: {
                id: "123e4567-e89b-12d3-a456-426614174006",
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

    const mockOrder = {
      id: orderId,
      draftId,
      state: OrderState.PENDING,
      createdAt: now,
    };

    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(mockDraftWithItems);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockDraftRepository.findByIdWithImagesForOrder).mockResolvedValue(mockDraftDataForOrder);
    vi.mocked(mockOrderRepository.createWithDraftUpdate).mockResolvedValue(mockOrder);

    const result = await createOrder.execute({ draftId });

    expect(result.id).toBe(orderId);
    expect(result.draftId).toBe(draftId);
    expect(result.state).toBe(OrderState.PENDING);
    expect(mockDraftRepository.findByIdWithLayoutItems).toHaveBeenCalledWith(draftId);
    expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
    expect(mockDraftRepository.findByIdWithImagesForOrder).toHaveBeenCalledWith(draftId);
    expect(mockOrderRepository.createWithDraftUpdate).toHaveBeenCalled();
  });

  it("should throw NotFoundError when draft does not exist", async () => {
    const draftId = "123e4567-e89b-12d3-a456-426614174000";

    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(null);

    await expect(createOrder.execute({ draftId })).rejects.toThrow(NotFoundError);
    expect(mockDraftRepository.findByIdWithLayoutItems).toHaveBeenCalledWith(draftId);
    expect(mockOrderRepository.createWithDraftUpdate).not.toHaveBeenCalled();
  });

  it("should throw error when draft is not locked", async () => {
    const draftId = "123e4567-e89b-12d3-a456-426614174000";
    const now = new Date();

    const mockDraftWithItems = {
      draft: {
        id: draftId,
        userId: "123e4567-e89b-12d3-a456-426614174004",
        productId: "123e4567-e89b-12d3-a456-426614174001",
        templateId: "123e4567-e89b-12d3-a456-426614174002",
        state: DraftStateEnum.EDITING,
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [],
    };

    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(mockDraftWithItems);

    await expect(createOrder.execute({ draftId })).rejects.toThrow(ConflictError);
    expect(mockDraftRepository.findByIdWithLayoutItems).toHaveBeenCalledWith(draftId);
    expect(mockOrderRepository.createWithDraftUpdate).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when product does not exist", async () => {
    const draftId = "123e4567-e89b-12d3-a456-426614174000";
    const now = new Date();

    const mockDraftWithItems = {
      draft: {
        id: draftId,
        userId: "123e4567-e89b-12d3-a456-426614174004",
        productId: "123e4567-e89b-12d3-a456-426614174001",
        templateId: "123e4567-e89b-12d3-a456-426614174002",
        state: DraftStateEnum.LOCKED,
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [],
    };

    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(mockDraftWithItems);
    vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

    await expect(createOrder.execute({ draftId })).rejects.toThrow(NotFoundError);
    expect(mockProductRepository.findById).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174001");
    expect(mockOrderRepository.createWithDraftUpdate).not.toHaveBeenCalled();
  });
});
