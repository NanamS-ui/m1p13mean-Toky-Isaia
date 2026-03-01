/** Produit du catalogue (agrégation stock + prix + promotion) */
export interface CatalogProduct {
  id: string;
  stockId: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  category: string;
  tags: string[];
  boutiqueId: string;
  boutiqueName: string;
  boutiqueLogo?: string;
  image?: string;
  inStock: boolean;
  stockQuantity: number;
  onPromo: boolean;
  popularity: number;
  createdAt: string;
}

/** Critères de filtrage et tri du catalogue */
export type CatalogSortBy = 'popularity' | 'newest' | 'price-asc' | 'price-desc';

export interface CatalogFilterCriteria {
  searchQuery: string;
  selectedCategory: string;
  minPrice: number | null;
  maxPrice: number | null;
  inStockOnly: boolean;
  onPromoOnly: boolean;
  sortBy: CatalogSortBy;
}
