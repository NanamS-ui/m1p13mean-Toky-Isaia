import { Routes } from '@angular/router';

export const boutiqueRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../layout/boutique-layout/boutique-layout.component').then(m => m.BoutiqueLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'dashboard', 
        loadComponent: () => import('./dashboard/boutique-dashboard.component').then(m => m.BoutiqueDashboardComponent)
      },
      { 
        path: 'profil/list', 
        loadComponent: () => import('./profil/boutiques-list.component').then(m => m.BoutiquesListComponent)
      },
      { 
        path: 'profil/:id', 
        loadComponent: () => import('./profil/boutique-profil.component').then(m => m.BoutiqueProfilComponent)
      },
      
      { 
        path: 'produits', 
        loadComponent: () => import('./produits/produits-list.component').then(m => m.ProduitsListComponent)
      },
      { 
        path: 'produits/nouveau', 
        loadComponent: () => import('./produits/produit-form.component').then(m => m.ProduitFormComponent)
      },
      { 
        path: 'produits/:id', 
        loadComponent: () => import('./produits/produit-form.component').then(m => m.ProduitFormComponent)
      },
      { 
        path: 'commandes', 
        loadComponent: () => import('./commandes/commandes-list.component').then(m => m.CommandesListComponent)
      },
      { 
        path: 'commandes/:id', 
        loadComponent: () => import('./commandes/commande-detail.component').then(m => m.CommandeDetailComponent)
      },
      { 
        path: 'statistiques', 
        loadComponent: () => import('./statistiques/boutique-stats.component').then(m => m.BoutiqueStatsComponent)
      },
      { 
        path: 'messagerie', 
        loadComponent: () => import('./relation-client/messagerie.component').then(m => m.MessagerieComponent)
      },
      { 
        path: 'avis', 
        loadComponent: () => import('./relation-client/avis.component').then(m => m.AvisComponent)
      },
      { 
        path: 'retours', 
        loadComponent: () => import('./relation-client/retours.component').then(m => m.RetoursComponent)
      }
    ]
  }
];
