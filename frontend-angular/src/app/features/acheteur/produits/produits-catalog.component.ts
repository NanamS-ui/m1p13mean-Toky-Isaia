import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  category: string;
  boutiqueId: string;
  boutiqueName: string;
  boutiqueLogo?: string;
  image?: string;
  images?: string[];
  inStock: boolean;
  stockQuantity: number;
  onPromo: boolean;
  popularity: number;
  createdAt: string;
  specs?: { [key: string]: string };
}

@Component({
  selector: 'app-produits-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produits-catalog.component.html',
  styleUrl: './produits-catalog.component.css'
})
export class ProduitsCatalogComponent {
  // Filter signals
  searchQuery = signal('');
  selectedCategory = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  inStockOnly = signal(false);
  onPromoOnly = signal(false);
  sortBy = signal<'popularity' | 'newest' | 'price-asc' | 'price-desc'>('popularity');

  // Mock products data
  products = signal<Product[]>([
    {
      id: '1',
      name: 'Robe été fleurie',
      description: 'Robe légère et élégante pour l\'été',
      price: 75000,
      promoPrice: 59000,
      category: 'Mode',
      boutiqueId: '1',
      boutiqueName: 'Mode & Style',
      image: undefined,
      inStock: true,
      stockQuantity: 12,
      onPromo: true,
      popularity: 95,
      createdAt: '2026-01-15'
    },
    {
      id: '2',
      name: 'Casque Bluetooth Pro',
      description: 'Casque sans fil avec réduction de bruit',
      price: 185000,
      category: 'Électronique',
      boutiqueId: '2',
      boutiqueName: 'TechZone',
      image: undefined,
      inStock: true,
      stockQuantity: 15,
      onPromo: false,
      popularity: 88,
      createdAt: '2026-01-20'
    },
    {
      id: '3',
      name: 'Sac à main cuir',
      description: 'Sac élégant en cuir véritable',
      price: 120000,
      category: 'Mode',
      boutiqueId: '1',
      boutiqueName: 'Mode & Style',
      image: undefined,
      inStock: false,
      stockQuantity: 0,
      onPromo: false,
      popularity: 75,
      createdAt: '2026-01-10'
    },
    {
      id: '4',
      name: 'Chaussures de sport',
      description: 'Chaussures confortables pour le sport',
      price: 95000,
      promoPrice: 75000,
      category: 'Sport',
      boutiqueId: '3',
      boutiqueName: 'Sport Pro',
      image: undefined,
      inStock: true,
      stockQuantity: 8,
      onPromo: true,
      popularity: 82,
      createdAt: '2026-01-22'
    },
    {
      id: '5',
      name: 'Montre connectée',
      description: 'Montre intelligente avec suivi fitness',
      price: 250000,
      promoPrice: 199000,
      category: 'Électronique',
      boutiqueId: '2',
      boutiqueName: 'TechZone',
      image: undefined,
      inStock: true,
      stockQuantity: 8,
      onPromo: true,
      popularity: 90,
      createdAt: '2026-01-18'
    },
    {
      id: '6',
      name: 'Parfum premium',
      description: 'Parfum de luxe pour homme',
      price: 150000,
      category: 'Beauté',
      boutiqueId: '4',
      boutiqueName: 'Beauté & Soins',
      image: undefined,
      inStock: true,
      stockQuantity: 20,
      onPromo: false,
      popularity: 70,
      createdAt: '2026-01-12'
    },
    {
      id: '7',
      name: 'Téléphone portable',
      description: 'Smartphone dernière génération',
      price: 450000,
      category: 'Électronique',
      boutiqueId: '2',
      boutiqueName: 'TechZone',
      image: undefined,
      inStock: true,
      stockQuantity: 5,
      onPromo: false,
      popularity: 98,
      createdAt: '2026-01-28'
    },
    {
      id: '8',
      name: 'Veste en jean',
      description: 'Veste décontractée en jean',
      price: 65000,
      category: 'Mode',
      boutiqueId: '1',
      boutiqueName: 'Mode & Style',
      image: undefined,
      inStock: true,
      stockQuantity: 10,
      onPromo: false,
      popularity: 65,
      createdAt: '2026-01-25'
    }
  ]);

  // Computed: categories from products
  categories = computed(() => {
    const cats = new Set<string>();
    this.products().forEach(product => {
      if (product.category) {
        cats.add(product.category);
      }
    });
    return Array.from(cats).sort();
  });

  // Computed: filtered products
  filteredProducts = computed(() => {
    let filtered = this.products();

    // Search filter
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.boutiqueName.toLowerCase().includes(query)
      );
    }

    // Category filter
    const category = this.selectedCategory();
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    // Price filters
    const min = this.minPrice();
    if (min !== null && min !== undefined) {
      filtered = filtered.filter(p => {
        const price = p.promoPrice ?? p.price;
        return price >= min;
      });
    }

    const max = this.maxPrice();
    if (max !== null && max !== undefined) {
      filtered = filtered.filter(p => {
        const price = p.promoPrice ?? p.price;
        return price <= max;
      });
    }

    // Stock filter
    if (this.inStockOnly()) {
      filtered = filtered.filter(p => p.inStock);
    }

    // Promo filter
    if (this.onPromoOnly()) {
      filtered = filtered.filter(p => p.onPromo);
    }

    // Sort
    const sort = this.sortBy();
    const sorted = [...filtered];
    
    switch (sort) {
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
    }

    return sorted;
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      maximumFractionDigits: 0
    }).format(value);
  }

  addToCart(productId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // TODO: Implement cart service
    console.log('Add to cart:', productId);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.inStockOnly.set(false);
    this.onPromoOnly.set(false);
    this.sortBy.set('popularity');
  }
}
