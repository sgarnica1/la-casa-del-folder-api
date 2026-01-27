export interface SelectedOptionSnapshot {
  optionTypeId: string;
  optionTypeName: string;
  optionValueId: string;
  optionValueName: string;
  priceModifier: number | null;
}

export interface CartItem {
  id: string;
  cartId: string;
  draftId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  selectedOptionsSnapshot: SelectedOptionSnapshot[] | null;
  createdAt: Date;
  updatedAt: Date;
}
