import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface StatCard {
  label: string;
  value: string | number;
  trend?: string;
  icon: string;
  link?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent {
  stats: StatCard[] = [
    { label: 'Boutiques actives', value: 42, trend: '+3 ce mois', icon: 'store', link: '/admin/boutiques' },
    { label: 'Chiffre d\'affaires global', value: '125 M Ar', trend: '+12 %', icon: 'trending_up', link: '/admin/statistiques' },
    { label: 'Taux d\'occupation', value: '94 %', trend: 'Stable', icon: 'pie_chart', link: '/admin/statistiques' },
    { label: 'Acheteurs inscrits', value: '12 450', trend: '+8 %', icon: 'people', link: '/admin/utilisateurs' }
  ];

  recentAlerts = [
    { type: 'warning', message: 'Boutique "TechZone" : baisse des ventes (-15 % ce mois)' },
    { type: 'success', message: 'Produit "Écouteurs X1" en surperformance (+45 % ventes)' },
    { type: 'info', message: 'Pic de trafic détecté hier 18h-20h' }
  ];

  /** Données pour le graphique barres CA (6 derniers mois) */
  chartData = [
    { month: 'Août', value: 18 },
    { month: 'Sept', value: 22 },
    { month: 'Oct', value: 19 },
    { month: 'Nov', value: 25 },
    { month: 'Déc', value: 28 },
    { month: 'Jan', value: 32 }
  ];

  maxChartValue = 32;
}
