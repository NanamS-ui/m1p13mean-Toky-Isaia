import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  promoPrice?: number;
  quantity: number;
  boutiqueId: string;
  boutiqueName: string;
}

interface CartGroup {
  boutiqueId: string;
  boutiqueName: string;
  items: CartItem[];
  subtotal: number;
}

interface DeliveryAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

interface PickupShop {
  id: string;
  name: string;
  zone: string;
  address: string;
}

type DeliveryMethod = 'home' | 'store';
type CheckoutStep = 1 | 2 | 3;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  // Current step
  currentStep = signal<CheckoutStep>(1);

  // Delivery method
  deliveryMethod = signal<DeliveryMethod>('home');

  // Mock cart data (same structure as panier component)
  cartItems = signal<CartItem[]>([
    {
      id: '1',
      productId: '1',
      productName: 'Robe été fleurie',
      price: 75000,
      promoPrice: 59000,
      quantity: 2,
      boutiqueId: '1',
      boutiqueName: 'Mode & Style'
    },
    {
      id: '2',
      productId: '2',
      productName: 'Casque Bluetooth Pro',
      price: 185000,
      quantity: 1,
      boutiqueId: '2',
      boutiqueName: 'TechZone'
    },
    {
      id: '3',
      productId: '5',
      productName: 'Montre connectée',
      price: 250000,
      promoPrice: 199000,
      quantity: 1,
      boutiqueId: '2',
      boutiqueName: 'TechZone'
    },
    {
      id: '4',
      productId: '8',
      productName: 'Sac à main cuir',
      price: 180000,
      promoPrice: 140000,
      quantity: 1,
      boutiqueId: '1',
      boutiqueName: 'Mode & Style'
    }
  ]);

  // Group items by shop
  cartGroups = computed<CartGroup[]>(() => {
    const groups = new Map<string, CartGroup>();
    
    this.cartItems().forEach(item => {
      if (!groups.has(item.boutiqueId)) {
        groups.set(item.boutiqueId, {
          boutiqueId: item.boutiqueId,
          boutiqueName: item.boutiqueName,
          items: [],
          subtotal: 0
        });
      }
      
      const group = groups.get(item.boutiqueId)!;
      group.items.push(item);
      const itemPrice = item.promoPrice ?? item.price;
      group.subtotal += itemPrice * item.quantity;
    });
    
    return Array.from(groups.values());
  });

  // Total calculation
  total = computed(() => {
    return this.cartGroups().reduce((sum, group) => sum + group.subtotal, 0);
  });

  // Mock delivery addresses
  deliveryAddresses = signal<DeliveryAddress[]>([
    {
      id: '1',
      label: 'Domicile',
      street: '123 Avenue de l\'Indépendance',
      city: 'Antananarivo',
      postalCode: '101',
      isDefault: true
    },
    {
      id: '2',
      label: 'Bureau',
      street: '456 Rue Analakely',
      city: 'Antananarivo',
      postalCode: '101',
      isDefault: false
    }
  ]);

  selectedAddressId = signal<string>('1');

  // Mock pickup shops
  pickupShops = signal<PickupShop[]>([
    {
      id: '1',
      name: 'Mode & Style',
      zone: 'Zone A',
      address: 'Niveau 1, Allée 3'
    },
    {
      id: '2',
      name: 'TechZone',
      zone: 'Zone B',
      address: 'Niveau 2, Allée 1'
    }
  ]);

  selectedShopId = signal<string>('');

  // Order number (generated after confirmation)
  orderNumber = signal<string>('');

  // Forms
  deliveryForm: FormGroup;
  paymentForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    // Delivery form
    this.deliveryForm = this.fb.nonNullable.group({
      method: ['home', Validators.required],
      addressId: ['1', Validators.required],
      shopId: ['']
    });

    // Payment form
    this.paymentForm = this.fb.nonNullable.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
      expiryMonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      expiryYear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Watch delivery method changes
    this.deliveryForm.get('method')?.valueChanges.subscribe(method => {
      this.deliveryMethod.set(method);
      if (method === 'home') {
        this.deliveryForm.get('shopId')?.clearValidators();
        this.deliveryForm.get('addressId')?.setValidators(Validators.required);
      } else {
        this.deliveryForm.get('addressId')?.clearValidators();
        this.deliveryForm.get('shopId')?.setValidators(Validators.required);
      }
      this.deliveryForm.get('shopId')?.updateValueAndValidity();
      this.deliveryForm.get('addressId')?.updateValueAndValidity();
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-MG', {
      style: 'currency',
      currency: 'MGA',
      maximumFractionDigits: 0
    }).format(value);
  }

  getItemPrice(item: CartItem): number {
    return item.promoPrice ?? item.price;
  }

  getItemSubtotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  getSelectedAddress(): DeliveryAddress | undefined {
    return this.deliveryAddresses().find(addr => addr.id === this.selectedAddressId());
  }

  getSelectedShop(): PickupShop | undefined {
    return this.pickupShops().find(shop => shop.id === this.selectedShopId());
  }

  addNewAddress(): void {
    // TODO: Open address form modal/dialog
    console.log('Add new address');
  }

  // Step navigation
  goToStep(step: CheckoutStep): void {
    if (step < this.currentStep()) {
      // Allow going back
      this.currentStep.set(step);
    } else if (step === this.currentStep() + 1) {
      // Validate current step before proceeding
      if (this.validateCurrentStep()) {
        this.currentStep.set(step);
      }
    }
  }

  validateCurrentStep(): boolean {
    if (this.currentStep() === 1) {
      this.deliveryForm.markAllAsTouched();
      return this.deliveryForm.valid;
    } else if (this.currentStep() === 2) {
      this.paymentForm.markAllAsTouched();
      return this.paymentForm.valid;
    }
    return true;
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      const next = (this.currentStep() + 1) as CheckoutStep;
      if (next <= 3) {
        this.currentStep.set(next);
      }
    }
  }

  previousStep(): void {
    const prev = (this.currentStep() - 1) as CheckoutStep;
    if (prev >= 1) {
      this.currentStep.set(prev);
    }
  }

  // Format card number with spaces
  formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatCardNumber(input.value);
    this.paymentForm.patchValue({ cardNumber: formatted }, { emitEvent: false });
  }

  // Submit order
  submitOrder(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    // Generate order number
    const orderNum = 'CMD-' + Date.now().toString().slice(-8);
    this.orderNumber.set(orderNum);

    // Move to confirmation step
    this.currentStep.set(3);

    // TODO: Send order to backend
    console.log('Order submitted:', {
      orderNumber: orderNum,
      delivery: this.deliveryForm.getRawValue(),
      payment: this.paymentForm.getRawValue(),
      items: this.cartItems(),
      total: this.total()
    });
  }

  // Estimated delivery/pickup date
  getEstimatedDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + (this.deliveryMethod() === 'home' ? 3 : 1));
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }

  goToOrderTracking(): void {
    this.router.navigate(['/acheteur/commandes', this.orderNumber()]);
  }

  goToHome(): void {
    this.router.navigate(['/acheteur/accueil']);
  }
}
