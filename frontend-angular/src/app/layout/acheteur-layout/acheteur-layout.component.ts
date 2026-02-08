import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  route: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-acheteur-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './acheteur-layout.component.html',
  styleUrl: './acheteur-layout.component.css'
})
export class AcheteurLayoutComponent {
  auth = inject(AuthService);
  user = this.auth.currentUser;
  
  sidebarOpen = true;

  // Mock data
  cartItemsCount = signal(3);
  unreadNotifications = signal(5);

  navItems: NavItem[] = [
    { route: '/acheteur/accueil', label: 'Accueil', icon: 'home' },
    { route: '/acheteur/boutiques', label: 'Boutiques', icon: 'storefront' },
    { route: '/acheteur/produits', label: 'Produits', icon: 'inventory_2' },
    { route: '/acheteur/panier', label: 'Mon panier', icon: 'shopping_cart' },
    { route: '/acheteur/commandes', label: 'Mes commandes', icon: 'local_shipping' },
    { route: '/acheteur/avis', label: 'Mes avis', icon: 'rate_review' },
    { route: '/acheteur/carte', label: 'Carte du centre', icon: 'map' }
  ];

  bottomNavItems: NavItem[] = [
    { route: '/acheteur/profil', label: 'Mon profil', icon: 'person' },
    { route: '/acheteur/notifications', label: 'Notifications', icon: 'notifications' }
  ];
}
