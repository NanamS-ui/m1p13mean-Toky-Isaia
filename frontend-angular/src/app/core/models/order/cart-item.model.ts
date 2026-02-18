export interface CartItem {
  stockId: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  promoPrice?: number;
  quantity: number;
  boutiqueId: string;
  boutiqueName: string;
  inStock: boolean;
}
