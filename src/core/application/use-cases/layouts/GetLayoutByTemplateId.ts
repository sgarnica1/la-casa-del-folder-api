import { ProductTemplateRepository } from "../../../domain/repositories/ProductTemplateRepository";
import { NotFoundError, ValidationError } from "../../../domain/errors";
import { GetLayoutByTemplateIdInputSchema, GetLayoutByTemplateIdOutput } from "./dtos/GetLayoutByTemplateId.dto";
import { prisma } from "../../../infrastructure/prisma/client";

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
      // Find the template by product name
      const product = await prisma.product.findFirst({
        where: { name: "Photo Calendar" },
      });

      if (!product) {
        throw new NotFoundError("Product", "Photo Calendar. Please ensure the database is seeded.");
      }

      const template = await prisma.productTemplate.findFirst({
        where: {
          productId: product.id,
          status: "active",
        },
      });

      if (!template) {
        throw new NotFoundError("Template", `for product ${product.id}. Please ensure the database is seeded.`);
      }

      actualTemplateId = template.id;
    }

    const layoutItems = await this.deps.productTemplateRepository.findLayoutItemsByTemplateId(actualTemplateId);

    if (layoutItems.length === 0) {
      throw new NotFoundError("Layout", actualTemplateId);
    }

    const slots = layoutItems.map((item) => {
      let slotName: string;
      if (item.layoutIndex === 0) {
        slotName = 'Portada';
      } else {
        slotName = `Mes ${item.layoutIndex}`;
      }

      return {
        id: `slot-${item.layoutIndex}`,
        name: slotName,
        required: item.editable,
        bounds: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        },
      };
    });

    return {
      id: `layout-${actualTemplateId}`,
      templateId: actualTemplateId,
      slots,
    };
  }
}
