import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../core/services/order/order.service';
import { forkJoin } from 'rxjs';
import { Order } from '../../../core/models/order/order.model';
import { OrderCategory } from '../../../core/models/order/order-category.model';
import { OrderCategoryService } from '../../../core/services/order/orderCategory.service';
type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
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
  ordersApi : Order[] = [];
  orderCategories : OrderCategory[]=[]; 
  constructor(private orderService : OrdersService, private cdr : ChangeDetectorRef,
    private orderCategoryService : OrderCategoryService
  ){}
  ngOnInit(): void {
    forkJoin({
      orders : this.orderService.getBoutiqueStatistique(),
      orderCategory : this.orderCategoryService.getOrderCategorys()
    }).subscribe(({orders,orderCategory })=>{
        this.ordersApi = orders;
        this.orderCategories = orderCategory;
        this.cdr.detectChanges();
    })
    
  }

  statuses: { value: string; label: string; icon: string }[] = [
  { value: 'En attente', label: 'En attente', icon: 'hourglass_empty' },
  { value: 'Confirmée', label: 'Confirmée', icon: 'check_circle' },
  { value: 'En préparation', label: 'En préparation', icon: 'inventory_2' },
  { value: 'Livrée', label: 'Livrée', icon: 'local_shipping' },
  { value: 'Annulée', label: 'Annulée', icon: 'cancel' }
];


  get filteredOrders(): Order[] {
    let result = this.ordersApi;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(o =>
        o._id?.toLowerCase().includes(query) ||
        o.buyer.firstName.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatus) {
      result = result.filter(o => o.orderCategory.value === this.selectedStatus);
    }

    return result;
  }

  get stats() {
    const all = this.ordersApi;
    return {
      total: all.length,
      pending: all.filter(o => o.orderCategory.value === 'En attente').length,
      processing: all.filter(o => ['Confirmée', 'En préparation'].includes(o.orderCategory.value)).length,
      delivered: all.filter(o => o.orderCategory.value === 'Livrée').length,
      revenue: all
        .filter(o => o.orderCategory.value === 'Livrée')
        .reduce((sum, o) => sum + o.total, 0)
    };
  }


  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
  }

  formatDate(date?: string | Date): string {
    if (!date) return '-';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-'; // sécurité
    
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  }


  

  getStatusInfo(status: string) {
    return this.statuses.find(s => s.value === status) || this.statuses[0];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'En attente': 'pending',
      'Confirmée': 'confirmed',
      'En préparation': 'preparing',
      'Livrée': 'delivered',
      'Annulée': 'cancelled'
    };
    const label = labels[status] || status;
    return label
  }
  updateStatus(orderId: string, newStatus: string): void {

    const category = this.orderCategories.find(o => o.value === newStatus);
    if (!category) return;

    const order = this.ordersApi.find(o => o._id === orderId);
    if (!order) return;

    this.orderService.updateOrder(orderId, {
      orderCategory: category._id
    }).subscribe({
      next: () => {
        this.ordersApi = this.ordersApi.map(o =>
          o._id === orderId
            ? { ...o, orderCategory: category }
            : o
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde', err);
      }
    });
  }


  getNextStatus(current: string): string | null {
    const flow: string[] = ['En attente', 'Confirmée', 'En préparation', 'Livrée'];
    const index = flow.indexOf(current);
    if (index >= 0 && index < flow.length - 1) {
      return flow[index + 1];
    }
    return null;
  }

}
