import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      sku: [''],
      description: [''],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      promoPrice: [null],
      promoStart: [''],
      promoEnd: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      lowStockAlert: [5],
      weight: [null],
      dimensions: [''],
      isActive: [true]
    });
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
    console.log('Produit enregistré:', data);
  }
}
