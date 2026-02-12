import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { Floor } from '../../../core/models/shop/floor.model';
import { Door } from '../../../core/models/shop/door.model';
import { ShopCategory } from '../../../core/models/shop/shopCategory.model';

import { ShopCategoryService } from '../../../core/services/shop/shop-category.service';
import { FloorService } from '../../../core/services/shop/floor.service';
import { DoorService } from '../../../core/services/shop/door.service';
import { ShopService } from '../../../core/services/shop/shop.service';

@Component({
  selector: 'app-boutique-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './boutique-form.component.html',
  styleUrl: './boutique-form.component.css'
})
export class BoutiqueFormComponent implements OnInit {
  form!: FormGroup; 
  floors: Floor[] = [];
  doors: Door[] = [];
  shopCategories: ShopCategory[] = [];
  shopId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private shopCategorieService: ShopCategoryService,
    private floorService: FloorService,
    private doorService: DoorService,
    private cdr: ChangeDetectorRef,
    private shopService: ShopService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    
    this.initForm();

    
    this.shopId = this.route.snapshot.paramMap.get('id');

    
    this.loadStaticData();
  }

  private initForm(): void {
    this.form = this.fb.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category: ['', Validators.required],
      zone: ['', Validators.required], 
      door: [{ value: '', disabled: true }, Validators.required]
    });

    
    this.form.get('zone')?.valueChanges.subscribe(floorId => {
      
      if (floorId) {
        this.loadDoorsForFloor(floorId);
      } else {
        this.doors = [];
        this.form.get('door')?.disable();
        this.form.get('door')?.reset();
      }
    });
  }

  private loadStaticData(): void {
    forkJoin({
      categories: this.shopCategorieService.getShopCategories(),
      floors: this.floorService.getFloors()
    }).subscribe(({ categories, floors }) => {
      this.shopCategories = categories;
      this.floors = floors;
      
      this.cdr.detectChanges();
      if (this.shopId) {
        this.loadShopForEdit(this.shopId);
      }
    });
  }

  private loadDoorsForFloor(floorId: string): void {
    this.form.get('door')?.disable();
    this.doorService.getAvailableDoorsByFloor(floorId).subscribe(doors => {
      this.doors = doors;
      this.form.get('door')?.enable();
      this.cdr.detectChanges();
    });
  }

  private loadShopForEdit(id: string): void {
    this.shopService.getShopById(id).subscribe(shop => {
      const door = shop.door as any; 
      const floorId = door.floor && door.floor._id ? door.floor._id : door.floor;

      
      if (floorId) {
        this.doorService.getAvailableDoorsByFloor(floorId).subscribe(availableDoors => {
          this.doors = availableDoors;

          const isCurrentDoorInList = this.doors.find(d => d._id === door._id);
          if (!isCurrentDoorInList) {
            this.doors.push(door); 
          }

          
          this.form.get('door')?.enable({ emitEvent: false });

          this.form.patchValue({
            name: shop.name,
            description: shop.description,
            category: shop.shop_category._id,
            zone: floorId,
            door: door._id
          }, { emitEvent: false });

          this.cdr.detectChanges();
        });
      } else {
        
        this.form.patchValue({
            name: shop.name,
            description: shop.description,
            category: shop.shop_category._id
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const payload = {
      name: formValue.name,
      description: formValue.description,
      door: formValue.door,
      shop_category: formValue.category
    };

    const request$ = this.shopId 
      ? this.shopService.updateShop(this.shopId, payload)
      : this.shopService.createShop(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/admin/boutiques']),
      error: (err) => console.error('Erreur lors de la sauvegarde', err)
    });
  }
}