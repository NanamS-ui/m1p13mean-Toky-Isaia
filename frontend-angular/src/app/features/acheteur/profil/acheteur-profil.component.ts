import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-acheteur-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './acheteur-profil.component.html',
  styleUrl: './acheteur-profil.component.css'
})
export class AcheteurProfilComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  activeTab = signal<'personal' | 'addresses' | 'security'>('personal');

  /** Profil de l'utilisateur connecté */
  userProfile = signal<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    adresse: string;
    avatar: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    adresse: '',
    avatar: ''
  });

  loading = signal(false);
  saveSuccess = signal(false);
  saveError = signal<string | null>(null);
  addressSaveSuccess = signal(false);
  addressSaveError = signal<string | null>(null);
  passwordSaveSuccess = signal(false);
  passwordSaveError = signal<string | null>(null);

  // Forms
  personalInfoForm: FormGroup;
  passwordForm: FormGroup;
  adresseForm: FormGroup;

  constructor() {
    // Personal info form - valeurs initiales mises à jour dans ngOnInit
    this.personalInfoForm = this.fb.nonNullable.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]]
    });

    this.passwordForm = this.fb.nonNullable.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.adresseForm = this.fb.nonNullable.group({
      adresse: ['']
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.userProfile.set({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        adresse: user.adresse ?? '',
        avatar: ''
      });
      this.personalInfoForm.patchValue({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email ?? '',
        phone: user.phone ?? ''
      });
      this.adresseForm.patchValue({ adresse: user.adresse ?? '' });
    }

    this.loading.set(true);
    this.auth.getProfile().subscribe({
      next: (profile) => {
        this.userProfile.set({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone ?? '',
          adresse: profile.adresse ?? '',
          avatar: ''
        });
        this.personalInfoForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone ?? ''
        });
        this.adresseForm.patchValue({ adresse: profile.adresse ?? '' });
      },
      error: () => {
        // En cas d'erreur, on garde les données du currentUser
      },
      complete: () => this.loading.set(false)
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Personal info methods
  onSavePersonalInfo(): void {
    if (this.personalInfoForm.invalid) {
      this.personalInfoForm.markAllAsTouched();
      return;
    }
    this.saveError.set(null);
    this.saveSuccess.set(false);
    const formValue = this.personalInfoForm.getRawValue();

    this.auth.updateProfile(formValue).subscribe({
      next: (profile) => {
        this.userProfile.set({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phone: profile.phone ?? '',
          adresse: profile.adresse ?? this.userProfile().adresse,
          avatar: ''
        });
        this.saveSuccess.set(true);
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        this.saveError.set(err.error?.message ?? 'Erreur lors de la mise à jour du profil');
      }
    });
  }

  onSaveAdresse(): void {
    this.addressSaveError.set(null);
    this.addressSaveSuccess.set(false);
    const adresse = this.adresseForm.get('adresse')?.value ?? '';

    this.auth.updateProfile({ adresse }).subscribe({
      next: (profile) => {
        this.userProfile.update(p => ({ ...p, adresse: profile.adresse ?? '' }));
        this.addressSaveSuccess.set(true);
        setTimeout(() => this.addressSaveSuccess.set(false), 3000);
      },
      error: (err) => {
        this.addressSaveError.set(err.error?.message ?? 'Erreur lors de la mise à jour de l\'adresse');
      }
    });
  }

  // Password methods
  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordSaveError.set(null);
    this.passwordSaveSuccess.set(false);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();

    this.auth.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.passwordSaveSuccess.set(true);
        setTimeout(() => this.passwordSaveSuccess.set(false), 3000);
      },
      error: (err) => {
        const msg = err?.error?.message ?? err?.message ?? 'Erreur lors du changement de mot de passe';
        this.passwordSaveError.set(msg);
      }
    });
  }

  getInitials(): string {
    const { firstName, lastName } = this.userProfile();
    const f = firstName?.charAt(0) ?? '';
    const l = lastName?.charAt(0) ?? '';
    return (f + l || '?').toUpperCase();
  }
}
