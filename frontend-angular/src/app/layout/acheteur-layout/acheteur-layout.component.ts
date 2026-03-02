import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/order/cart.service';
import { MessengerService } from '../../core/services/messenger/messenger.service';
import { NotificationService } from '../../core/services/notification/notification.service';

interface NavItem {
  route: string;
  label: string;
  icon: string;
  badge?: number;
  children?: { route: string; label: string }[];
}

@Component({
  selector: 'app-acheteur-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './acheteur-layout.component.html',
  styleUrl: './acheteur-layout.component.css',
})
export class AcheteurLayoutComponent implements OnInit {
  auth = inject(AuthService);
  user = this.auth.currentUser;
  cartService = inject(CartService);
  messengerService = inject(MessengerService);
  notificationService = inject(NotificationService);

  sidebarOpen = true;

  cartItemsCount = this.cartService.totalItems;
  unreadNotifications = signal(0);
  unreadMessages = signal(0);
  openGroups = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.messengerService.getUnreadCount().subscribe({
      next: (res) => this.unreadMessages.set(Number(res?.count || 0)),
      error: () => this.unreadMessages.set(0),
    });

    this.notificationService.loadUnreadCount();
    this.notificationService.getUnreadCount$().subscribe({
      next: (count) => this.unreadNotifications.set(Number(count || 0)),
      error: () => this.unreadNotifications.set(0),
    });
  }

  toggleGroup(route: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const groups = new Set(this.openGroups());
    if (groups.has(route)) {
      groups.delete(route);
    } else {
      groups.add(route);
    }
    this.openGroups.set(groups);
  }

  isGroupOpen(route: string): boolean {
    return this.openGroups().has(route);
  }

  navItems: NavItem[] = [
    { route: '/accueil', label: 'Home', icon: 'home' },
    { route: '/acheteur/accueil', label: 'Accueil', icon: 'home' },
    { route: '/acheteur/boutiques', label: 'Boutiques', icon: 'storefront' },
    { route: '/acheteur/produits', label: 'Produits', icon: 'inventory_2' },
    { route: '/acheteur/panier', label: 'Mon panier', icon: 'shopping_cart' },
    { route: '/acheteur/commandes', label: 'Mes commandes', icon: 'local_shipping' },
    { route: '/acheteur/avis', label: 'Mes avis', icon: 'rate_review' },
    { route: '/acheteur/carte', label: 'Carte du centre', icon: 'map' },
    {
      route: '/acheteur/relation-client',
      label: 'Support & Messagerie',
      icon: 'contact_support',
      children: [
        { route: '/acheteur/messagerie', label: 'Messagerie' },
        { route: '/acheteur/reclamation-feedback', label: 'Réclamation & feedback' },
      ],
    },
  ];

  bottomNavItems: NavItem[] = [
    { route: '/acheteur/profil', label: 'Mon profil', icon: 'person' },
    { route: '/acheteur/notifications', label: 'Notifications', icon: 'notifications' },
  ];
}
