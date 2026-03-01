import { Injectable } from '@angular/core';
import {
  CatalogProduct,
  CatalogFilterCriteria,
  CatalogSortBy
} from '../../models/product/catalog-product.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogFilterService {

  /**
   * Filtre et trie les produits selon les critères fournis.
   */
  filterAndSort(
    products: CatalogProduct[],
    criteria: CatalogFilterCriteria
  ): CatalogProduct[] {
    let filtered = this.applyFilters(products, criteria);
    return this.applySort(filtered, criteria.sortBy);
  }

  /**
   * Applique les filtres (recherche, catégorie, prix, stock, promo).
   */
  applyFilters(
    products: CatalogProduct[],
    criteria: CatalogFilterCriteria
  ): CatalogProduct[] {
    let result = [...products];

    // Recherche textuelle (nom, description, catégorie, boutique, tags)
    const query = criteria.searchQuery?.toLowerCase().trim() ?? '';
    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.boutiqueName.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Filtre catégorie
    if (criteria.selectedCategory) {
      result = result.filter(p => p.category === criteria.selectedCategory);
    }

    // Filtre prix min
    const min = criteria.minPrice;
    if (min !== null && min !== undefined) {
      result = result.filter(p => {
        const price = p.promoPrice ?? p.price;
        return price >= min;
      });
    }

    // Filtre prix max
    const max = criteria.maxPrice;
    if (max !== null && max !== undefined) {
      result = result.filter(p => {
        const price = p.promoPrice ?? p.price;
        return price <= max;
      });
    }

    // Filtre en stock uniquement
    if (criteria.inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Filtre en promotion uniquement
    if (criteria.onPromoOnly) {
      result = result.filter(p => p.onPromo);
    }

    return result;
  }

  /**
   * Trie les produits selon le critère choisi.
   */
  applySort(products: CatalogProduct[], sortBy: CatalogSortBy): CatalogProduct[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'popularity':
        sorted.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'newest':
        sorted.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'price-asc':
        sorted.sort((a, b) => {
          const priceA = a.promoPrice ?? a.price;
          const priceB = b.promoPrice ?? b.price;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        sorted.sort((a, b) => {
          const priceA = a.promoPrice ?? a.price;
          const priceB = b.promoPrice ?? b.price;
          return priceB - priceA;
        });
        break;
      default:
        sorted.sort((a, b) => b.popularity - a.popularity);
    }

    return sorted;
  }

  /**
   * Extrait les catégories uniques des produits (triées).
   */
  getCategories(products: CatalogProduct[]): string[] {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }

  /**
   * Indique si des filtres sont actifs (hors tri).
   */
  hasActiveFilters(criteria: CatalogFilterCriteria): boolean {
    return !!(
      (criteria.searchQuery?.trim?.() ?? '') ||
      criteria.selectedCategory ||
      (criteria.minPrice !== null && criteria.minPrice !== undefined) ||
      (criteria.maxPrice !== null && criteria.maxPrice !== undefined) ||
      criteria.inStockOnly ||
      criteria.onPromoOnly
    );
  }

  /**
   * Critères par défaut (aucun filtre, tri par popularité).
   */
  getDefaultCriteria(): CatalogFilterCriteria {
    return {
      searchQuery: '',
      selectedCategory: '',
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      onPromoOnly: false,
      sortBy: 'popularity'
    };
  }
}
