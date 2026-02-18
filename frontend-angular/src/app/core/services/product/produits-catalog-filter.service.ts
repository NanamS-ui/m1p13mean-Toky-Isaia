import { Injectable, computed, signal } from '@angular/core';
import {
  CatalogFilterCriteria,
  CatalogProduct,
  CatalogSortBy
} from '../../models/product/catalog-product.model';
import { CatalogFilterService } from './catalog-filter.service';

@Injectable({
  providedIn: 'root'
})
export class ProduitsCatalogFilterService {
  searchQuery = signal('');
  selectedCategory = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  inStockOnly = signal(false);
  onPromoOnly = signal(false);
  sortBy = signal<CatalogSortBy>('popularity');

  private products = signal<CatalogProduct[]>([]);

  criteria = computed<CatalogFilterCriteria>(() => ({
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
      this.criteria()
    )
  );

  hasActiveFilters = computed(() =>
    this.catalogFilterService.hasActiveFilters(this.criteria())
  );

  constructor(private catalogFilterService: CatalogFilterService) {}

  setProducts(products: CatalogProduct[]): void {
    this.products.set(products ?? []);
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
