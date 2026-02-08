import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface DashboardStats {
  todaySales: number;
  monthSales: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  averageOrderValue: number;
  conversionRate: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

interface TopProduct {
  id: string;
  name: string;
  image: string;
  sales: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutique-dashboard.component.html',
  styleUrl: './boutique-dashboard.component.css'
})
export class BoutiqueDashboardComponent {
  stats = signal<DashboardStats>({
    todaySales: 245000,
    monthSales: 3850000,
    pendingOrders: 12,
    totalProducts: 156,
    lowStockProducts: 8,
    averageOrderValue: 45000,
    conversionRate: 3.2
  });

  recentOrders = signal<RecentOrder[]>([
    { id: 'CMD-001', customer: 'Marie Dupont', amount: 125000, status: 'pending', date: '2026-01-29 14:30', items: 3 },
    { id: 'CMD-002', customer: 'Jean Martin', amount: 89000, status: 'confirmed', date: '2026-01-29 13:15', items: 2 },
    { id: 'CMD-003', customer: 'Sophie Bernard', amount: 210000, status: 'preparing', date: '2026-01-29 11:45', items: 5 },
    { id: 'CMD-004', customer: 'Pierre Durand', amount: 65000, status: 'delivered', date: '2026-01-28 16:20', items: 1 },
    { id: 'CMD-005', customer: 'Claire Moreau', amount: 178000, status: 'cancelled', date: '2026-01-28 10:00', items: 4 }
  ]);

  topProducts = signal<TopProduct[]>([
    { id: '1', name: 'Robe été fleurie', image: '', sales: 45, revenue: 2250000, trend: 'up' },
    { id: '2', name: 'Jean slim noir', image: '', sales: 38, revenue: 1900000, trend: 'up' },
    { id: '3', name: 'T-shirt basic blanc', image: '', sales: 62, revenue: 930000, trend: 'stable' },
    { id: '4', name: 'Veste en cuir', image: '', sales: 12, revenue: 1440000, trend: 'down' },
    { id: '5', name: 'Sneakers urbaines', image: '', sales: 28, revenue: 1680000, trend: 'up' }
  ]);

  // Chart data (mock)
  weeklyData = [
    { day: 'Lun', sales: 180000 },
    { day: 'Mar', sales: 220000 },
    { day: 'Mer', sales: 195000 },
    { day: 'Jeu', sales: 280000 },
    { day: 'Ven', sales: 350000 },
    { day: 'Sam', sales: 420000 },
    { day: 'Dim', sales: 165000 }
  ];

  maxWeeklySales = Math.max(...this.weeklyData.map(d => d.sales));

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'confirmed': 'Confirmée',
      'preparing': 'En préparation',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  getBarHeight(value: number): number {
    return (value / this.maxWeeklySales) * 100;
  }
}
