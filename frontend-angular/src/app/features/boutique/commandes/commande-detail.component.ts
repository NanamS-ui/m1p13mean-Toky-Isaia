import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'refunded';
  notes: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: { status: OrderStatus; date: string; note?: string }[];
}

@Component({
  selector: 'app-commande-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './commande-detail.component.html',
  styleUrl: './commande-detail.component.css'
})
export class CommandeDetailComponent {
  order = signal<OrderDetail>({
    id: '1',
    orderNumber: 'CMD-2026-001',
    customer: {
      name: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      phone: '+261 34 12 345 67',
      address: 'Lot IVG 123, Analakely, Antananarivo 101, Madagascar'
    },
    items: [
      { productId: '1', productName: 'Robe été fleurie', productSku: 'ROB-001', quantity: 2, unitPrice: 59000, total: 118000 },
      { productId: '3', productName: 'T-shirt basic blanc', productSku: 'TSH-003', quantity: 1, unitPrice: 25000, total: 25000 }
    ],
    subtotal: 143000,
    shipping: 5000,
    discount: 0,
    total: 148000,
    status: 'confirmed',
    paymentMethod: 'Mobile Money (MVola)',
    paymentStatus: 'paid',
    notes: 'Livraison souhaitée en fin de journée si possible.',
    createdAt: '2026-01-29T14:30:00',
    updatedAt: '2026-01-29T15:00:00',
    statusHistory: [
      { status: 'pending', date: '2026-01-29T14:30:00', note: 'Commande reçue' },
      { status: 'confirmed', date: '2026-01-29T15:00:00', note: 'Paiement confirmé' }
    ]
  });

  statuses: { value: OrderStatus; label: string; icon: string }[] = [
    { value: 'pending', label: 'En attente', icon: 'hourglass_empty' },
    { value: 'confirmed', label: 'Confirmée', icon: 'check_circle' },
    { value: 'preparing', label: 'En préparation', icon: 'inventory_2' },
    { value: 'delivered', label: 'Livrée', icon: 'local_shipping' },
    { value: 'cancelled', label: 'Annulée', icon: 'cancel' }
  ];

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(new Date(dateStr));
  }

  formatShortDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: 'short',
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(new Date(dateStr));
  }

  getStatusInfo(status: OrderStatus) {
    return this.statuses.find(s => s.value === status) || this.statuses[0];
  }

  getStatusIndex(status: OrderStatus): number {
    const flow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'delivered'];
    return flow.indexOf(status);
  }

  updateStatus(newStatus: OrderStatus): void {
    const order = this.order();
    this.order.set({
      ...order,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...order.statusHistory,
        { status: newStatus, date: new Date().toISOString() }
      ]
    });
  }

  exportInvoice(): void {
    // Simuler l'export PDF
    console.log('Exporting invoice PDF...');
    alert('La facture a été téléchargée (simulation)');
  }

  exportReceipt(): void {
    // Simuler l'export du reçu
    console.log('Exporting receipt...');
    alert('Le reçu a été téléchargé (simulation)');
  }

  printOrder(): void {
    window.print();
  }
}
