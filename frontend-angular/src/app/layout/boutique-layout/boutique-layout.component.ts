import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  route: string;
  label: string;
  icon: string;
  badge?: number;
  children?: { route: string; label: string }[];
}

@Component({
  selector: 'app-boutique-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './boutique-layout.component.html',
  styleUrl: './boutique-layout.component.css'
})
export class BoutiqueLayoutComponent {
  auth = inject(AuthService);
  user = this.auth.currentUser;
  
  sidebarOpen = true;
  openGroups = signal<Set<string>>(new Set(['/boutique/relation-client']));

  // Mock data pour les badges
  pendingOrders = 5;
  unreadMessages = 3;
  pendingReviews = 2;

  navItems: NavItem[] = [
    { route: '/boutique/dashboard', label: 'Tableau de bord', icon: 'dashboard' },
    // { route: '/boutique/profil', label: 'Ma boutique', icon: 'store' },
    { route: '/boutique/profil/list', label: 'Mes boutiques', icon: 'store' },
    { route: '/boutique/produits', label: 'Produits', icon: 'inventory_2' },
    { route: '/boutique/commandes', label: 'Commandes', icon: 'shopping_bag', badge: this.pendingOrders },
    { route: '/boutique/statistiques', label: 'Statistiques', icon: 'analytics' },
    { 
      route: '/boutique/relation-client', 
      label: 'Relation client', 
      icon: 'support_agent',
      children: [
        { route: '/boutique/messagerie', label: 'Messagerie' },
        { route: '/boutique/avis', label: 'Avis clients' },
        { route: '/boutique/retours', label: 'Retours' }
      ]
    }
  ];

  boutiqueInfo = signal({
    name: 'Ma Boutique Mode',
    logo: null as string | null,
    status: 'active' as 'pending' | 'active' | 'suspended'
  });

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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'active': 'Active',
      'suspended': 'Suspendue'
    };
    return labels[status] || status;
  }
}
