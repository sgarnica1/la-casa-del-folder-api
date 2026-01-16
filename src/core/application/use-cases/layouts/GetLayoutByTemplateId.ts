import { ProductTemplateRepository } from "../../../domain/repositories/ProductTemplateRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";
import { GetLayoutByTemplateIdInputSchema, GetLayoutByTemplateIdOutput } from "./dtos/GetLayoutByTemplateId.dto";

export interface GetLayoutByTemplateIdDependencies {
  productTemplateRepository: ProductTemplateRepository;
}

export class GetLayoutByTemplateId {
  constructor(private deps: GetLayoutByTemplateIdDependencies) { }

  async execute(input: unknown): Promise<GetLayoutByTemplateIdOutput> {
    const validationResult = GetLayoutByTemplateIdInputSchema.safeParse(input);

    if (!validationResult.success) {
      throw new ValidationError("Invalid input", { issues: validationResult.error.issues });
    }

    const validatedInput = validationResult.data;
    let actualTemplateId = validatedInput.templateId;
    if (validatedInput.templateId === "calendar-template") {
      actualTemplateId = "00000000-0000-0000-0000-000000000003";
    }

    const layoutItems = await this.deps.productTemplateRepository.findLayoutItemsByTemplateId(actualTemplateId);

    if (layoutItems.length === 0) {
      throw new NotFoundError("Layout", actualTemplateId);
    }

    return {
      id: `layout-${actualTemplateId}`,
      templateId: actualTemplateId,
      slots: layoutItems.map((item) => ({
        id: `slot-${item.layoutIndex}`,
        name: `Slot ${item.layoutIndex}`,
        required: item.editable,
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
      })),
    };
  }
}
