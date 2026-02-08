import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Shop {
  id: string;
  name: string;
  category: 'mode' | 'food' | 'tech' | 'beauty' | 'sport' | 'other';
  floor: number;
  x: number; // Position percentage (0-100)
  y: number; // Position percentage (0-100)
  isOpen: boolean;
  openingHours: string;
  description?: string;
}

interface MapMarker {
  shop: Shop;
  element: HTMLElement | null;
}

@Component({
  selector: 'app-carte-interactive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './carte-interactive.component.html',
  styleUrl: './carte-interactive.component.css'
})
export class CarteInteractiveComponent {
  selectedFloor = signal<number>(0);
  selectedShop = signal<Shop | null>(null);
  searchQuery = signal('');
  selectedCategory = signal<string>('all');
  showOpenOnly = signal(false);
  showRoute = signal(false);
  routeFromEntrance = signal(false);

  // Mock shops data
  shops = signal<Shop[]>([
    // Floor 0
    { id: '1', name: 'Mode & Style', category: 'mode', floor: 0, x: 20, y: 30, isOpen: true, openingHours: '9h-20h' },
    { id: '2', name: 'TechZone', category: 'tech', floor: 0, x: 60, y: 25, isOpen: true, openingHours: '9h-20h' },
    { id: '3', name: 'Food Court', category: 'food', floor: 0, x: 80, y: 70, isOpen: true, openingHours: '10h-22h' },
    { id: '4', name: 'Beauté & Soins', category: 'beauty', floor: 0, x: 40, y: 60, isOpen: true, openingHours: '9h-19h' },
    
    // Floor 1
    { id: '5', name: 'Sport Pro', category: 'sport', floor: 1, x: 30, y: 40, isOpen: true, openingHours: '9h-20h' },
    { id: '6', name: 'Fashion House', category: 'mode', floor: 1, x: 70, y: 35, isOpen: true, openingHours: '9h-20h' },
    { id: '7', name: 'Gaming Store', category: 'tech', floor: 1, x: 50, y: 65, isOpen: false, openingHours: '10h-20h' },
    
    // Floor 2
    { id: '8', name: 'Luxe Mode', category: 'mode', floor: 2, x: 25, y: 30, isOpen: true, openingHours: '10h-19h' },
    { id: '9', name: 'Restaurant Le Jardin', category: 'food', floor: 2, x: 75, y: 50, isOpen: true, openingHours: '11h-23h' },
    { id: '10', name: 'Electronics Plus', category: 'tech', floor: 2, x: 55, y: 70, isOpen: true, openingHours: '9h-20h' },
    
    // Floor 3
    { id: '11', name: 'Cinéma Korus', category: 'other', floor: 3, x: 50, y: 40, isOpen: true, openingHours: '12h-23h' },
    { id: '12', name: 'Arcade Zone', category: 'other', floor: 3, x: 30, y: 60, isOpen: true, openingHours: '10h-22h' }
  ]);

  categories = [
    { value: 'all', label: 'Toutes', icon: 'apps' },
    { value: 'mode', label: 'Mode', icon: 'checkroom' },
    { value: 'food', label: 'Restaurant', icon: 'restaurant' },
    { value: 'tech', label: 'Technologie', icon: 'devices' },
    { value: 'beauty', label: 'Beauté', icon: 'face' },
    { value: 'sport', label: 'Sport', icon: 'sports_soccer' },
    { value: 'other', label: 'Autres', icon: 'more_horiz' }
  ];

  floors = [
    { number: 0, label: 'Niveau 0', icon: 'stairs' },
    { number: 1, label: 'Niveau 1', icon: 'stairs' },
    { number: 2, label: 'Niveau 2', icon: 'stairs' },
    { number: 3, label: 'Niveau 3', icon: 'stairs' }
  ];

  // Filtered shops based on current floor and filters
  filteredShops = computed(() => {
    let filtered = this.shops().filter(shop => shop.floor === this.selectedFloor());

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(shop => shop.category === this.selectedCategory());
    }

    // Filter by open status
    if (this.showOpenOnly()) {
      filtered = filtered.filter(shop => shop.isOpen);
    }

    // Filter by search query
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  // Get category color
  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      mode: '#f59e0b',
      food: '#10b981',
      tech: '#3b82f6',
      beauty: '#ec4899',
      sport: '#ef4444',
      other: '#8b5cf6'
    };
    return colors[category] || '#94a3b8';
  }

  // Get category icon
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      mode: 'checkroom',
      food: 'restaurant',
      tech: 'devices',
      beauty: 'face',
      sport: 'sports_soccer',
      other: 'more_horiz'
    };
    return icons[category] || 'store';
  }

  setFloor(floor: number): void {
    this.selectedFloor.set(floor);
    this.selectedShop.set(null);
    this.showRoute.set(false);
  }

  selectShop(shop: Shop): void {
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

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('all');
    this.showOpenOnly.set(false);
  }

  getShopMarkerStyle(shop: Shop): Record<string, string> {
    return {
      left: `${shop.x}%`,
      top: `${shop.y}%`,
      '--marker-color': this.getCategoryColor(shop.category)
    };
  }

  // Get selected shop category label
  getSelectedShopCategoryLabel(): string | undefined {
    const shop = this.selectedShop();
    if (!shop) {
      return undefined;
    }
    return this.categories.find(c => c.value === shop.category)?.label;
  }
}
