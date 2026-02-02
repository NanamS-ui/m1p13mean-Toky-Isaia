import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-commandes.component.html',
  styleUrl: './mes-commandes.component.css'
})
export class MesCommandesComponent {
  // Mock orders data
  private allOrders = signal<Order[]>([
    {
      id: '1',
      orderNumber: 'CMD-2025-001',
      date: new Date('2025-01-15'),
      total: 234000,
      status: 'delivered',
      itemsCount: 3,
      boutiqueName: 'Mode & Style',
      boutiqueId: '1'
    },
    {
      id: '2',
      orderNumber: 'CMD-2025-002',
      date: new Date('2025-01-20'),
      total: 185000,
      status: 'shipped',
      itemsCount: 1,
      boutiqueName: 'TechZone',
      boutiqueId: '2'
    },
    {
      id: '3',
      orderNumber: 'CMD-2025-003',
      date: new Date('2025-01-25'),
      total: 590000,
      status: 'preparing',
      itemsCount: 4,
      boutiqueName: 'Mode & Style',
      boutiqueId: '1'
    },
    {
      id: '4',
      orderNumber: 'CMD-2025-004',
      date: new Date('2025-01-28'),
      total: 199000,
      status: 'confirmed',
      itemsCount: 1,
      boutiqueName: 'TechZone',
      boutiqueId: '2'
    },
    {
      id: '5',
      orderNumber: 'CMD-2025-005',
      date: new Date('2025-01-30'),
      total: 140000,
      status: 'pending',
      itemsCount: 2,
      boutiqueName: 'Mode & Style',
      boutiqueId: '1'
    },
    {
      id: '6',
      orderNumber: 'CMD-2024-098',
      date: new Date('2024-12-10'),
      total: 320000,
      status: 'cancelled',
      itemsCount: 2,
      boutiqueName: 'TechZone',
      boutiqueId: '2'
    }
  ]);

  selectedStatus = signal<OrderStatus | 'all'>('all');
  searchQuery = signal<string>('');

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

  // Status options
  statusOptions: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'preparing', label: 'En préparation' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' }
  ];

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
}
