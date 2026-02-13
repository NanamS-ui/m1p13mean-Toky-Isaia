import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ShopService } from '../../../core/services/shop/shop.service';
import { FloorService } from '../../../core/services/shop/floor.service';
import { ShopCategoryService } from '../../../core/services/shop/shop-category.service';
import type { Shop } from '../../../core/models/shop/shop.model';
import type { Floor } from '../../../core/models/shop/floor.model';
import type { Door } from '../../../core/models/shop/door.model';
import type { ShopCategory } from '../../../core/models/shop/shopCategory.model';

/** Boutique affichée sur la carte avec position calculée */
interface MapShop {
  id: string;
  _raw: Shop;
  name: string;
  category: string;
  categoryId: string;
  floorId: string;
  floorLabel: string;
  doorValue: string;
  x: number;
  y: number;
  isOpen: boolean;
  statusLabel: string;
}

/** Couleur par catégorie (fallback si non mappée) */
const CATEGORY_COLORS: Record<string, string> = {
  mode: '#f59e0b',
  Mode: '#f59e0b',
  food: '#10b981',
  Restaurant: '#10b981',
  tech: '#3b82f6',
  Technologie: '#3b82f6',
  beauty: '#ec4899',
  Beauté: '#ec4899',
  sport: '#ef4444',
  Sport: '#ef4444',
  other: '#8b5cf6',
  Autre: '#8b5cf6',
  default: '#94a3b8'
};

const CATEGORY_ICONS: Record<string, string> = {
  mode: 'checkroom', Mode: 'checkroom',
  food: 'restaurant', Restaurant: 'restaurant',
  tech: 'devices', Technologie: 'devices',
  beauty: 'face', Beauté: 'face',
  sport: 'sports_soccer', Sport: 'sports_soccer',
  default: 'store'
};

@Component({
  selector: 'app-carte-interactive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carte-interactive.component.html',
  styleUrl: './carte-interactive.component.css'
})
export class CarteInteractiveComponent implements OnInit {
  private readonly shopService = inject(ShopService);
  private readonly floorService = inject(FloorService);
  private readonly categoryService = inject(ShopCategoryService);

  loading = signal(true);
  error = signal<string | null>(null);

  floors = signal<Floor[]>([]);
  categories = signal<ShopCategory[]>([]);
  mapShops = signal<MapShop[]>([]);
  /** Map doorId -> { x, y } par étage */
  doorPositions = signal<Map<string, { x: number; y: number }>>(new Map());

  selectedFloorId = signal<string | null>(null);
  selectedShop = signal<MapShop | null>(null);
  searchQuery = signal('');
  selectedCategoryId = signal<string | null>(null);
  showOpenOnly = signal(false);
  showRoute = signal(false);
  routeFromEntrance = signal(false);

  /** Catégories avec "Toutes" pour le filtre */
  categoriesWithAll = computed(() => {
    const cats = this.categories();
    return [{ _id: '', value: 'Toutes' } as ShopCategory, ...cats];
  });

