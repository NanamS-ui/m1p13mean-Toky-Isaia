import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Review {
  id: string;
  customer: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
  replied: boolean;
  reply?: string;
}

@Component({
  selector: 'app-avis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avis.component.html',
  styleUrl: './avis.component.css'
})
export class AvisComponent {
  filterRating = 0;
  filterStatus = '';
  replyingTo = signal<string | null>(null);
  replyText = '';

  reviews = signal<Review[]>([
    {
      id: '1',
      customer: 'Marie Dupont',
      product: 'Robe été fleurie',
      rating: 5,
      comment: 'Magnifique robe ! La qualité est excellente et la livraison était rapide. Je recommande vivement !',
      date: '2026-01-28',
      replied: false
    },
    {
      id: '2',
      customer: 'Jean Martin',
      product: 'Jean slim noir',
      rating: 4,
      comment: 'Bon jean, coupe parfaite. Seul bémol, la couleur a légèrement déteint au premier lavage.',
      date: '2026-01-27',
      replied: true,
      reply: 'Merci pour votre retour Jean ! Nous conseillons de laver le jean à l\'envers à 30° pour préserver la couleur.'
    },
    {
      id: '3',
      customer: 'Sophie Bernard',
      product: 'Veste en cuir',
      rating: 5,
      comment: 'Veste sublime ! Le cuir est très doux et la finition impeccable. Un coup de cœur !',
      date: '2026-01-26',
      replied: false
    },
    {
      id: '4',
      customer: 'Pierre Durand',
      product: 'T-shirt basic blanc',
      rating: 3,
      comment: 'Qualité correcte mais taille un peu petit. Prenez une taille au-dessus.',
      date: '2026-01-25',
      replied: true,
      reply: 'Merci Pierre pour votre avis ! Nous mettons à jour notre guide des tailles pour aider nos clients.'
    },
    {
      id: '5',
      customer: 'Claire Moreau',
      product: 'Sneakers urbaines',
      rating: 2,
      comment: 'Déçue par la qualité, les semelles se sont décollées après 2 semaines.',
      date: '2026-01-20',
      replied: false
    }
  ]);

  stats = {
    average: 3.8,
    total: 5,
    distribution: [
      { rating: 5, count: 2, percentage: 40 },
      { rating: 4, count: 1, percentage: 20 },
      { rating: 3, count: 1, percentage: 20 },
      { rating: 2, count: 1, percentage: 20 },
      { rating: 1, count: 0, percentage: 0 }
    ]
  };

  get filteredReviews() {
    let result = this.reviews();
    
    if (this.filterRating > 0) {
      result = result.filter(r => r.rating === this.filterRating);
    }
    
    if (this.filterStatus === 'pending') {
      result = result.filter(r => !r.replied);
    } else if (this.filterStatus === 'replied') {
      result = result.filter(r => r.replied);
    }
    
    return result;
  }

  get pendingCount(): number {
    return this.reviews().filter(r => !r.replied).length;
  }

  startReply(reviewId: string): void {
    this.replyingTo.set(reviewId);
    this.replyText = '';
  }

  cancelReply(): void {
    this.replyingTo.set(null);
    this.replyText = '';
  }

  submitReply(review: Review): void {
    if (!this.replyText.trim()) return;
    
    this.reviews.update(reviews =>
      reviews.map(r => r.id === review.id 
        ? { ...r, replied: true, reply: this.replyText }
        : r
      )
    );
    
    this.replyingTo.set(null);
    this.replyText = '';
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(dateStr));
  }
}
