import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

interface Product {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  promoPrice?: number;
  category: string;
  boutiqueId: string;
  boutiqueName: string;
  boutiqueLogo?: string;
  images?: string[];
  inStock: boolean;
  stockQuantity: number;
  onPromo: boolean;
  popularity: number;
  createdAt: string;
  specs: { [key: string]: string };
}

@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produit-detail.component.html',
  styleUrl: './produit-detail.component.css'
})
export class ProduitDetailComponent implements OnInit {
  quantity = signal(1);
  selectedImageIndex = signal(0);

  // Mock product data
  product = signal<Product | null>(null);

  // Mock related products
  relatedProducts = signal<Product[]>([
    {
      id: '2',
      name: 'Casque Bluetooth Pro',
      description: 'Casque sans fil avec réduction de bruit',
      fullDescription: 'Casque Bluetooth haute qualité avec réduction de bruit active, autonomie de 30h, design confortable.',
      price: 185000,
      category: 'Électronique',
      boutiqueId: '2',
      boutiqueName: 'TechZone',
      inStock: true,
      stockQuantity: 15,
      onPromo: false,
      popularity: 88,
      createdAt: '2026-01-20',
      specs: { 'Autonomie': '30h', 'Bluetooth': '5.0', 'Poids': '250g' }
    },
    {
      id: '5',
      name: 'Montre connectée',
      description: 'Montre intelligente avec suivi fitness',
      fullDescription: 'Montre connectée avec écran AMOLED, suivi fitness complet, GPS intégré, résistance à l\'eau.',
      price: 250000,
      promoPrice: 199000,
      category: 'Électronique',
      boutiqueId: '2',
      boutiqueName: 'TechZone',
      inStock: true,
      stockQuantity: 8,
      onPromo: true,
      popularity: 90,
      createdAt: '2026-01-18',
      specs: { 'Écran': '1.4" AMOLED', 'Autonomie': '7 jours', 'GPS': 'Oui' }
    },
    {
      id: '7',
      name: 'Téléphone portable',
      description: 'Smartphone dernière génération',
      fullDescription: 'Smartphone avec écran 6.7", processeur puissant, 128GB de stockage, triple caméra.',
      price: 450000,
      category: 'Électronique',
      boutiqueId: '2',
      boutiqueName: 'TechZone',
      inStock: true,
      stockQuantity: 5,
      onPromo: false,
      popularity: 98,
      createdAt: '2026-01-28',
      specs: { 'Écran': '6.7"', 'RAM': '8GB', 'Stockage': '128GB' }
    }
  ]);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get product ID from route
    const productId = this.route.snapshot.paramMap.get('id');
    
    // Mock product data - in real app, fetch from service
    const mockProduct: Product = {
      id: productId || '1',
      name: 'Robe été fleurie',
      description: 'Robe légère et élégante pour l\'été',
      fullDescription: 'Magnifique robe d\'été en coton léger avec motif floral. Parfaite pour les occasions décontractées et les sorties estivales. Matière respirante et confortable.',
      price: 75000,
      promoPrice: 59000,
      category: 'Mode',
      boutiqueId: '1',
      boutiqueName: 'Mode & Style',
      boutiqueLogo: undefined,
      images: undefined,
      inStock: true,
      stockQuantity: 12,
      onPromo: true,
      popularity: 95,
      createdAt: '2026-01-15',
      specs: {
        'Matière': 'Coton',
        'Taille': 'S, M, L, XL',
        'Couleur': 'Fleurie multicolore',
        'Entretien': 'Lavage à la main recommandé'
      }
    };

    this.product.set(mockProduct);
  }

  incrementQuantity(): void {
    const current = this.quantity();
    const max = this.product()?.stockQuantity || 1;
    if (current < max) {
      this.quantity.set(current + 1);
    }
  }

  decrementQuantity(): void {
    const current = this.quantity();
    if (current > 1) {
      this.quantity.set(current - 1);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      maximumFractionDigits: 0
    }).format(value);
  }

  addToCart(): void {
    const product = this.product();
    if (product && product.inStock) {
      // TODO: Implement cart service
      console.log('Add to cart:', {
        productId: product.id,
        quantity: this.quantity()
      });
    }
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  getSpecKeys(specs: { [key: string]: string } | undefined): string[] {
    if (!specs) {
      return [];
    }
    return Object.keys(specs);
  }

  getSpecEntries(specs: { [key: string]: string } | undefined): [string, string][] {
    if (!specs) {
      return [];
    }
    return Object.entries(specs);
  }
}
