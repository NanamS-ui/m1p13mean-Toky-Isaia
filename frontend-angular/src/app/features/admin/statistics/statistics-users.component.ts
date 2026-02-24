import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminStatisticsService } from '../../../core/services/statistic/adminStatistics.service';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-statistics-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './statistics-users.component.html',
  styleUrl: './statistics-users.component.css',
})
export class StatisticsUsersComponent {
  statisticUtilisateur: any;
  startDate!: string;
  endDate!: string;
  userStats: any;
  hourlyActiveUsers: { hour: string; activeUsers: number }[] = [];
  constructor(
    private adminStatisticService: AdminStatisticsService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.startDate = '';
    this.endDate = '';
    this.loadData();
  }
  loadData(): void {
    this.adminStatisticService
      .getAdminUserStatistics(this.startDate, this.endDate)
      .subscribe((data) => {
        this.statisticUtilisateur = data;
        this.hourlyActiveUsers = data.hourlyActiveUsers;
        this.appliStat(data);
        this.cdr.detectChanges();
      });
  }
  onDateChange(): void {
    this.loadData();
  }
  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.loadData();
  }
  appliStat(data: any): void {
    this.userStats = [
      {
        label: "Temps moyen sur l'application",
        value: data.moyenneMensuelleGlobale + ' min / mois /utilisateurs',
      },
      { label: "Nombre d'acheteurs", value: data.orderStats.totalUsers + ' acheteurs' },
      { label: 'Nombre total de commandes', value: data.orderStats.totalOrders + ' commandes' },
      {
        label: 'Total commandes',
        value:
          this.currencyFormatter.format(data.orderStats.totalSpentAll).replace(/\u202F/g, ' ') +
          ' MGA',
      },
      {
        label: 'Panier moyen',
        value:
          this.currencyFormatter.format(data.orderStats.avgOrderTotal).replace(/\u202F/g, ' ') +
          ' MGA',
      },
      // { label: "Fréquence d'achat", value: '2,3 achats / mois / user' },
      // { label: "Heure de pic d'activité", value: '18h - 20h' },
      // { label: 'Zones les plus fréquentées', value: 'Mode, Food court' },
      // { label: 'Recherche sans résultat', value: '12 % des recherches' },
    ];
  }
  currencyFormatter = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  getMaxActiveUsers(): number {
    return Math.max(...this.hourlyActiveUsers.map((h) => h.activeUsers), 1);
  }
  getHeightPercent(value: number): number {
    const max = this.getMaxActiveUsers();
    return (value / max) * 100;
  }
  getPeakHour(): string {
    if (!this.hourlyActiveUsers.length) return '';

    const max = this.getMaxActiveUsers();
    const peakHours = this.hourlyActiveUsers
      .filter((h) => h.activeUsers === max)
      .map((h) => h.hour);

    return peakHours.join(' – ');
  }
  @ViewChild('contentToConvert') contentToConvert!: ElementRef;
  exportPDF(): void {
    const data = this.contentToConvert.nativeElement;

    html2canvas(data, { scale: 2 }).then(canvas => {
      
      const now = new Date();
      const formattedDate = 
        now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + '_' +
        String(now.getHours()).padStart(2, '0') + '-' +
        String(now.getMinutes()).padStart(2, '0');

      
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      
      const pageWidth = 297; 
      const pageHeight = 210; 
      
      
      const padding = 15; 
      
      
      const maxImgWidth = pageWidth - (padding * 2);
      const maxImgHeight = pageHeight - (padding * 2);

      
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
      pdf.save(`${formattedDate}_statistique_utilisateur.pdf`);
    });
  }
}
