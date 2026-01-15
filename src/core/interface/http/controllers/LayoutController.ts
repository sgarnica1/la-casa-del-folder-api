import { Request, Response, NextFunction } from "express";
import { ProductTemplateRepository } from "../../../domain/repositories/ProductTemplateRepository";

export class LayoutController {
  constructor(private productTemplateRepository: ProductTemplateRepository) { }

  async getByTemplateId(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { templateId } = req.params;

    let actualTemplateId = templateId;
    if (templateId === "calendar-template") {
      actualTemplateId = "00000000-0000-0000-0000-000000000003";
    }

    const layoutItems = await this.productTemplateRepository.findLayoutItemsByTemplateId(actualTemplateId);

    if (layoutItems.length === 0) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Layout not found" } });
      return;
    }

    res.json({
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
    });
  }
}
