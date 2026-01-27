import { ProductRepository } from "../../../domain/repositories/ProductRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";
import { GetProductByIdInputSchema, GetProductByIdOutput } from "./dtos/GetProductById.dto";

export interface GetProductByIdDependencies {
  productRepository: ProductRepository;
}

export class GetProductById {
  constructor(private deps: GetProductByIdDependencies) { }

  async execute(input: unknown): Promise<GetProductByIdOutput> {
    const validationResult = GetProductByIdInputSchema.safeParse(input);

    if (!validationResult.success) {
      console.error("[GetProductById] Validation failed:", {
        input,
        issues: validationResult.error.issues,
        formatted: validationResult.error.format(),
      });
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    const product = await this.deps.productRepository.findById(validatedInput.productId);

    if (!product) {
      throw new NotFoundError("Product", validatedInput.productId);
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      currency: "MXN",
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
