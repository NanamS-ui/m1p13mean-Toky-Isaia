import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../core/services/events/event.service';
import { EventEntity } from '../../../core/models/events/event.model';
import { EventCategoryService } from '../../../core/services/events/event-category.service';

export type EventType = string;

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: EventType;
  categoryValue: string;
  image?: string;
  featured?: boolean;
}

interface FilterOption {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-evenements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evenements.component.html',
  styleUrl: './evenements.component.css'
})
export class EvenementsComponent implements OnInit {
  selectedFilter = signal<string>('Tous');

  allEvents = signal<Event[]>([]);

  eventTypes: FilterOption[] = [
    { value: 'Tous', label: 'Tous', icon: 'apps' }
  ];

  constructor(
    private eventService: EventService,
    private eventCategoryService: EventCategoryService
  ) {}

  ngOnInit(): void {
    this.eventCategoryService.getEventCategories().subscribe({
      next: (cats) => {
        const options: FilterOption[] = (cats || [])
          .map((c) => {
            const value = (c.value || c.name || '').toString();
            const label = (c.label ?? c.name ?? c.value ?? '').toString();
            return {
              value,
              label: label || value,
              icon: this.getCategoryIcon(value)
            };
          })
          .filter((o) => Boolean(o.value));

        this.eventTypes = [{ value: 'Tous', label: 'Tous', icon: 'apps' }, ...options];
      },
      error: () => {
        // garde uniquement "Tous"
        this.eventTypes = [{ value: 'Tous', label: 'Tous', icon: 'apps' }];
      }
    });

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
          .map((e) => this.mapEntityToPublicEvent(e))
          .sort((a, b) => a.date.localeCompare(b.date));

        if (mapped.length > 0) {
          mapped[0] = { ...mapped[0], featured: true };
        }

        this.allEvents.set(mapped);
      },
      error: (err) => {
        console.error('Erreur chargement événements publiés:', err);
        this.allEvents.set([]);
      }
    });
  }

  private toYmd(isoDate: string | null | undefined): string {
    if (!isoDate) return '';
    return isoDate.length >= 10 ? isoDate.slice(0, 10) : isoDate;
  }

  getCategoryIcon(categoryValue?: string | null): string {
    const value = (categoryValue || '').toLowerCase();
    if (value === 'promo' || value === 'promotion' || value === 'promotions') return 'local_offer';
    if (value === 'atelier' || value === 'ateliers') return 'workshop';
    return 'celebration';
  }

  private mapEntityToPublicEvent(entity: EventEntity): Event {
    const date = this.toYmd(entity.started_date);
    const time = entity.all_day ? 'Journée entière' : ((entity.start_time || '').toString());
    const categoryValue = (entity.category?.value || 'event').toString();
    const type = (entity.category?.label || entity.category?.value || 'Événement').toString();

    return {
      id: entity._id,
      title: entity.title,
      description: (entity.description || '').toString(),
      date,
      time,
      type,
      categoryValue,
      image: entity.image_url || undefined
    };
  }

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

  setFilter(type: string): void {
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
