import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NoticeDto, NoticeService } from '../../../core/services/notice/notice.service';

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
  private route = inject(ActivatedRoute);
  private noticeService = inject(NoticeService);

  activeTab = signal<'all' | 'shops' | 'products'>('all');
  showReviewModal = signal(false);
  editingReview = signal<Review | null>(null);
  pendingReview = signal<PendingReview | null>(null);

  private handledInitialQuery = false;

  // Form data
  formRating = signal(5);
  formComment = signal('');
  formType = signal<'shop' | 'product'>('shop');

  reviews = signal<Review[]>([]);

  pendingReviews = signal<PendingReview[]>([]);

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

  constructor() {
    this.loadMyNotices();

    const qp = this.route.snapshot.queryParamMap;
    const orderId = qp.get('orderId');
    if (orderId && !this.handledInitialQuery) {
      this.handledInitialQuery = true;

      const typeParam = qp.get('type');
      const type: 'shop' | 'product' = typeParam === 'product' ? 'product' : 'shop';

      const orderDateParam = qp.get('orderDate');
      const parsedDate = orderDateParam ? new Date(orderDateParam) : new Date();
      const orderDate = Number.isFinite(parsedDate.getTime()) ? parsedDate : new Date();

      const pending: PendingReview = {
        id: `order-${orderId}-${type}`,
        type,
        shopId: qp.get('shopId') || undefined,
        shopName: qp.get('shopName') || undefined,
        productId: qp.get('productId') || undefined,
        productName: qp.get('productName') || undefined,
        orderId,
        orderDate
      };

      this.pendingReviews.set([pending]);
      this.openReviewModal(pending);
    }
  }

  private loadMyNotices(): void {
    this.noticeService.getMyNotices().subscribe({
      next: (notices) => {
        this.reviews.set((notices || []).map(n => this.mapNoticeToReview(n)));
      },
      error: () => {
        this.reviews.set([]);
      }
    });
  }

  private mapNoticeToReview(n: NoticeDto): Review {
    const shop = n.shop as any;
    const product = n.product as any;

    return {
      id: n._id,
      type: n.type,
      shopId: typeof shop === 'object' && shop ? (shop._id ?? shop.id) : (typeof shop === 'string' ? shop : undefined),
      shopName: typeof shop === 'object' && shop ? (shop.name ?? undefined) : undefined,
      productId: typeof product === 'object' && product ? (product._id ?? product.id) : (typeof product === 'string' ? product : undefined),
      productName: typeof product === 'object' && product ? (product.name ?? undefined) : undefined,
      rating: Number(n.rating) || 0,
      comment: String(n.comment || ''),
      date: n.created_at ? new Date(n.created_at) : new Date(),
      status: (n.status || 'published') as any
    };
  }

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

    const editing = this.editingReview();
    const pending = this.pendingReview();

    if (editing) {
      this.noticeService
        .updateMyNotice(editing.id, { rating: this.formRating(), comment: this.formComment() })
        .subscribe({
          next: (updated) => {
            this.reviews.update(reviews => reviews.map(r => (r.id === editing.id ? this.mapNoticeToReview(updated) : r)));
            this.closeReviewModal();
          },
          error: (err) => {
            alert(err?.error?.message || 'Impossible de modifier cet avis');
          }
        });
      return;
    }

    if (!pending?.orderId || (!pending.shopId && !pending.productId)) {
      alert("Veuillez donner un avis depuis une commande livrée.");
      return;
    }

    this.noticeService
      .createNotice({
        type: this.formType(),
        rating: this.formRating(),
        comment: this.formComment(),
        shopId: pending.shopId,
        productId: pending.productId,
        orderId: pending.orderId
      })
      .subscribe({
        next: (created) => {
          this.reviews.update(reviews => [this.mapNoticeToReview(created), ...reviews]);
          this.pendingReviews.update(pendingList => pendingList.filter(p => p.id !== pending.id));
          this.closeReviewModal();
        },
        error: (err) => {
          console.error('POST /api/notices a échoué', {
            backendMessage: err?.error?.message,
            status: err?.status,
            payload: {
              type: this.formType(),
              rating: this.formRating(),
              comment: this.formComment(),
              shopId: pending.shopId,
              productId: pending.productId,
              orderId: pending.orderId
            },
            raw: err
          });
          alert(err?.error?.message || 'Impossible de publier cet avis');
        }
      });
  }

  deleteReview(reviewId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.noticeService.deleteMyNotice(reviewId).subscribe({
        next: () => {
          this.reviews.update(reviews => reviews.filter(r => r.id !== reviewId));
        },
        error: (err) => {
          alert(err?.error?.message || 'Impossible de supprimer cet avis');
        }
      });
    }
  }

  setRating(rating: number): void {
    this.formRating.set(rating);
  }
}
