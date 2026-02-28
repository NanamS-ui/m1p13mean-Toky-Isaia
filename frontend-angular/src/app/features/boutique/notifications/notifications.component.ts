import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AuthService } from '../../../core/services/auth.service';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  target: string;
  sent_by: any;
  is_sent: boolean;
  sent_at: string;
  created_at: string;
  read_by: any[];
  isRead?: boolean;
}

@Component({
  selector: 'app-notifications-boutique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsBoutiqueComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  notifications = signal<NotificationItem[]>([]);
  loading = signal(false);
  error = signal('');
  filterType = signal<'all' | 'unread'>('all');

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.error.set('');

    this.notificationService.getMyNotifications().subscribe({
      next: (data: any) => {
        // Les notifications viennent avec isRead du backend
        this.notifications.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notifications:', err);
        this.error.set('Erreur lors du chargement des notifications');
        this.loading.set(false);
      }
    });
  }

  filteredNotifications = computed(() => {
    const notifs = this.notifications();
    if (this.filterType() === 'unread') {
      return notifs.filter(n => !n.isRead);
    }
    return notifs;
  });

  unreadCount = computed(() => {
    return this.notifications().filter(n => !n.isRead).length;
  });

  hasReadNotifications = computed(() => {
    return this.notifications().some(n => n.isRead);
  });


  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        // Mettre à jour localement
        this.notifications.update(notifs => 
          notifs.map(n => 
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
      },
      error: (err) => {
        console.error('Erreur lors du marquage comme lu:', err);
        this.error.set('Erreur lors du marquage comme lu');
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        // Mettre à jour localement - marquer tous comme lus
        this.notifications.update(notifs => 
          notifs.map(n => ({ ...n, isRead: true }))
        );
      },
      error: (err) => {
        console.error('Erreur lors du marquage de tous les messages:', err);
        this.error.set('Erreur lors du marquage des notifications');
      }
    });
  }

  deleteAllRead(): void {
    this.notifications.update(notifs => notifs.filter(n => !n.isRead));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

    return date.toLocaleDateString('fr-FR');
  }

  getTargetLabel(target: string): string {
    const labels: Record<string, string> = {
      'all': 'Tous les utilisateurs',
      'acheteurs': 'Acheteurs',
      'boutiques': 'Propriétaires de boutiques',
      'custom': 'Sélection manuelle'
    };
    return labels[target] || target;
  }

  getNotificationIcon(notif: NotificationItem): string {
    // Icône par défaut pour les notifications
    return 'notifications';
  }

  getNotificationColor(notif: NotificationItem): string {
    // Couleur par défaut pour les notifications
    return '#6366f1';
  }
}
