import { ChangeDetectorRef, Component, signal  ,ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderStatisticService } from '../../../core/services/statistic/orderStatistic.service';
import { forkJoin } from 'rxjs';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


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

  @ViewChild('contentToConvert') contentToConvert!: ElementRef;

  public exportToPDF(): void {
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
      pdf.save(`${formattedDate}_dashboard_boutique.pdf`);
    });
  }
}
