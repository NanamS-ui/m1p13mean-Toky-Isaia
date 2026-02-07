import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent {
  auth = inject(AuthService);
  mobileMenuOpen = signal(false);

  isLoggedIn = this.auth.isAuthenticated;

  /** Libellé du lien vers l'espace connecté */
  dashboardLabel = computed(() => {
    switch (this.auth.userRole()) {
      case 'ADMIN':    return 'Espace Admin';
      case 'BOUTIQUE': return 'Espace Boutique';
      case 'ACHETEUR': return 'Mon Espace';
      default:         return 'Mon Espace';
    }
  });

  /** Icône selon le rôle */
  dashboardIcon = computed(() => {
    switch (this.auth.userRole()) {
      case 'ADMIN':    return 'admin_panel_settings';
      case 'BOUTIQUE': return 'storefront';
      case 'ACHETEUR': return 'account_circle';
      default:         return 'dashboard';
    }
  });

  /** Route de l'espace connecté */
  dashboardRoute = computed(() => this.auth.getRedirectRoute());

  navItems = [
    { route: '/accueil', label: 'Accueil', icon: 'home' },
    { route: '/boutiques', label: 'Boutiques', icon: 'storefront' },
    { route: '/evenements', label: 'Événements', icon: 'event' },
    { route: '/localisation', label: 'Nous trouver', icon: 'location_on' },
    { route: '/contact', label: 'Contact', icon: 'mail' }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
