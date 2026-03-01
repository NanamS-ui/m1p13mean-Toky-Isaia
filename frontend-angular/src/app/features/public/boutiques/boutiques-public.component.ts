import { ChangeDetectorRef, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ShopService } from '../../../core/services/shop/shop.service';
import { ShopCategoryService } from '../../../core/services/shop/shop-category.service';
import { FloorService } from '../../../core/services/shop/floor.service';
import { OpeningHoursService } from '../../../core/services/shop/opening-hours.service';
import type { Shop } from '../../../core/models/shop/shop.model';

interface PublicBoutique {
  id: string;
  name: string;
  categoryId: string;
  categoryLabel: string;
  floor: number;
  isOpen: boolean;
  logoUrl?: string;
  description?: string;
}

interface CategoryOption {
  _id: string;
  value: string;
  label: string;
}

@Component({
  selector: 'app-boutiques-public',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './boutiques-public.component.html',
  styleUrl: './boutiques-public.component.css'
})
export class BoutiquesPublicComponent implements OnInit {
  private shopService = inject(ShopService);
  private shopCategoryService = inject(ShopCategoryService);
  private floorService = inject(FloorService);
  private openingHours = inject(OpeningHoursService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  categories: CategoryOption[] = [];
  floors = signal<Array<{ value: string; label: string }>>([]);

  allBoutiques = signal<PublicBoutique[]>([]);
  filteredBoutiques = signal<PublicBoutique[]>([]);

  // Filter signals
  searchQuery = signal<string>('');
  selectedCategory = signal<string | 'ALL'>('ALL');
  selectedFloor = signal<string | 'ALL'>('ALL');

  private lastCategoryParam: string | null = null;
  private initialized = signal(false);

  // Computed filtered boutiques with search
  filteredBySearch = computed(() => {
    let filtered = this.filteredBoutiques();

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query) ||
        b.categoryLabel.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  // Effect pour charger les boutiques quand les filtres floor/category changent
  filterEffect = effect(() => {
    // N'exécuter l'effet que si le composant est initialisé
    if (!this.initialized()) return;
    
    const floor = this.selectedFloor();
    const category = this.selectedCategory();
    this.loadFilteredBoutiques(floor, category);
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.lastCategoryParam = params.get('category');
      this.applyCategoryParamIfPossible();
    });

    // Charger les catégories, les floors et les boutiques en parallèle
    forkJoin({
      categories: this.shopCategoryService.getShopCategories().pipe(catchError(() => of([]))),
      floors: this.floorService.getFloors().pipe(catchError(() => of([]))),
      shops: this.shopService.getActiveShops('ALL', 'ALL').pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ categories, floors, shops }) => {
        this.categories = (categories || []).map((c) => ({ _id: c._id, value: c.value, label: c.value }));
        // Transformer les floors du backend au format attendu
        this.floors.set((floors || []).map((f) => ({ value: f.value, label: `${f.value}` })));
        const mappedBoutiques = (shops || []).map((s) => this.mapShopToPublicBoutique(s));
        this.allBoutiques.set(mappedBoutiques);
        this.filteredBoutiques.set(mappedBoutiques);
        this.applyCategoryParamIfPossible();
        // Marquer comme initialisé pour déclencher l'effet
        this.initialized.set(true);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement données publiques:', err);
        this.categories = [];
        this.floors.set([]);
        this.allBoutiques.set([]);
        this.initialized.set(true);
        this.cdr.detectChanges();
      }
    });
  }

  // Charger les boutiques filtrées par floor et category
  private loadFilteredBoutiques(floor: string | 'ALL', category: string | 'ALL'): void {
    this.shopService.getActiveShops(floor, category).pipe(
      catchError((err) => {
        console.error('Erreur chargement boutiques filtrées:', err);
        return of([]);
      })
    ).subscribe((shops) => {
      const mappedBoutiques = (shops || []).map((s) => this.mapShopToPublicBoutique(s));
      this.filteredBoutiques.set(mappedBoutiques);
      this.cdr.detectChanges();
    });
  }

  // Get category label from categoryId
  getCategoryLabel(categoryId: string): string {
    const cat = this.categories.find(c => c._id === categoryId);
    return cat?.label || '';
  }

  // Get category label from value (for mapping)
  getCategoryLabelFromValue(value: string): string {
    const cat = this.categories.find(c => c.value === value);
    return cat?.label || value || '';
  }

  // Get category icon from categoryId
  getCategoryIcon(categoryId: string): string {
    const cat = this.categories.find(c => c._id === categoryId);
    const key = (cat?.value || '').toLowerCase().trim();
    if (key.includes('mode')) return 'checkroom';
    if (key.includes('tech') || key.includes('électron') || key.includes('electron')) return 'devices';
    if (key.includes('beauté') || key.includes('beaute') || key.includes('bien-être') || key.includes('bien etre')) return 'spa';
    if (key.includes('sport')) return 'sports_soccer';
    if (key.includes('restaurant') || key.includes('food') || key.includes('restauration') || key.includes('alimentation')) return 'restaurant';
    if (key.includes('maison') || key.includes('décoration') || key.includes('decoration')) return 'chair';
    if (key.includes('enfant')) return 'child_care';
    return 'store';
  }

  // Get category icon from value
  getCategoryIconFromValue(value: string): string {
    const key = (value || '').toLowerCase().trim();
    if (key.includes('mode')) return 'checkroom';
    if (key.includes('tech') || key.includes('électron') || key.includes('electron')) return 'devices';
    if (key.includes('beauté') || key.includes('beaute') || key.includes('bien-être') || key.includes('bien etre')) return 'spa';
    if (key.includes('sport')) return 'sports_soccer';
    if (key.includes('restaurant') || key.includes('food') || key.includes('restauration') || key.includes('alimentation')) return 'restaurant';
    if (key.includes('maison') || key.includes('décoration') || key.includes('decoration')) return 'chair';
    if (key.includes('enfant')) return 'child_care';
    return 'store';
  }

  // Update search
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  // Update category filter
  onCategoryChange(category: string | 'ALL'): void {
    this.selectedCategory.set(category);
  }

  // Update floor filter
  onFloorChange(floor: string | 'ALL'): void {
    this.selectedFloor.set(floor);
  }

  // Clear all filters
  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('ALL');
    this.selectedFloor.set('ALL');
  }

  private mapShopToPublicBoutique(shop: Shop): PublicBoutique {
    const floorValue = (shop as any)?.door?.floor?.value;
    const floor = this.parseFloorNumber(floorValue);
    const categoryId = this.extractCategoryId(shop.shop_category);
    const categoryLabel = this.extractCategoryLabel(shop.shop_category);

    return {
      id: shop._id,
      name: shop.name,
      categoryId,
      categoryLabel,
      floor,
      isOpen: this.openingHours.isShopOpenNow(shop),
      logoUrl: shop.logo || undefined,
      description: shop.description || undefined
    };
  }

  private extractCategoryId(category?: any): string {
    if (!category) return '';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && category._id) return category._id;
    return '';
  }

  private extractCategoryLabel(category?: any): string {
    if (!category) return '';
    if (typeof category === 'object' && category.value) return category.value;
    const found = this.categories.find(c => c._id === category);
    return found?.value || '';
  }

  private parseFloorNumber(raw: unknown): number {
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    const str = String(raw ?? '').trim();
    const match = str.match(/-?\d+/);
    const num = match ? Number(match[0]) : Number.NaN;
    return Number.isFinite(num) ? num : 0;
  }

  private applyCategoryParamIfPossible(): void {
    const raw = (this.lastCategoryParam || '').trim();
    if (!raw) return;

    const normalized = raw.toLowerCase();
    const match = this.categories.find(
      (c) => c.value.toLowerCase() === normalized || c.label.toLowerCase() === normalized || c._id.toLowerCase() === normalized
    );
    if (match) {
      this.selectedCategory.set(match._id);
      this.cdr.detectChanges();
    }
  }
}
