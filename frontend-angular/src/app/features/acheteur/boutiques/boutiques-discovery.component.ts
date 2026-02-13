import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BOUTIQUE_CATEGORIES, type BoutiqueCategory } from '../../../core/models/boutique.model';
import { ShopService } from '../../../core/services/shop/shop.service';
import type { Shop } from '../../../core/models/shop/shop.model';

interface BoutiqueDiscovery {
  id: string;
  name: string;
  category: BoutiqueCategory;
  logoUrl?: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  floor: number;
  zone?: string;
  description: string;
  popularity: number; // Based on views/clicks
}

type SortOption = 'name' | 'rating' | 'popularity';
type ViewMode = 'grid' | 'list';

@Component({
  selector: 'app-boutiques-discovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './boutiques-discovery.component.html',
  styleUrl: './boutiques-discovery.component.css'
})
export class BoutiquesDiscoveryComponent implements OnInit {
  categories = BOUTIQUE_CATEGORIES;
  
  // Search and filters
  searchQuery = signal('');
  selectedCategory = signal<BoutiqueCategory | ''>('');
  selectedFloor = signal<number | ''>('');
  onlyOpen = signal(false);
  sortBy = signal<SortOption>('popularity');
  viewMode = signal<ViewMode>('grid');

  boutiques = signal<BoutiqueDiscovery[]>([]);

  constructor(
    private shopService: ShopService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const cat = params['category'];
      if (cat && this.categories.some(c => c.value === cat)) {
        this.selectedCategory.set(cat as BoutiqueCategory);
      }
    });

    this.shopService.getShops().subscribe({
      next: (shops) => this.boutiques.set(shops.map(shop => this.mapShopToDiscovery(shop))),
      error: () => this.boutiques.set([])
    });
  }

  // Filtered and sorted boutiques
  filteredBoutiques = computed(() => {
    let result = this.boutiques();

    // Search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query) ||
        b.zone?.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.selectedCategory()) {
      result = result.filter(b => b.category === this.selectedCategory());
    }

    // Floor filter
    const floorFilter = this.selectedFloor();
    if (floorFilter !== '' && floorFilter !== null && floorFilter !== undefined) {
      const floorNum = typeof floorFilter === 'string' ? Number(floorFilter) : floorFilter;
      result = result.filter(b => b.floor === floorNum);
    }

    // Open status filter
    if (this.onlyOpen()) {
      result = result.filter(b => b.isOpen);
    }

    // Sort
    const sortBy = this.sortBy();
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'popularity':
          return b.popularity - a.popularity;
        default:
          return 0;
      }
    });

    return result;
  });

  // Étages disponibles (triage : RDC en premier, puis 1, 2, 3...)
  floors = computed(() => {
    const unique = new Set(this.boutiques().map(b => b.floor).filter(f => !Number.isNaN(f)));
    return Array.from(unique).sort((a, b) => a - b);
  });

  onFloorChange(value: string | number | ''): void {
    if (value === '' || value === null || value === undefined) {
      this.selectedFloor.set('');
    } else {
      this.selectedFloor.set(typeof value === 'string' ? Number(value) : value);
    }
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  setSortBy(sort: SortOption): void {
    this.sortBy.set(sort);
  }

  getCategoryLabel(category: BoutiqueCategory): string {
    return this.categories.find(c => c.value === category)?.label ?? category;
  }

  getFloorLabel(floor: number): string {
    if (floor === undefined || floor === null || Number.isNaN(floor)) return '—';
    if (floor === 0) return 'Rez-de-chaussée';
    if (floor === 1) return '1er étage';
    return `Étage ${floor}`;
  }

  private mapShopToDiscovery(shop: Shop): BoutiqueDiscovery {
    const category = this.normalizeCategory(shop.shop_category?.value);
    const floor = this.extractFloor(shop.door);
    const { rating, reviewCount } = this.getMockRating(shop._id);

    return {
      id: shop._id,
      name: shop.name,
      category,
      logoUrl: shop.logo,
      rating,
      reviewCount,
      isOpen: shop.is_accepted || this.isStatusActive(shop.shop_status?.value),
      floor,
      zone: this.extractZone(shop.door),
      description: shop.description ?? '',
      popularity: reviewCount
    };
  }

  /** Maquette de note : génère des valeurs fictives pour l'affichage */
  private getMockRating(shopId: string): { rating: number; reviewCount: number } {
    let hash = 0;
    for (let i = 0; i < shopId.length; i++) {
      hash = ((hash << 5) - hash) + shopId.charCodeAt(i) | 0;
    }
    const n = Math.abs(hash);
    const rating = 3.2 + (n % 18) / 10;
    const reviewCount = 5 + (n % 95);
    return { rating: Math.round(rating * 10) / 10, reviewCount };
  }

  private normalizeCategory(value?: string): BoutiqueCategory {
    const normalized = (value ?? '').toUpperCase();
    const match = this.categories.find(c => c.value === normalized);
    return (match?.value as BoutiqueCategory) ?? 'AUTRE';
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

  private isStatusActive(value?: string): boolean {
    if (!value) return false;
    return value.toLowerCase().includes('active');
  }
}
