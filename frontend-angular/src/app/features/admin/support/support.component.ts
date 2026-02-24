import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSupportService } from '../../../core/services/support/admin-support.service';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent {
  types: any;
  status: any;
  supportClients: any;
  startDate!: string;
  endDate!: string;
  replyingTo = signal<string | null>(null);
  replyText = '';
  filterStatus = '';
  filterType = '';
  constructor(private adminSupportService: AdminSupportService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.startDate = '';
    this.endDate = '';
    this.loadData();
  }
  loadData(): void {
    forkJoin({
      types: this.adminSupportService.getTypeSupportClients(),
      status: this.adminSupportService.getStatusSupportClients(),
      supportClients: this.adminSupportService.getSupportClientsByDate(
        this.startDate,
        this.endDate
      ),
    }).subscribe(({ types, status, supportClients }) => {
      this.types = types;
      this.status = status;
      this.supportClients = supportClients;
      this.cdr.detectChanges();
    });
  }
  get filteredSupport() {
    let result = this.supportClients;

    if (this.startDate !== '') {
      result = result.filter((r: any) => new Date(r.created_at) >= new Date(this.startDate));
    }
    if (this.endDate !== '') {
      result = result.filter((r: any) => new Date(r.created_at) <= new Date(this.endDate));
    }

    if (this.filterStatus !== '') {
      result = result.filter((r: any) => r.status_support_client?._id === this.filterStatus);
    }
    if (this.filterType !== '') {
      result = result.filter((r: any) => r.type_support_client?._id === this.filterType);
    }

    return result;
  }
  getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      'En cours': 'open',
      Ouvert: 'in_progress',
      Fermé: 'closed',
    };
    return statusMap[status] ?? '';
  }
  reinitialiserFiltre(): void {
    this.startDate = '';
    this.endDate = '';
    this.filterStatus = '';
    this.filterType = '';
  }
  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateStr));
  }
  getOuvertStatus(): any {
    for (let index = 0; index < this.status.length; index++) {
      if (this.status[index].value === 'Ouvert') return this.status[index];
    }
  }
  getFermeStatus(): any {
    for (let index = 0; index < this.status.length; index++) {
      if (this.status[index].value === 'Fermé') return this.status[index];
    }
  }
  getEnAttenteStatus(): any {
    for (let index = 0; index < this.status.length; index++) {
      if (this.status[index].value === 'En cours') return this.status[index];
    }
  }
  startReply(reviewId: string): void {
    this.replyingTo.set(reviewId);
    this.replyText = '';
    this.adminSupportService
      .updateSupport(reviewId, { status_support_client: this.getOuvertStatus()._id })
      .subscribe({
        next: (updatedReview) => {
          this.supportClients = this.supportClients.map((r: any) =>
            r._id === reviewId ? { ...r, status_support_client: this.getOuvertStatus() } : r
          );
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur lors de update status', err),
      });
  }

  cancelReply(): void {
    const reviewId = this.replyingTo();
    if (!reviewId) return;
    this.adminSupportService
      .updateSupport(reviewId, { status_support_client: this.getEnAttenteStatus()._id })
      .subscribe({
        next: (updatedReview) => {
          this.supportClients = this.supportClients.map((r: any) =>
            r._id === reviewId ? { ...r, status_support_client: this.getEnAttenteStatus() } : r
          );
          this.replyingTo.set(null);
          this.replyText = '';
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur lors de update status', err),
      });
    

  }
  submitReply(): void {
    const reviewId = this.replyingTo();
    if (!this.replyText.trim() || !reviewId) return;
    this.adminSupportService
      .updateSupport(reviewId, { status_support_client: this.getFermeStatus()._id, reponse : this.replyText  })
      .subscribe({
        next: (updatedReview) => {
          this.supportClients = this.supportClients.map((r: any) =>
            r._id === reviewId ? { ...r, status_support_client: this.getFermeStatus(), reponse : this.replyText } : r
          );
          this.replyingTo.set(null);
          this.replyText = '';
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erreur lors de update status', err),
      });
  }
}
