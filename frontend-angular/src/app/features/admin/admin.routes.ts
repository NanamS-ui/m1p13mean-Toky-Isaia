import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layout/admin-layout/admin-layout.component';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'boutiques', loadComponent: () => import('./boutiques/boutiques-list.component').then(m => m.BoutiquesListComponent) },
      { path: 'boutiques/nouvelle', loadComponent: () => import('./boutiques/boutique-form.component').then(m => m.BoutiqueFormComponent) },
      { path: 'boutiques/loyers', loadComponent: () => import('./boutiques/loyers.component').then(m => m.LoyersComponent) },
      { path: 'boutiques/:id', loadComponent: () => import('./boutiques/boutique-form.component').then(m => m.BoutiqueFormComponent) },
      { path: 'utilisateurs', loadComponent: () => import('./users/users-list.component').then(m => m.UsersListComponent) },
      { path: 'statistiques', loadComponent: () => import('./statistics/statistics-dashboard.component').then(m => m.StatisticsDashboardComponent) },
      { path: 'statistiques/utilisateurs', loadComponent: () => import('./statistics/statistics-users.component').then(m => m.StatisticsUsersComponent) },
      { path: 'alertes', loadComponent: () => import('./alerts/alerts.component').then(m => m.AlertsComponent) },
      { path: 'communication', loadComponent: () => import('./communication/communication.component').then(m => m.CommunicationComponent) },
      { path: 'communication/notifications', loadComponent: () => import('./communication/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'support', loadComponent: () => import('./support/support.component').then(m => m.SupportComponent) },
      { path: 'roles', loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent) }
    ]
  }
];
