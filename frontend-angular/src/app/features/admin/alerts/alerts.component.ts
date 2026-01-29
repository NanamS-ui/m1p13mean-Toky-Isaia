import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AlertItem {
  type: 'warning' | 'danger' | 'success' | 'info';
  title: string;
  description: string;
  date: string;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent {
  alerts: AlertItem[] = [
    { type: 'warning', title: 'Boutique à risque', description: 'Betsaka avis négatif amin\'ny clients (TechZone : 15 avis négatifs ce mois)', date: '2025-01-28' },
    { type: 'danger', title: 'Baisse soudaine des ventes', description: 'Fashion House : -25 % CA sur les 7 derniers jours', date: '2025-01-27' },
    { type: 'info', title: 'Explosion trafic', description: 'Pic de trafic détecté hier 18h-20h (+180 % vs moyenne)', date: '2025-01-27' },
    { type: 'danger', title: 'Paiement échoué', description: '3 paiements échoués (carte refusée) — alerte boutique Sport Pro', date: '2025-01-26' },
    { type: 'warning', title: 'Avis négatifs', description: 'Beauté & Soins : 8 nouveaux avis < 3 étoiles cette semaine', date: '2025-01-26' },
    { type: 'success', title: 'Produit surperformant', description: 'Écouteurs X1 (TechZone) : +45 % ventes vs mois précédent', date: '2025-01-25' },
    { type: 'warning', title: 'Pic d\'abandon panier', description: 'Taux d\'abandon panier à 72 % hier (moyenne 58 %)', date: '2025-01-25' },
    { type: 'info', title: 'Inactivité prolongée', description: '12 boutiques sans connexion depuis plus de 7 jours', date: '2025-01-24' }
  ];
}
