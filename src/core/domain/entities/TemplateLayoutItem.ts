import { LayoutItemType } from "./DraftLayoutItem";

export interface TemplateLayoutItem {
  id: string;
  templateId: string;
  layoutIndex: number;
  type: LayoutItemType;
  editable: boolean;
  constraintsJson: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}