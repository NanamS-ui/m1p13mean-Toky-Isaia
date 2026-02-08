import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'completed';
type ReturnReason = 'defect' | 'wrong_size' | 'not_as_described' | 'changed_mind' | 'other';

interface Return {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  quantity: number;
  amount: number;
  reason: ReturnReason;
  reasonDetail?: string;
  status: ReturnStatus;
  requestDate: string;
  images?: string[];
}

@Component({
  selector: 'app-retours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './retours.component.html',
  styleUrl: './retours.component.css'
})
export class RetoursComponent {
  filterStatus = '';
  
  returns = signal<Return[]>([
    {
      id: '1',
      orderNumber: 'CMD-2026-003',
      customer: 'Sophie Bernard',
      product: 'Sneakers urbaines',
      quantity: 1,
      amount: 115000,
      reason: 'defect',
      reasonDetail: 'Les semelles se sont décollées après 2 semaines d\'utilisation.',
      status: 'pending',
      requestDate: '2026-01-28'
    },
    {
      id: '2',
      orderNumber: 'CMD-2026-008',
      customer: 'Marc Leroy',
      product: 'T-shirt basic blanc',
      quantity: 2,
      amount: 50000,
      reason: 'wrong_size',
      reasonDetail: 'Taille trop petite, j\'aurais dû prendre un L.',
      status: 'approved',
      requestDate: '2026-01-26'
    },
    {
      id: '3',
      orderNumber: 'CMD-2026-005',
      customer: 'Claire Moreau',
      product: 'Veste en cuir',
      quantity: 1,
      amount: 320000,
      reason: 'not_as_described',
      reasonDetail: 'La couleur ne correspond pas à la photo du site.',
      status: 'refunded',
      requestDate: '2026-01-20'
    },
    {
      id: '4',
      orderNumber: 'CMD-2026-001',
      customer: 'Paul Girard',
      product: 'Jean slim noir',
      quantity: 1,
      amount: 89000,
      reason: 'changed_mind',
      status: 'rejected',
      requestDate: '2026-01-15'
    }
  ]);

  statuses: { value: ReturnStatus; label: string; icon: string }[] = [
    { value: 'pending', label: 'En attente', icon: 'hourglass_empty' },
    { value: 'approved', label: 'Approuvé', icon: 'check_circle' },
    { value: 'rejected', label: 'Refusé', icon: 'cancel' },
    { value: 'refunded', label: 'Remboursé', icon: 'payments' },
    { value: 'completed', label: 'Terminé', icon: 'task_alt' }
  ];

  reasons: { value: ReturnReason; label: string }[] = [
    { value: 'defect', label: 'Produit défectueux' },
    { value: 'wrong_size', label: 'Mauvaise taille' },
    { value: 'not_as_described', label: 'Non conforme' },
    { value: 'changed_mind', label: 'Changement d\'avis' },
    { value: 'other', label: 'Autre' }
  ];

  filteredReturns = computed(() => {
    if (!this.filterStatus) return this.returns();
    return this.returns().filter(r => r.status === this.filterStatus);
  });

  stats = computed(() => {
    const all = this.returns();
    return {
      total: all.length,
      pending: all.filter(r => r.status === 'pending').length,
      refundedTotal: all.filter(r => r.status === 'refunded').reduce((sum, r) => sum + r.amount, 0)
    };
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));
  }

  getStatusInfo(status: ReturnStatus) {
    return this.statuses.find(s => s.value === status) || this.statuses[0];
  }

  getReasonLabel(reason: ReturnReason): string {
    return this.reasons.find(r => r.value === reason)?.label || reason;
  }

  updateStatus(ret: Return, newStatus: ReturnStatus): void {
    this.returns.update(returns =>
      returns.map(r => r.id === ret.id ? { ...r, status: newStatus } : r)
    );
  }
}
