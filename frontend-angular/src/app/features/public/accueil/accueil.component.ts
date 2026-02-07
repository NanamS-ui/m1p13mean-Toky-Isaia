import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FeaturedBoutique {
  id: string;
  name: string;
  category: string;
  logo?: string;
  description: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  image?: string;
  description: string;
}

interface Category {
  icon: string;
  label: string;
  count: number;
}

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.css'
})
export class AccueilComponent {

  categories: Category[] = [
    { icon: 'checkroom', label: 'Mode', count: 35 },
    { icon: 'devices', label: 'High-Tech', count: 15 },
    { icon: 'spa', label: 'Beauté', count: 20 },
    { icon: 'sports_soccer', label: 'Sport', count: 12 },
    { icon: 'restaurant', label: 'Restaurants', count: 25 },
    { icon: 'diamond', label: 'Bijouterie', count: 8 },
    { icon: 'chair', label: 'Maison', count: 18 },
    { icon: 'child_care', label: 'Enfants', count: 15 }
  ];

  featuredBoutiques = signal<FeaturedBoutique[]>([
    { id: '1', name: 'Mode & Style', category: 'Mode', description: 'Prêt-à-porter tendance pour toute la famille' },
    { id: '2', name: 'TechZone', category: 'High-Tech', description: 'Électronique et gadgets dernière génération' },
    { id: '3', name: 'Beauty Corner', category: 'Beauté', description: 'Cosmétiques et soins de qualité' },
    { id: '4', name: 'Sport Plus', category: 'Sport', description: 'Équipements sportifs pour tous les niveaux' },
    { id: '5', name: 'Gourmet House', category: 'Restaurant', description: 'Cuisine gastronomique et ambiance raffinée' },
    { id: '6', name: 'Kids Paradise', category: 'Enfants', description: 'Jouets et vêtements pour enfants' }
  ]);

  upcomingEvents = signal<Event[]>([
    { 
      id: '1', 
      title: 'Soldes d\'hiver', 
      date: '2026-02-01', 
      time: '09:00',
      description: 'Jusqu\'à -50% sur une sélection d\'articles dans toutes nos boutiques partenaires'
    },
    { 
      id: '2', 
      title: 'Défilé de mode', 
      date: '2026-02-14', 
      time: '15:00',
      description: 'Découvrez les nouvelles collections printemps-été lors de notre défilé exclusif'
    },
    { 
      id: '3', 
      title: 'Atelier cuisine enfants', 
      date: '2026-02-20', 
      time: '14:00',
      description: 'Atelier pâtisserie pour les enfants de 6 à 12 ans avec nos chefs'
    }
  ]);

  services = [
    { icon: 'local_parking', title: 'Parking gratuit', description: '2000 places avec 2h gratuites' },
    { icon: 'wifi', title: 'WiFi gratuit', description: 'Connexion haut débit dans tout le centre' },
    { icon: 'child_care', title: 'Espace enfants', description: 'Aire de jeux surveillée' },
    { icon: 'accessible', title: 'Accessibilité', description: 'Accès PMR et fauteuils disponibles' },
    { icon: 'local_atm', title: 'Distributeurs', description: 'Plusieurs DAB dans le centre' },
    { icon: 'local_taxi', title: 'Navettes', description: 'Service de navettes gratuites' }
  ];

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }).format(date);
  }
}
