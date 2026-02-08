import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser, UserRole } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthUser | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  readonly isBoutique = computed(() => this.currentUserSignal()?.role === 'BOUTIQUE');
  readonly isAcheteur = computed(() => this.currentUserSignal()?.role === 'ACHETEUR');
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  constructor(private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('korus_user');
    if (stored) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        user.createdAt = new Date(user.createdAt);
        if (user.lastLoginAt) user.lastLoginAt = new Date(user.lastLoginAt);
        this.currentUserSignal.set(user);
      } catch {
        localStorage.removeItem('korus_user');
      }
    }
  }

  // Comptes de démonstration
  private readonly mockAccounts: Record<string, { password: string; user: AuthUser }> = {
    'admin@korus.mg': {
      password: 'admin123',
      user: {
        id: '1',
        email: 'admin@korus.mg',
        firstName: 'Admin',
        lastName: 'KORUS',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        token: 'mock-jwt-admin',
        permissions: ['boutiques:manage', 'users:manage', 'stats:view', 'alerts:view', 'communication:manage', 'roles:manage']
      }
    },
    'boutique@korus.mg': {
      password: 'boutique123',
      user: {
        id: '2',
        email: 'boutique@korus.mg',
        firstName: 'Jean',
        lastName: 'Marchand',
        role: 'BOUTIQUE',
        status: 'ACTIVE',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        token: 'mock-jwt-boutique',
        boutiqueId: 'b1',
        permissions: ['products:manage', 'orders:manage', 'stats:view', 'messages:manage']
      }
    },
    'acheteur@korus.mg': {
      password: 'acheteur123',
      user: {
        id: '3',
        email: 'acheteur@korus.mg',
        firstName: 'Marie',
        lastName: 'Dupont',
        role: 'ACHETEUR',
        status: 'ACTIVE',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        token: 'mock-jwt-acheteur',
        permissions: ['orders:create', 'reviews:create', 'profile:manage']
      }
    }
  };

  login(email: string, password: string): boolean {
    const account = this.mockAccounts[email];
    if (account && account.password === password) {
      const user = { ...account.user, lastLoginAt: new Date() };
      this.currentUserSignal.set(user);
      localStorage.setItem('korus_user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  /** Retourne la route de redirection selon le rôle */
  getRedirectRoute(): string {
    switch (this.currentUserSignal()?.role) {
      case 'ADMIN':    return '/admin';
      case 'BOUTIQUE': return '/boutique';
      case 'ACHETEUR': return '/acheteur';
      default:         return '/login';
    }
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('korus_user');
    this.router.navigate(['/accueil']);
  }

  hasPermission(code: string): boolean {
    const user = this.currentUserSignal();
    return user?.permissions?.includes(code) ?? false;
  }
}
