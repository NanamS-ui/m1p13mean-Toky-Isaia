import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OrderStatus, Order } from './mes-commandes.component';

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
  paymentStatus: 'paid' | 'pending' | 'refunded';
}

@Component({
  selector: 'app-commande-suivi',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commande-suivi.component.html',
  styleUrl: './commande-suivi.component.css'
})
export class CommandeSuiviComponent implements OnInit {
  // Mock order data
  private mockOrders: Record<string, OrderDetail> = {
    '1': {
      id: '1',
      orderNumber: 'CMD-2025-001',
      date: new Date('2025-01-15'),
      total: 234000,
      status: 'delivered',
      itemsCount: 3,
      boutiqueName: 'Mode & Style',
      boutiqueId: '1',
      items: [
        {
          id: '1',
          productId: '1',
          productName: 'Robe été fleurie',
          quantity: 2,
          price: 75000,
          promoPrice: 59000
        },
        {
          id: '2',
          productId: '8',
          productName: 'Sac à main cuir',
          quantity: 1,
          price: 180000,
          promoPrice: 140000
        }
      ],
      deliveryMethod: 'delivery',
      deliveryAddress: 'Lot II M 12, Antananarivo 101',
      estimatedDelivery: new Date('2025-01-18'),
      paymentMethod: 'Mobile Money',
      paymentStatus: 'paid'
    },
    '2': {
      id: '2',
      orderNumber: 'CMD-2025-002',
      date: new Date('2025-01-20'),
      total: 185000,
      status: 'shipped',
      itemsCount: 1,
      boutiqueName: 'TechZone',
      boutiqueId: '2',
      items: [
        {
          id: '1',
          productId: '2',
          productName: 'Casque Bluetooth Pro',
          quantity: 1,
          price: 185000
        }
      ],
      deliveryMethod: 'delivery',
      deliveryAddress: 'Lot II M 12, Antananarivo 101',
      estimatedDelivery: new Date('2025-02-05'),
      trackingNumber: 'TRK-2025-002-ABC',
      paymentMethod: 'Carte bancaire',
      paymentStatus: 'paid'
    },
    '3': {
      id: '3',
      orderNumber: 'CMD-2025-003',
      date: new Date('2025-01-25'),
      total: 590000,
      status: 'preparing',
      itemsCount: 4,
      boutiqueName: 'Mode & Style',
      boutiqueId: '1',
      items: [
        {
          id: '1',
          productId: '1',
          productName: 'Robe été fleurie',
          quantity: 3,
          price: 75000,
          promoPrice: 59000
        },
        {
          id: '2',
          productId: '5',
          productName: 'Montre connectée',
          quantity: 1,
          price: 250000,
          promoPrice: 199000
        }
      ],
      deliveryMethod: 'pickup',
      pickupLocation: 'Boutique Mode & Style - KORUS Center',
      estimatedDelivery: new Date('2025-02-01'),
      paymentMethod: 'Mobile Money',
      paymentStatus: 'paid'
    }
  };

  orderId = signal<string>('');
  order = signal<OrderDetail | null>(null);
  loading = signal<boolean>(true);

  // Timeline steps
  timelineSteps = computed<OrderTimelineStep[]>(() => {
    const currentOrder = this.order();
    if (!currentOrder) return [];

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

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.orderId.set(id);
      this.loadOrder(id);
    });
  }

  private loadOrder(id: string): void {
    this.loading.set(true);
    
    // Simulate API call
    setTimeout(() => {
      const order = this.mockOrders[id] || null;
      this.order.set(order);
      this.loading.set(false);
    }, 300);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      maximumFractionDigits: 0
    }).format(value);
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
    // TODO: Implement invoice download
    console.log('Download invoice for order:', this.orderId());
  }

  downloadReceipt(): void {
    // TODO: Implement receipt download
    console.log('Download receipt for order:', this.orderId());
  }
}
