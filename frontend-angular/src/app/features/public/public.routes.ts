import { Routes } from '@angular/router';

export const publicRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', redirectTo: 'accueil', pathMatch: 'full' },
      { 
        path: 'accueil', 
        loadComponent: () => import('./accueil/accueil.component').then(m => m.AccueilComponent)
      },
      { 
        path: 'boutiques', 
        loadComponent: () => import('./boutiques/boutiques-public.component').then(m => m.BoutiquesPublicComponent)
      },
      { 
        path: 'boutiques/:id', 
        loadComponent: () => import('./boutiques/boutiques-public.component').then(m => m.BoutiquesPublicComponent)
      },
      { 
        path: 'evenements', 
        loadComponent: () => import('./evenements/evenements.component').then(m => m.EvenementsComponent)
      },
      { 
        path: 'localisation', 
        loadComponent: () => import('./localisation/localisation.component').then(m => m.LocalisationComponent)
      },
      { 
        path: 'contact', 
        loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent)
      }
    ]
  }
];
