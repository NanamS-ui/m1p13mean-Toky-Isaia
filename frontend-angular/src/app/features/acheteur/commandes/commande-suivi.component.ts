import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { OrderStatus, Order } from './mes-commandes.component';
import { OrdersService } from '../../../core/services/order/order.service';
import { PaymentService } from '../../../core/services/payment/payment.service';
import { DocumentService } from '../../../core/services/billing/document.service';
import { catchError, forkJoin, of } from 'rxjs';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  promoPrice?: number;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  date?: Date;
  completed: boolean;
  icon: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  pickupLocation?: string;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
}

type PaymentStatus =
  | 'WAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PREPARATION'
  | 'SHIPPED'
  | 'DELIVERY_EFFECTED'
  | 'REJECTED'
  | string;

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
  selector: 'app-commande-suivi',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commande-suivi.component.html',
  styleUrl: './commande-suivi.component.css'
})
export class CommandeSuiviComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private paymentService = inject(PaymentService);
  private documentService = inject(DocumentService);
  private router = inject(Router);

  orderId = signal<string>('');
  order = signal<OrderDetail | null>(null);
  loading = signal<boolean>(true);

  showOrderDetails = signal<boolean>(false);

  // Timeline steps
  timelineSteps = computed<OrderTimelineStep[]>(() => {
    const currentOrder = this.order();
    if (!currentOrder) return [];

    // Workflow attendu: En attente -> Confirmée -> En préparation -> Livrée (+ Annulée)
    if (currentOrder.status === 'cancelled') {
      return [
        {
          status: 'pending',
          label: 'Commande en attente',
          date: currentOrder.date,
          completed: true,
          icon: 'schedule'
        },
        {
          status: 'cancelled',
          label: 'Commande annulée',
          completed: true,
          icon: 'cancel'
        }
      ];
    }

    const allSteps: OrderTimelineStep[] = [
      {
        status: 'pending',
        label: 'Commande en attente',
        date: currentOrder.date,
        completed: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'].includes(currentOrder.status),
        icon: 'schedule'
      },
      {
        status: 'confirmed',
        label: 'Commande confirmée',
        completed: ['confirmed', 'preparing', 'shipped', 'delivered'].includes(currentOrder.status),
        icon: 'check_circle'
      },
      {
        status: 'preparing',
        label: 'En préparation',
        completed: ['preparing', 'shipped', 'delivered'].includes(currentOrder.status),
        icon: 'inventory_2'
      },
      {
        status: 'shipped',
        label: 'Expédiée',
        completed: ['shipped', 'delivered'].includes(currentOrder.status),
        icon: 'local_shipping'
      },
      {
        status: 'delivered',
        label: 'Livrée',
        date: currentOrder.status === 'delivered' ? currentOrder.estimatedDelivery : undefined,
        completed: currentOrder.status === 'delivered',
        icon: 'done_all'
      }
    ];

    return allSteps;
  });

  constructor(private route: ActivatedRoute) {}

  private mapCategoryToStatus(value: string | undefined | null): OrderStatus {
    const raw = String(value || '').trim();
    const up = raw.toUpperCase();

    // Support des codes backend
    if (up === 'WAITING_CONFIRMATION') return 'pending';
    if (up === 'CONFIRMED') return 'confirmed';
    if (up === 'IN_PREPARATION') return 'preparing';
    if (up === 'SHIPPED') return 'shipped';
    if (up === 'DELIVERY_EFFECTED') return 'delivered';
    if (up === 'REJECTED') return 'cancelled';

    const v = raw.toLowerCase();
    if (v.includes('attente')) return 'pending';
    if (v.includes('confirm')) return 'confirmed';
    if (v.includes('prépar') || v.includes('prepar')) return 'preparing';
    if (v.includes('expédi') || v.includes('expedi') || v.includes('shipp')) return 'shipped';
    if (v.includes('livr')) return 'delivered';
    if (v.includes('annul')) return 'cancelled';
    return 'pending';
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

  private mapPaymentMethod(payment: OrderPayment | null): string {
    if (!payment) return 'Non effectué';
    if (payment.method === 'BANK_TRANSFER' || payment.provider === 'bank_transfer') return 'Virement bancaire';
    return String(payment.method || payment.provider || '-');
  }

  private mapPaymentStatus(payment: OrderPayment | null): 'paid' | 'pending' | 'rejected' {
    // Deprecated: conservé pour compat mais on utilise désormais PaymentStatus brut.
    const s = String(payment?.status || '').toUpperCase();
    if (s === 'REJECTED') return 'rejected';
    if (!s) return 'pending';
    return 'pending';
  }

  getPaymentStatusLabel(status: PaymentStatus | undefined): string {
    const s = String(status || '').toUpperCase();
    if (s === 'WAITING_CONFIRMATION') return 'En attente';
    if (s === 'CONFIRMED') return 'Confirmée';
    if (s === 'IN_PREPARATION') return 'En préparation';
    if (s === 'SHIPPED') return 'Expédiée';
    if (s === 'DELIVERY_EFFECTED') return 'Livrée';
    if (s === 'REJECTED') return 'Annulée';
    if (!s) return '—';
    return s;
  }

  private toOrderDetailVM(raw: any, payment: OrderPayment | null): OrderDetail {
    const id = String(raw?._id || raw?.id || '');
    const createdAt = raw?.created_at ? new Date(raw.created_at) : new Date();
    const updatedAt = raw?.updated_at ? new Date(raw.updated_at) : undefined;
    const categoryValue = raw?.orderCategory?.value;
    const status = this.mapCategoryToStatus(categoryValue);
    const boutique = this.buildBoutiqueInfo(raw);

    const items: OrderItem[] = (Array.isArray(raw?.orderItems) ? raw.orderItems : [])
      .map((it: any): OrderItem | null => {
        const stock = it?.stock;
        const product = stock?.product;
        const productId = product?._id;
        const productName = product?.name || product?.title || product?.designation;
        const quantity = Number(it?.quantity || 0);
        const unitPrice = Number(it?.unit_price || 0);
        const promoPct = Number(it?.promotion_percentage || 0);
        const promoPrice = promoPct > 0 ? unitPrice * (1 - promoPct / 100) : undefined;
        if (!productId || !productName || !Number.isFinite(quantity) || quantity <= 0) return null;
        return {
          id: String(it?._id || ''),
          productId: String(productId),
          productName: String(productName),
          productImage: product?.image || undefined,
          quantity,
          price: unitPrice,
          promoPrice
        };
      })
      .filter((x: OrderItem | null): x is OrderItem => x !== null);

    return {
      id,
      orderNumber: id,
      date: createdAt,
      total: Number(raw?.total || 0),
      status,
      itemsCount: items.length,
      boutiqueName: boutique.boutiqueName,
      boutiqueId: boutique.boutiqueId,
      items,
      deliveryMethod: 'pickup',
      pickupLocation: boutique.boutiqueName !== '-' ? boutique.boutiqueName : undefined,
      estimatedDelivery: status === 'delivered' ? updatedAt : undefined,
      paymentMethod: this.mapPaymentMethod(payment),
      paymentStatus: String(payment?.status || '').toUpperCase()
    };
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.orderId.set(id);
      this.loadOrder(id);
    });
  }

  private loadOrder(id: string): void {
    this.loading.set(true);
    this.showOrderDetails.set(false);

    forkJoin({
      order: this.ordersService.getOrderByIdAny(id),
      payment: this.paymentService.getLatestPaymentForOrder(id).pipe(
        catchError(() => of(null))
      )
    })
      .pipe(
        catchError(() => of({ order: null, payment: null }))
      )
      .subscribe(({ order, payment }) => {
        this.order.set(order ? this.toOrderDetailVM(order, payment) : null);
        this.loading.set(false);
      });
  }

  toggleOrderDetails(): void {
    this.showOrderDetails.update((v) => !v);
  }

  giveReview(): void {
    const o = this.order();
    if (!o) return;

    this.router.navigate(['/acheteur/avis'], {
      queryParams: {
        orderId: o.id,
        shopId: o.boutiqueId || undefined,
        shopName: o.boutiqueName || undefined,
        orderDate: o.date?.toISOString?.() || undefined,
        type: 'shop'
      }
    });
  }

  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  formatDateShort(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
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

  getItemPrice(item: OrderItem): number {
    return item.promoPrice ?? item.price;
  }

  getItemSubtotal(item: OrderItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  downloadInvoice(): void {
    const orderId = this.orderId();
    if (!orderId) return;

    this.documentService.downloadInvoice(orderId).subscribe({
      next: (blob) => this.saveBlob(blob, `facture-${orderId}.pdf`),
      error: (err) => {
        console.error('Erreur téléchargement facture:', err);
      }
    });
  }

  downloadReceipt(): void {
    const orderId = this.orderId();
    if (!orderId) return;
    if (!this.isReceiptAvailable(this.order()?.paymentStatus)) return;

    this.documentService.downloadReceipt(orderId).subscribe({
      next: (blob) => this.saveBlob(blob, `recu-${orderId}.pdf`),
      error: (err) => {
        console.error('Erreur téléchargement reçu:', err);
      }
    });
  }

  isReceiptAvailable(status: PaymentStatus | undefined): boolean {
    const s = String(status || '').toUpperCase();
    return s === 'DELIVERY_EFFECTED' || s === 'CONFIRMED';
  }

  private saveBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
