import { CartItem } from './cart-item.model';

export interface CartGroup {
  boutiqueId: string;
  boutiqueName: string;
  items: CartItem[];
  subtotal: number;
}
