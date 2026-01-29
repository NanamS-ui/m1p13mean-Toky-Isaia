import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  children?: { label: string; route: string }[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  protected auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  readonly user = this.auth.currentUser;
  sidebarOpen = true;
  private activeUrl = signal<string>(this.router.url);
  private expandedGroups = signal<Record<string, boolean>>({});

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin', icon: 'dashboard' },
    {
      label: 'Gestion des boutiques',
      route: '/admin/boutiques',
      icon: 'store',
      children: [
        { label: 'Liste des boutiques', route: '/admin/boutiques' },
        { label: 'Créer une boutique', route: '/admin/boutiques/nouvelle' },
        { label: 'Suivi loyers', route: '/admin/boutiques/loyers' }
      ]
    },
    { label: 'Gestion des utilisateurs', route: '/admin/utilisateurs', icon: 'people' },
    {
      label: 'Statistiques',
      route: '/admin/statistiques',
      icon: 'bar_chart',
      children: [
        { label: 'Dashboard & CA', route: '/admin/statistiques' },
        { label: 'Statistiques utilisateurs', route: '/admin/statistiques/utilisateurs' }
      ]
    },
    { label: 'Alertes & indicateurs', route: '/admin/alertes', icon: 'notifications_active' },
    {
      label: 'Communication & Marketing',
      route: '/admin/communication',
      icon: 'campaign',
      children: [
        { label: 'Annonces & Événements', route: '/admin/communication' },
        { label: 'Notifications', route: '/admin/communication/notifications' }
      ]
    },
    { label: 'Support client', route: '/admin/support', icon: 'support_agent' },
    { label: 'Rôles & Permissions', route: '/admin/roles', icon: 'admin_panel_settings' }
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(e => {
        this.activeUrl.set(e.urlAfterRedirects || e.url);
      });
  }

  isGroupOpen(route: string): boolean {
    const explicit = this.expandedGroups()[route];
    if (explicit !== undefined) return explicit;
    return this.activeUrl().startsWith(route);
  }

  toggleGroup(route: string, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.expandedGroups.update(curr => {
      const next = { ...curr };
      next[route] = !this.isGroupOpen(route);
      return next;
    });
  }
}
