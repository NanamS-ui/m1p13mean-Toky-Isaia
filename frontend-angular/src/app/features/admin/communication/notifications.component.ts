import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AdminUsersService, type AdminUserSearchItem } from '../../../core/services/user/admin-users.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  form: FormGroup;
  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  searchQuery = signal('');
  searchRole = signal<'acheteurs' | 'boutiques'>('acheteurs');
  searchResults = signal<AdminUserSearchItem[]>([]);
  selectedRecipients = signal<AdminUserSearchItem[]>([]);
  searching = signal(false);

  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private adminUsersService: AdminUsersService
  ) {
    this.form = this.fb.nonNullable.group({
      title: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
      target: ['all', Validators.required] // all | acheteurs | boutiques | custom
    });

    this.form.get('target')?.valueChanges.subscribe((target) => {
      if (target !== 'custom') {
        this.selectedRecipients.set([]);
        this.searchResults.set([]);
        this.searchQuery.set('');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.form.value.target === 'custom' && this.selectedRecipients().length === 0) {
      this.errorMessage.set('Veuillez sélectionner au moins un utilisateur');
      setTimeout(() => this.errorMessage.set(''), 5000);
      return;
    }

    this.loading.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    const payload = {
      ...this.form.getRawValue(),
      recipients: this.selectedRecipients().map((u) => u._id)
    };

    this.notificationService.createNotification(payload).subscribe({
      next: (notification) => {
        this.loading.set(false);
        this.successMessage.set(`Notification envoyée avec succès à ${this.getTargetLabel(notification.target)}`);
        this.form.reset({ target: 'all' });
        this.selectedRecipients.set([]);
        this.searchResults.set([]);
        this.searchQuery.set('');
        setTimeout(() => this.successMessage.set(''), 5000);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(error.error?.message || 'Erreur lors de l\'envoi de la notification');
        setTimeout(() => this.errorMessage.set(''), 5000);
      }
    });
  }

  searchUsers(): void {
    const query = this.searchQuery().trim();
    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.searching.set(true);
    this.adminUsersService.searchUsers(query, this.searchRole()).subscribe({
      next: (users) => {
        this.searchResults.set(Array.isArray(users) ? users : []);
        this.searching.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.searching.set(false);
      }
    });
  }

  toggleRecipient(user: AdminUserSearchItem): void {
    const selected = this.selectedRecipients();
    const exists = selected.some((u) => u._id === user._id);
    if (exists) {
      this.selectedRecipients.set(selected.filter((u) => u._id !== user._id));
    } else {
      this.selectedRecipients.set([...selected, user]);
    }
  }

  isSelected(userId: string): boolean {
    return this.selectedRecipients().some((u) => u._id === userId);
  }

  clearSelectedRecipients(): void {
    this.selectedRecipients.set([]);
  }

  private getTargetLabel(target: string): string {
    const labels: Record<string, string> = {
      all: 'tous les utilisateurs',
      acheteurs: 'les acheteurs',
      boutiques: 'les propriétaires de boutiques',
      custom: 'les utilisateurs sélectionnés'
    };
    return labels[target] || target;
  }
}
