import { Component, OnInit, inject, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminStatisticsService } from '../../../core/services/statistic/adminStatistics.service';
import { retry, timer } from 'rxjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StatCard {
  label: string;
  value: string | number;
  trend?: string;
  icon: string;
  link?: string;
}

type AdminDashboardApi = {
  totalUsers?: number;
  totalBoutiques?: number;
  totalCommandes?: number;
  CA12LastMonths?: { total12Months?: number };
  CAParMois12DernierMois?: Array<{ _id: string; total: number }>;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  private adminStatsService = inject(AdminStatisticsService);
  private cdr = inject(ChangeDetectorRef);

  startDate: string | null = null;
  endDate: string | null = null;

  @ViewChild('contentToConvert') contentToConvert!: ElementRef;

  stats: StatCard[] = [
    { label: 'Boutiques actives', value: '—', icon: 'store', link: '/admin/boutiques' },
    { label: 'Utilisateurs inscrits', value: '—', icon: 'people', link: '/admin/utilisateurs' },
    { label: 'Commandes', value: '—', icon: 'shopping_cart', link: '/admin/statistiques' },
    { label: "CA total (12 derniers mois)", value: '—', icon: 'trending_up', link: '/admin/statistiques' }
  ];

  recentAlerts = [
    { type: 'warning', message: 'Boutique "TechZone" : baisse des ventes (-15 % ce mois)' },
    { type: 'success', message: 'Produit "Écouteurs X1" en surperformance (+45 % ventes)' },
    { type: 'info', message: 'Pic de trafic détecté hier 18h-20h' }
  ];

  trackByAlertMessage(_index: number, alert: { message: string }): string {
    return alert.message;
  }

  /** Données pour le graphique barres CA (6 derniers mois) */
  chartData: Array<{ month: string; value: number }> = [];
  maxChartValue = 1;

  ngOnInit(): void {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.startDate = this.formatDateLocal(startOfMonth);
    this.endDate = this.formatDateLocal(today);
    this.fetchDashboard();
  }

  fetchDashboard(): void {
    this.adminStatsService
      .getAdminDashboard(this.startDate || undefined, this.endDate || undefined)
      .pipe(
        // Comportement voulu: comme la page statistiques (chargement auto).
        // En pratique, le premier appel peut échouer si l'API ou l'auth n'est pas encore prête;
        // on retente brièvement pour éviter d'obliger l'utilisateur à cliquer sur "Appliquer".
        retry({
          count: 5,
          delay: (_err, retryCount) => timer(500 * retryCount)
        })
      )
      .subscribe({
        next: (data: AdminDashboardApi) => {
          this.applyDashboard(data);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur chargement dashboard admin:', err);
        }
      });
  }

  exportExcel(): void {
    const startDate = this.startDate || undefined;
    const endDate = this.endDate || undefined;

    const safeStart = startDate || 'all';
    const safeEnd = endDate || 'now';
    const filename = `dashboard-centre_${safeStart}_${safeEnd}.xlsx`;

    this.adminStatsService.exportAdminDashboardExcel(startDate, endDate).subscribe({
      next: (blob) => this.saveBlob(blob, filename),
      error: (err) => {
        console.error('Erreur export Excel dashboard:', err);
      }
    });
  }

  exportPDF(): void {
    const data = this.contentToConvert?.nativeElement;
    if (!data) return;

    html2canvas(data, { scale: 2 }).then((canvas) => {
      const now = new Date();
      const formattedDate =
        now.getFullYear() +
        '-' +
        String(now.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(now.getDate()).padStart(2, '0') +
        '_' +
        String(now.getHours()).padStart(2, '0') +
        '-' +
        String(now.getMinutes()).padStart(2, '0');

      const pdf = new jsPDF('l', 'mm', 'a4');

      const pageWidth = 297;
      const pageHeight = 210;

      const padding = 15;

      const maxImgWidth = pageWidth - padding * 2;
      const maxImgHeight = pageHeight - padding * 2;

      const ratio = canvas.width / canvas.height;

      let imgWidth = maxImgWidth;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > maxImgHeight) {
        imgHeight = maxImgHeight;
        imgWidth = imgHeight * ratio;
      }

      const xOffset = padding + (maxImgWidth - imgWidth) / 2;
      const yOffset = padding + (maxImgHeight - imgHeight) / 2;

      const contentDataURL = canvas.toDataURL('image/png');
      pdf.addImage(contentDataURL, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

      pdf.save(`${formattedDate}_dashboard_centre.pdf`);
    });
  }

  private applyDashboard(data: AdminDashboardApi): void {
    const totalBoutiques = Number(data?.totalBoutiques ?? 0);
    const totalUsers = Number(data?.totalUsers ?? 0);
    const totalCommandes = Number(data?.totalCommandes ?? 0);
    const caTotal = Number(data?.CA12LastMonths?.total12Months ?? 0);

    const caMillions = caTotal / 1_000_000;
    const caValue = `${this.formatNumber(caMillions, 2)} M Ar`;

    this.stats = [
      { label: 'Boutiques actives', value: this.formatNumber(totalBoutiques, 0), icon: 'store', link: '/admin/boutiques' },
      { label: 'Utilisateurs inscrits', value: this.formatNumber(totalUsers, 0), icon: 'people', link: '/admin/utilisateurs' },
      { label: 'Commandes', value: this.formatNumber(totalCommandes, 0), icon: 'shopping_cart', link: '/admin/statistiques' },
      { label: 'CA total (12 derniers mois)', value: caValue, icon: 'trending_up', link: '/admin/statistiques' }
    ];

    const series = Array.isArray(data?.CAParMois12DernierMois) ? data.CAParMois12DernierMois : [];
    const last6 = series.slice(-6);
    this.chartData = last6
      .map((m) => {
        const total = Number(m?.total ?? 0);
        return {
          month: this.formatYearMonthToShortLabel(String(m?._id || '')),
          value: Number((total / 1_000_000).toFixed(2))
        };
      })
      .filter((x) => Boolean(x.month));

    this.maxChartValue = Math.max(...this.chartData.map((b) => b.value), 1);
  }

  private formatYearMonthToShortLabel(yearMonth: string): string {
    // attendu: YYYY-MM
    const parts = yearMonth.split('-');
    if (parts.length !== 2) return '';
    const monthIndex = Number(parts[1]);
    if (!Number.isFinite(monthIndex) || monthIndex < 1 || monthIndex > 12) return '';
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
    return months[monthIndex - 1];
  }

  private formatNumber(value: number, decimals: number): string {
    if (!Number.isFinite(value)) return '0';
    return value.toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
