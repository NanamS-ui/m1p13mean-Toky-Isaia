import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ProductCategory } from '../../../core/models/product/product-category.model';
import { Shop } from '../../../core/models/shop/shop.model';
import { ProductCategoryService } from '../../../core/services/product/product-category.service';
import { ShopService } from '../../../core/services/shop/shop.service';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product/product.service';
import { Stock } from '../../../core/models/product/stock.model';
import { StockService } from '../../../core/services/product/stock.service';

@Component({
  selector: 'app-produit-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './produit-form.component.html',
  styleUrl: './produit-form.component.css'
})
export class ProduitFormComponent {
  form: FormGroup;
  isEditMode = false;
  activeTab = signal<'general' | 'images' | 'pricing' | 'stock'>('general');
  imagePreviews = signal<string[]>([]);
  productCategories : ProductCategory[] =[];
  shops : Shop[] =[]; 
  stock : Stock = new Stock();
  stockId : string | null = null;
  categories = [
    'Vêtements Femme',
    'Vêtements Homme',
    'Accessoires',
    'Chaussures',
    'Bijoux'
  ];

  tags = signal<string[]>(['Nouveauté', 'Tendance', 'Été 2026', 'Promo']);
  selectedTags = signal<string[]>([]);
  newTag = '';

  constructor(private fb: FormBuilder, private productCategoryService : ProductCategoryService,
    private shopService : ShopService, private cdr : ChangeDetectorRef,
    private productService : ProductService, private router : Router,
    private route : ActivatedRoute, private stockService : StockService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      sku: [''],
      description: [''],
      category: ['', Validators.required],
      boutique: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      promoPrice: [null],
      promoStart: [''],
      promoEnd: [''],
      priceStart: [''],
      priceEnd: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      lowStockAlert: [5],
      weight: [null],
      dimensions: [''],
      isActive: [true]
    });

    this.stockId = this.route.snapshot.paramMap.get("id");

    this.initData();
  }
  private initData():void{
    forkJoin({
      categories : this.productCategoryService.getProductCategories(),
      shops : this.shopService.getShopsByOwner()
    }).subscribe(({categories, shops})=>{
      this.productCategories = categories;
      this.shops = shops;
      this.cdr.detectChanges();
      if(this.stockId){
        
        this.loadStockForEdit(this.stockId);
      }
    })
  }
  private loadStockForEdit(id : string) : void{
    this.stockService.getStockViewById(id).subscribe(stockResult =>{
      console.log(stockResult);
      this.stock = stockResult;
      this.form.patchValue({
        name: this.stock.product.name,
        sku: this.stock.product.reference,
        description: this.stock.product.description,
        category: this.stock.product.product_category._id,
        boutique: this.stock.shop._id,
        price: this.stock.current_price?.price ?? 0,
        promoPrice: this.stock.current_promotion?.percent ?? 0,
        promoStart: this.formatDateForInput(this.stock.current_promotion?.started_date),
        promoEnd: this.formatDateForInput(this.stock.current_promotion?.end_date),
        priceStart: this.formatDateForInput(this.stock.current_price?.started_date),
        priceEnd: this.formatDateForInput(this.stock.current_price?.end_date),
        stock: this.stock.reste,
        lowStockAlert: this.stock.alerte,
        weight: this.stock.product.poids,
        dimensions: this.stock.product.dimension,
        isActive: [true]
      },{ emitEvent: false });

      this.cdr.detectChanges();
    });
  }
  private formatDateForInput(date?: string | Date | null): string | null {
    if (!date) return null;

    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }


  setTab(tab: 'general' | 'images' | 'pricing' | 'stock'): void {
    this.activeTab.set(tab);
  }

  onImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.update(imgs => [...imgs, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.update(imgs => imgs.filter((_, i) => i !== index));
  }

  

  generateSku(): void {
    const name = this.form.get('name')?.value || '';
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.form.patchValue({ sku: `${prefix}-${random}` });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const data = {
      ...this.form.getRawValue(),
      tags: this.selectedTags(),
      images: this.imagePreviews()
    };
    this.submitForm();
    console.log('Produit enregistré:', data);
  }
  private submitForm():void{
    const formValue = this.form.getRawValue();
    const request$ = this.stockId ? this.productService.updateProductByFormulaire(this.stockId, formValue) :this.productService.createProductStock(formValue);
    // const request$ = this.productService.createProductStock(formValue);
    request$.subscribe({
      next: () => {
        this.router.navigate(['/boutique/produits']);
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde', err);
      }
    })
  }
}
