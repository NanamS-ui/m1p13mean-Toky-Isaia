import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification/notification.service';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  target: string;
  sent_by?: any;
  is_sent: boolean;
  sent_at: string;
  created_at: string;
  read_by: any[];
  isRead?: boolean;
  order_id?: string;
  order_status?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);

  notifications = signal<NotificationItem[]>([]);
  loading = signal(false);
  error = signal('');
  selectedFilter = signal<string>('all');

  filterOptions = [
    { value: 'all', label: 'Toutes', icon: 'notifications' },
    { value: 'order', label: 'Commandes', icon: 'local_shipping' },
    { value: 'promotion', label: 'Admin', icon: 'campaign' },
    { value: 'system', label: 'Système', icon: 'info' }
  ];

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.error.set('');

    this.notificationService.getMyNotifications().subscribe({
      next: (data: any) => {
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

  // Filtered notifications
  filteredNotifications = computed(() => {
    const all = this.notifications();
    const filter = this.selectedFilter();
    
    if (filter === 'all') {
      return all;
    } else if (filter === 'order') {
      // Afficher uniquement les notifications liées aux commandes
      return all.filter(n => n.order_id);
    } else if (filter === 'promotion') {
      // Afficher les notifications système envoyées par un administrateur
      return all.filter(n => !n.order_id && n.sent_by);
    } else if (filter === 'system') {
      // Afficher les notifications système sans sender
      return all.filter(n => !n.order_id && !n.sent_by);
    }
    return all;
  });

  // Unread count
  unreadCount = computed(() => {
    return this.notifications().filter(n => !n.isRead).length;
  });

  unreadCountByFilter = computed(() => {
    return this.filteredNotifications().filter(n => !n.isRead).length;
  });

  // Check if there are any read notifications
  hasReadNotifications = computed(() => {
    return this.notifications().some(n => n.isRead);
  });

  // Get notification type based on order_id and sent_by
  getNotificationType(notif: NotificationItem): 'order' | 'admin' | 'system' {
    if (notif.order_id) return 'order';
    if (notif.sent_by) return 'admin';
    return 'system';
  }

  // Get notification icon
  getNotificationIcon(notif: NotificationItem): string {
    const type = this.getNotificationType(notif);
    
    if (type === 'order' && notif.order_status) {
      // Icônes par statut de commande
      switch (notif.order_status) {
        case 'En attente': return 'hourglass_empty';
        case 'Confirmée': return 'check_circle';
        case 'En préparation': return 'inventory_2';
        case 'Livrée': return 'local_shipping';
        case 'Annulée': return 'cancel';
        default: return 'package';
      }
    }
    
    const icons: Record<string, string> = {
      order: 'shopping_bag',
      admin: 'campaign',
      system: 'notifications'
    };
    return icons[type] || 'notifications';
  }

  // Get notification color
  getNotificationColor(notif: NotificationItem): string {
    const type = this.getNotificationType(notif);
    
    if (type === 'order' && notif.order_status) {
      // Couleurs par statut de commande
      switch (notif.order_status) {
        case 'En attente': return '#f59e0b'; // Amber
        case 'Confirmée': return '#10b981'; // Green
        case 'En préparation': return '#3b82f6'; // Blue
        case 'Livrée': return '#8b5cf6'; // Purple
        case 'Annulée': return '#ef4444'; // Red
        default: return '#6366f1'; // Indigo
      }
    }
    
    const colors: Record<string, string> = {
      order: '#3b82f6',
      admin: '#f59e0b',
      system: '#6b7280'
    };
    return colors[type] || '#94a3b8';
  }

  // Format timestamp
  formatTimestamp(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      }).format(date);
    }
  }

  setFilter(filter: string): void {
    this.selectedFilter.set(filter);
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        this.notifications.update(notifs =>
          notifs.map(n =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
      },
      error: (err) => {
        console.error('Erreur lors du marquage comme lu:', err);
      }
    });
  }

  markAsUnread(notificationId: string): void {
    // Backend doesn't have a markAsUnread endpoint, but we can implement it
    this.notifications.update(notifs =>
      notifs.map(n =>
        n._id === notificationId ? { ...n, isRead: false } : n
      )
    );
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update(notifs =>
          notifs.map(n => ({ ...n, isRead: true }))
        );
      },
      error: (err) => {
        console.error('Erreur lors du marquage de tous les messages:', err);
      }
    });
  }

  deleteNotification(notificationId: string): void {
    // Backend doesn't have a delete endpoint yet,
    // we can implement local deletion or request backend to add it
    this.notifications.update(notifs =>
      notifs.filter(n => n._id !== notificationId)
    );
  }

  deleteAllRead(): void {
    if (confirm('Supprimer toutes les notifications lues ?')) {
      this.notifications.update(notifs =>
        notifs.filter(n => !n.isRead)
      );
    }
  }

  // Get unread count by filter type
  getUnreadCountByType(filterType: string): number {
    const notifs = this.notifications();
    if (filterType === 'order') {
      return notifs.filter(n => n.order_id && !n.isRead).length;
    } else if (filterType === 'promotion') {
      return notifs.filter(n => !n.order_id && n.sent_by && !n.isRead).length;
    } else if (filterType === 'system') {
      return notifs.filter(n => !n.order_id && !n.sent_by && !n.isRead).length;
    }
    return notifs.filter(n => !n.isRead).length;
  }
}
