import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/events/event.service';
import { EventEntity } from '../../../core/models/events/event.model';

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
  categoryValue: string;
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

  upcomingEvents = signal<Event[]>([]);

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.eventService.getEvents({ published: true }).subscribe({
      next: (entities) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const mapped = (entities || [])
          .filter((e) => e?.published)
          .filter((e) => {
            const startDate = new Date(e.started_date);
            startDate.setHours(0, 0, 0, 0);
            return startDate >= today;
          })
          .sort((a, b) => new Date(a.started_date).getTime() - new Date(b.started_date).getTime())
          .slice(0, 3)
          .map((e) => this.mapEntityToHomeEvent(e));

        this.upcomingEvents.set(mapped);
      },
      error: (err) => {
        console.error('Erreur chargement événements accueil:', err);
        this.upcomingEvents.set([]);
      }
    });
  }

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

  getCategoryIcon(categoryValue?: string | null): string {
    const value = (categoryValue || '').toLowerCase();
    if (value === 'promo' || value === 'promotion' || value === 'promotions') return 'local_offer';
    if (value === 'atelier' || value === 'ateliers') return 'workshop';
    return 'celebration';
  }

  private mapEntityToHomeEvent(entity: EventEntity): Event {
    const categoryValue = (entity.category?.value || 'event').toString();
    const time = entity.all_day ? 'Journée entière' : ((entity.start_time || '').toString());

    return {
      id: entity._id,
      title: entity.title,
      description: (entity.description || '').toString(),
      date: entity.started_date,
      time,
      categoryValue,
      image: entity.image_url || undefined
    };
  }
}
