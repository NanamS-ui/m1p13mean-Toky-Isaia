import { Component, signal, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EventService } from '../../../core/services/events/event.service';
import { EventEntity } from '../../../core/models/events/event.model';
import { ShopCategoryService } from '../../../core/services/shop/shop-category.service';
import { ShopService } from '../../../core/services/shop/shop.service';
import { forkJoin } from 'rxjs';

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
export class AccueilComponent implements OnInit {
  private eventService = inject(EventService);
  private shopCategoryService = inject(ShopCategoryService);
  private shopService = inject(ShopService);
  private cdr = inject(ChangeDetectorRef);

  /** Mapping icône par nom de catégorie (insensible à la casse) */
  private readonly categoryIcons: Record<string, string> = {
    'mode': 'checkroom',
    'tech & électronique': 'devices',
    'beauté & bien-être': 'spa',
    'sport': 'sports_soccer',
    'restaurants': 'restaurant',
    'restaurant/food': 'restaurant',
    'bijouterie': 'diamond',
    'maison & décoration': 'chair',
    'enfants': 'child_care',
    'alimentation': 'local_grocery_store',
    'santé': 'local_pharmacy',
    'services': 'miscellaneous_services',
    'loisirs': 'attractions',
    'culture': 'menu_book',
    'animalerie': 'pets',
    'auto': 'directions_car',
  };

  categories: Category[] = [];

  featuredBoutiques = signal<FeaturedBoutique[]>([
    { id: '1', name: 'Mode & Style', category: 'Mode', description: 'Prêt-à-porter tendance pour toute la famille' },
    { id: '2', name: 'TechZone', category: 'High-Tech', description: 'Électronique et gadgets dernière génération' },
    { id: '3', name: 'Beauty Corner', category: 'Beauté', description: 'Cosmétiques et soins de qualité' },
    { id: '4', name: 'Sport Plus', category: 'Sport', description: 'Équipements sportifs pour tous les niveaux' },
    { id: '5', name: 'Gourmet House', category: 'Restaurant', description: 'Cuisine gastronomique et ambiance raffinée' },
    { id: '6', name: 'Kids Paradise', category: 'Enfants', description: 'Jouets et vêtements pour enfants' }
  ]);

  upcomingEvents = signal<Event[]>([]);

  ngOnInit(): void {
    this.loadCategories();
    this.loadEvents();
  }

  private loadCategories(): void {
    forkJoin({
      categories: this.shopCategoryService.getShopCategories(),
      shops: this.shopService.getActiveShops()
    }).subscribe({
      next: ({ categories, shops }) => {
        // Compter les boutiques par catégorie
        const countMap = new Map<string, number>();
        for (const shop of shops || []) {
          const catValue = shop.shop_category?.value || shop.shop_category?._id || '';
          if (catValue) {
            countMap.set(catValue, (countMap.get(catValue) || 0) + 1);
          }
        }

        this.categories = (categories || []).map(cat => ({
          label: cat.value,
          icon: this.getCategoryIconByName(cat.value),
          count: countMap.get(cat.value) || countMap.get(cat._id) || 0
        }));

        // Mapper aussi les boutiques populaires
        const activeBoutiques = (shops || []).slice(0, 6).map(s => ({
          id: s._id,
          name: s.name,
          category: s.shop_category?.value || '',
          logo: s.logo || undefined,
          description: s.description || ''
        }));
        this.featuredBoutiques.set(activeBoutiques);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement catégories/boutiques:', err);
      }
    });
  }

  private loadEvents(): void {
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
        this.cdr.detectChanges();
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

  private getCategoryIconByName(name: string): string {
    const key = (name || '').toLowerCase().trim();
    return this.categoryIcons[key] || 'category';
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
