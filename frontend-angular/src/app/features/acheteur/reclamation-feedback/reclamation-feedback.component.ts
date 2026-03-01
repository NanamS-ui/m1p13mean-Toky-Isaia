import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SupportClientService } from '../../../core/services/support/support-client.service';

@Component({
  selector: 'app-reclamation-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamation-feedback.component.html',
  styleUrl: './reclamation-feedback.component.css'
})
export class ReclamationFeedbackComponent implements OnInit {
  types = signal<any[]>([]);
  supports = signal<any[]>([]);
  loading = signal(true);
  submitting = signal(false);
  error = signal<string | null>(null);

  typeId = '';
  sujet = '';

  constructor(private supportService: SupportClientService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      types: this.supportService.getTypeSupportClients(),
      supports: this.supportService.getMySupportClients()
    }).subscribe({
      next: ({ types, supports }) => {
        this.types.set(types || []);
        this.supports.set(supports || []);
        if (!this.typeId && (types?.length || 0) > 0) {
          this.typeId = types[0]._id;
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Impossible de charger vos réclamations/feedback.');
      }
    });
  }

  submit(): void {
    if (!this.typeId || !this.sujet.trim()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.supportService
      .createSupportClientByUser({ type_support_client: this.typeId, sujet: this.sujet.trim() })
      .subscribe({
        next: () => {
          this.sujet = '';
          this.submitting.set(false);
          this.refresh();
        },
        error: () => {
          this.submitting.set(false);
          this.error.set("Échec de l'envoi. Veuillez réessayer.");
        }
      });
  }

  formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateStr));
  }
}
