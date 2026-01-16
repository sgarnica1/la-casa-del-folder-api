export enum RoleTypeEnum {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

export type RoleType = (typeof RoleTypeEnum)[keyof typeof RoleTypeEnum];

export interface Role {
  id: string;
  type: RoleType;
  createdAt: Date;
  updatedAt: Date;
}