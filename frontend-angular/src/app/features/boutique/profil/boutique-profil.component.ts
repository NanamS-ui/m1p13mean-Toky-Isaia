import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Shop } from '../../../core/models/shop/shop.model';
import { ShopService } from '../../../core/services/shop/shop.service';
import { ShopCategoryService } from '../../../core/services/shop/shop-category.service';
import { UploadService } from '../../../core/services/shop/upload.service';
import { forkJoin } from 'rxjs';
import { ShopCategory } from '../../../core/models/shop/shopCategory.model';
import { OpeningHourShop } from '../../../core/models/shop/openingHours.model';
import { Suspension } from '../../../core/models/suspension/suspension.model';
 

interface BoutiqueProfil {
  name: string;
  description: string;
  logo: string | null;
  banner: string | null;
  category: string;
  email: string;
  phone: string;
  address: string;
  location: string; // Emplacement dans le centre
  status: 'pending' | 'active' | 'suspended';
  createdAt: string;
}

interface OpeningHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

@Component({
  selector: 'app-boutique-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './boutique-profil.component.html',
  styleUrl: './boutique-profil.component.css'
})
export class BoutiqueProfilComponent {
  form: FormGroup;
  activeTab = signal<'general' | 'horaires' | 'apparence'>('general');
  logoPreview = signal<string | null>(null);
  bannerPreview = signal<string | null>(null);
  shopId: string | null = null;
  shop: Shop  = new Shop();
  shopCategories :ShopCategory[]=[];
  isUploadingLogo = signal(false);
  isUploadingBanner = signal(false);
  uploadError = signal<string | null>(null);

  boutique = signal<BoutiqueProfil>({
    name: 'Ma Boutique Mode',
    description: 'Boutique de vêtements tendance pour homme et femme. Nous proposons les dernières collections à des prix accessibles.',
    logo: null,
    banner: null,
    category: 'Mode & Accessoires',
    email: 'contact@maboutique.mg',
    phone: '+261 34 00 000 00',
    address: 'Centre Commercial KORUS, Niveau 1, Local 15',
    location: 'Niveau 1 - Zone A - Local 15',
    status: 'active',
    createdAt: '2025-06-15'
  });

  categories = [
    'Mode & Accessoires',
    'Électronique',
    'Beauté & Cosmétiques',
    'Alimentation',
    'Sport & Loisirs',
    'Maison & Déco',
    'Bijouterie',
    'Services'
  ];

  days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private shopService: ShopService,
    private shopCategoryService: ShopCategoryService,
    private uploadService: UploadService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ["", Validators.required],
      description: ["", Validators.required],
      category: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.required],
      openingHours: this.fb.array([])
    });
    this.shopId = this.route.snapshot.paramMap.get('id');
    this.initData(this.shopId);
  }
  private initData(shopId: string|null): void{
    if(shopId){
      forkJoin({
        categories : this.shopCategoryService.getShopCategories(),
        shop : this.shopService.getShopById(shopId)
      }).subscribe(({categories,shop}) =>{
        this.shopCategories = categories;
        this.shop = shop;
        

        this.form = this.fb.group({
          name: [shop.name, Validators.required],
          description: [shop.description, Validators.required],
          category: [shop.shop_category._id, Validators.required],
          email: [shop.email, [Validators.required, Validators.email]],
          phone: [shop.phone, Validators.required],
          openingHours: this.fb.array(this.initOpeningHours(shop))
        });
        this.logoPreview.set(shop.logo ?? null);
        this.bannerPreview.set(shop.banner ?? null);
        this.cdr.detectChanges();
      });
    }
    

  }

  private initOpeningHours(shop:Shop): FormGroup[] {
    let defaultHours: OpeningHourShop[] = []
    if(shop.opening_hours.length == 0){
      defaultHours =[
        { day: 'Lundi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Mardi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Mercredi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Jeudi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Vendredi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
        { day: 'Samedi', isOpen: true, openTime: '09:00', closeTime: '20:00' },
        { day: 'Dimanche', isOpen: false, openTime: '10:00', closeTime: '18:00' }
      ];
    }else{
      defaultHours = shop.opening_hours;
    }
    
    return defaultHours.map(h => this.fb.group({
      day: [h.day],
      isOpen: [h.isOpen],
      openTime: [h.openTime],
      closeTime: [h.closeTime]
    }));
  }

  get openingHours(): FormArray {
    return this.form.get('openingHours') as FormArray;
  }

  setTab(tab: 'general' | 'horaires' | 'apparence'): void {
    this.activeTab.set(tab);
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.uploadError.set('Format accepté : JPG, PNG ou WebP');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.uploadError.set('Le logo doit faire moins de 2 Mo');
      return;
    }

    this.uploadError.set(null);
    this.isUploadingLogo.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      this.uploadService.uploadShopLogo(base64).subscribe({
        next: (res) => {
          this.logoPreview.set(res.url);
          this.shop.logo = res.url;
          this.isUploadingLogo.set(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.uploadError.set(err.error?.message ?? 'Erreur lors de l\'upload du logo');
          this.isUploadingLogo.set(false);
          this.cdr.detectChanges();
        }
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  onBannerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.uploadError.set('Format accepté : JPG, PNG ou WebP');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.uploadError.set('La bannière doit faire moins de 5 Mo');
      return;
    }

    this.uploadError.set(null);
    this.isUploadingBanner.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : '';
      this.uploadService.uploadShopBanner(base64).subscribe({
        next: (res) => {
          this.bannerPreview.set(res.url);
          this.shop.banner = res.url;
          this.isUploadingBanner.set(false);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.uploadError.set(err.error?.message ?? 'Erreur lors de l\'upload de la bannière');
          this.isUploadingBanner.set(false);
          this.cdr.detectChanges();
        }
      });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeLogo(): void {
    this.logoPreview.set(null);
    this.shop.logo = undefined;
    this.uploadError.set(null);
    this.cdr.detectChanges();
  }

  removeBanner(): void {
    this.bannerPreview.set(null);
    this.shop.banner = undefined;
    this.uploadError.set(null);
    this.cdr.detectChanges();
  }
  copyFormMonday(){
    let open = this.form.getRawValue().openingHours;
    for (let index = 1; index < open.length; index++) {
      open[index].isOpen = open[0].isOpen;
      open[index].openTime = open[0].openTime;
      open[index].closeTime = open[0].closeTime;
    }
    console.log(open);
    this.form.patchValue({
      openingHours : open
    });
    this.cdr.detectChanges();

  }
  onSubmit(): void {
    if (this.form.invalid) return;
    const formValue = this.form.getRawValue();
    const payload = {
      name: formValue.name,
      description: formValue.description,
      phone: formValue.phone,
      email: formValue.email,
      shop_category: formValue.category,
      opening_hours: formValue.openingHours,
      logo: this.logoPreview() ?? null,
      banner: this.bannerPreview() ?? null
    };
    if (this.shopId) {
      const request$ = this.shopService.updateShop(this.shopId, payload as unknown as Partial<Shop>)

      request$.subscribe({
        next: () => {
          this.router.navigate(['/boutique/profil/list']);
        },
        error: (err) => {
          console.error('Erreur lors de la sauvegarde', err);
        }
      });
    }
    
      
    console.log('Profil mis à jour:', this.form.getRawValue());
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'En attente de validation',
      'active': 'Active',
      'suspended': 'Suspendue'
    };
    return labels[status] || status;
  }
  getStatusLabelString(s:string):string{
    const map: Record<string, string> = {  'En attente':"pending",'Active':"active",  'Désactivée': "disable", 'Refusée':"rejected" };
    return map[s] ?? s;
  }
}
