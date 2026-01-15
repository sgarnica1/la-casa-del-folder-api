export enum OrderState {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface Order {
  id: string;
  draftId: string;
  state: OrderState;
  createdAt: Date;
}
