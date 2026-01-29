import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthUser | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

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

  login(email: string, password: string): boolean {
    // Mock: accept admin@korus.mg / admin123
    if (email === 'admin@korus.mg' && password === 'admin123') {
      const user: AuthUser = {
        id: '1',
        email,
        firstName: 'Admin',
        lastName: 'KORUS',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        token: 'mock-jwt-token',
        permissions: ['boutiques:manage', 'users:manage', 'stats:view', 'alerts:view', 'communication:manage', 'roles:manage']
      };
      this.currentUserSignal.set(user);
      localStorage.setItem('korus_user', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('korus_user');
    this.router.navigate(['/login']);
  }

  hasPermission(code: string): boolean {
    const user = this.currentUserSignal();
    return user?.permissions?.includes(code) ?? false;
  }
}
