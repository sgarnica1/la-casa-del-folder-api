export interface ProductTemplate {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}