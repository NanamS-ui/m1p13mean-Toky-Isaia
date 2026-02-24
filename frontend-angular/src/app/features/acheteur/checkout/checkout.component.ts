import { Component, Signal, WritableSignal, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CartItem } from '../../../core/models/order/cart-item.model';
import { CartGroup } from '../../../core/models/order/cart-group.model';
import { CartService } from '../../../core/services/order/cart.service';
import { OrdersService } from '../../../core/services/order/order.service';
import { PaymentService } from '../../../core/services/payment/payment.service';

interface DeliveryAddress {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

type DeliveryMethod = 'home';
type CheckoutStep = 1 | 2 | 3;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {
  private ordersService = inject(OrdersService);
  private paymentService = inject(PaymentService);

  // Current step
  currentStep = signal<CheckoutStep>(1);

  // Delivery method
  deliveryMethod = signal<DeliveryMethod>('home');

  cartItems!: WritableSignal<CartItem[]>;
  cartGroups!: Signal<CartGroup[]>;
  total!: Signal<number>;

  private orderCartItems = signal<CartItem[]>([]);
  private orderCartGroups = computed<CartGroup[]>(() => {
    const groups = new Map<string, CartGroup>();

    this.orderCartItems().forEach((item) => {
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
  private orderCartTotal = computed(() =>
    this.orderCartGroups().reduce((sum, group) => sum + group.subtotal, 0)
  );

  // Mock delivery addresses
  deliveryAddresses = signal<DeliveryAddress[]>([
    {
      id: '1',
      label: 'Domicile',
      street: "123 Avenue de l'Indépendance",
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

  orderId = signal<string | null>(null);
  fromCart = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  // Order number (generated after confirmation)
  orderNumber = signal<string>('');

  // Forms
  deliveryForm: FormGroup;
  paymentForm: FormGroup;
  newAddressForm: FormGroup;
  showNewAddressForm = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {
    // Par défaut: récap basé sur le panier local
    this.cartItems = this.cartService.items;
    this.cartGroups = this.cartService.groups;
    this.total = this.cartService.total;

    // Delivery form
    this.deliveryForm = this.fb.nonNullable.group({
      addressId: ['1', Validators.required]
    });

    // New address form (inline)
    this.newAddressForm = this.fb.nonNullable.group({
      label: ['', [Validators.required]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]]
    });

    // Payment form (virement / infos bancaires)
    this.paymentForm = this.fb.nonNullable.group({
      bankName: ['', [Validators.required]],
      accountHolder: ['', [Validators.required]],
      accountNumber: [''],
      note: ['']
    });

    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('orderId');
      this.orderId.set(id);

      const fromCartParam = String(params.get('fromCart') || '').toLowerCase();
      this.fromCart.set(fromCartParam === '1' || fromCartParam === 'true');

      if (id) {
        // Mode commande: récap basé sur l'order
        this.cartItems = this.orderCartItems;
        this.cartGroups = this.orderCartGroups;
        this.total = this.orderCartTotal;
        this.loadOrderSummary(id);
      } else {
        // Mode panier
        this.cartItems = this.cartService.items;
        this.cartGroups = this.cartService.groups;
        this.total = this.cartService.total;
      }
    });
  }

  private loadOrderSummary(orderId: string): void {
    this.ordersService.getOrderByIdAny(orderId).subscribe({
      next: (order) => {
        const items = this.mapOrderToCartItems(order);
        this.orderCartItems.set(items);
      },
      error: (err) => {
        console.error('Erreur chargement commande', err);
        alert(err?.error?.message || 'Erreur lors du chargement de la commande');
        this.orderCartItems.set([]);
      }
    });
  }

  private mapOrderToCartItems(order: any): CartItem[] {
    const orderItems = order?.orderItems;
    if (!Array.isArray(orderItems)) return [];

    return orderItems
      .map((item: any): CartItem | null => {
        const stock = item?.stock;
        const product = stock?.product;
        const shop = stock?.shop;

        if (!stock?._id || !product?._id || !shop?._id) {
          return null;
        }

        const unitPrice = Number(item?.unit_price || 0);
        const promoPct = Number(item?.promotion_percentage || 0);
        const qty = Number(item?.quantity || 0);
        const promoPrice = promoPct > 0 ? unitPrice * (1 - promoPct / 100) : undefined;

        const reste = stock?.reste;
        const inStock = typeof reste === 'number' ? reste >= qty : true;

        return {
          stockId: String(stock._id),
          productId: String(product._id),
          productName: String(product.name || 'Produit'),
          productImage: product.image || undefined,
          price: unitPrice,
          promoPrice,
          quantity: qty,
          boutiqueId: String(shop._id),
          boutiqueName: String(shop.name || 'Boutique'),
          inStock
        };
      })
      .filter((x: CartItem | null): x is CartItem => x !== null);
  }

  formatCurrency(value: number): string {
    const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
    const dotted = formatted.replace(/\u202f|\u00a0| /g, '.');
    return `${dotted} MGA`;
  }

  getItemPrice(item: CartItem): number {
    return item.promoPrice ?? item.price;
  }

  getItemSubtotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  getSelectedAddress(): DeliveryAddress | undefined {
    const addressId = this.deliveryForm.get('addressId')?.value;
    return this.deliveryAddresses().find((addr) => addr.id === addressId);
  }

  addNewAddress(): void {
    this.showNewAddressForm.set(true);
    this.newAddressForm.reset({
      label: '',
      street: '',
      city: '',
      postalCode: ''
    });
  }

  cancelNewAddress(): void {
    this.showNewAddressForm.set(false);
  }

  saveNewAddress(): void {
    this.newAddressForm.markAllAsTouched();
    if (this.newAddressForm.invalid) return;

    const id = String(Date.now());
    const payload = this.newAddressForm.getRawValue();

    const newAddress: DeliveryAddress = {
      id,
      label: String(payload.label).trim(),
      street: String(payload.street).trim(),
      city: String(payload.city).trim(),
      postalCode: String(payload.postalCode).trim(),
      isDefault: false
    };

    this.deliveryAddresses.update((prev) => [newAddress, ...prev]);
    this.deliveryForm.patchValue({ addressId: id });
    this.showNewAddressForm.set(false);
  }

  // Step navigation
  goToStep(step: CheckoutStep): void {
    if (step === 3 && !this.orderNumber()) {
      return;
    }
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    } else if (step === this.currentStep() + 1) {
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

  // Submit payment (manual) then show confirmation
  async submitOrder(): Promise<void> {
    if (this.isSubmitting()) return;

    const orderId = this.orderId();
    if (!orderId) {
      alert('orderId manquant. Veuillez retourner au panier et relancer la commande.');
      return;
    }

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const payload = {
      orderId,
      bankDetails: {
        bank_name: String(this.paymentForm.get('bankName')?.value || '').trim(),
        account_holder: String(this.paymentForm.get('accountHolder')?.value || '').trim(),
        account_number: String(this.paymentForm.get('accountNumber')?.value || '').trim() || undefined,
        note: String(this.paymentForm.get('note')?.value || '').trim() || undefined
      }
    };

    this.isSubmitting.set(true);
    try {
      await firstValueFrom(this.paymentService.createBankPayment(payload as any));

      // Paiement enregistré: on vide le panier
      if (this.fromCart()) {
        this.cartService.clear();
      }

      this.orderNumber.set(orderId);
      this.currentStep.set(3);
    } catch (err: any) {
      console.error('Erreur paiement bancaire', err);
      alert(err?.error?.message || err?.message || "Erreur lors de l'enregistrement du paiement");
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Estimated delivery/pickup date
  getEstimatedDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 3);
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
