import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FeaturedBoutique {
  id: string;
  name: string;
  category: string;
  logo?: string;
  rating: number;
  isOpen: boolean;
}

interface FeaturedProduct {
  id: string;
  name: string;
  boutique: string;
  price: number;
  promoPrice?: number;
  image?: string;
}

interface Promotion {
  id: string;
  title: string;
  boutique: string;
  discount: number;
  endDate: string;
}

@Component({
  selector: 'app-acheteur-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './acheteur-accueil.component.html',
  styleUrl: './acheteur-accueil.component.css'
})
export class AcheteurAccueilComponent {
  userName = signal('Jean');

  featuredBoutiques = signal<FeaturedBoutique[]>([
    { id: '1', name: 'Mode & Style', category: 'Mode', rating: 4.8, isOpen: true },
    { id: '2', name: 'TechZone', category: 'Électronique', rating: 4.6, isOpen: true },
    { id: '3', name: 'Beauty Corner', category: 'Beauté', rating: 4.9, isOpen: false },
    { id: '4', name: 'Sport Plus', category: 'Sport', rating: 4.5, isOpen: true },
    { id: '5', name: 'Bijoux Précieux', category: 'Bijouterie', rating: 4.7, isOpen: true },
    { id: '6', name: 'Home Design', category: 'Maison', rating: 4.4, isOpen: true }
  ]);

  featuredProducts = signal<FeaturedProduct[]>([
    { id: '1', name: 'Robe été fleurie', boutique: 'Mode & Style', price: 75000, promoPrice: 59000 },
    { id: '2', name: 'Casque Bluetooth Pro', boutique: 'TechZone', price: 185000 },
    { id: '3', name: 'Coffret parfum luxe', boutique: 'Beauty Corner', price: 120000, promoPrice: 95000 },
    { id: '4', name: 'Sneakers urbaines', boutique: 'Sport Plus', price: 145000 },
    { id: '5', name: 'Montre connectée', boutique: 'TechZone', price: 250000, promoPrice: 199000 },
    { id: '6', name: 'Collier perles', boutique: 'Bijoux Précieux', price: 85000 }
  ]);

  promotions = signal<Promotion[]>([
    { id: '1', title: 'Soldes d\'hiver', boutique: 'Mode & Style', discount: 30, endDate: '2026-02-15' },
    { id: '2', title: 'Flash Sale Tech', boutique: 'TechZone', discount: 20, endDate: '2026-02-05' },
    { id: '3', title: 'Beauté en fête', boutique: 'Beauty Corner', discount: 25, endDate: '2026-02-10' }
  ]);

  categories = [
    { icon: 'checkroom', label: 'Mode', count: 24 },
    { icon: 'devices', label: 'Électronique', count: 12 },
    { icon: 'spa', label: 'Beauté', count: 18 },
    { icon: 'sports_soccer', label: 'Sport', count: 8 },
    { icon: 'diamond', label: 'Bijouterie', count: 6 },
    { icon: 'restaurant', label: 'Alimentation', count: 15 },
    { icon: 'chair', label: 'Maison', count: 10 },
    { icon: 'more_horiz', label: 'Autres', count: 20 }
  ];

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
  }

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
