import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [this.boutique().name, Validators.required],
      description: [this.boutique().description, Validators.required],
      category: [this.boutique().category, Validators.required],
      email: [this.boutique().email, [Validators.required, Validators.email]],
      phone: [this.boutique().phone, Validators.required],
      openingHours: this.fb.array(this.initOpeningHours())
    });
  }

  private initOpeningHours(): FormGroup[] {
    const defaultHours: OpeningHour[] = [
      { day: 'Lundi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'Mardi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'Mercredi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'Jeudi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'Vendredi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
      { day: 'Samedi', isOpen: true, openTime: '09:00', closeTime: '20:00' },
      { day: 'Dimanche', isOpen: false, openTime: '10:00', closeTime: '18:00' }
    ];

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
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onBannerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreview.set(null);
  }

  removeBanner(): void {
    this.bannerPreview.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
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
}
