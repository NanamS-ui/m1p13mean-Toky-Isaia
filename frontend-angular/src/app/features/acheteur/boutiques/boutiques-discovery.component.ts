import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BOUTIQUE_CATEGORIES, type BoutiqueCategory } from '../../../core/models/boutique.model';

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
export class BoutiquesDiscoveryComponent {
  categories = BOUTIQUE_CATEGORIES;
  
  // Search and filters
  searchQuery = signal('');
  selectedCategory = signal<BoutiqueCategory | ''>('');
  selectedFloor = signal<number | ''>('');
  onlyOpen = signal(false);
  sortBy = signal<SortOption>('popularity');
  viewMode = signal<ViewMode>('grid');

  // Mock data
  boutiques = signal<BoutiqueDiscovery[]>([
    {
      id: '1',
      name: 'Mode & Style',
      category: 'MODE',
      rating: 4.8,
      reviewCount: 124,
      isOpen: true,
      floor: 1,
      zone: 'Zone A',
      description: 'Boutique de mode tendance pour hommes et femmes',
      popularity: 950
    },
    {
      id: '2',
      name: 'TechZone',
      category: 'TECH',
      rating: 4.6,
      reviewCount: 89,
      isOpen: true,
      floor: 2,
      zone: 'Zone B',
      description: 'Électronique et gadgets high-tech',
      popularity: 820
    },
    {
      id: '3',
      name: 'Beauty Corner',
      category: 'BEAUTE',
      rating: 4.9,
      reviewCount: 156,
      isOpen: false,
      floor: 1,
      zone: 'Zone C',
      description: 'Produits de beauté et bien-être',
      popularity: 1100
    },
    {
      id: '4',
      name: 'Sport Plus',
      category: 'SPORT',
      rating: 4.5,
      reviewCount: 67,
      isOpen: true,
      floor: 2,
      zone: 'Zone A',
      description: 'Équipements et vêtements de sport',
      popularity: 650
    },
    {
      id: '5',
      name: 'Bijoux Précieux',
      category: 'AUTRE',
      rating: 4.7,
      reviewCount: 43,
      isOpen: true,
      floor: 1,
      zone: 'Zone D',
      description: 'Bijouterie et accessoires précieux',
      popularity: 580
    },
    {
      id: '6',
      name: 'Home Design',
      category: 'MAISON',
      rating: 4.4,
      reviewCount: 92,
      isOpen: true,
      floor: 2,
      zone: 'Zone C',
      description: 'Décoration et mobilier pour la maison',
      popularity: 720
    },
    {
      id: '7',
      name: 'Sushi Express',
      category: 'FOOD',
      rating: 4.3,
      reviewCount: 201,
      isOpen: true,
      floor: 1,
      zone: 'Zone E',
      description: 'Restaurant japonais et cuisine asiatique',
      popularity: 1300
    },
    {
      id: '8',
      name: 'Fashion House',
      category: 'MODE',
      rating: 4.6,
      reviewCount: 78,
      isOpen: true,
      floor: 1,
      zone: 'Zone A',
      description: 'Prêt-à-porter de luxe',
      popularity: 890
    },
    {
      id: '9',
      name: 'Gaming Hub',
      category: 'TECH',
      rating: 4.7,
      reviewCount: 112,
      isOpen: true,
      floor: 2,
      zone: 'Zone B',
      description: 'Jeux vidéo et consoles',
      popularity: 1050
    },
    {
      id: '10',
      name: 'Wellness Spa',
      category: 'BEAUTE',
      rating: 4.8,
      reviewCount: 95,
      isOpen: false,
      floor: 1,
      zone: 'Zone C',
      description: 'Soins du corps et relaxation',
      popularity: 750
    },
    {
      id: '11',
      name: 'Fit Zone',
      category: 'SPORT',
      rating: 4.5,
      reviewCount: 54,
      isOpen: true,
      floor: 2,
      zone: 'Zone A',
      description: 'Équipements de fitness',
      popularity: 620
    },
    {
      id: '12',
      name: 'Coffee Corner',
      category: 'FOOD',
      rating: 4.6,
      reviewCount: 167,
      isOpen: true,
      floor: 1,
      zone: 'Zone E',
      description: 'Café et pâtisseries artisanales',
      popularity: 980
    }
  ]);

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
    if (this.selectedFloor() !== '') {
      result = result.filter(b => b.floor === this.selectedFloor());
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

  // Available floors
  floors = computed(() => {
    const uniqueFloors = new Set(this.boutiques().map(b => b.floor));
    return Array.from(uniqueFloors).sort();
  });

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  setSortBy(sort: SortOption): void {
    this.sortBy.set(sort);
  }

  getCategoryLabel(category: BoutiqueCategory): string {
    return this.categories.find(c => c.value === category)?.label ?? category;
  }
}
