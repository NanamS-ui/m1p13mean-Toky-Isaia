import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs';
import { InfoCenterService } from '../../core/services/config/info-center.service';
import type { InfoCenter, InfoCenterHour } from '../../core/models/config/info-center.model';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private infoCenterService = inject(InfoCenterService);
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
    { route: '/localisation', label: 'Nous trouver', icon: 'location_on' }
  ];

  footerHours = signal<InfoCenterHour[]>([
    { day: 'Lundi - Vendredi', hours: '09:00 - 21:00' },
    { day: 'Samedi', hours: '09:00 - 22:00' },
    { day: 'Dimanche', hours: '10:00 - 20:00' }
  ]);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileMenuOpen.set(false);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      });
  }

  ngOnInit(): void {
    this.infoCenterService.getAll().subscribe({
      next: (items: InfoCenter[]) => {
        const info = items?.[0];
        if (!info) return;

        this.footerHours.set(
          info.footerHours?.length
            ? info.footerHours.map(h => ({ day: h.day, hours: h.hours }))
            : this.footerHours()
        );
      }
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
  }
}
