import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreateDraft } from "../../core/application/use-cases/drafts/CreateDraft";
import { DraftRepository } from "../../core/domain/repositories/DraftRepository";
import { ProductRepository } from "../../core/domain/repositories/ProductRepository";
import { ProductTemplateRepository } from "../../core/domain/repositories/ProductTemplateRepository";
import { DraftStateEnum } from "../../core/domain/entities/Draft";
import { LayoutItemType } from "../../core/domain/entities/DraftLayoutItem";
import { NotFoundError } from "../../core/domain/errors/DomainErrors";

describe("CreateDraft", () => {
  let createDraft: CreateDraft;
  let mockDraftRepository: DraftRepository;
  let mockProductRepository: ProductRepository;
  let mockProductTemplateRepository: ProductTemplateRepository;

  beforeEach(() => {
    mockDraftRepository = {
      create: vi.fn(),
      createWithLayoutItems: vi.fn(),
      findById: vi.fn(),
      findByIdWithLayoutItems: vi.fn(),
      update: vi.fn(),
    } as unknown as DraftRepository;

    mockProductRepository = {
      findActiveProduct: vi.fn(),
    } as unknown as ProductRepository;

    mockProductTemplateRepository = {
      findActiveTemplateByProductId: vi.fn(),
      findLayoutItemsByTemplateId: vi.fn(),
    } as unknown as ProductTemplateRepository;

    createDraft = new CreateDraft({
      draftRepository: mockDraftRepository,
      productRepository: mockProductRepository,
      productTemplateRepository: mockProductTemplateRepository,
    });
  });

  it("should create a draft with layout items successfully", async () => {
    const userId = "123e4567-e89b-12d3-a456-426614174000";
    const productId = "123e4567-e89b-12d3-a456-426614174001";
    const templateId = "123e4567-e89b-12d3-a456-426614174002";
    const draftId = "123e4567-e89b-12d3-a456-426614174003";
    const now = new Date();

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174004",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const mockTemplate = {
      id: templateId,
      productId: productId,
      name: "Calendar Template",
      description: "Test template",
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const mockLayoutItems = [
      {
        id: "123e4567-e89b-12d3-a456-426614174007",
        templateId: templateId,
        layoutIndex: 1,
        type: LayoutItemType.IMAGE,
        editable: true,
        constraintsJson: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174008",
        templateId: templateId,
        layoutIndex: 2,
        type: LayoutItemType.IMAGE,
        editable: true,
        constraintsJson: null,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const mockDraftWithItems = {
      draft: {
        id: draftId,
        userId,
        productId,
        templateId,
        state: DraftStateEnum.EDITING,
        createdAt: now,
        updatedAt: now,
      },
      layoutItems: [
        {
          id: "123e4567-e89b-12d3-a456-426614174005",
          draftId,
          layoutIndex: 1,
          type: LayoutItemType.IMAGE,
          transformJson: null,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174006",
          draftId,
          layoutIndex: 2,
          type: LayoutItemType.IMAGE,
          transformJson: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
    };

    vi.mocked(mockProductRepository.findActiveProduct).mockResolvedValue(mockProduct);
    vi.mocked(mockProductTemplateRepository.findActiveTemplateByProductId).mockResolvedValue(mockTemplate);
    vi.mocked(mockProductTemplateRepository.findLayoutItemsByTemplateId).mockResolvedValue(mockLayoutItems);
    vi.mocked(mockDraftRepository.createWithLayoutItems).mockResolvedValue(mockDraftWithItems);

    const result = await createDraft.execute({ userId });

    expect(result.draft.id).toBe(draftId);
    expect(result.draft.productId).toBe(productId);
    expect(result.draft.templateId).toBe(templateId);
    expect(result.draft.state).toBe(DraftStateEnum.EDITING);
    expect(result.layoutItems).toHaveLength(2);
    expect(result.layoutItems[0].layoutIndex).toBe(1);
    expect(result.layoutItems[1].layoutIndex).toBe(2);

    expect(mockProductRepository.findActiveProduct).toHaveBeenCalledOnce();
    expect(mockProductTemplateRepository.findActiveTemplateByProductId).toHaveBeenCalledWith(productId);
    expect(mockProductTemplateRepository.findLayoutItemsByTemplateId).toHaveBeenCalledWith(templateId);
    expect(mockDraftRepository.createWithLayoutItems).toHaveBeenCalledWith({
      draft: {
        userId,
        productId,
        templateId,
        state: DraftStateEnum.EDITING,
      },
      layoutItems: [
        { layoutIndex: 1, type: "image", transformJson: null },
        { layoutIndex: 2, type: "image", transformJson: null },
      ],
    });
  });

  it("should throw NotFoundError when no active product exists", async () => {
    vi.mocked(mockProductRepository.findActiveProduct).mockResolvedValue(null);

    await expect(createDraft.execute({ userId: "123e4567-e89b-12d3-a456-426614174000" })).rejects.toThrow(NotFoundError);
    expect(mockProductRepository.findActiveProduct).toHaveBeenCalledOnce();
    expect(mockDraftRepository.createWithLayoutItems).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when no active template exists", async () => {
    const mockProduct = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      categoryId: "123e4567-e89b-12d3-a456-426614174004",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockProductRepository.findActiveProduct).mockResolvedValue(mockProduct);
    vi.mocked(mockProductTemplateRepository.findActiveTemplateByProductId).mockResolvedValue(null);

    await expect(createDraft.execute({ userId: "123e4567-e89b-12d3-a456-426614174000" })).rejects.toThrow(NotFoundError);
    expect(mockProductTemplateRepository.findActiveTemplateByProductId).toHaveBeenCalledWith("123e4567-e89b-12d3-a456-426614174001");
    expect(mockDraftRepository.createWithLayoutItems).not.toHaveBeenCalled();
  });
});
