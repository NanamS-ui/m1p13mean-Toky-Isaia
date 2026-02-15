import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ProductCategory } from '../../../core/models/product/product-category.model';
import { Shop } from '../../../core/models/shop/shop.model';
import { ProductCategoryService } from '../../../core/services/product/product-category.service';
import { ShopService } from '../../../core/services/shop/shop.service';
import { forkJoin } from 'rxjs';
import { ProductService } from '../../../core/services/product/product.service';

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
    private productService : ProductService, private router : Router
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
    })
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

  toggleTag(tag: string): void {
    this.selectedTags.update(tags => {
      if (tags.includes(tag)) {
        return tags.filter(t => t !== tag);
      }
      return [...tags, tag];
    });
  }

  addTag(): void {
    if (this.newTag.trim() && !this.tags().includes(this.newTag.trim())) {
      this.tags.update(tags => [...tags, this.newTag.trim()]);
      this.selectedTags.update(tags => [...tags, this.newTag.trim()]);
      this.newTag = '';
    }
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
    const request$ = this.productService.createProductStock(formValue);
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
