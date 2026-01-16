import { Request, Response, NextFunction } from "express";
import { GetLayoutByTemplateId } from "../../../application/use-cases/layouts/GetLayoutByTemplateId";
import { NotFoundError, ValidationError } from "../../../domain/errors/DomainErrors";

export class LayoutController {
  constructor(private getLayoutByTemplateId: GetLayoutByTemplateId) { }

  async getByTemplateId(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const templateId = typeof req.params.templateId === "string" ? req.params.templateId : req.params.templateId?.[0];

    if (!templateId) {
      res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Template ID is required" } });
      return;
    }

    try {
      const result = await this.getLayoutByTemplateId.execute({ templateId });
      res.json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: error.message, details: error.details } });
        return;
      }

      if (error instanceof NotFoundError) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: error.message } });
        return;
      }

      console.error("Get layout error:", error);
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to get layout" } });
    }
  }
}
