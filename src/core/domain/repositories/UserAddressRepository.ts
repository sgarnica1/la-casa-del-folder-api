export interface UserAddress {
  id: string;
  userId: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserAddressInput {
  userId: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UserAddressRepository {
  findByUserId(userId: string): Promise<UserAddress[]>;
  findById(id: string, userId: string): Promise<UserAddress | null>;
  create(input: CreateUserAddressInput): Promise<UserAddress>;
}
