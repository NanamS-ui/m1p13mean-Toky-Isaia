import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree(['/login']);
};

export const boutiqueGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Un commerçant peut accéder à son espace boutique
  // Pour la maquette, on autorise l'accès à tous les utilisateurs connectés
  if (auth.currentUser()) return true;
  return router.createUrlTree(['/login']);
};

export const acheteurGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Un acheteur peut accéder à son espace client
  // Pour la maquette, on autorise l'accès à tous les utilisateurs connectés
  if (auth.currentUser()) return true;
  return router.createUrlTree(['/login']);
};
