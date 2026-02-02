import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-commandes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './commandes-list.component.html',
  styleUrl: './commandes-list.component.css'
})
export class CommandesListComponent {
  searchQuery = '';
  selectedStatus = '';
  dateRange = '';

  orders = signal<Order[]>([
    {
      id: '1',
      orderNumber: 'CMD-2026-001',
      customer: { name: 'Marie Dupont', email: 'marie@email.com', phone: '+261 34 12 345 67', address: 'Analakely, Antananarivo' },
      items: [
        { productId: '1', productName: 'Robe été fleurie', quantity: 2, price: 59000 },
        { productId: '3', productName: 'T-shirt basic blanc', quantity: 1, price: 25000 }
      ],
      total: 143000,
      status: 'pending',
      paymentMethod: 'Mobile Money',
      createdAt: '2026-01-29T14:30:00',
      updatedAt: '2026-01-29T14:30:00'
    },
    {
      id: '2',
      orderNumber: 'CMD-2026-002',
      customer: { name: 'Jean Martin', email: 'jean@email.com', phone: '+261 33 98 765 43', address: 'Ivandry, Antananarivo' },
      items: [
        { productId: '2', productName: 'Jean slim noir', quantity: 1, price: 89000 }
      ],
      total: 89000,
      status: 'confirmed',
      paymentMethod: 'Carte bancaire',
      createdAt: '2026-01-29T13:15:00',
      updatedAt: '2026-01-29T15:00:00'
    },
    {
      id: '3',
      orderNumber: 'CMD-2026-003',
      customer: { name: 'Sophie Bernard', email: 'sophie@email.com', phone: '+261 34 55 555 55', address: 'Ankorondrano, Antananarivo' },
      items: [
        { productId: '4', productName: 'Veste en cuir', quantity: 1, price: 320000 },
        { productId: '6', productName: 'Sac à main cuir', quantity: 1, price: 180000 }
      ],
      total: 500000,
      status: 'preparing',
      paymentMethod: 'Espèces',
      createdAt: '2026-01-29T11:45:00',
      updatedAt: '2026-01-29T14:00:00'
    },
    {
      id: '4',
      orderNumber: 'CMD-2026-004',
      customer: { name: 'Pierre Durand', email: 'pierre@email.com', phone: '+261 32 11 111 11', address: 'Ambohimanarina, Antananarivo' },
      items: [
        { productId: '3', productName: 'T-shirt basic blanc', quantity: 3, price: 25000 }
      ],
      total: 75000,
      status: 'delivered',
      paymentMethod: 'Mobile Money',
      createdAt: '2026-01-28T16:20:00',
      updatedAt: '2026-01-29T10:00:00'
    },
    {
      id: '5',
      orderNumber: 'CMD-2026-005',
      customer: { name: 'Claire Moreau', email: 'claire@email.com', phone: '+261 34 22 222 22', address: 'Talatamaty, Antananarivo' },
      items: [
        { productId: '5', productName: 'Sneakers urbaines', quantity: 2, price: 115000 }
      ],
      total: 230000,
      status: 'cancelled',
      paymentMethod: 'Carte bancaire',
      createdAt: '2026-01-28T10:00:00',
      updatedAt: '2026-01-28T12:00:00'
    }
  ]);

  statuses: { value: OrderStatus; label: string; icon: string }[] = [
    { value: 'pending', label: 'En attente', icon: 'hourglass_empty' },
    { value: 'confirmed', label: 'Confirmée', icon: 'check_circle' },
    { value: 'preparing', label: 'En préparation', icon: 'inventory_2' },
    { value: 'delivered', label: 'Livrée', icon: 'local_shipping' },
    { value: 'cancelled', label: 'Annulée', icon: 'cancel' }
  ];

  filteredOrders = computed(() => {
    let result = this.orders();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(o =>
        o.orderNumber.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus) {
      result = result.filter(o => o.status === this.selectedStatus);
    }

    return result;
  });

  stats = computed(() => {
    const all = this.orders();
    return {
      total: all.length,
      pending: all.filter(o => o.status === 'pending').length,
      processing: all.filter(o => ['confirmed', 'preparing'].includes(o.status)).length,
      delivered: all.filter(o => o.status === 'delivered').length,
      revenue: all.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
    };
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
  }

  getStatusInfo(status: OrderStatus) {
    return this.statuses.find(s => s.value === status) || this.statuses[0];
  }

  updateStatus(order: Order, newStatus: OrderStatus): void {
    this.orders.update(orders =>
      orders.map(o => o.id === order.id ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o)
    );
  }

  getNextStatus(current: OrderStatus): OrderStatus | null {
    const flow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivered'];
    const index = flow.indexOf(current);
    if (index >= 0 && index < flow.length - 1) {
      return flow[index + 1];
    }
    return null;
  }
}
