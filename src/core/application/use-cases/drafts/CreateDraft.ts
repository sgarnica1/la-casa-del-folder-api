import { DraftRepository } from "../../../domain/repositories/DraftRepository";
import { ProductRepository } from "../../../domain/repositories/ProductRepository";
import { ProductTemplateRepository } from "../../../domain/repositories/ProductTemplateRepository";
import { DraftState } from "../../../domain/entities/Draft";
import { NotFoundError } from "../../../domain/errors";

export interface CreateDraftDependencies {
  draftRepository: DraftRepository;
  productRepository: ProductRepository;
  productTemplateRepository: ProductTemplateRepository;
}

export interface CreateDraftInput {
  userId: string;
}

export interface CreateDraftOutput {
  draftId: string;
  layoutItems: Array<{
    id: string;
    layoutIndex: number;
    type: string;
  }>;
}

export class CreateDraft {
  constructor(private deps: CreateDraftDependencies) { }

  async execute(input: CreateDraftInput): Promise<CreateDraftOutput> {
    const product = await this.deps.productRepository.findActiveProduct();
    if (!product) {
      throw new NotFoundError("Product", "active");
    }

    const template = await this.deps.productTemplateRepository.findActiveTemplateByProductId(product.id);
    if (!template) {
      throw new NotFoundError("ProductTemplate", `active template for product ${product.id}`);
    }

    const templateLayoutItems = await this.deps.productTemplateRepository.findLayoutItemsByTemplateId(template.id);

    const draftWithLayoutItems = await this.deps.draftRepository.createWithLayoutItems({
      draft: {
        userId: input.userId,
        productId: product.id,
        templateId: template.id,
        state: DraftState.EDITING,
      },
      layoutItems: templateLayoutItems.map((item) => ({
        layoutIndex: item.layoutIndex,
        type: item.type,
        transformJson: null,
      })),
    });

    return {
      draftId: draftWithLayoutItems.draft.id,
      layoutItems: draftWithLayoutItems.layoutItems.map((item) => ({
        id: item.id,
        layoutIndex: item.layoutIndex,
        type: item.type,
      })),
    };
  }
}
