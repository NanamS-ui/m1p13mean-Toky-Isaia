import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { StockService } from '../../../core/services/product/stock.service';
import { CartService } from '../../../core/services/order/cart.service';
import type { CatalogFilterCriteria, CatalogProduct } from '../../../core/models/product/catalog-product.model';

interface Product {
  id: string;
  stockId: string;
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

  product = signal<Product | null>(null);

  relatedProducts = signal<Product[]>([]);

  constructor(
    private route: ActivatedRoute,
    private stockService: StockService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.product.set(null);
      return;
    }

    this.loadProduct(productId);
  }

  private loadProduct(productId: string): void {
    this.stockService.getCatalogByProduct(productId).subscribe({
      next: (items) => {
        const item = items?.[0];
        if (!item) {
          this.product.set(null);
          this.relatedProducts.set([]);
          return;
        }

        const detail = this.mapCatalogToDetail(item);
        this.product.set(detail);
        this.quantity.set(1);
        this.selectedImageIndex.set(0);

        this.loadRelated(detail.category, detail.id);
      },
      error: () => {
        this.product.set(null);
        this.relatedProducts.set([]);
      }
    });
  }

  private loadRelated(category: string, currentId: string): void {
    const criteria: CatalogFilterCriteria = {
      searchQuery: '',
      selectedCategory: category,
      minPrice: null,
      maxPrice: null,
      inStockOnly: false,
      onPromoOnly: false,
      sortBy: 'popularity'
    };

    this.stockService.getCatalog(criteria).subscribe({
      next: (items) => {
        const mapped = (items || [])
          .filter(item => item.id !== currentId)
          .slice(0, 6)
          .map(item => this.mapCatalogToDetail(item));
        this.relatedProducts.set(mapped);
      },
      error: () => {
        this.relatedProducts.set([]);
      }
    });
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
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
  }

  addToCart(): void {
    const product = this.product();
    if (product && product.inStock) {
      this.cartService.addItem({
        stockId: product.stockId,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0],
        price: product.price,
        promoPrice: product.promoPrice,
        quantity: this.quantity(),
        boutiqueId: product.boutiqueId,
        boutiqueName: product.boutiqueName,
        inStock: product.inStock
      }, this.quantity());
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

  private mapCatalogToDetail(item: CatalogProduct): Product {
    return {
      id: item.id,
      stockId: item.stockId,
      name: item.name,
      description: item.description,
      fullDescription: item.description,
      price: item.price,
      promoPrice: item.promoPrice,
      category: item.category,
      boutiqueId: item.boutiqueId,
      boutiqueName: item.boutiqueName,
      boutiqueLogo: item.boutiqueLogo,
      images: item.image ? [item.image] : [],
      inStock: item.inStock,
      stockQuantity: item.stockQuantity,
      onPromo: item.onPromo,
      popularity: item.popularity,
      createdAt: item.createdAt,
      specs: {}
    };
  }
}
