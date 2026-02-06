import { UserAddressRepository } from "../../../domain/repositories/UserAddressRepository";

export interface GetUserAddressesDependencies {
  userAddressRepository: UserAddressRepository;
}

export class GetUserAddresses {
  constructor(private deps: GetUserAddressesDependencies) { }

  async execute(userId: string) {
    return await this.deps.userAddressRepository.findByUserId(userId);
  }
}
