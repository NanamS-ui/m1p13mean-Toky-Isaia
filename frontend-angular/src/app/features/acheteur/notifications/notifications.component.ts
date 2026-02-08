import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'shop' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  selectedFilter = signal<string>('all');

  // Mock notifications data
  notifications = signal<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Commande expédiée',
      message: 'Votre commande #ORD-12345 a été expédiée et sera livrée sous 2-3 jours.',
      timestamp: new Date('2025-02-01T14:30:00'),
      isRead: false,
      actionUrl: '/acheteur/commandes/ORD-12345',
      actionLabel: 'Suivre la commande',
      icon: 'local_shipping'
    },
    {
      id: '2',
      type: 'promotion',
      title: 'Promotion spéciale',
      message: 'Réduction de 30% sur tous les produits de mode chez Mode & Style. Valable jusqu\'au 5 février.',
      timestamp: new Date('2025-02-01T10:15:00'),
      isRead: false,
      actionUrl: '/acheteur/boutiques/1',
      actionLabel: 'Voir la boutique',
      icon: 'local_offer'
    },
    {
      id: '3',
      type: 'shop',
      title: 'Nouveau produit disponible',
      message: 'TechZone a ajouté de nouveaux produits. Découvrez les dernières nouveautés technologiques.',
      timestamp: new Date('2025-01-31T16:45:00'),
      isRead: true,
      actionUrl: '/acheteur/boutiques/2',
      actionLabel: 'Explorer',
      icon: 'inventory_2'
    },
    {
      id: '4',
      type: 'order',
      title: 'Commande confirmée',
      message: 'Votre commande #ORD-12340 a été confirmée et est en cours de préparation.',
      timestamp: new Date('2025-01-31T09:20:00'),
      isRead: true,
      actionUrl: '/acheteur/commandes/ORD-12340',
      actionLabel: 'Voir la commande',
      icon: 'check_circle'
    },
    {
      id: '5',
      type: 'promotion',
      title: 'Flash Sale',
      message: 'Vente flash chez Beauté & Soins ! Jusqu\'à 50% de réduction sur les produits de beauté.',
      timestamp: new Date('2025-01-30T12:00:00'),
      isRead: true,
      actionUrl: '/acheteur/boutiques/3',
      actionLabel: 'Profiter de l\'offre',
      icon: 'flash_on'
    },
    {
      id: '6',
      type: 'system',
      title: 'Mise à jour du système',
      message: 'De nouvelles fonctionnalités sont disponibles sur la plateforme. Découvrez-les maintenant !',
      timestamp: new Date('2025-01-29T08:00:00'),
      isRead: true,
      icon: 'system_update'
    },
    {
      id: '7',
      type: 'order',
      title: 'Commande livrée',
      message: 'Votre commande #ORD-12335 a été livrée avec succès. Merci pour votre achat !',
      timestamp: new Date('2025-01-28T15:30:00'),
      isRead: true,
      actionUrl: '/acheteur/commandes/ORD-12335',
      actionLabel: 'Laisser un avis',
      icon: 'delivery_dining'
    }
  ]);

  filterOptions = [
    { value: 'all', label: 'Toutes', icon: 'notifications' },
    { value: 'order', label: 'Commandes', icon: 'shopping_bag' },
    { value: 'promotion', label: 'Promotions', icon: 'local_offer' },
    { value: 'shop', label: 'Boutiques', icon: 'store' },
    { value: 'system', label: 'Système', icon: 'settings' }
  ];

  // Filtered notifications
  filteredNotifications = computed(() => {
    const all = this.notifications();
    if (this.selectedFilter() === 'all') {
      return all;
    }
    return all.filter(n => n.type === this.selectedFilter());
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

  // Get notification icon
  getNotificationIcon(notification: Notification): string {
    if (notification.icon) {
      return notification.icon;
    }
    const icons: Record<string, string> = {
      order: 'shopping_bag',
      promotion: 'local_offer',
      shop: 'store',
      system: 'settings'
    };
    return icons[notification.type] || 'notifications';
  }

  // Get notification color
  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      order: '#3b82f6',
      promotion: '#f59e0b',
      shop: '#10b981',
      system: '#8b5cf6'
    };
    return colors[type] || '#94a3b8';
  }

  // Format timestamp
  formatTimestamp(date: Date): string {
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
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  }

  markAsUnread(notificationId: string): void {
    this.notifications.update(notifications =>
      notifications.map(n =>
        n.id === notificationId ? { ...n, isRead: false } : n
      )
    );
  }

  markAllAsRead(): void {
    this.notifications.update(notifications =>
      notifications.map(n => ({ ...n, isRead: true }))
    );
  }

  deleteNotification(notificationId: string): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== notificationId)
    );
  }

  deleteAllRead(): void {
    if (confirm('Supprimer toutes les notifications lues ?')) {
      this.notifications.update(notifications =>
        notifications.filter(n => !n.isRead)
      );
    }
  }

  // Get unread count by notification type
  getUnreadCountByType(type: string): number {
    return this.notifications().filter(n => n.type === type && !n.isRead).length;
  }
}
