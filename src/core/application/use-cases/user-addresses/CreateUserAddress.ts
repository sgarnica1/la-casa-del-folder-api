import { UserAddressRepository } from "../../../domain/repositories/UserAddressRepository";
import { ValidationError } from "../../../domain/errors/DomainErrors";

export interface CreateUserAddressDependencies {
  userAddressRepository: UserAddressRepository;
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

export class CreateUserAddress {
  constructor(private deps: CreateUserAddressDependencies) { }

  async execute(input: CreateUserAddressInput) {
    if (!input.addressLine1 || !input.city || !input.state || !input.postalCode || !input.country) {
      throw new ValidationError("Required address fields are missing");
    }

    return await this.deps.userAddressRepository.create(input);
  }
}
