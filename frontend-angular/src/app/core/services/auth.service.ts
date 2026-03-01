import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { AuthUser, UserProfile } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<AuthUser | null>(null);
  private readonly accessTokenKey = 'korus_access_token';
  private readonly refreshTokenKey = 'korus_refresh_token';
  private readonly userKey = 'korus_user';
  private readonly apiBaseUrl = environment.apiBaseUrl;

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');
  readonly isBoutique = computed(() => this.currentUserSignal()?.role === 'BOUTIQUE');
  readonly isAcheteur = computed(() => this.currentUserSignal()?.role === 'ACHETEUR');
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  constructor(private router: Router, private http: HttpClient) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem(this.userKey);
    if (stored) {
      try {
        const user = JSON.parse(stored) as AuthUser;
        user.createdAt = new Date(user.createdAt);
        if (user.lastLoginAt) user.lastLoginAt = new Date(user.lastLoginAt);
        this.currentUserSignal.set(user);
      } catch {
        localStorage.removeItem(this.userKey);
      }
    }
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<any>(`${this.apiBaseUrl}/auth/login`, { email, password }).pipe(
      map((response) => {
        const nameParts = (response.user?.name || '').trim().split(' ');
        const firstName = nameParts.shift() || '';
        const lastName = nameParts.join(' ');

        return {
          id: response.user.id,
          email: response.user.email,
          firstName,
          lastName,
          role: response.user.role,
          status: 'ACTIVE',
          createdAt: response.user.createdAt ? new Date(response.user.createdAt) : new Date(),
          lastLoginAt: new Date(),
          token: response.accessToken,
          refreshToken: response.refreshToken,
          permissions: []
        } as AuthUser;
      }),
      tap((user) => {
        this.currentUserSignal.set(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        localStorage.setItem(this.accessTokenKey, user.token);
        if (user.refreshToken) {
          localStorage.setItem(this.refreshTokenKey, user.refreshToken);
        }
      })
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<any>(`${this.apiBaseUrl}/auth/refresh`, { refreshToken }).pipe(
      map((response) => response.accessToken as string),
      tap((token) => {
        localStorage.setItem(this.accessTokenKey, token);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  /** Récupère le profil complet de l'utilisateur connecté */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiBaseUrl}/auth/me`);
  }

  /** Met à jour le profil de l'utilisateur connecté */
  updateProfile(payload: { firstName?: string; lastName?: string; email?: string; phone?: string; adresse?: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiBaseUrl}/auth/me`, payload).pipe(
      tap((profile) => {
        this.currentUserSignal.update((u) =>
          u ? { ...u, firstName: profile.firstName, lastName: profile.lastName, email: profile.email, phone: profile.phone, adresse: profile.adresse } : null
        );
        const stored = localStorage.getItem(this.userKey);
        if (stored) {
          try {
            const user = JSON.parse(stored) as AuthUser;
            user.firstName = profile.firstName;
            user.lastName = profile.lastName;
            user.email = profile.email;
            user.phone = profile.phone;
            user.adresse = profile.adresse;
            localStorage.setItem(this.userKey, JSON.stringify(user));
          } catch {}
        }
      })
    );
  }

  /** Change le mot de passe de l'utilisateur connecté */
  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(`${this.apiBaseUrl}/auth/me/password`, payload);
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
    const refreshToken = localStorage.getItem(this.refreshTokenKey);
    if (refreshToken) {
      this.http.post(`${this.apiBaseUrl}/auth/logout`, { refreshToken }).subscribe({
        next: () => {},
        error: () => {}
      });
    }
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.router.navigate(['/accueil']);
  }

  hasPermission(code: string): boolean {
    const user = this.currentUserSignal();
    return user?.permissions?.includes(code) ?? false;
  }
}
