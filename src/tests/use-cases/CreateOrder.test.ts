import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateOrder } from "../../core/application/use-cases/orders/CreateOrder";
import { OrderRepository } from "../../core/domain/repositories/OrderRepository";
import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { DraftState } from "../../core/domain/entities/Draft";
import { OrderState } from "../../core/domain/entities/Order";
import { NotFoundError } from "../../core/domain/errors/DomainErrors";
import { prisma } from "../../core/infrastructure/prisma/client";

vi.mock("../../core/infrastructure/prisma/client", () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
    draft: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("CreateOrder", () => {
  let createOrder: CreateOrder;
  let mockOrderRepository: OrderRepository;
  let mockDraftRepository: DraftRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockOrderRepository = {
      create: vi.fn(),
      findById: vi.fn(),
    } as unknown as OrderRepository;

    mockDraftRepository = {
      create: vi.fn(),
      createWithLayoutItems: vi.fn(),
      findById: vi.fn(),
      findByIdWithLayoutItems: vi.fn(),
      update: vi.fn(),
    } as unknown as DraftRepository;

    createOrder = new CreateOrder({
      orderRepository: mockOrderRepository,
      draftRepository: mockDraftRepository,
    });
  });

  it("should create an order successfully from a locked draft", async () => {
    const draftId = "draft-123";
    const productId = "product-123";
    const templateId = "template-123";
    const orderId = "order-123";
    const now = new Date();

    const mockDraftWithItems = {
      draft: {
        id: draftId,
        userId: "user-123",
        productId,
        templateId,
        state: DraftState.LOCKED,
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [
        {
          id: "item-1",
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
      name: "Calendar",
      basePrice: 29.99,
    };

    const mockDraftData = {
      id: draftId,
      layoutItems: [
        {
          layoutIndex: 1,
          type: "image",
          transformJson: null,
          images: [
            {
              uploadedImageId: "image-123",
              uploadedImage: {
                originalUrl: "https://example.com/image.jpg",
              },
              transformJson: null,
            },
          ],
        },
      ],
    };

    const mockOrder = {
      id: orderId,
      createdAt: now,
    };

    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(mockDraftWithItems);
    vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
    vi.mocked(prisma.draft.findUnique).mockResolvedValue(mockDraftData as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
      const tx = {
        order: {
          create: vi.fn().mockResolvedValue(mockOrder),
        },
        draft: {
          update: vi.fn().mockResolvedValue({}),
        },
      };
      return callback(tx);
    });

    const result = await createOrder.execute({ draftId });

    expect(result.id).toBe(orderId);
    expect(result.draftId).toBe(draftId);
    expect(result.state).toBe(OrderState.PENDING);
    expect(mockDraftRepository.findByIdWithLayoutItems).toHaveBeenCalledWith(draftId);
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: productId },
    });
    expect(prisma.draft.findUnique).toHaveBeenCalledWith({
      where: { id: draftId },
      include: {
        layoutItems: {
          include: {
            images: {
              include: {
                uploadedImage: true,
              },
            },
          },
          orderBy: { layoutIndex: "asc" },
        },
      },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("should throw NotFoundError when draft does not exist", async () => {
    const draftId = "draft-123";

    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(null);

    await expect(createOrder.execute({ draftId })).rejects.toThrow(NotFoundError);
    expect(mockDraftRepository.findByIdWithLayoutItems).toHaveBeenCalledWith(draftId);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should throw error when draft is not locked", async () => {
    const draftId = "draft-123";
    const now = new Date();

    const mockDraftWithItems = {
      draft: {
        id: draftId,
        userId: "user-123",
        productId: "product-123",
        templateId: "template-123",
        state: DraftState.EDITING,
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [],
    };

    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(mockDraftWithItems);

    await expect(createOrder.execute({ draftId })).rejects.toThrow("Draft must be locked before creating an order");
    expect(mockDraftRepository.findByIdWithLayoutItems).toHaveBeenCalledWith(draftId);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when product does not exist", async () => {
    const draftId = "draft-123";
    const now = new Date();

    const mockDraftWithItems = {
      draft: {
        id: draftId,
        userId: "user-123",
        productId: "product-123",
        templateId: "template-123",
        state: DraftState.LOCKED,
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [],
    };

    vi.mocked(mockDraftRepository.findByIdWithLayoutItems).mockResolvedValue(mockDraftWithItems);
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

    await expect(createOrder.execute({ draftId })).rejects.toThrow(NotFoundError);
    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: "product-123" },
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
