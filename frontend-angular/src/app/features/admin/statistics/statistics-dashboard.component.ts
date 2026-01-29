import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-statistics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './statistics-dashboard.component.html',
  styleUrl: './statistics-dashboard.component.css'
})
export class StatisticsDashboardComponent {
  kpiList = [
    { label: 'Nombre de boutiques actives', value: '42', icon: 'store' },
    { label: 'Chiffre d\'affaires global', value: '125 M Ar', icon: 'payments' },
    { label: 'Produits les plus vendus', value: 'Rapport détaillé', icon: 'inventory' },
    { label: 'CA total du centre', value: '98 M Ar (mois)', icon: 'trending_up' },
    { label: 'CA par boutique', value: 'Voir tableau', icon: 'table_chart' },
    { label: 'Taux d\'occupation du centre', value: '94 %', icon: 'pie_chart' },
    { label: 'Taux de croissance mensuel', value: '+12 %', icon: 'show_chart' },
    { label: 'Boutiques les plus rentables', value: 'Top 5', icon: 'emoji_events' },
    { label: 'Boutiques en difficulté', value: '2 alertes', icon: 'warning' }
  ];

  /** CA par catégorie pour le graphique donut */
  categoryData = [
    { label: 'Mode', value: 45, color: '#f59e0b' },
    { label: 'Food', value: 28, color: '#10b981' },
    { label: 'Tech', value: 27, color: '#3b82f6' }
  ];

  /** Barres pour CA par boutique (top 6) */
  boutiqueBars = [
    { name: 'Fashion House', value: 28 },
    { name: 'TechZone', value: 22 },
    { name: 'Food Court', value: 18 },
    { name: 'Beauté & Soins', value: 12 },
    { name: 'Sport Pro', value: 8 },
    { name: 'Autres', value: 12 }
  ];
  maxBoutiqueValue = 28;

  getDonutGradient(): string {
    let acc = 0;
    const parts = this.categoryData.map(s => {
      const start = acc;
      acc += s.value;
      return `${s.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }
}
