import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface CartItem {
  id: string;
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

interface CartGroup {
  boutiqueId: string;
  boutiqueName: string;
  items: CartItem[];
  subtotal: number;
}

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './panier.component.html',
  styleUrl: './panier.component.css'
})
export class PanierComponent {
  // Mock cart items
  cartItems = signal<CartItem[]>([
    {
      id: '1',
      productId: '1',
      productName: 'Robe été fleurie',
      price: 75000,
      promoPrice: 59000,
      quantity: 2,
      boutiqueId: '1',
      boutiqueName: 'Mode & Style',
      inStock: true
    },
    {
      id: '2',
      productId: '2',
      productName: 'Casque Bluetooth Pro',
      price: 185000,
      quantity: 1,
      boutiqueId: '2',
      boutiqueName: 'TechZone',
      inStock: true
    },
    {
      id: '3',
      productId: '5',
      productName: 'Montre connectée',
      price: 250000,
      promoPrice: 199000,
      quantity: 1,
      boutiqueId: '2',
      boutiqueName: 'TechZone',
      inStock: true
    },
    {
      id: '4',
      productId: '8',
      productName: 'Sac à main cuir',
      price: 180000,
      promoPrice: 140000,
      quantity: 1,
      boutiqueId: '1',
      boutiqueName: 'Mode & Style',
      inStock: true
    }
  ]);

  // Group items by shop
  cartGroups = computed<CartGroup[]>(() => {
    const groups = new Map<string, CartGroup>();
    
    this.cartItems().forEach(item => {
      if (!groups.has(item.boutiqueId)) {
        groups.set(item.boutiqueId, {
          boutiqueId: item.boutiqueId,
          boutiqueName: item.boutiqueName,
          items: [],
          subtotal: 0
        });
      }
      
      const group = groups.get(item.boutiqueId)!;
      group.items.push(item);
      const itemPrice = item.promoPrice ?? item.price;
      group.subtotal += itemPrice * item.quantity;
    });
    
    return Array.from(groups.values());
  });

  // Total calculation
  total = computed(() => {
    return this.cartGroups().reduce((sum, group) => sum + group.subtotal, 0);
  });

  totalItems = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      maximumFractionDigits: 0
    }).format(value);
  }

  getItemPrice(item: CartItem): number {
    return item.promoPrice ?? item.price;
  }

  getItemSubtotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  updateQuantity(itemId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(itemId);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }

  incrementQuantity(itemId: string): void {
    const item = this.cartItems().find(i => i.id === itemId);
    if (item) {
      this.updateQuantity(itemId, item.quantity + 1);
    }
  }

  decrementQuantity(itemId: string): void {
    const item = this.cartItems().find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      this.updateQuantity(itemId, item.quantity - 1);
    }
  }

  removeItem(itemId: string): void {
    this.cartItems.update(items => items.filter(item => item.id !== itemId));
  }

  clearCart(): void {
    this.cartItems.set([]);
  }

  proceedToCheckout(): void {
    // TODO: Navigate to checkout
    console.log('Proceed to checkout');
  }

  isEmpty(): boolean {
    return this.cartItems().length === 0;
  }
}
