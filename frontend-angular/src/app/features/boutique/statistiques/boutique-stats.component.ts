import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderStatisticService } from '../../../core/services/statistic/orderStatistic.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  stock: number;
}

interface LowPerformer {
  name: string;
  sales: number;
  views: number;
  conversionRate: number;
}

@Component({
  selector: 'app-boutique-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './boutique-stats.component.html',
  styleUrl: './boutique-stats.component.css',
})
export class BoutiqueStatsComponent {
  activePeriod = signal<'day' | 'week' | 'month' | 'year'>('month');
  statistiques: any;
  startDate!: string;
  endDate!: string;
  constructor(private orderStatService: OrderStatisticService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.startDate = '';
    this.endDate = '';
    this.applyPeriod();
  }
  applyPeriod(): void {
    forkJoin({
      statistiques: this.orderStatService.getBoutiqueStatistique(this.startDate, this.endDate),
    }).subscribe(({ statistiques }) => {
      this.statistiques = statistiques;
      console.log(statistiques);
      this.cdr.detectChanges();
    });
  }
  getBarHeight2(value: number): number {
    const max = Math.max(
      ...(this.statistiques?.stats?.revenueParMois?.caParMois ?? []).map((c: any) => c.CA)
    );
    return (value / max) * 100;
  }
  getMois(value: number): string {
    const mois = [
      '',
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];

    return mois[value] ?? '';
  }
  // KPIs
  kpis = signal({
    totalRevenue: 3850000,
    totalOrders: 87,
    avgOrderValue: 44250,
    conversionRate: 3.2,
    cartAbandonRate: 24.5,
    returnsRate: 2.1,
  });

  // Daily sales for chart
  dailySales = signal<SalesData[]>([
    { period: '23 Jan', revenue: 180000, orders: 4, avgOrderValue: 45000 },
    { period: '24 Jan', revenue: 220000, orders: 5, avgOrderValue: 44000 },
    { period: '25 Jan', revenue: 195000, orders: 4, avgOrderValue: 48750 },
    { period: '26 Jan', revenue: 280000, orders: 6, avgOrderValue: 46667 },
    { period: '27 Jan', revenue: 350000, orders: 8, avgOrderValue: 43750 },
    { period: '28 Jan', revenue: 420000, orders: 9, avgOrderValue: 46667 },
    { period: '29 Jan', revenue: 245000, orders: 5, avgOrderValue: 49000 },
  ]);

  maxDailyRevenue = Math.max(...this.dailySales().map((d) => d.revenue));

  // Top products
  topProducts = signal<TopProduct[]>([
    { name: 'Robe été fleurie', sales: 45, revenue: 2655000, stock: 15 },
    { name: 'Jean slim noir', sales: 38, revenue: 3382000, stock: 8 },
    { name: 'T-shirt basic blanc', sales: 62, revenue: 1550000, stock: 50 },
    { name: 'Veste en cuir', sales: 12, revenue: 3840000, stock: 3 },
    { name: 'Sneakers urbaines', sales: 28, revenue: 3220000, stock: 0 },
  ]);

  // Low performers
  lowPerformers = signal<LowPerformer[]>([
    { name: 'Ceinture tressée', sales: 2, views: 156, conversionRate: 1.3 },
    { name: 'Chapeau panama', sales: 3, views: 89, conversionRate: 3.4 },
    { name: 'Écharpe laine', sales: 1, views: 67, conversionRate: 1.5 },
  ]);

  // Promotion stats
  promoStats = signal({
    activePromos: 3,
    totalDiscounted: 1250000,
    promoOrders: 24,
    avgPromoDiscount: 15,
  });

  setPeriod(period: 'day' | 'week' | 'month' | 'year'): void {
    this.activePeriod.set(period);
  }

  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
  }

  getBarHeight(value: number): number {
    return (value / this.maxDailyRevenue) * 100;
  }

  exportPDF(): void {
    console.log('Exporting PDF...');
    alert('Export PDF (simulation)');
  }

  exportExcel(): void {
    console.log('Exporting Excel...');
    alert('Export Excel (simulation)');
  }
}
