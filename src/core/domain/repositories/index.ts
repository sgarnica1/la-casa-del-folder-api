import { UserRepository } from "./UserRepository";
import { DraftRepository } from "./DraftRepository";
import { OrderRepository } from "./OrderRepository";
import { ProductRepository } from "./ProductRepository";
import { ProductTemplateRepository } from "./ProductTemplateRepository";
import { UploadedImageRepository } from "./UploadedImageRepository";
import { AssetRepository } from "./AssetRepository";
import { RoleRepository } from "./RoleRepository";

export interface Repositories {
  userRepository: UserRepository;
  draftRepository: DraftRepository;
  orderRepository: OrderRepository;
  productRepository: ProductRepository;
  productTemplateRepository: ProductTemplateRepository;
  uploadedImageRepository: UploadedImageRepository;
  assetRepository: AssetRepository;
  roleRepository: RoleRepository;
}
