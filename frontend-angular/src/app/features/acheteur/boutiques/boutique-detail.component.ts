import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { BOUTIQUE_CATEGORIES, type BoutiqueCategory } from '../../../core/models/boutique.model';

interface BoutiqueDetail {
  id: string;
  name: string;
  category: BoutiqueCategory;
  logoUrl?: string;
  bannerUrl?: string;
  description: string;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  floor: number;
  zone?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
  isFavorite: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  promoPrice?: number;
  imageUrl?: string;
  stock: number;
  rating: number;
}

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-boutique-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './boutique-detail.component.html',
  styleUrl: './boutique-detail.component.css'
})
export class BoutiqueDetailComponent {
  boutiqueId = signal<string>('');
  isFavorite = signal(false);

  // Mock boutique data
  boutique = signal<BoutiqueDetail | null>({
    id: '1',
    name: 'Mode & Style',
    category: 'MODE',
    description: 'Boutique de mode tendance pour hommes et femmes. Nous proposons une large sélection de vêtements, accessoires et chaussures des dernières tendances. Notre équipe passionnée vous conseille pour trouver le style qui vous correspond.',
    rating: 4.8,
    reviewCount: 124,
    isOpen: true,
    floor: 1,
    zone: 'Zone A',
    phone: '+261 34 12 345 67',
    email: 'contact@mode-style.mg',
    website: 'www.mode-style.mg',
    hours: [
      { day: 'Lundi', open: '09:00', close: '20:00' },
      { day: 'Mardi', open: '09:00', close: '20:00' },
      { day: 'Mercredi', open: '09:00', close: '20:00' },
      { day: 'Jeudi', open: '09:00', close: '20:00' },
      { day: 'Vendredi', open: '09:00', close: '21:00' },
      { day: 'Samedi', open: '09:00', close: '21:00' },
      { day: 'Dimanche', open: '10:00', close: '19:00' }
    ],
    isFavorite: false
  });

  // Mock products
  products = signal<Product[]>([
    {
      id: '1',
      name: 'Robe été fleurie',
      price: 75000,
      promoPrice: 59000,
      stock: 15,
      rating: 4.7
    },
    {
      id: '2',
      name: 'Jean slim noir',
      price: 89000,
      stock: 8,
      rating: 4.5
    },
    {
      id: '3',
      name: 'T-shirt basic blanc',
      price: 25000,
      stock: 50,
      rating: 4.6
    },
    {
      id: '4',
      name: 'Veste en cuir',
      price: 320000,
      stock: 3,
      rating: 4.8
    },
    {
      id: '5',
      name: 'Sneakers urbaines',
      price: 145000,
      promoPrice: 115000,
      stock: 12,
      rating: 4.4
    },
    {
      id: '6',
      name: 'Sac à main cuir',
      price: 180000,
      stock: 7,
      rating: 4.9
    }
  ]);

  // Mock reviews
  reviews = signal<Review[]>([
    {
      id: '1',
      userName: 'Marie R.',
      rating: 5,
      comment: 'Excellente boutique ! Les vêtements sont de très bonne qualité et le service est impeccable. Je recommande vivement.',
      date: '2026-01-15'
    },
    {
      id: '2',
      userName: 'Jean P.',
      rating: 4,
      comment: 'Bonne sélection de produits, prix raisonnables. Le personnel est accueillant et compétent.',
      date: '2026-01-10'
    },
    {
      id: '3',
      userName: 'Sophie L.',
      rating: 5,
      comment: 'Ma boutique préférée ! Toujours les dernières tendances et des conseils personnalisés. Parfait !',
      date: '2026-01-05'
    },
    {
      id: '4',
      userName: 'Thomas M.',
      rating: 4,
      comment: 'Très satisfait de mes achats. La qualité est au rendez-vous et les prix sont compétitifs.',
      date: '2025-12-28'
    }
  ]);

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.boutiqueId.set(params['id']);
      // In a real app, fetch boutique data based on ID
      this.isFavorite.set(this.boutique()?.isFavorite ?? false);
    });
  }

  getCategoryLabel(category: BoutiqueCategory): string {
    return BOUTIQUE_CATEGORIES.find(c => c.value === category)?.label ?? category;
  }

  toggleFavorite(): void {
    this.isFavorite.update(fav => !fav);
    // In a real app, save to backend
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  }

  getCurrentDay(): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date().getDay()];
  }

  getTodayHours(): string | null {
    const today = this.getCurrentDay();
    const hours = this.boutique()?.hours.find(h => h.day === today);
    if (!hours) return null;
    return `${hours.open} - ${hours.close}`;
  }
}
