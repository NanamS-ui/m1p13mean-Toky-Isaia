import { Component, signal, effect, Signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/product/stock.service';
import { ProductService } from '../../../core/services/product/product.service';
import { ProduitsCatalogFilterService } from '../../../core/services/product/produits-catalog-filter.service';
import { CatalogFilterCriteria, CatalogProduct, CatalogSortBy } from '../../../core/models/product/catalog-product.model';
import { catchError, of } from 'rxjs';

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
  onlyFavorites = signal(false);
  sortBy!: WritableSignal<CatalogSortBy>;

  loading = signal(true);
  products = signal<CatalogProduct[]>([]);
  favoriteProductIds = signal<string[]>([]);

  categories!: Signal<string[]>;
  hasActiveFilters!: Signal<boolean>;

  filteredProducts = computed(() => {
    let result = this.catalogFilters.filteredProducts();
    
    if (this.onlyFavorites()) {
      const favorites = new Set(this.favoriteProductIds());
      result = result.filter(p => favorites.has(p.id));
    }
    
    return result;
  });

  constructor(
    private stockService: StockService,
    private productService: ProductService,
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
    this.hasActiveFilters = this.catalogFilters.hasActiveFilters;

    this.loadFavoriteIds();

    effect((onCleanup) => {
      const criteria = this.catalogFilters.criteria();
      const handle = setTimeout(() => {
        this.loadCatalog(criteria);
      }, 400);

      onCleanup(() => clearTimeout(handle));
    });
  }

  private loadFavoriteIds(): void {
    this.productService.getMyFavoriteProductIds()
      .pipe(catchError(() => of([] as string[])))
      .subscribe(ids => {
        this.favoriteProductIds.set(ids);
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
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
  }

  clearFilters(): void {
    this.catalogFilters.clearFilters();
  }

  isFavorite(productId: string): boolean {
    return this.favoriteProductIds().includes(productId);
  }

  toggleFavorite(event: Event, productId: string): void {
    event.preventDefault();
    event.stopPropagation();

    if (this.isFavorite(productId)) {
      this.productService.removeFavoriteProduct(productId).subscribe({
        next: (result) => {
          this.favoriteProductIds.set(result.favoriteProducts);
        },
        error: (error) => console.error('Erreur lors de la suppression des favoris', error)
      });
      return;
    }

    this.productService.addFavoriteProduct(productId).subscribe({
      next: (result) => {
        this.favoriteProductIds.set(result.favoriteProducts);
      },
      error: (error) => console.error('Erreur lors de l\'ajout aux favoris', error)
    });
  }
}
