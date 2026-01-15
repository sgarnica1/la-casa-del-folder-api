export enum DraftState {
  EDITING = "editing",
  LOCKED = "locked",
  ORDERED = "ordered",
}

export interface Draft {
  id: string;
  state: DraftState;
  createdAt: Date;
  updatedAt: Date;
}
