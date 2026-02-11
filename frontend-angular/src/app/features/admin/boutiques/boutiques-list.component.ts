import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BOUTIQUE_CATEGORIES } from '../../../core/models/boutique.model';
import type { BoutiqueCategory, BoutiqueStatus } from '../../../core/models/boutique.model';
import { ShopCategory } from '../../../core/models/shop/shopCategory.model';
import { ShopCategoryService } from '../../../core/services/shop/shop-category.service';
import { ShopStatus } from '../../../core/models/shop/shopStatus.model';
import { ShopStatusService } from '../../../core/services/shop/shop-status.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { Shop } from '../../../core/models/shop/shop.model';
import { ShopService } from '../../../core/services/shop/shop.service';

interface BoutiqueRow {
  id: string;
  name: string;
  category: BoutiqueCategory;
  status: BoutiqueStatus;
  ownerEmail: string;
  monthlyRent: number;
  rentPaidUntil?: string;
}

@Component({
  selector: 'app-boutiques-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './boutiques-list.component.html',
  styleUrl: './boutiques-list.component.css'
})
export class BoutiquesListComponent {
  categories = BOUTIQUE_CATEGORIES;
  filterStatus: BoutiqueStatus | '' = '';
  filterCategory: BoutiqueCategory | '' = '';
  shopCategories : ShopCategory[] = [];
  shopStatus : ShopStatus[] = [];
  shops : Shop[] =[];
  constructor(private shopCategoryService : ShopCategoryService,
    private shopStatusService : ShopStatusService,
    private shopService : ShopService
  ){}
  
  ngOnInit(): void {
    forkJoin({
      categories: this.shopCategoryService.getShopCategories(),
      status: this.shopStatusService.getShopStatus(),
      shops : this.shopService.getShops()
    }).subscribe(({ categories, status, shops }) => {
      this.shopCategories = categories;
      this.shopStatus = status;
      this.shops = shops;
      console.log(categories);
      console.log(this.shops);
    });
  }
  // Données mock
  boutiques: BoutiqueRow[] = [
    { id: '1', name: 'TechZone', category: 'TECH', status: 'ACTIVE', ownerEmail: 'contact@techzone.mg', monthlyRent: 850000, rentPaidUntil: '2025-02-28' },
    { id: '2', name: 'Fashion House', category: 'MODE', status: 'ACTIVE', ownerEmail: 'info@fashionhouse.mg', monthlyRent: 620000, rentPaidUntil: '2025-03-15' },
    { id: '3', name: 'Food Court Sushi', category: 'FOOD', status: 'PENDING', ownerEmail: 'sushi@foodcourt.mg', monthlyRent: 450000 },
    { id: '4', name: 'Beauté & Soins', category: 'BEAUTE', status: 'ACTIVE', ownerEmail: 'contact@beaute.mg', monthlyRent: 380000, rentPaidUntil: '2025-01-31' },
    { id: '5', name: 'Sport Pro', category: 'SPORT', status: 'DISABLED', ownerEmail: 'pro@sport.mg', monthlyRent: 520000 }
  ];

  get filteredBoutiques(): Shop[] {
    return this.shops.filter(b => {
      
      const matchStatus = !this.filterStatus || b.shop_status?.value === this.filterStatus;
      const matchCategory = !this.filterCategory || b.shop_category?.value === this.filterCategory;
      return matchStatus && matchCategory;
    });
  }

  getStatusLabel(s: BoutiqueStatus): string {
    const map: Record<BoutiqueStatus, string> = { PENDING: 'En attente', ACTIVE: 'Active', DISABLED: 'Désactivée', REJECTED: 'Refusée' };
    return map[s] ?? s;
  }
  getStatusLabelString(s:string):string{
    const map: Record<string, string> = {  'En attente':"pending",'Active':"active",  'Désactivée': "disable", 'Refusée':"rejected" };
    return map[s] ?? s;
  }

  getCategoryLabel(c: BoutiqueCategory): string {
    return this.categories.find(x => x.value === c)?.label ?? c;
  }
}
