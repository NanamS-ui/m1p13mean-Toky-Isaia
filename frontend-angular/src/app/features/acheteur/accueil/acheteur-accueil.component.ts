import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ShopService } from '../../../core/services/shop/shop.service';
import { BOUTIQUE_CATEGORIES, type BoutiqueCategory } from '../../../core/models/boutique.model';
import type { Shop } from '../../../core/models/shop/shop.model';

interface FeaturedBoutique {
  id: string;
  name: string;
  category: string;
  logo?: string;
  rating: number;
  isOpen: boolean;
}

interface CategoryWithCount {
  icon: string;
  label: string;
  value: BoutiqueCategory;
  count: number;
}

const CATEGORY_ICONS: Record<BoutiqueCategory, string> = {
  MODE: 'checkroom',
  FOOD: 'restaurant',
  TECH: 'devices',
  BEAUTE: 'spa',
  SPORT: 'sports_soccer',
  MAISON: 'chair',
  AUTRE: 'more_horiz'
};

@Component({
  selector: 'app-acheteur-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './acheteur-accueil.component.html',
  styleUrl: './acheteur-accueil.component.css'
})
export class AcheteurAccueilComponent implements OnInit {
  boutiques = signal<Shop[]>([]);

  userName = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return 'invité';
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return name || user.email?.split('@')[0] || 'invité';
  });

  featuredBoutiques = computed(() => {
    const shops = this.boutiques();
    return shops.slice(0, 6).map(s => this.mapShopToFeaturedBoutique(s));
  });

  categories = computed<CategoryWithCount[]>(() => {
    const shops = this.boutiques();
    return BOUTIQUE_CATEGORIES.map(cat => ({
      icon: CATEGORY_ICONS[cat.value],
      label: cat.label,
      value: cat.value,
      count: shops.filter(s => this.normalizeCategory(s.shop_category?.value) === cat.value).length
    }));
  });

  promotionsCount = signal(0);

  totalBoutiques = computed(() => this.boutiques().length);

  constructor(
    private auth: AuthService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    this.shopService.getShops().subscribe({
      next: (shops) => this.boutiques.set(shops),
      error: () => this.boutiques.set([])
    });
  }

  private mapShopToFeaturedBoutique(shop: Shop): FeaturedBoutique {
    const category = this.normalizeCategory(shop.shop_category?.value);
    const label = BOUTIQUE_CATEGORIES.find(c => c.value === category)?.label ?? category;
    const { rating } = this.getMockRating(shop._id);
    const isOpen = shop.is_accepted || this.isStatusActive(shop.shop_status?.value);

    return {
      id: shop._id,
      name: shop.name,
      category: label,
      logo: shop.logo,
      rating,
      isOpen
    };
  }

  private normalizeCategory(value?: string): BoutiqueCategory {
    const normalized = (value ?? '').toUpperCase().replace(/\s+/g, '');
    const match = BOUTIQUE_CATEGORIES.find(c => c.value === normalized);
    return (match?.value as BoutiqueCategory) ?? 'AUTRE';
  }

  private getMockRating(shopId: string): { rating: number } {
    let hash = 0;
    for (let i = 0; i < shopId.length; i++) {
      hash = ((hash << 5) - hash) + shopId.charCodeAt(i) | 0;
    }
    const n = Math.abs(hash);
    const rating = 3.2 + (n % 18) / 10;
    return { rating: Math.round(rating * 10) / 10 };
  }

  private isStatusActive(value?: string): boolean {
    if (!value) return false;
    return value.toLowerCase().includes('active');
  }
}
