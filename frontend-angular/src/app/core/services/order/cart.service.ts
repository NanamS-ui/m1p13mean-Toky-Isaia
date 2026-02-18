import { Injectable, computed, signal } from '@angular/core';
import { CartItem } from '../../models/order/cart-item.model';
import { CartGroup } from '../../models/order/cart-group.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'cart_items';

  items = signal<CartItem[]>(this.load());

  groups = computed<CartGroup[]>(() => {
    const groups = new Map<string, CartGroup>();

    this.items().forEach(item => {
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

  total = computed(() =>
    this.groups().reduce((sum, group) => sum + group.subtotal, 0)
  );

  totalItems = computed(() =>
    this.items().reduce((sum, item) => sum + item.quantity, 0)
  );

  addItem(item: CartItem, quantity = 1): void {
    if (!item.stockId) return;

    this.items.update(items => {
      const existing = items.find(i => i.stockId === item.stockId);
      if (existing) {
        return items.map(i =>
          i.stockId === item.stockId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...items, { ...item, quantity }];
    });

    this.persist();
  }

  updateQuantity(stockId: string, quantity: number): void {
    if (quantity < 1) {
      this.removeItem(stockId);
      return;
    }

    this.items.update(items =>
      items.map(item =>
        item.stockId === stockId ? { ...item, quantity } : item
      )
    );
    this.persist();
  }

  removeItem(stockId: string): void {
    this.items.update(items => items.filter(item => item.stockId !== stockId));
    this.persist();
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }

  toOrderItems(): { stock: string; unit_price: number; promotion_percentage: number; quantity: number }[] {
    return this.items().map(item => ({
      stock: item.stockId,
      unit_price: item.price,
      promotion_percentage: item.promoPrice && item.price > 0
        ? Math.round((1 - item.promoPrice / item.price) * 100)
        : 0,
      quantity: item.quantity
    }));
  }

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items()));
    } catch {
      // Ignore storage errors
    }
  }
}
