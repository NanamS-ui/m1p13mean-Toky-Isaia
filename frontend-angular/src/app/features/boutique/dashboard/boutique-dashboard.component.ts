import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderStatisticService } from '../../../core/services/statistic/orderStatistic.service';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutique-dashboard.component.html',
  styleUrl: './boutique-dashboard.component.css'
})
export class BoutiqueDashboardComponent {
  now = new Date();
  statistiques : any;
  maxWeeklySales: number = 0;
  constructor(private orderStatService: OrderStatisticService, private cdr : ChangeDetectorRef){}
  ngOnInit(): void {
    forkJoin({
      statistiques : this.orderStatService.getBoutiqueDashboard()
    }).subscribe(({statistiques})=>{
      this.statistiques = statistiques;
      if (this.statistiques?.stats?.weeklyRevenue?.length) {
         this.maxWeeklySales = Math.max(...this.statistiques.stats.weeklyRevenue.map((d: { _id: string, revenue: number }) => d.revenue));
      } else {
        this.maxWeeklySales = 0;
      }
      this.cdr.detectChanges();
    })
  }

  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
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

  getBarHeight(value: number): number {
    return (value / this.maxWeeklySales) * 100;
  }
}
