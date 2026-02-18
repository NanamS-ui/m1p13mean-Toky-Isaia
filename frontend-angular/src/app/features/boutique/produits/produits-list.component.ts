import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductCategory } from '../../../core/models/product/product-category.model';
import { Stock, StockView } from '../../../core/models/product/stock.model';
import { ProductCategoryService } from '../../../core/services/product/product-category.service';
import { StockService } from '../../../core/services/product/stock.service';
import { forkJoin } from 'rxjs';
import { Shop } from '../../../core/models/shop/shop.model';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  promoPrice?: number;
  stock: number;
  category: string;
  images: string[];
  status: 'active' | 'inactive' | 'outOfStock';
  sales: number;
  createdAt: string;
}

@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './produits-list.component.html',
  styleUrl: './produits-list.component.css'
})
export class ProduitsListComponent {
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  viewMode = signal<'grid' | 'list'>('grid');

  productCategories : ProductCategory[] = [];
  stockViews : Stock[] =[];
  shops : Shop[] = [];
  constructor(private productCategoryService: ProductCategoryService, 
    private stockService : StockService, private cdr : ChangeDetectorRef
  ){}
  ngOnInit(): void {
    forkJoin({
      categories : this.productCategoryService.getProductCategories(),
      stocks : this.stockService.getStockPricePromotion()
    }).subscribe(({categories,stocks})=>{
      this.productCategories = categories;
      this.stockViews = stocks;
      const shopMap: Record<string, Shop> = {};
      stocks.forEach(stock => {
        if (stock.shop && !shopMap[stock.shop._id]) {
          shopMap[stock.shop._id] = stock.shop;
        }
      });
    this.shops = Object.values(shopMap);
      this.cdr.detectChanges();
    })
  }


  categories = [
    'Vêtements Femme',
    'Vêtements Homme',
    'Accessoires',
    'Chaussures',
    'Bijoux'
  ];

  products = signal<Product[]>([
    {
      id: '1',
      name: 'Robe été fleurie',
      sku: 'ROB-001',
      price: 75000,
      promoPrice: 59000,
      stock: 15,
      category: 'Vêtements Femme',
      images: [],
      status: 'active',
      sales: 45,
      createdAt: '2025-12-01'
    },
    {
      id: '2',
      name: 'Jean slim noir',
      sku: 'JEA-002',
      price: 89000,
      stock: 8,
      category: 'Vêtements Homme',
      images: [],
      status: 'active',
      sales: 38,
      createdAt: '2025-11-15'
    },
    {
      id: '3',
      name: 'T-shirt basic blanc',
      sku: 'TSH-003',
      price: 25000,
      stock: 50,
      category: 'Vêtements Homme',
      images: [],
      status: 'active',
      sales: 62,
      createdAt: '2025-10-20'
    },
    {
      id: '4',
      name: 'Veste en cuir',
      sku: 'VES-004',
      price: 320000,
      stock: 3,
      category: 'Vêtements Femme',
      images: [],
      status: 'active',
      sales: 12,
      createdAt: '2025-09-10'
    },
    {
      id: '5',
      name: 'Sneakers urbaines',
      sku: 'SNE-005',
      price: 145000,
      promoPrice: 115000,
      stock: 0,
      category: 'Chaussures',
      images: [],
      status: 'outOfStock',
      sales: 28,
      createdAt: '2025-08-25'
    },
    {
      id: '6',
      name: 'Sac à main cuir',
      sku: 'SAC-006',
      price: 180000,
      stock: 7,
      category: 'Accessoires',
      images: [],
      status: 'active',
      sales: 19,
      createdAt: '2025-07-30'
    },
    {
      id: '7',
      name: 'Collier perles',
      sku: 'COL-007',
      price: 45000,
      stock: 12,
      category: 'Bijoux',
      images: [],
      status: 'inactive',
      sales: 8,
      createdAt: '2025-06-15'
    }
  ]);
  get filteredStocks(): Stock[] {
    const query = this.searchQuery?.toLowerCase() || '';

    return this.stockViews.filter(stock => {
      const product = stock.product;

      const matchName = !query || product.name.toLowerCase().includes(query);

      const matchReference = !product.reference || !query || product.reference.toLowerCase().includes(query);

      const matchCategory = !this.selectedCategory || product.product_category._id === this.selectedCategory;
      const matchBoutique = !this.selectedStatus || stock.shop._id === this.selectedStatus;

      return matchName && matchReference && matchCategory && matchBoutique;
    });
  }


  filteredProducts = computed(() => {
    let result = this.products();

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory) {
      result = result.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedStatus) {
      result = result.filter(p => p.status === this.selectedStatus);
    }

    return result;
  });

  
  get stats()  {
    const all = this.stockViews;
    const shops = this.shops;
    return {
      total: all.length,
      shop: shops.length,
      outOfStock: all.filter(p => p.reste === 0).length,
      lowStock: all.filter(p => p.reste > 0 && p.reste <= p.alerte).length
    };
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'active': 'Actif',
      'inactive': 'Inactif',
      'outOfStock': 'Rupture'
    };
    return labels[status] || status;
  }

  getStockStatus(stock: number): 'ok' | 'low' | 'out' {
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'ok';
  }

  toggleProductStatus(product: Product): void {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    this.products.update(products => 
      products.map(p => p.id === product.id ? { ...p, status: newStatus } : p)
    );
  }
  

  deleteProductStock(stock: Stock): void {
    if (!confirm(`Vous êtes sûre de supprimer "${stock.product?.name}" ?`)) {
      return;
    }

    this.stockService.deleteStock(stock._id).subscribe({
      next: () => {

        this.stockViews = this.stockViews.filter(
          s => s._id !== stock._id
        );

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }


}
