import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()?.role === 'ADMIN') return true;
  if (auth.isAuthenticated()) return router.createUrlTree([auth.getRedirectRoute()]);
  return router.createUrlTree(['/accueil']);
};

export const boutiqueGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()?.role === 'BOUTIQUE') return true;
  if (auth.isAuthenticated()) return router.createUrlTree([auth.getRedirectRoute()]);
  return router.createUrlTree(['/accueil']);
};

export const acheteurGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()?.role === 'ACHETEUR') return true;
  if (auth.isAuthenticated()) return router.createUrlTree([auth.getRedirectRoute()]);
  return router.createUrlTree(['/accueil']);
};