  /** Boutiques filtrées pour l'étage et les filtres actuels */
  filteredShops = computed(() => {
    const floorId = this.selectedFloorId();
    const shops = this.mapShops();
    let filtered = floorId ? shops.filter(s => s.floorId === floorId) : shops;

    if (this.selectedCategoryId()) {
      filtered = filtered.filter(s => s.categoryId === this.selectedCategoryId());
    }
    if (this.showOpenOnly()) {
      filtered = filtered.filter(s => s.isOpen);
    }
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        s.doorValue.toLowerCase().includes(query)
      );
    }
    return filtered;
  });

  /** Label de l'étage sélectionné */
  selectedFloorLabel = computed(() => {
    const id = this.selectedFloorId();
    if (!id) return 'Sélectionner un niveau';
    return this.floors().find(f => f._id === id)?.value ?? 'Niveau';
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      floors: this.floorService.getFloors(),
      categories: this.categoryService.getShopCategories(),
      shops: this.shopService.getShops()
    }).subscribe({
        next: ({ floors, categories, shops }) => {
          const sortedFloors = [...floors].sort((a, b) =>
            (a.value ?? '').localeCompare(b.value ?? '', undefined, { numeric: true })
          );
          this.floors.set(sortedFloors);
          this.categories.set(categories);

          if (sortedFloors.length > 0 && !this.selectedFloorId()) {
            this.selectedFloorId.set(sortedFloors[0]._id);
          }

          this.buildDoorPositions(sortedFloors, shops);
          this.mapShops.set(this.buildMapShops(shops));
          this.loading.set(false);
        },
        error: err => {
          this.error.set(err?.error?.message ?? 'Erreur de chargement des données');
          this.loading.set(false);
        }
      });
  }

  /**
   * Calcule les positions x,y des boutiques sur le plan (allée A gauche, allée B droite).
   * Sans x,y en base : positionnement automatique selon le plan.
   */
  private buildDoorPositions(floors: Floor[], shops: Shop[]): void {
    const map = new Map<string, { x: number; y: number }>();
    for (const floor of floors) {
      const floorId = floor._id;
      const shopDoors = this.getShopDoorsOnFloor(shops, floorId);
      shopDoors.forEach(({ doorId }, idx) => {
        const pos = this.getPlanGridPosition(idx, shopDoors.length);
        map.set(`${floorId}:${doorId}`, pos);
      });
    }
    this.doorPositions.set(map);
  }

  /** Position sur le plan : Allée A (gauche) et Allée B (droite) */
  private getPlanGridPosition(index: number, total: number): { x: number; y: number } {
    const half = Math.ceil(total / 2);
    const isLeft = index < half;
    const idx = isLeft ? index : index - half;
    const sideCount = isLeft ? half : total - half;
    const x = isLeft ? 18 + (idx / Math.max(sideCount - 1, 1)) * 16 : 66 + (idx / Math.max(sideCount - 1, 1)) * 16;
    const y = 22 + (idx / Math.max(sideCount - 1, 1)) * 58;
    return { x, y };
  }

  private getShopDoorsOnFloor(shops: Shop[], floorId: string): { doorId: string }[] {
    const seen = new Set<string>();
    const result: { doorId: string }[] = [];
    for (const shop of shops) {
      const door = shop.door as Door & { floor?: Floor | string };
      if (!door) continue;
      const fid = typeof door.floor === 'object' && door.floor ? door.floor._id : door.floor;
      if (fid === floorId && door._id && !seen.has(door._id)) {
        seen.add(door._id);
        result.push({ doorId: door._id });
      }
    }
    return result.sort((a, b) => a.doorId.localeCompare(b.doorId));
  }

  private buildMapShops(shops: Shop[]): MapShop[] {
    const positions = this.doorPositions();
    const result: MapShop[] = [];
    for (const shop of shops) {
      if (shop.deleted_at) continue;
      const door = shop.door as Door & { floor?: Floor | string };
      if (!door) continue;
      const floorId = typeof door.floor === 'object' && door.floor ? door.floor._id : (door.floor as string);
      const floor = this.floors().find(f => f._id === floorId);
      const key = `${floorId}:${door._id}`;
      const pos = positions.get(key) ?? { x: 50, y: 50 };
      const category = shop.shop_category as ShopCategory;
      const catValue = category?.value ?? 'Autre';
      const isOpen = (shop.shop_status?.value ?? '').toLowerCase().includes('active');

      result.push({
        id: shop._id,
        _raw: shop,
        name: shop.name,
        category: catValue,
        categoryId: category?._id ?? '',
        floorId: floorId ?? '',
        floorLabel: floor?.value ?? 'Niveau',
        doorValue: door.value ?? '',
        x: pos.x,
        y: pos.y,
        isOpen,
        statusLabel: shop.shop_status?.value ?? 'Inconnu'
      });
    }
    return result;
  }

  setFloor(floorId: string): void {
    this.selectedFloorId.set(floorId);
    this.selectedShop.set(null);
    this.showRoute.set(false);
  }

  selectShop(shop: MapShop): void {
    this.selectedShop.set(shop);
    this.showRoute.set(false);
  }

  closeShopPopup(): void {
    this.selectedShop.set(null);
  }

  toggleRoute(): void {
    if (this.selectedShop()) {
      this.showRoute.set(!this.showRoute());
      this.routeFromEntrance.set(true);
    }
  }

  setCategory(catId: string | null): void {
    this.selectedCategoryId.set(catId || null);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoryId.set(null);
    this.showOpenOnly.set(false);
  }

  getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] ?? CATEGORY_COLORS['default'];
  }

  getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category] ?? CATEGORY_ICONS['default'];
  }
}
