import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type EventType = 'Tous' | 'Promotions' | 'Animations' | 'Ateliers';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: EventType;
  image?: string;
  featured?: boolean;
}

@Component({
  selector: 'app-evenements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evenements.component.html',
  styleUrl: './evenements.component.css'
})
export class EvenementsComponent {
  selectedFilter = signal<EventType>('Tous');

  allEvents = signal<Event[]>([
    {
      id: '1',
      title: 'Grandes Soldes d\'Hiver',
      description: 'Jusqu\'à -70% sur une sélection exceptionnelle d\'articles dans toutes nos boutiques partenaires. Profitez de réductions incroyables sur la mode, l\'électronique, la beauté et bien plus encore.',
      date: '2026-02-15',
      time: '09:00',
      type: 'Promotions',
      featured: true
    },
    {
      id: '2',
      title: 'Défilé de Mode Printemps-Été',
      description: 'Découvrez les nouvelles collections printemps-été lors de notre défilé exclusif. Les plus grandes marques présenteront leurs créations dans une ambiance festive.',
      date: '2026-02-20',
      time: '15:00',
      type: 'Animations',
      featured: true
    },
    {
      id: '3',
      title: 'Atelier Pâtisserie pour Enfants',
      description: 'Atelier pâtisserie interactif pour les enfants de 6 à 12 ans avec nos chefs pâtissiers. Apprenez à créer de délicieux gâteaux et repartez avec vos créations.',
      date: '2026-02-25',
      time: '14:00',
      type: 'Ateliers'
    },
    {
      id: '4',
      title: 'Promotion High-Tech',
      description: 'Remises exceptionnelles sur tous les produits électroniques et high-tech. Smartphones, ordinateurs, accessoires : profitez de prix imbattables.',
      date: '2026-03-01',
      time: '10:00',
      type: 'Promotions'
    },
    {
      id: '5',
      title: 'Concert Live - Musique Locale',
      description: 'Venez assister à un concert gratuit avec les meilleurs artistes malgaches. Ambiance garantie dans notre espace événementiel.',
      date: '2026-03-05',
      time: '18:00',
      type: 'Animations'
    },
    {
      id: '6',
      title: 'Atelier Bien-être et Relaxation',
      description: 'Initiation au yoga et à la méditation. Découvrez des techniques de relaxation pour améliorer votre bien-être quotidien.',
      date: '2026-03-10',
      time: '16:00',
      type: 'Ateliers'
    },
    {
      id: '7',
      title: 'Flash Sale - Mode & Accessoires',
      description: 'Vente flash de 24h avec des réductions allant jusqu\'à -60% sur une sélection de vêtements et accessoires de mode.',
      date: '2026-03-12',
      time: '08:00',
      type: 'Promotions'
    },
    {
      id: '8',
      title: 'Spectacle de Danse Traditionnelle',
      description: 'Découvrez la richesse culturelle malgache à travers un spectacle de danse traditionnelle avec des artistes locaux.',
      date: '2026-03-15',
      time: '17:00',
      type: 'Animations'
    },
    {
      id: '9',
      title: 'Atelier DIY - Création de Bijoux',
      description: 'Apprenez à créer vos propres bijoux uniques lors de cet atelier créatif. Matériel fourni, repartez avec vos créations.',
      date: '2026-03-18',
      time: '15:00',
      type: 'Ateliers'
    }
  ]);

  featuredEvent = computed(() => 
    this.allEvents().find(event => event.featured) || this.allEvents()[0]
  );

  filteredEvents = computed(() => {
    const filter = this.selectedFilter();
    if (filter === 'Tous') {
      return this.allEvents();
    }
    return this.allEvents().filter(event => event.type === filter);
  });

  upcomingEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.filteredEvents().filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
  });

  pastEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.filteredEvents().filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < today;
    });
  });

  eventTypes: EventType[] = ['Tous', 'Promotions', 'Animations', 'Ateliers'];

  setFilter(type: EventType): void {
    this.selectedFilter.set(type);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  }
}
