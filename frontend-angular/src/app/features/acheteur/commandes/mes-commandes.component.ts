import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { OrdersService } from '../../../core/services/order/order.service';
import { PaymentService } from '../../../core/services/payment/payment.service';
import { OrderCategoryService } from '../../../core/services/order/orderCategory.service';
import { OrderCategory } from '../../../core/models/order/order-category.model';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  total: number;
  status: OrderStatus;
  itemsCount: number;
  boutiqueName: string;
  boutiqueId: string;
}

interface OrderItemPreview {
  productName: string;
  quantity: number;
}

interface OrderDetails {
  itemsPreview: OrderItemPreview[];
}

type PaymentStatus = 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'REJECTED' | string;

interface OrderPayment {
  _id: string;
  provider?: string;
  method?: string;
  status?: PaymentStatus;
  bank_details?: {
    bank_name?: string | null;
    account_holder?: string | null;
    account_number?: string | null;
    note?: string | null;
  } | null;
  amount?: number;
  currency?: string;
  created_at?: string | Date;
}

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-commandes.component.html',
  styleUrl: './mes-commandes.component.css'
})
export class MesCommandesComponent {
  private ordersService = inject(OrdersService);
  private paymentService = inject(PaymentService);
  private orderCategoryService = inject(OrderCategoryService);
  private router = inject(Router);

  private allOrders = signal<Order[]>([]);
  private paymentsByOrderId = signal<Record<string, OrderPayment | null>>({});
  private detailsByOrderId = signal<Record<string, OrderDetails | null>>({});

  selectedStatus = signal<OrderStatus | 'all'>('all');
  searchQuery = signal<string>('');

  constructor() {
    this.loadOrderCategories();
    this.loadOrders();
  }

  giveReview(order: Order): void {
    this.router.navigate(['/acheteur/avis'], {
      queryParams: {
        orderId: order.id,
        shopId: order.boutiqueId || undefined,
        shopName: order.boutiqueName || undefined,
        orderDate: order.date?.toISOString?.() || undefined,
        type: 'shop'
      }
    });
  }

  // Status options (alimentées par les catégories depuis l'API)
  statusOptions = signal<Array<{ value: OrderStatus | 'all'; label: string }>>([
    { value: 'all', label: 'Toutes' }
  ]);

  private mapCategoryToStatus(value: string | undefined | null): OrderStatus {
    const v = String(value || '').toLowerCase();
    if (v.includes('attente')) return 'pending';
    if (v.includes('confirm')) return 'confirmed';
    if (v.includes('prépar') || v.includes('prepar')) return 'preparing';
    if (v.includes('expédi') || v.includes('expedi') || v.includes('shipp')) return 'shipped';
    if (v.includes('livr')) return 'delivered';
    if (v.includes('annul')) return 'cancelled';
    return 'pending';
  }

  private loadOrderCategories(): void {
    this.orderCategoryService.getOrderCategorys().pipe(
      catchError((err) => {
        console.error('Erreur chargement catégories commande', err);
        return of([] as OrderCategory[]);
      })
    ).subscribe((cats) => {
      const options: Array<{ value: OrderStatus | 'all'; label: string }> = [
        { value: 'all', label: 'Toutes' }
      ];

      const seen = new Set<OrderStatus>();
      for (const c of cats || []) {
        const label = String(c?.value || '').trim();
        if (!label) continue;
        const status = this.mapCategoryToStatus(label);
        if (seen.has(status)) continue;
        seen.add(status);
        options.push({ value: status, label });
      }

      // Fallback si l'API renvoie vide: on garde la liste standard
      if (options.length === 1) {
        this.statusOptions.set([
          { value: 'all', label: 'Toutes' },
          { value: 'pending', label: 'En attente' },
          { value: 'confirmed', label: 'Confirmée' },
          { value: 'preparing', label: 'En préparation' },
          { value: 'shipped', label: 'Expédiée' },
          { value: 'delivered', label: 'Livrée' },
          { value: 'cancelled', label: 'Annulée' }
        ]);
        return;
      }

      this.statusOptions.set(options);
    });
  }

  private buildBoutiqueInfo(rawOrder: any): { boutiqueName: string; boutiqueId: string } {
    const items = rawOrder?.orderItems;
    const shops: Array<{ id: string; name: string }> = [];
    if (Array.isArray(items)) {
      for (const item of items) {
        const shop = item?.stock?.shop;
        if (shop?._id && shop?.name) {
          shops.push({ id: String(shop._id), name: String(shop.name) });
        }
      }
    }
    const unique = new Map<string, string>();
    for (const s of shops) unique.set(s.id, s.name);
    const arr = Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    if (arr.length === 0) return { boutiqueName: '-', boutiqueId: '' };
    if (arr.length === 1) return { boutiqueName: arr[0].name, boutiqueId: arr[0].id };
    return { boutiqueName: `${arr.length} boutiques`, boutiqueId: arr[0].id };
  }

