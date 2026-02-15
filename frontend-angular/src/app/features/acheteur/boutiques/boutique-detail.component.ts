import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BOUTIQUE_CATEGORIES, type BoutiqueCategory } from '../../../core/models/boutique.model';
import { ShopService } from '../../../core/services/shop/shop.service';
import { OpeningHoursService } from '../../../core/services/shop/opening-hours.service';
import type { Shop } from '../../../core/models/shop/shop.model';

interface BoutiqueDetail {
  id: string;
  name: string;
  category: BoutiqueCategory;
  logoUrl?: string;
  bannerUrl?: string;
  description: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  floor: number;
  zone?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
  isFavorite: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  imageUrl?: string;
  stock: number;
  rating: number;
}

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

const FRENCH_DAYS_ORDER = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const;

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutique-detail.component.html',
  styleUrl: './boutique-detail.component.css'
})
export class BoutiqueDetailComponent implements OnInit {
  boutiqueId = signal<string>('');
  isFavorite = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);

  boutique = signal<BoutiqueDetail | null>(null);

  // Mock products
  products = signal<Product[]>([
    {
      id: '1',
      name: 'Robe été fleurie',
      price: 75000,
      promoPrice: 59000,
      stock: 15,
      rating: 4.7
    },
    {
      id: '2',
      name: 'Jean slim noir',
      price: 89000,
      stock: 8,
      rating: 4.5
    },
    {
      id: '3',
      name: 'T-shirt basic blanc',
      price: 25000,
      stock: 50,
      rating: 4.6
    },
    {
      id: '4',
      name: 'Veste en cuir',
      price: 320000,
      stock: 3,
      rating: 4.8
    },
    {
      id: '5',
      name: 'Sneakers urbaines',
      price: 145000,
      promoPrice: 115000,
      stock: 12,
      rating: 4.4
    },
    {
      id: '6',
      name: 'Sac à main cuir',
      price: 180000,
      stock: 7,
      rating: 4.9
    }
  ]);

  // Mock reviews
  reviews = signal<Review[]>([
    {
      id: '1',
      userName: 'Marie R.',
      rating: 5,
      comment: 'Excellente boutique ! Les vêtements sont de très bonne qualité et le service est impeccable. Je recommande vivement.',
      date: '2026-01-15'
    },
    {
      id: '2',
      userName: 'Jean P.',
      rating: 4,
      comment: 'Bonne sélection de produits, prix raisonnables. Le personnel est accueillant et compétent.',
      date: '2026-01-10'
    },
    {
      id: '3',
      userName: 'Sophie L.',
      rating: 5,
      comment: 'Ma boutique préférée ! Toujours les dernières tendances et des conseils personnalisés. Parfait !',
      date: '2026-01-05'
    },
    {
      id: '4',
      userName: 'Thomas M.',
      rating: 4,
      comment: 'Très satisfait de mes achats. La qualité est au rendez-vous et les prix sont compétitifs.',
      date: '2025-12-28'
    }
  ]);

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private openingHours: OpeningHoursService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.boutiqueId.set(id);
      if (id) {
        this.loadShop(id);
      } else {
        this.loading.set(false);
      }
    });
  }

  private loadShop(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.shopService.getShopById(id).subscribe({
      next: (shop) => {
        this.boutique.set(this.mapShopToDetail(shop));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Boutique introuvable');
        this.boutique.set(null);
        this.loading.set(false);
      }
    });
  }

  private mapShopToDetail(shop: Shop): BoutiqueDetail {
    const category = this.normalizeCategory(shop.shop_category?.value);
    const floor = this.extractFloor(shop.door);
    const zone = this.extractZone(shop.door);
    const { rating, reviewCount } = this.getMockRating(shop._id);
    const hours = this.mapOpeningHours(shop.opening_hours);

    return {
      id: shop._id,
      name: shop.name,
      category,
      logoUrl: shop.logo,
      bannerUrl: shop.banner,
      description: shop.description ?? '',
      rating,
      reviewCount,
      isOpen: shop.is_accepted && this.openingHours.isShopOpenNow(shop),
      floor,
      zone,
      phone: shop.phone,
      email: shop.email,
      website: undefined,
      hours,
      isFavorite: this.isFavorite()
    };
  }

  private mapOpeningHours(openingHours: Shop['opening_hours']): { day: string; open: string; close: string }[] {
    const order = [...FRENCH_DAYS_ORDER];
    const byDay = new Map((openingHours || []).map(h => [h.day, h]));
    return order.map(day => {
      const h = byDay.get(day);
      if (!h) return { day, open: '', close: '' };
      return {
        day,
        open: h.isOpen ? h.openTime : '',
        close: h.isOpen ? h.closeTime : ''
      };
    });
  }

  private extractFloor(door: Shop['door']): number {
    if (!door || typeof door !== 'object') return 0;
    const floor = (door as { floor?: unknown }).floor;
    if (typeof floor === 'string') return this.parseFloorNumber(floor);
    if (typeof floor === 'object' && floor && 'value' in floor) {
      return this.parseFloorNumber((floor as { value?: string }).value ?? '');
    }
    return 0;
  }

  private extractZone(door: Shop['door']): string | undefined {
    if (!door || typeof door !== 'object') return undefined;
    const value = (door as { value?: unknown }).value;
    return typeof value === 'string' ? value : undefined;
  }

  private parseFloorNumber(value: string): number {
    if (!value || typeof value !== 'string') return 0;
    const match = value.match(/(-?\d+)/);
    return match ? Number.parseInt(match[1], 10) : 0;
  }

  private normalizeCategory(value?: string): BoutiqueCategory {
    const normalized = (value ?? '').toUpperCase();
    const match = BOUTIQUE_CATEGORIES.find(c => c.value === normalized);
    return (match?.value as BoutiqueCategory) ?? 'AUTRE';
  }

  private getMockRating(shopId: string): { rating: number; reviewCount: number } {
    let hash = 0;
    for (let i = 0; i < shopId.length; i++) {
      hash = ((hash << 5) - hash) + shopId.charCodeAt(i) | 0;
    }
    const n = Math.abs(hash);
    const rating = 3.2 + (n % 18) / 10;
    const reviewCount = 5 + (n % 95);
    return { rating: Math.round(rating * 10) / 10, reviewCount };
  }

  getCategoryLabel(category: BoutiqueCategory): string {
    return BOUTIQUE_CATEGORIES.find(c => c.value === category)?.label ?? category;
  }

  toggleFavorite(): void {
    this.isFavorite.update(fav => !fav);
    // In a real app, save to backend
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  }

  getFloorLabel(floor: number): string {
    if (floor === undefined || floor === null || Number.isNaN(floor)) return '—';
    if (floor === 0) return 'Rez-de-chaussée';
    if (floor === 1) return '1er étage';
    return `Étage ${floor}`;
  }

  getCurrentDay(): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date().getDay()];
  }

  getTodayHours(): string | null {
    const today = this.getCurrentDay();
    const hours = this.boutique()?.hours.find(h => h.day === today);
    if (!hours) return null;
    return `${hours.open} - ${hours.close}`;
  }
}
