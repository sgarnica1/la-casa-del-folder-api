import { ProductTemplateRepository } from "../../domain/repositories/ProductTemplateRepository";
import { ProductTemplate } from "../../domain/entities/ProductTemplate";
import { TemplateLayoutItem } from "../../domain/entities/TemplateLayoutItem";
import { LayoutItemType } from "../../domain/entities/DraftLayoutItem";
import { prisma } from "../prisma/client";

export class PrismaProductTemplateRepository implements ProductTemplateRepository {
  async findActiveTemplateByProductId(productId: string): Promise<ProductTemplate | null> {
    const template = await prisma.productTemplate.findFirst({
      where: {
        productId,
        status: "active",
      },
    });

    if (!template) {
      return null;
    }

    return {
      id: template.id,
      productId: template.productId,
      name: template.name,
      description: template.description,
      status: template.status,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }

  async findLayoutItemsByTemplateId(templateId: string): Promise<TemplateLayoutItem[]> {
    const items = await prisma.templateLayoutItem.findMany({
      where: { templateId },
      orderBy: { layoutIndex: "asc" },
    });

    return items.map((item) => ({
      id: item.id,
      templateId: item.templateId,
      layoutIndex: item.layoutIndex,
      type: item.type as LayoutItemType,
      editable: item.editable,
      constraintsJson: item.constraintsJson as Record<string, unknown> | null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }
}