import { Component, signal, effect, Signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/product/stock.service';
import { ProduitsCatalogFilterService } from '../../../core/services/product/produits-catalog-filter.service';
import { CatalogFilterCriteria, CatalogProduct, CatalogSortBy } from '../../../core/models/product/catalog-product.model';

@Component({
  selector: 'app-produits-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produits-catalog.component.html',
  styleUrl: './produits-catalog.component.css'
})
export class ProduitsCatalogComponent {
  // Filter signals
  searchQuery!: WritableSignal<string>;
  selectedCategory!: WritableSignal<string>;
  minPrice!: WritableSignal<number | null>;
  maxPrice!: WritableSignal<number | null>;
  inStockOnly!: WritableSignal<boolean>;
  onPromoOnly!: WritableSignal<boolean>;
  sortBy!: WritableSignal<CatalogSortBy>;

  loading = signal(true);
  products = signal<CatalogProduct[]>([]);

  categories!: Signal<string[]>;
  filteredProducts!: Signal<CatalogProduct[]>;
  hasActiveFilters!: Signal<boolean>;

  constructor(
    private stockService: StockService,
    private catalogFilters: ProduitsCatalogFilterService
  ) {
    this.searchQuery = this.catalogFilters.searchQuery;
    this.selectedCategory = this.catalogFilters.selectedCategory;
    this.minPrice = this.catalogFilters.minPrice;
    this.maxPrice = this.catalogFilters.maxPrice;
    this.inStockOnly = this.catalogFilters.inStockOnly;
    this.onPromoOnly = this.catalogFilters.onPromoOnly;
    this.sortBy = this.catalogFilters.sortBy;

    this.categories = this.catalogFilters.categories;
    this.filteredProducts = this.catalogFilters.filteredProducts;
    this.hasActiveFilters = this.catalogFilters.hasActiveFilters;

    effect((onCleanup) => {
      const criteria = this.catalogFilters.criteria();
      const handle = setTimeout(() => {
        this.loadCatalog(criteria);
      }, 400);

      onCleanup(() => clearTimeout(handle));
    });
  }

  private loadCatalog(criteria: CatalogFilterCriteria): void {
    this.loading.set(true);
    this.stockService.getCatalog(criteria).subscribe({
      next: (catalog) => {
        this.products.set(catalog);
        this.catalogFilters.setProducts(catalog);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.catalogFilters.setProducts([]);
        this.loading.set(false);
      }
    });
  }

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
    this.catalogFilters.clearFilters();
  }
}
