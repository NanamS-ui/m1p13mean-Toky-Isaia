import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-acheteur-profil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './acheteur-profil.component.html',
  styleUrl: './acheteur-profil.component.css'
})
export class AcheteurProfilComponent {
  activeTab = signal<'personal' | 'addresses' | 'security'>('personal');
  
  // Sample user data
  userProfile = signal({
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.mg',
    phone: '+261 34 12 345 67',
    avatar: ''
  });

  addresses = signal<Address[]>([
    {
      id: '1',
      label: 'Domicile',
      street: 'Lot II M 12 Bis Ambohimanarina',
      city: 'Antananarivo',
      postalCode: '101',
      country: 'Madagascar',
      isDefault: true
    },
    {
      id: '2',
      label: 'Bureau',
      street: 'Immeuble KORUS, Ankorondrano',
      city: 'Antananarivo',
      postalCode: '101',
      country: 'Madagascar',
      isDefault: false
    }
  ]);

  // Forms
  personalInfoForm: FormGroup;
  passwordForm: FormGroup;
  addressForm: FormGroup;
  editingAddressId = signal<string | null>(null);

  constructor(private fb: FormBuilder) {
    // Personal info form
    this.personalInfoForm = this.fb.nonNullable.group({
      firstName: [this.userProfile().firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.userProfile().lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.userProfile().email, [Validators.required, Validators.email]],
      phone: [this.userProfile().phone, [Validators.required]]
    });

    // Password form
    this.passwordForm = this.fb.nonNullable.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Address form
    this.addressForm = this.fb.nonNullable.group({
      label: ['', [Validators.required]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['Madagascar', [Validators.required]],
      isDefault: [false]
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
    const formValue = this.personalInfoForm.getRawValue();
    this.userProfile.update(profile => ({ ...profile, ...formValue }));
    console.log('Profil mis à jour:', formValue);
    // In real app, call API here
  }

  // Address methods
  onAddAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    const formValue = this.addressForm.getRawValue();
    
    // If this is set as default, unset others
    if (formValue.isDefault) {
      this.addresses.update(addrs => 
        addrs.map(addr => ({ ...addr, isDefault: false }))
      );
    }

    const newAddress: Address = {
      id: Date.now().toString(),
      ...formValue
    };

    this.addresses.update(addrs => [...addrs, newAddress]);
    this.addressForm.reset({
      label: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Madagascar',
      isDefault: false
    });
    console.log('Adresse ajoutée:', newAddress);
  }

  onEditAddress(address: Address): void {
    this.editingAddressId.set(address.id);
    this.addressForm.patchValue({
      label: address.label,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
  }

  onUpdateAddress(): void {
    if (this.addressForm.invalid || !this.editingAddressId()) {
      return;
    }
    const formValue = this.addressForm.getRawValue();
    const addressId = this.editingAddressId()!;

    // If this is set as default, unset others
    if (formValue.isDefault) {
      this.addresses.update(addrs => 
        addrs.map(addr => 
          addr.id === addressId ? { ...addr, ...formValue } : { ...addr, isDefault: false }
        )
      );
    } else {
      this.addresses.update(addrs => 
        addrs.map(addr => 
          addr.id === addressId ? { ...addr, ...formValue } : addr
        )
      );
    }

    this.addressForm.reset({
      label: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Madagascar',
      isDefault: false
    });
    this.editingAddressId.set(null);
    console.log('Adresse mise à jour:', formValue);
  }

  onDeleteAddress(id: string): void {
    this.addresses.update(addrs => addrs.filter(addr => addr.id !== id));
    if (this.editingAddressId() === id) {
      this.editingAddressId.set(null);
      this.addressForm.reset();
    }
    console.log('Adresse supprimée:', id);
  }

  onCancelEdit(): void {
    this.editingAddressId.set(null);
    this.addressForm.reset({
      label: '',
      street: '',
      city: '',
      postalCode: '',
      country: 'Madagascar',
      isDefault: false
    });
  }

  onSetDefaultAddress(id: string): void {
    this.addresses.update(addrs => 
      addrs.map(addr => ({ ...addr, isDefault: addr.id === id }))
    );
    console.log('Adresse par défaut:', id);
  }

  // Password methods
  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    console.log('Changement de mot de passe demandé');
    // In real app, call API here
    this.passwordForm.reset();
  }

  // Computed
  defaultAddress = computed(() => 
    this.addresses().find(addr => addr.isDefault) || this.addresses()[0]
  );

  getInitials(): string {
    const { firstName, lastName } = this.userProfile();
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
}
