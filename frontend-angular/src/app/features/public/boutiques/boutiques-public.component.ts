import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BOUTIQUE_CATEGORIES, BoutiqueCategory } from '../../../core/models/boutique.model';

interface PublicBoutique {
  id: string;
  name: string;
  category: BoutiqueCategory;
  floor: number;
  isOpen: boolean;
  logoUrl?: string;
  description?: string;
}

@Component({
  selector: 'app-boutiques-public',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './boutiques-public.component.html',
  styleUrl: './boutiques-public.component.css'
})
export class BoutiquesPublicComponent {
  // Categories from model
  categories = BOUTIQUE_CATEGORIES;
  
  // Floor options
  floors = [
    { value: 0, label: 'Niveau 0' },
    { value: 1, label: 'Niveau 1' },
    { value: 2, label: 'Niveau 2' }
  ];

  // Mock data - 15 boutiques
  allBoutiques = signal<PublicBoutique[]>([
    {
      id: '1',
      name: 'Mode & Style',
      category: 'MODE',
      floor: 0,
      isOpen: true,
      description: 'Prêt-à-porter tendance pour toute la famille'
    },
    {
      id: '2',
      name: 'TechZone',
      category: 'TECH',
      floor: 1,
      isOpen: true,
      description: 'Électronique et gadgets dernière génération'
    },
    {
      id: '3',
      name: 'Beauty Corner',
      category: 'BEAUTE',
      floor: 0,
      isOpen: true,
      description: 'Cosmétiques et soins de qualité'
    },
    {
      id: '4',
      name: 'Sport Plus',
      category: 'SPORT',
      floor: 2,
      isOpen: true,
      description: 'Équipements sportifs pour tous les niveaux'
    },
    {
      id: '5',
      name: 'Gourmet House',
      category: 'FOOD',
      floor: 0,
      isOpen: true,
      description: 'Cuisine gastronomique et ambiance raffinée'
    },
    {
      id: '6',
      name: 'Kids Paradise',
      category: 'MODE',
      floor: 1,
      isOpen: true,
      description: 'Jouets et vêtements pour enfants'
    },
    {
      id: '7',
      name: 'Maison & Décoration',
      category: 'MAISON',
      floor: 2,
      isOpen: true,
      description: 'Mobilier et décoration intérieure'
    },
    {
      id: '8',
      name: 'Fast Food Express',
      category: 'FOOD',
      floor: 0,
      isOpen: true,
      description: 'Restauration rapide et snacks'
    },
    {
      id: '9',
      name: 'High-Tech Store',
      category: 'TECH',
      floor: 1,
      isOpen: false,
      description: 'Smartphones, ordinateurs et accessoires'
    },
    {
      id: '10',
      name: 'Beauté & Bien-être',
      category: 'BEAUTE',
      floor: 1,
      isOpen: true,
      description: 'Institut de beauté et spa'
    },
    {
      id: '11',
      name: 'Fashion Avenue',
      category: 'MODE',
      floor: 0,
      isOpen: true,
      description: 'Mode féminine et masculine'
    },
    {
      id: '12',
      name: 'Restaurant Le Jardin',
      category: 'FOOD',
      floor: 2,
      isOpen: true,
      description: 'Cuisine traditionnelle malgache'
    },
    {
      id: '13',
      name: 'Fitness Center',
      category: 'SPORT',
      floor: 2,
      isOpen: true,
      description: 'Équipements de fitness et nutrition'
    },
    {
      id: '14',
      name: 'Home Design',
      category: 'MAISON',
      floor: 1,
      isOpen: true,
      description: 'Décoration et ameublement moderne'
    },
    {
      id: '15',
      name: 'Boutique Générale',
      category: 'AUTRE',
      floor: 0,
      isOpen: true,
      description: 'Articles divers et souvenirs'
    }
  ]);

  // Filter signals
  searchQuery = signal<string>('');
  selectedCategory = signal<BoutiqueCategory | 'ALL'>('ALL');
  selectedFloor = signal<number | 'ALL'>('ALL');

  // Computed filtered boutiques
  filteredBoutiques = computed(() => {
    let filtered = this.allBoutiques();

    // Filter by search query
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query) ||
        this.getCategoryLabel(b.category).toLowerCase().includes(query)
      );
    }

    // Filter by category
    const category = this.selectedCategory();
    if (category !== 'ALL') {
      filtered = filtered.filter(b => b.category === category);
    }

    // Filter by floor
    const floor = this.selectedFloor();
    if (floor !== 'ALL') {
      filtered = filtered.filter(b => b.floor === floor);
    }

    return filtered;
  });

  // Get category label
  getCategoryLabel(category: BoutiqueCategory): string {
    const cat = this.categories.find(c => c.value === category);
    return cat?.label || category;
  }

  // Get category icon
  getCategoryIcon(category: BoutiqueCategory): string {
    const icons: Record<BoutiqueCategory, string> = {
      'MODE': 'checkroom',
      'FOOD': 'restaurant',
      'TECH': 'devices',
      'BEAUTE': 'spa',
      'SPORT': 'sports_soccer',
      'MAISON': 'chair',
      'AUTRE': 'store'
    };
    return icons[category] || 'store';
  }

  // Update search
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  // Update category filter
  onCategoryChange(category: BoutiqueCategory | 'ALL'): void {
    this.selectedCategory.set(category);
  }

  // Update floor filter
  onFloorChange(floor: number | 'ALL'): void {
    this.selectedFloor.set(floor);
  }

  // Clear all filters
  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('ALL');
    this.selectedFloor.set('ALL');
  }
}
