import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { StockService } from '../../../core/services/product/stock.service';
import { PriceService } from '../../../core/services/product/price.service';
import { PromotionService } from '../../../core/services/product/promotion.service';
import { CatalogFilterService } from '../../../core/services/product/catalog-filter.service';
import {
  CatalogProduct,
  CatalogFilterCriteria
} from '../../../core/models/product/catalog-product.model';

@Component({
  selector: 'app-produits-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produits-catalog.component.html',
  styleUrl: './produits-catalog.component.css'
})
export class ProduitsCatalogComponent implements OnInit {
  // Filter signals
  searchQuery = signal('');
  selectedCategory = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  inStockOnly = signal(false);
  onPromoOnly = signal(false);
  sortBy = signal<'popularity' | 'newest' | 'price-asc' | 'price-desc'>('popularity');

  loading = signal(true);
  products = signal<CatalogProduct[]>([]);

  constructor(
    private stockService: StockService,
    private priceService: PriceService,
    private promotionService: PromotionService,
    private catalogFilterService: CatalogFilterService
  ) {}

  ngOnInit(): void {
    this.loadCatalog();
  }

  private loadCatalog(): void {
    this.loading.set(true);
    forkJoin({
      stocks: this.stockService.getStocks(),
      prices: this.priceService.getPrices(),
      promotions: this.promotionService.getPromotions()
    }).subscribe({
      next: ({ stocks, prices, promotions }) => {
        const catalog = this.buildCatalog(stocks, prices, promotions);
        this.products.set(catalog);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
      }
    });
  }

  private buildCatalog(stocks: any[], prices: any[], promotions: any[]): CatalogProduct[] {
    const now = new Date();
    const priceByStock = new Map<string, { price: number }>();
    for (const p of prices) {
      if (p.deleted_at) continue;
      const start = new Date(p.started_date).getTime();
      const end = new Date(p.end_date).getTime();
      if (now.getTime() >= start && now.getTime() <= end) {
        const stockId = typeof p.stock === 'string' ? p.stock : p.stock?._id;
        if (stockId) priceByStock.set(stockId, { price: p.price });
      }
    }
    const promoByStock = new Map<string, { percent: number }>();
    for (const pr of promotions) {
      if (pr.deleted_at) continue;
      const start = new Date(pr.started_date).getTime();
      const end = new Date(pr.end_date).getTime();
      if (now.getTime() >= start && now.getTime() <= end) {
        const stockId = typeof pr.stock === 'string' ? pr.stock : pr.stock?._id;
        if (stockId) promoByStock.set(stockId, { percent: pr.percent });
      }
    }

    return stocks
      .filter(s => s.product && s.shop)
      .map(stock => {
        const product = stock.product;
        const shop = typeof stock.shop === 'object' ? stock.shop : {};
        const category = product?.product_category?.value ?? '';
        const tags = Array.isArray(product?.tags)
          ? product.tags.map((t: any) => (typeof t === 'string' ? t : t?.value ?? '')).filter(Boolean)
          : [];
        const prix = priceByStock.get(stock._id);
        const promo = promoByStock.get(stock._id);
        const price = prix?.price ?? 0;
        const promoPrice = promo
          ? Math.round(price * (1 - promo.percent / 100))
          : undefined;
        const hash = (stock._id + (product?._id ?? '')).split('').reduce((h: number, c: string) => ((h << 5) - h) + c.charCodeAt(0) | 0, 0);
        const popularity = 50 + Math.abs(hash % 50);

        return {
          id: product?._id ?? stock._id,
          stockId: stock._id,
          name: product?.name ?? '',
          description: product?.description ?? '',
          price,
          promoPrice,
          category,
          tags,
          boutiqueId: shop?._id ?? '',
          boutiqueName: shop?.name ?? '',
          boutiqueLogo: shop?.logo,
          image: product?.image,
          inStock: (stock.reste ?? 0) > 0,
          stockQuantity: stock.reste ?? 0,
          onPromo: !!promo,
          popularity,
          createdAt: stock.created_at ?? product?.created_at ?? new Date().toISOString()
        };
      });
  }

  private filterCriteria = computed<CatalogFilterCriteria>(() => ({
    searchQuery: this.searchQuery(),
    selectedCategory: this.selectedCategory(),
    minPrice: this.minPrice(),
    maxPrice: this.maxPrice(),
    inStockOnly: this.inStockOnly(),
    onPromoOnly: this.onPromoOnly(),
    sortBy: this.sortBy()
  }));

  categories = computed(() =>
    this.catalogFilterService.getCategories(this.products())
  );

  filteredProducts = computed(() =>
    this.catalogFilterService.filterAndSort(
      this.products(),
      this.filterCriteria()
    )
  );

  hasActiveFilters = computed(() =>
    this.catalogFilterService.hasActiveFilters(this.filterCriteria())
  );

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      maximumFractionDigits: 0
    }).format(value);
  }

  addToCart(productId: string, event: Event, stockId?: string): void {
    event.preventDefault();
    event.stopPropagation();
    // TODO: Implement cart service (utiliser stockId pour identifier produit+boutique)
  }

  clearFilters(): void {
    const def = this.catalogFilterService.getDefaultCriteria();
    this.searchQuery.set(def.searchQuery);
    this.selectedCategory.set(def.selectedCategory);
    this.minPrice.set(def.minPrice);
    this.maxPrice.set(def.maxPrice);
    this.inStockOnly.set(def.inStockOnly);
    this.onPromoOnly.set(def.onPromoOnly);
    this.sortBy.set(def.sortBy);
  }
}
