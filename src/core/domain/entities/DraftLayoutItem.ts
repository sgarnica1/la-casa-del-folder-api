export enum LayoutItemType {
  IMAGE = "image",
  TEXT = "text",
}

export interface DraftLayoutItem {
  id: string;
  draftId: string;
  layoutIndex: number;
  type: LayoutItemType;
  transformJson: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}