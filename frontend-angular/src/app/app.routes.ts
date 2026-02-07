import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard, boutiqueGuard, acheteurGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Routes publiques (sans authentification)
  { 
    path: '', 
    loadChildren: () => import('./features/public/public.routes').then(m => m.publicRoutes) 
  },
  
  // Authentification
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  
  // Espace Admin (protégé)
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'boutiques', loadComponent: () => import('./features/admin/boutiques/boutiques-list.component').then(m => m.BoutiquesListComponent) },
      { path: 'boutiques/nouvelle', loadComponent: () => import('./features/admin/boutiques/boutique-form.component').then(m => m.BoutiqueFormComponent) },
      { path: 'boutiques/loyers', loadComponent: () => import('./features/admin/boutiques/loyers.component').then(m => m.LoyersComponent) },
      { path: 'boutiques/:id', loadComponent: () => import('./features/admin/boutiques/boutique-form.component').then(m => m.BoutiqueFormComponent) },
      { path: 'utilisateurs', loadComponent: () => import('./features/admin/users/users-list.component').then(m => m.UsersListComponent) },
      { path: 'statistiques', loadComponent: () => import('./features/admin/statistics/statistics-dashboard.component').then(m => m.StatisticsDashboardComponent) },
      { path: 'statistiques/utilisateurs', loadComponent: () => import('./features/admin/statistics/statistics-users.component').then(m => m.StatisticsUsersComponent) },
      { path: 'alertes', loadComponent: () => import('./features/admin/alerts/alerts.component').then(m => m.AlertsComponent) },
      { path: 'communication', loadComponent: () => import('./features/admin/communication/communication.component').then(m => m.CommunicationComponent) },
      { path: 'communication/notifications', loadComponent: () => import('./features/admin/communication/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'support', loadComponent: () => import('./features/admin/support/support.component').then(m => m.SupportComponent) },
      { path: 'roles', loadComponent: () => import('./features/admin/roles/roles.component').then(m => m.RolesComponent) }
    ]
  },
  
  // Espace Boutique/Commerçant (protégé)
  {
    path: 'boutique',
    loadChildren: () => import('./features/boutique/boutique.routes').then(m => m.boutiqueRoutes),
    canActivate: [authGuard, boutiqueGuard]
  },
  
  // Espace Acheteur/Client (protégé)
  {
    path: 'acheteur',
    loadChildren: () => import('./features/acheteur/acheteur.routes').then(m => m.acheteurRoutes),
    canActivate: [authGuard, acheteurGuard]
  },
  
  // Redirection par défaut vers l'accueil public
  { path: '**', redirectTo: 'accueil' }
];
