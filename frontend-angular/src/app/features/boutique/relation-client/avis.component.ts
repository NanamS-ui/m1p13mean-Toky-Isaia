import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopReviewService } from '../../../core/services/shop/shopReview.service';
import { forkJoin } from 'rxjs';
import { ShopService } from '../../../core/services/shop/shop.service';

@Component({
  selector: 'app-avis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avis.component.html',
  styleUrl: './avis.component.css',
})
export class AvisComponent {
  filterRating = 0;
  filterStatus = '';
  filterBoutique = '';
  replyingTo = signal<string | null>(null);
  replyText = '';
  shopReviews: any[] = [];
  shops: any[] = [];
  shopReviewStats: any;
  constructor(
    private shopReviewService: ShopReviewService,
    private shopService: ShopService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    forkJoin({
      shopReviews: this.shopReviewService.getShopReviewByOwner(),
      shops: this.shopService.getShopsByOwner(),
    }).subscribe(({ shopReviews, shops }) => {
      this.shopReviews = shopReviews;
      this.shops = shops;
      this.shopReviewStats = this.getReviewStats(shopReviews);
      console.log(shops);

      this.cdr.detectChanges();
    });
  }

  getReviewStats(shopReviews: any[]): {
    total: number;
    average: number;
    distribution: { rating: number; count: number; percentage: number }[];
  } {
    const total = shopReviews.length;
    const average =
      total > 0 ? shopReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / total : 0;

    const distribution = [5, 4, 3, 2, 1].map((rating) => {
      const count = shopReviews.filter((r) => r.rating === rating).length;
      const percentage = total > 0 ? (count / total) * 100 : 0;
      return { rating, count, percentage: Math.round(percentage) };
    });

    return { total, average, distribution };
  }
  get pendingCount2(): number {
    return this.shopReviews.filter((r) => r.response == null).length;
  }

  get filteredReviews() {
    let result = this.shopReviews;

    if (this.filterRating > 0) {
      result = result.filter((r) => r.rating === this.filterRating);
    }

    if (this.filterStatus === 'pending') {
      result = result.filter((r) => r.response == null);
    } else if (this.filterStatus === 'replied') {
      result = result.filter((r) => r.response != null);
    }
    if(this.filterBoutique !==''){
      result = result.filter((r) => r.shop._id === this.filterBoutique);
    }

    return result;
  }

  startReply(reviewId: string): void {
    this.replyingTo.set(reviewId);
    this.replyText = '';
  }

  cancelReply(): void {
    this.replyingTo.set(null);
    this.replyText = '';
  }

  submitReply(): void {
    const reviewId = this.replyingTo();
    if (!this.replyText.trim() || !reviewId) return;

    this.shopReviewService.updateShopReview(reviewId, { response: this.replyText }).subscribe({
      next: (updatedReview) => {
        this.shopReviews = this.shopReviews.map((r: any) =>
          r._id === reviewId ? { ...r, response: this.replyText } : r
        );
        this.replyingTo.set(null);
        this.replyText = '';
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur lors de la réponse', err),
    });
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  }
}
