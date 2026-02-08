import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-statistics-users',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './statistics-users.component.html',
  styleUrl: './statistics-users.component.css'
})
export class StatisticsUsersComponent {
  userStats = [
    { label: 'Taux de conversion visiteurs → acheteurs', value: '18 %' },
    { label: 'Temps moyen sur l\'application', value: '4 min 32 s' },
    { label: 'Pages les plus visitées', value: 'Catalogue, Panier, Promos' },
    { label: 'Produits les plus consultés', value: 'Rapport détaillé' },
    { label: 'Fréquence d\'achat', value: '2,3 achats / mois / user' },
    { label: 'Heure de pic d\'activité', value: '18h - 20h' },
    { label: 'Zones les plus fréquentées', value: 'Mode, Food court' },
    { label: 'Recherche sans résultat', value: '12 % des recherches' },
    { label: 'Réachat', value: '65 % des acheteurs' }
  ];
}
