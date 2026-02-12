import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
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
  
  filterStatus: BoutiqueStatus | '' = '';
  filterCategory: BoutiqueCategory | '' = '';
  shopCategories : ShopCategory[] = [];
  shopStatus : ShopStatus[] = [];
  shops : Shop[] =[];
  constructor(private shopCategoryService : ShopCategoryService,
    private shopStatusService : ShopStatusService,
    private shopService : ShopService,
    private cdr : ChangeDetectorRef
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
      this.cdr.detectChanges();
    });
  }
  

  get filteredBoutiques(): Shop[] {
    return this.shops.filter(b => {
      
      const matchStatus = !this.filterStatus || b.shop_status?.value === this.filterStatus;
      const matchCategory = !this.filterCategory || b.shop_category?.value === this.filterCategory;
      return matchStatus && matchCategory;
    });
  }
  changeStatus(id: string, status: string): void {
    this.shopService.updateShopStatus(status, id).subscribe({
      next: (updatedShop) => {
        const index = this.shops.findIndex(b => b._id === id);

        if (index !== -1) {
          
          const newShops = [...this.shops];
          
          newShops[index] = updatedShop;
          
          this.shops = newShops;
          
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erreur mise à jour status', err);
      }
    });
  }

  
  getStatusLabelString(s:string):string{
    const map: Record<string, string> = {  'En attente':"pending",'Active':"active",  'Désactivée': "disable", 'Refusée':"rejected" };
    return map[s] ?? s;
  }

}
