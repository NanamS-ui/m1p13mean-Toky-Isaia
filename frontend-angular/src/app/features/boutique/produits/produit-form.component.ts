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
import { ImageService } from '../../../core/services/product/image.service';

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
  uploadedImages = signal<any[]>([]);
  productCategories : ProductCategory[] =[];
  shops : Shop[] =[]; 
  stock : Stock = new Stock();
  stockId : string | null = null;
  isUploading = signal<boolean>(false);
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
    private route : ActivatedRoute, private stockService : StockService,
    private imageService : ImageService
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
      // weight: [null],
      // dimensions: [''],
      image: [''],
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
        image: this.stock.product.image || '',
        isActive: [true]
      },{ emitEvent: false });

      // Charger l'image existante si elle existe
      if (this.stock.product.image) {
        this.uploadedImages.set([{
          url: this.stock.product.image,
          publicId: '',
          preview: this.stock.product.image,
          index: 0
        }]);
        this.imagePreviews.set([this.stock.product.image]);
      }

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
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; // Prendre seulement la première image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.set([reader.result as string]); // Remplacer l'image existante
        this.uploadedImages.set([]); // Réinitialiser les images uploadées
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number): void {
    this.imagePreviews.set([]);
    this.uploadedImages.set([]);
    this.form.patchValue({ image: '' });
  }

  

  generateSku(): void {
    const name = this.form.get('name')?.value || '';
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.form.patchValue({ sku: `${prefix}-${random}` });
  }

  onSubmit(): void {
    if (this.form.invalid || this.imagePreviews().length === 0) {
      console.error('Formulaire invalide ou pas d\'images');
      return;
    }
    
    this.isUploading.set(true);
    this.uploadAllImages();
  }

  private uploadAllImages(): void {
    const imagesToUpload = this.imagePreviews().filter(
      (_, i) => !this.uploadedImages().find(uploaded => uploaded.preview === this.imagePreviews()[i])
    );

    if (imagesToUpload.length === 0) {
      // L'image est déjà uploadée
      this.submitForm();
      return;
    }

    // Upload de l'image unique
    const base64Image = imagesToUpload[0];
    this.imageService.uploadImage(base64Image, 'products').subscribe({
      next: (response) => {
        this.uploadedImages.set([{
          url: response.url,
          publicId: response.publicId,
          preview: base64Image,
          index: 0
        }]);

        // Mettre à jour le formulaire avec l'URL de l'image
        this.form.patchValue({ image: response.url });
        this.isUploading.set(false);
        this.submitForm();
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload de l\'image', error);
        this.isUploading.set(false);
        alert('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
      }
    });
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
