export enum DraftStateEnum {
  EDITING = "editing",
  LOCKED = "locked",
  ORDERED = "ordered",
}

export type DraftState = (typeof DraftStateEnum)[keyof typeof DraftStateEnum];

export interface Draft {
  id: string;
  userId: string;
  productId: string;
  templateId: string;
  state: DraftState;
  title?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
