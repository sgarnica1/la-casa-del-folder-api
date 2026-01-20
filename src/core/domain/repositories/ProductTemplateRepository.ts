import { ProductTemplate } from "../entities/ProductTemplate";
import { TemplateLayoutItem } from "../entities/TemplateLayoutItem";

export interface ProductTemplateRepository {
  findActiveTemplateByProductId(productId: string): Promise<ProductTemplate | null>;
  findLayoutItemsByTemplateId(templateId: string): Promise<TemplateLayoutItem[]>;
}