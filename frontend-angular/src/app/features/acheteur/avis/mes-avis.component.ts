import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Review {
  id: string;
  type: 'shop' | 'product';
  shopId?: string;
  shopName?: string;
  productId?: string;
  productName?: string;
  rating: number;
  comment: string;
  date: Date;
  status: 'published' | 'pending';
}

interface PendingReview {
  id: string;
  type: 'shop' | 'product';
  shopId?: string;
  shopName?: string;
  productId?: string;
  productName?: string;
  orderId: string;
  orderDate: Date;
}

@Component({
  selector: 'app-mes-avis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-avis.component.html',
  styleUrl: './mes-avis.component.css'
})
export class MesAvisComponent {
  activeTab = signal<'all' | 'shops' | 'products'>('all');
  showReviewModal = signal(false);
  editingReview = signal<Review | null>(null);
  pendingReview = signal<PendingReview | null>(null);

  // Form data
  formRating = signal(5);
  formComment = signal('');
  formType = signal<'shop' | 'product'>('shop');

  // Mock reviews data
  reviews = signal<Review[]>([
    {
      id: '1',
      type: 'shop',
      shopId: '1',
      shopName: 'Mode & Style',
      rating: 5,
      comment: 'Excellente boutique avec un très bon service client. Les produits sont de qualité.',
      date: new Date('2025-01-15'),
      status: 'published'
    },
    {
      id: '2',
      type: 'product',
      shopId: '1',
      shopName: 'Mode & Style',
      productId: '1',
      productName: 'Robe été fleurie',
      rating: 4,
      comment: 'Très belle robe, bonne qualité. Un peu cher mais ça vaut le coup.',
      date: new Date('2025-01-10'),
      status: 'published'
    },
    {
      id: '3',
      type: 'shop',
      shopId: '2',
      shopName: 'TechZone',
      rating: 5,
      comment: 'Service impeccable, personnel très compétent. Je recommande!',
      date: new Date('2025-01-05'),
      status: 'published'
    },
    {
      id: '4',
      type: 'product',
      shopId: '2',
      shopName: 'TechZone',
      productId: '2',
      productName: 'Casque Bluetooth Pro',
      rating: 3,
      comment: 'Bon produit mais la batterie ne tient pas très longtemps.',
      date: new Date('2024-12-28'),
      status: 'published'
    }
  ]);

  // Mock pending reviews
  pendingReviews = signal<PendingReview[]>([
    {
      id: 'p1',
      type: 'shop',
      shopId: '3',
      shopName: 'Beauté & Soins',
      orderId: 'ord-123',
      orderDate: new Date('2025-01-20')
    },
    {
      id: 'p2',
      type: 'product',
      shopId: '3',
      shopName: 'Beauté & Soins',
      productId: '10',
      productName: 'Crème hydratante',
      orderId: 'ord-123',
      orderDate: new Date('2025-01-20')
    }
  ]);

  // Filtered reviews based on active tab
  filteredReviews = computed(() => {
    const allReviews = this.reviews();
    if (this.activeTab() === 'all') {
      return allReviews;
    } else if (this.activeTab() === 'shops') {
      return allReviews.filter(r => r.type === 'shop');
    } else {
      return allReviews.filter(r => r.type === 'product');
    }
  });

  publishedReviews = computed(() => {
    return this.filteredReviews().filter(r => r.status === 'published');
  });

  // Computed signals for review counts
  shopReviewsCount = computed(() => this.reviews().filter(r => r.type === 'shop').length);
  productReviewsCount = computed(() => this.reviews().filter(r => r.type === 'product').length);

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  setActiveTab(tab: 'all' | 'shops' | 'products'): void {
    this.activeTab.set(tab);
  }

  openReviewModal(pending?: PendingReview): void {
    if (pending) {
      this.pendingReview.set(pending);
      this.formType.set(pending.type);
    } else {
      this.pendingReview.set(null);
    }
    this.editingReview.set(null);
    this.formRating.set(5);
    this.formComment.set('');
    this.showReviewModal.set(true);
  }

  openEditModal(review: Review): void {
    this.editingReview.set(review);
    this.pendingReview.set(null);
    this.formRating.set(review.rating);
    this.formComment.set(review.comment);
    this.formType.set(review.type);
    this.showReviewModal.set(true);
  }

  closeReviewModal(): void {
    this.showReviewModal.set(false);
    this.editingReview.set(null);
    this.pendingReview.set(null);
    this.formRating.set(5);
    this.formComment.set('');
  }

  submitReview(): void {
    if (!this.formComment().trim()) {
      return;
    }

    if (this.editingReview()) {
      // Update existing review
      this.reviews.update(reviews =>
        reviews.map(r =>
          r.id === this.editingReview()!.id
            ? {
                ...r,
                rating: this.formRating(),
                comment: this.formComment(),
                date: new Date()
              }
            : r
        )
      );
    } else {
      // Create new review
      const pending = this.pendingReview();
      const newReview: Review = {
        id: Date.now().toString(),
        type: this.formType(),
        shopId: pending?.shopId,
        shopName: pending?.shopName,
        productId: pending?.productId,
        productName: pending?.productName,
        rating: this.formRating(),
        comment: this.formComment(),
        date: new Date(),
        status: 'published'
      };

      this.reviews.update(reviews => [newReview, ...reviews]);

      // Remove from pending if exists
      if (pending) {
        this.pendingReviews.update(pendingList => pendingList.filter(p => p.id !== pending.id));
      }
    }

    this.closeReviewModal();
  }

  deleteReview(reviewId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.reviews.update(reviews => reviews.filter(r => r.id !== reviewId));
    }
  }

  setRating(rating: number): void {
    this.formRating.set(rating);
  }
}
