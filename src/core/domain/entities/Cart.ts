export enum CartStatusEnum {
  ACTIVE = "active",
  CONVERTED = "converted",
}

export type CartStatus = (typeof CartStatusEnum)[keyof typeof CartStatusEnum];

export interface Cart {
  id: string;
  userId: string;
  status: CartStatus;
  createdAt: Date;
  updatedAt: Date;
}
