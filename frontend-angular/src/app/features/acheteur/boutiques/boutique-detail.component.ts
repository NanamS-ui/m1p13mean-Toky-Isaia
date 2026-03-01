import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { BOUTIQUE_CATEGORIES } from '../../../core/models/boutique.model';
import { ShopService } from '../../../core/services/shop/shop.service';
import { ShopCategoryService } from '../../../core/services/shop/shop-category.service';
import { OpeningHoursService } from '../../../core/services/shop/opening-hours.service';
import type { Shop } from '../../../core/models/shop/shop.model';
import type { ShopCategory } from '../../../core/models/shop/shopCategory.model';
import { StockService } from '../../../core/services/product/stock.service';
import type { CatalogProduct } from '../../../core/models/product/catalog-product.model';
import { NoticeDto, NoticeService } from '../../../core/services/notice/notice.service';

interface BoutiqueDetail {
  id: string;
  name: string;
  categoryId?: string;
  categoryLabel: string;
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

  products = signal<Product[]>([]);

  reviews = signal<Review[]>([]);

  private categoryMap = new Map<string, string>();

  constructor(
    private route: ActivatedRoute,
    private shopService: ShopService,
    private shopCategoryService: ShopCategoryService,
    private openingHours: OpeningHoursService,
    private stockService: StockService,
    private noticeService: NoticeService
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
    forkJoin({
      shop: this.shopService.getShopById(id),
      products: this.stockService.getCatalogForShop(id),
      categories: this.shopCategoryService.getShopCategories().pipe(catchError(() => of([] as ShopCategory[]))),
      notices: this.noticeService.getNoticesByShop(id).pipe(catchError(() => of([] as NoticeDto[]))),
      favoriteStatus: this.shopService.isFavoriteShop(id).pipe(catchError(() => of({ isFavorite: false })))
    }).subscribe({
      next: ({ shop, products, categories, notices, favoriteStatus }) => {
        this.categoryMap = new Map((categories || []).map(cat => [cat._id, cat.value]));
        const reviews = this.mapNoticesToReviews(notices);
        const summary = this.computeRatingSummary(notices);

        this.isFavorite.set(Boolean(favoriteStatus?.isFavorite));
        this.reviews.set(reviews);
        this.boutique.set(this.mapShopToDetail(shop, summary));
        this.products.set(this.mapCatalogProducts(products));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message || 'Boutique introuvable');
        this.boutique.set(null);
        this.products.set([]);
        this.reviews.set([]);
        this.loading.set(false);
      }
    });
  }

  private mapShopToDetail(shop: Shop, ratingInfo?: { rating: number; reviewCount: number }): BoutiqueDetail {
    const categoryId = this.extractCategoryId(shop.shop_category);
    const categoryValue = this.extractCategoryValue(shop.shop_category);
    const categoryLabel = this.getCategoryLabelByIdOrValue(categoryId, categoryValue);
    const floor = this.extractFloor(shop.door);
    const zone = this.extractZone(shop.door);
    const { rating, reviewCount } = ratingInfo ?? { rating: 0, reviewCount: 0 };
    const hours = this.mapOpeningHours(shop.opening_hours);
    const isActive = this.isStatusActive(shop.shop_status?.value) || shop.is_accepted === true;

    return {
      id: shop._id,
      name: shop.name,
      categoryId,
      categoryLabel,
      logoUrl: shop.logo,
      bannerUrl: shop.banner,
      description: shop.description ?? '',
      rating,
      reviewCount,
      isOpen: isActive && this.openingHours.isShopOpenNow(shop),
      floor,
      zone,
      phone: shop.phone,
      email: shop.email,
      website: undefined,
      hours,
      isFavorite: this.isFavorite()
    };
  }

  private mapNoticesToReviews(notices: NoticeDto[]): Review[] {
    return (notices || []).map(n => {
      const user = n.user as any;
      const userName = (typeof user === 'object' && user)
        ? (user.name || user.email || 'Utilisateur')
        : 'Utilisateur';

      return {
        id: n._id,
        userName,
        rating: Number(n.rating) || 0,
        comment: String(n.comment || ''),
        date: n.created_at || new Date().toISOString()
      };
    });
  }

  private computeRatingSummary(notices: NoticeDto[]): { rating: number; reviewCount: number } {
    const list = (notices || []).filter(n => Number.isFinite(Number(n.rating)));
    const reviewCount = list.length;
    if (reviewCount === 0) return { rating: 0, reviewCount: 0 };

    const sum = list.reduce((acc, n) => acc + Number(n.rating), 0);
    const rating = Math.round((sum / reviewCount) * 10) / 10;
    return { rating, reviewCount };
  }

  private isStatusActive(value?: string): boolean {
    if (!value) return false;
    return value.toLowerCase().includes('active');
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

  private getCategoryLabelByIdOrValue(id?: string, value?: string): string {
    if (value) return value;
    if (!id) return 'Autre';
    const mapped = this.categoryMap.get(id);
    if (mapped) return mapped;
    const match = BOUTIQUE_CATEGORIES.find(c => c.value === id);
    return match?.label ?? id;
  }

  private extractCategoryId(category: Shop['shop_category']): string | undefined {
    if (!category) return undefined;
    return typeof category === 'string' ? category : category._id;
  }

  private extractCategoryValue(category: Shop['shop_category']): string | undefined {
    if (!category || typeof category === 'string') return undefined;
    return category.value;
  }

  private mapCatalogProducts(items: CatalogProduct[]): Product[] {
    return (items || []).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      promoPrice: item.promoPrice,
      imageUrl: item.image,
      stock: item.stockQuantity,
      rating: this.getMockProductRating(item.id)
    }));
  }

  private getMockProductRating(productId: string): number {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = ((hash << 5) - hash) + productId.charCodeAt(i);
      hash |= 0;
    }
    const n = Math.abs(hash);
    return Math.round((3.5 + (n % 15) / 10) * 10) / 10;
  }

  getCategoryLabel(category: string): string {
    return category || 'Autre';
  }

  toggleFavorite(): void {
    const shopId = this.boutiqueId();
    if (!shopId) return;

    if (this.isFavorite()) {
      this.shopService.removeFavoriteShop(shopId).subscribe({
        next: () => this.isFavorite.set(false),
        error: (error) => console.error('Erreur lors de la suppression des favoris', error)
      });
      return;
    }

    this.shopService.addFavoriteShop(shopId).subscribe({
      next: () => this.isFavorite.set(true),
      error: (error) => console.error('Erreur lors de l\'ajout aux favoris', error)
    });
  }

  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
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
