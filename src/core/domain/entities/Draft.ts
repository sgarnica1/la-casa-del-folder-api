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
  createdAt: Date;
  updatedAt: Date;
}
