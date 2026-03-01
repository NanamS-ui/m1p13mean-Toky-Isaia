import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ShopService, ShopCategory } from '../../../core/services/shop/shop.service';
import { OpeningHoursService } from '../../../core/services/shop/opening-hours.service';
import { NoticeService, type ShopNoticeSummaryDto } from '../../../core/services/notice/notice.service';
import type { Shop } from '../../../core/models/shop/shop.model';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface FeaturedBoutique {
  id: string;
  name: string;
  category: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
}

interface CategoryWithCount {
  _id: string;
  value: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-acheteur-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './acheteur-accueil.component.html',
  styleUrl: './acheteur-accueil.component.css'
})
export class AcheteurAccueilComponent implements OnInit {
  boutiques = signal<Shop[]>([]);
  categories = signal<CategoryWithCount[]>([]);
  private shopSummariesById = signal<Record<string, ShopNoticeSummaryDto>>({});

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

  promotionsCount = signal(0);

  totalBoutiques = computed(() => this.boutiques().length);

  constructor(
    private auth: AuthService,
    private shopService: ShopService,
    private openingHours: OpeningHoursService,
    private noticeService: NoticeService
  ) {}

  ngOnInit(): void {
    forkJoin({
      shops: this.shopService.getActiveShops(),
      categories: this.shopService.getShopCategories().pipe(catchError(() => of([] as ShopCategory[])))
    }).subscribe({
      next: ({ shops, categories }) => {
        this.boutiques.set(shops);

        // Compter les boutiques par catégorie
        const categoriesWithCount: CategoryWithCount[] = (categories || []).map(cat => ({
          _id: cat._id,
          value: cat.value,
          icon: this.getCategoryIcon(cat.value),
          count: shops.filter(s => this.getCategoryId(s.shop_category) === cat._id).length
        }));
        this.categories.set(categoriesWithCount);

        const ids = shops.map(s => s._id).filter(Boolean);
        this.noticeService.getShopSummaries(ids).subscribe({
          next: (summaries) => {
            const byId: Record<string, ShopNoticeSummaryDto> = {};
            for (const s of summaries) byId[s.shopId] = s;
            this.shopSummariesById.set(byId);
          },
          error: () => this.shopSummariesById.set({})
        });
      },
      error: () => {
        this.boutiques.set([]);
        this.categories.set([]);
      }
    });
  }

  private mapShopToFeaturedBoutique(shop: Shop): FeaturedBoutique {
    const categoryLabel = this.extractCategoryLabel(shop.shop_category);
    const summary = this.shopSummariesById()[shop._id];
    const rating = summary?.reviewCount ? summary.rating : 0;
    const reviewCount = summary?.reviewCount ?? 0;
    const isActive = this.isStatusActive(shop.shop_status?.value) || shop.is_accepted === true;
    const isOpen = isActive && this.openingHours.isShopOpenNow(shop);

    return {
      id: shop._id,
      name: shop.name,
      category: categoryLabel,
      logo: shop.logo,
      rating,
      reviewCount,
      isOpen
    };
  }

  private getCategoryId(category?: any): string {
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category._id) return category._id;
    return '';
  }

  private extractCategoryLabel(category?: any): string {
    if (!category) return '';
    if (typeof category === 'object' && category.value) return category.value;
    return '';
  }

  private getCategoryIcon(value: string): string {
    const key = (value || '').toLowerCase().trim();
    if (key.includes('mode')) return 'checkroom';
    if (key.includes('tech') || key.includes('électron') || key.includes('electron')) return 'devices';
    if (key.includes('beauté') || key.includes('beaute') || key.includes('bien-être') || key.includes('bien etre')) return 'spa';
    if (key.includes('sport')) return 'sports_soccer';
    if (key.includes('restaurant') || key.includes('food') || key.includes('restauration') || key.includes('alimentation')) return 'restaurant';
    if (key.includes('maison') || key.includes('décoration') || key.includes('decoration')) return 'chair';
    if (key.includes('enfant')) return 'child_care';
    return 'more_horiz';
  }

  private isStatusActive(value?: string): boolean {
    if (!value) return false;
    return value.toLowerCase().includes('active');
  }

}
