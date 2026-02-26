import { Component, OnInit, inject, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NumberFormatPipe } from './number-format.pipe';
import { AdminStatisticsService } from '../../../core/services/statistic/adminStatistics.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-statistics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NumberFormatPipe],
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.css']
})
export class StatisticsDashboardComponent implements OnInit {
  kpiList: any[] = [];
  categoryData: any[] = [];
  boutiqueBars: any[] = [];
  maxBoutiqueValue = 0;
  private adminStatsService = inject(AdminStatisticsService);
  private cdr = inject(ChangeDetectorRef);
  startDate: string | null = null;
  endDate: string | null = null;

  @ViewChild('contentToConvert') contentToConvert!: ElementRef;

  ngOnInit(): void {
    const todayStr = this.formatDateLocal(new Date());
    this.startDate = todayStr;
    this.endDate = todayStr;
    this.fetchStats();
  }

  fetchStats(): void {
    this.adminStatsService.getAdminStatistics(this.startDate || undefined, this.endDate || undefined)
      .subscribe((stats: any) => {
        this.applyStats(stats);
        this.cdr.detectChanges();
      });
  }

  exportExcel(): void {
    const startDate = this.startDate || undefined;
    const endDate = this.endDate || undefined;

    const safeStart = startDate || 'all';
    const safeEnd = endDate || 'now';
    const filename = `statistiques-centre_${safeStart}_${safeEnd}.xlsx`;

    this.adminStatsService.exportAdminStatisticsExcel(startDate, endDate).subscribe({
      next: (blob) => this.saveBlob(blob, filename),
      error: (err) => {
        console.error("Erreur export Excel statistiques:", err);
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

      pdf.save(`${formattedDate}_statistique_centre.pdf`);
    });
  }

  resetFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.fetchStats();
  }

  private formatDateLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private applyStats(stats: any) {
    this.kpiList = [
      { label: 'Nombre de boutiques actives', value: stats.totalBoutiques, icon: 'store' },
      { label: 'Nombre d\'utilisateurs', value: stats.totalUsers, icon: 'person' },
      { label: 'Nombre de commandes', value: stats.totalCommandes, icon: 'shopping_cart' },
      { label: 'CA total 12 derniers mois', value: stats.CA12LastMonths?.total12Months || 0, icon: 'payments' },
      { label: 'CA ce mois', value: stats.CAMonthandGrowth?.caCurrentMonth || 0, icon: 'trending_up' },
      { label: 'CA mois précédent', value: stats.CAMonthandGrowth?.caPrevMonth || 0, icon: 'show_chart' },
      { label: 'Croissance mensuelle', value: stats.CAMonthandGrowth?.growthRatePercent ? stats.CAMonthandGrowth.growthRatePercent.toFixed(2) + ' %' : 'N/A', icon: 'trending_up' }
    ];
    this.categoryData = (stats.CAShopAndCategory?.topShopCategory || []).map((cat: any) => ({
      label: cat.shopCategoryName,
      value: cat.totalCA,
      color: this.getRandomColor()
    }));
    this.boutiqueBars = (stats.CAShopAndCategory?.topBoutique || []).map((b: any) => ({
      name: b.shopName,
      value: b.totalCA
    }));
    this.maxBoutiqueValue = Math.max(...this.boutiqueBars.map((b: any) => b.value), 0);
  }

  getDonutGradient(): string {
    if (!this.categoryData || this.categoryData.length === 0) return '';
    let acc = 0;
    const total = this.categoryData.reduce((sum: number, s: any) => sum + s.value, 0) || 1;
    const parts = this.categoryData.map((s: any) => {
      const start = (acc / total) * 100;
      acc += s.value;
      const end = (acc / total) * 100;
      return `${s.color} ${start}% ${end}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }

  getRandomColor(): string {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#6366f1', '#a21caf', '#db2777', '#f472b6'];
    return colors[Math.floor(Math.random() * colors.length)];
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
