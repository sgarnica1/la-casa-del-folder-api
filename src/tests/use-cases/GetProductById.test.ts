import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetProductById } from "../../core/application/use-cases/products/GetProductById";
import { ProductRepository } from "../../core/domain/repositories/ProductRepository";
import { NotFoundError, ValidationError } from "../../core/domain/errors/DomainErrors";

describe("GetProductById", () => {
  let getProductById: GetProductById;
  let mockProductRepository: ProductRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    mockProductRepository = {
      findById: vi.fn(),
    } as unknown as ProductRepository;

    getProductById = new GetProductById({
      productRepository: mockProductRepository,
    });
  });

  it("should return product successfully", async () => {
    const productId = "123e4567-e89b-12d3-a456-426614174000";
    const now = new Date();

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174001",
      name: "Calendar",
      description: "Test calendar",
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);

    const result = await getProductById.execute({ productId });

    expect(result.id).toBe(productId);
    expect(result.name).toBe("Calendar");
    expect(result.description).toBe("Test calendar");
    expect(result.basePrice).toBe(29.99);
    expect(result.currency).toBe("MXN");
    expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
  });

  it("should handle null description", async () => {
    const productId = "123e4567-e89b-12d3-a456-426614174000";
    const now = new Date();

    const mockProduct = {
      id: productId,
      categoryId: "123e4567-e89b-12d3-a456-426614174001",
      name: "Calendar",
      description: null,
      basePrice: 29.99,
      status: "active" as const,
      createdAt: now,
      updatedAt: now,
    };

    vi.mocked(mockProductRepository.findById).mockResolvedValue(mockProduct);

    const result = await getProductById.execute({ productId });

    expect(result.description).toBeNull();
  });

  it("should throw ValidationError for invalid input", async () => {
    await expect(
      getProductById.execute({ productId: "invalid" })
    ).rejects.toThrow(ValidationError);

    expect(mockProductRepository.findById).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError when product does not exist", async () => {
    const productId = "123e4567-e89b-12d3-a456-426614174000";

    vi.mocked(mockProductRepository.findById).mockResolvedValue(null);

    await expect(getProductById.execute({ productId })).rejects.toThrow(NotFoundError);
    expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
  });
});
