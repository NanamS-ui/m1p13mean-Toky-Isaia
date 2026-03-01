import { Component, inject, Signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/order/cart.service';
import { CartItem } from '../../../core/models/order/cart-item.model';
import { CartGroup } from '../../../core/models/order/cart-group.model';
import { OrdersService } from '../../../core/services/order/order.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './panier.component.html',
  styleUrl: './panier.component.css'
})
export class PanierComponent {
  private cartService = inject(CartService);
  private ordersService = inject(OrdersService);
  private router = inject(Router);

  cartItems: WritableSignal<CartItem[]> = this.cartService.items;
  cartGroups: Signal<CartGroup[]> = this.cartService.groups;
  total: Signal<number> = this.cartService.total;
  totalItems: Signal<number> = this.cartService.totalItems;

  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
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

    this.cartService.updateQuantity(itemId, newQuantity);
  }

  incrementQuantity(itemId: string): void {
    const item = this.cartItems().find(i => i.stockId === itemId);
    if (item) {
      this.updateQuantity(itemId, item.quantity + 1);
    }
  }

  decrementQuantity(itemId: string): void {
    const item = this.cartItems().find(i => i.stockId === itemId);
    if (item && item.quantity > 1) {
      this.updateQuantity(itemId, item.quantity - 1);
    }
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  clearCart(): void {
    this.cartService.clear();
  }

  proceedToCheckout(): void {
    if (this.isEmpty()) return;

    const payload = {
      total: this.total(),
      orderItems: this.cartService.toOrderItems()
    };

    this.ordersService.createOrderWithItems(payload).subscribe({
      next: (order) => {
        const orderId = (order as any)?._id;
        this.router.navigate(['/acheteur/checkout'], {
          queryParams: orderId ? { orderId, fromCart: 1 } : { fromCart: 1 }
        });
      },
      error: (err) => {
        console.error('Erreur création commande', err);
        alert(err?.error?.message || 'Erreur lors de la création de la commande');
      }
    });
  }

  isEmpty(): boolean {
    return this.cartItems().length === 0;
  }
}
