import { Product } from "../entities/Product";

export interface ProductRepository {
  findActiveProduct(): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
}