  private toOrderVM(raw: any): Order {
    const id = String(raw?._id || raw?.id || '');
    const createdAt = raw?.created_at ? new Date(raw.created_at) : new Date();
    const categoryValue = raw?.orderCategory?.value;
    const boutique = this.buildBoutiqueInfo(raw);
    const itemsCount = Array.isArray(raw?.orderItems) ? raw.orderItems.length : 0;
    return {
      id,
      orderNumber: id,
      date: createdAt,
      total: Number(raw?.total || 0),
      status: this.mapCategoryToStatus(categoryValue),
      itemsCount,
      boutiqueName: boutique.boutiqueName,
      boutiqueId: boutique.boutiqueId
    };
  }

  private loadOrders(): void {
    this.ordersService.getMyOrders().subscribe({
      next: (rawOrders) => {
        const orders = (rawOrders || []).map((o: any) => this.toOrderVM(o));
        this.allOrders.set(orders);

        if (!orders.length) {
          this.paymentsByOrderId.set({});
          this.detailsByOrderId.set({});
          return;
        }

        // Détails commande (produits + quantités)
        forkJoin(
          orders.map((o) =>
            this.ordersService.getOrderByIdAny(o.id).pipe(
              catchError(() => of(null))
            )
          )
        ).subscribe({
          next: (details) => {
            const map: Record<string, OrderDetails | null> = {};
            for (let i = 0; i < orders.length; i++) {
              map[orders[i].id] = this.toOrderDetails(details[i]);
            }
            this.detailsByOrderId.set(map);
          }
        });

        forkJoin(
          orders.map((o) =>
            this.paymentService.getLatestPaymentForOrder(o.id).pipe(
              catchError(() => of(null))
            )
          )
        ).subscribe({
          next: (payments) => {
            const map: Record<string, OrderPayment | null> = {};
            for (let i = 0; i < orders.length; i++) {
              map[orders[i].id] = payments[i];
            }
            this.paymentsByOrderId.set(map);
          }
        });
      },
      error: (err) => {
        console.error('Erreur chargement commandes', err);
        this.allOrders.set([]);
      }
    });
  }

  private toOrderDetails(raw: any): OrderDetails | null {
    if (!raw) return null;
    const items = Array.isArray(raw?.orderItems) ? raw.orderItems : [];
    const previews: OrderItemPreview[] = items
      .map((it: any) => {
        const productName = it?.stock?.product?.name || it?.stock?.product?.title || it?.stock?.product?.designation;
        const quantity = Number(it?.quantity || 0);
        if (!productName || !Number.isFinite(quantity) || quantity <= 0) return null;
        return { productName: String(productName), quantity };
      })
      .filter(Boolean) as OrderItemPreview[];

    return { itemsPreview: previews };
  }

  // Filtered orders
  filteredOrders = computed(() => {
    let orders = this.allOrders();

    // Filter by status
    if (this.selectedStatus() !== 'all') {
      orders = orders.filter(order => order.status === this.selectedStatus());
    }

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      orders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(query) ||
        order.boutiqueName.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return orders.sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status];
  }

  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      shipped: '#06b6d4',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status];
  }

  onStatusChange(status: OrderStatus | 'all'): void {
    this.selectedStatus.set(status);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  downloadInvoice(orderId: string): void {
    // TODO: Implement invoice download
    console.log('Download invoice for order:', orderId);
  }

  isPaymentNull(orderId: string): boolean {
    const map = this.paymentsByOrderId();
    return Object.prototype.hasOwnProperty.call(map, orderId) && map[orderId] === null;
  }

  getPayment(orderId: string): OrderPayment | null | undefined {
    const map = this.paymentsByOrderId();
    if (!Object.prototype.hasOwnProperty.call(map, orderId)) return undefined; // pas encore chargé
    return map[orderId];
  }

  getOrderDetails(orderId: string): OrderDetails | null | undefined {
    const map = this.detailsByOrderId();
    if (!Object.prototype.hasOwnProperty.call(map, orderId)) return undefined;
    return map[orderId];
  }

  getItemsPreview(orderId: string): OrderItemPreview[] {
    const details = this.getOrderDetails(orderId);
    if (!details?.itemsPreview?.length) return [];
    return details.itemsPreview;
  }

  getPaymentStatusLabel(status: PaymentStatus | undefined): string {
    const s = String(status || '').toUpperCase();
    if (s === 'WAITING_CONFIRMATION') return 'En attente de confirmation';
    if (s === 'CONFIRMED') return 'Confirmé';
    if (s === 'REJECTED') return 'Rejeté';
    if (!s) return '—';
    return s;
  }

  getPaymentStatusTone(status: PaymentStatus | undefined): 'pending' | 'success' | 'danger' | 'muted' {
    const s = String(status || '').toUpperCase();
    if (s === 'CONFIRMED') return 'success';
    if (s === 'REJECTED') return 'danger';
    if (s === 'WAITING_CONFIRMATION') return 'pending';
    return 'muted';
  }

  payOrder(orderId: string): void {
    this.router.navigate(['/acheteur/checkout'], {
      queryParams: { orderId }
    });
  }
}
