export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  basePrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}